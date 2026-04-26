/**
 * Translate Chinese blog posts to English using DeepSeek (OpenAI-compatible API).
 *
 * Detection: a post is considered translated when a sibling `xxx.en.md` exists.
 * Pass --force to overwrite.
 *
 * Usage:
 *   pnpm tsx scripts/translate-posts.ts                  # all missing
 *   pnpm tsx scripts/translate-posts.ts --slug=104-      # only files whose name contains "104-"
 *   pnpm tsx scripts/translate-posts.ts --limit=1        # first one only
 *   pnpm tsx scripts/translate-posts.ts --dry-run        # no API calls / no writes
 *   pnpm tsx scripts/translate-posts.ts --force          # overwrite existing .en.md
 *
 * Env (loaded from .env if present):
 *   DEEPSEEK_API_KEY   required
 *   DEEPSEEK_BASE_URL  default https://api.deepseek.com
 *   DEEPSEEK_MODEL     default deepseek-v4-flash
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ---------- env loader (no extra dep) ----------
function loadDotenv(envPath: string) {
	if (!fs.existsSync(envPath)) return;
	const text = fs.readFileSync(envPath, "utf-8");
	for (const raw of text.split("\n")) {
		const line = raw.trim();
		if (!line || line.startsWith("#")) continue;
		const eq = line.indexOf("=");
		if (eq < 0) continue;
		const key = line.slice(0, eq).trim();
		let value = line.slice(eq + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		if (process.env[key] === undefined) process.env[key] = value;
	}
}

loadDotenv(path.resolve(import.meta.dirname, "../.env"));

const POSTS_DIR = path.resolve(import.meta.dirname, "../src/content/post");
const API_KEY = process.env.DEEPSEEK_API_KEY;
const BASE_URL = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/+$/, "");
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";

if (!API_KEY) {
	console.error("Error: DEEPSEEK_API_KEY is missing. Set it in .env or env.");
	process.exit(1);
}

// ---------- args ----------
const argv = process.argv.slice(2);
function getFlag(name: string) {
	return argv.includes(`--${name}`);
}
function getArg(name: string): string | undefined {
	const prefix = `--${name}=`;
	const found = argv.find((a) => a.startsWith(prefix));
	return found ? found.slice(prefix.length) : undefined;
}
const slugFilter = getArg("slug");
const limit = parseInt(getArg("limit") || "0", 10);
const force = getFlag("force");
const dryRun = getFlag("dry-run");

// ---------- frontmatter ----------
type Fm = Record<string, string>;

function splitFrontmatter(filepath: string): { fmRaw: string; body: string } | null {
	const content = fs.readFileSync(filepath, "utf-8");
	const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
	if (!m) return null;
	return { fmRaw: m[1]!, body: m[2]! };
}

function parseFrontmatter(raw: string): Fm {
	const out: Fm = {};
	for (const line of raw.split("\n")) {
		const m = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.+)$/);
		if (!m) continue;
		let v = m[2]!.trim();
		if (
			(v.startsWith('"') && v.endsWith('"')) ||
			(v.startsWith("'") && v.endsWith("'"))
		) {
			v = v.slice(1, -1);
		}
		out[m[1]!] = v;
	}
	return out;
}

function formatYamlValue(v: string): string {
	// Pass arrays / booleans through (e.g. tags: ["AI","Agent"])
	if (v.startsWith("[") && v.endsWith("]")) return v;
	if (v === "true" || v === "false") return v;
	const escaped = v.replace(/\r/g, "").replace(/\n/g, "\\n").replace(/"/g, '\\"');
	return `"${escaped}"`;
}

function buildFrontmatter(fm: Fm): string {
	const lines = Object.entries(fm).map(([k, v]) => `${k}: ${formatYamlValue(v)}`);
	return `---\n${lines.join("\n")}\n---\n`;
}

// ---------- DeepSeek call ----------
const SYSTEM_PROMPT = `You are a professional translator for a personal Chinese tech blog written by a developer.
Translate the Chinese markdown the user sends into natural, idiomatic English.

Strict rules:
1. Output ONLY the translated content. No commentary, no preamble, no surrounding code fences.
2. Preserve ALL markdown syntax exactly: headings (#), lists, tables, blockquotes, links, images, footnotes, custom directives such as :::tip ... :::, and inline HTML.
3. Code blocks (fenced with \`\`\`) and inline code (\`...\`) MUST stay byte-for-byte identical, except: translate Chinese comments inside code to English comments. Do NOT translate identifiers, strings, or APIs.
4. Keep all URLs unchanged. Keep image src unchanged. Translate alt text.
5. Keep brand and product names in English (React, Next.js, OpenAI, GitHub, Claude, Cursor, etc.). Don't transliterate them.
6. Tone: clear, conversational, like a developer talking to peers — not academic or marketing-style.
7. Match the original paragraph structure and length. Don't merge or split paragraphs.
8. Translate technical terms accurately (e.g. "提示词" → "prompt", "智能体" → "agent", "踩坑" → "pitfall"/"gotcha").`;

async function callDeepSeek(messages: { role: string; content: string }[]): Promise<string> {
	const url = `${BASE_URL}/chat/completions`;
	const res = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${API_KEY}`,
		},
		body: JSON.stringify({
			model: MODEL,
			messages,
			temperature: 0.3,
			stream: false,
			max_tokens: 8192,
		}),
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`DeepSeek ${res.status} ${res.statusText}: ${text.slice(0, 600)}`);
	}
	const data = (await res.json()) as {
		choices?: { message?: { content?: string }; finish_reason?: string }[];
	};
	const choice = data.choices?.[0];
	if (!choice?.message?.content) {
		throw new Error(`DeepSeek returned no content: ${JSON.stringify(data).slice(0, 400)}`);
	}
	if (choice.finish_reason && choice.finish_reason !== "stop") {
		console.warn(`  [warn] finish_reason=${choice.finish_reason} — output may be truncated`);
	}
	return choice.message.content;
}

async function translate(text: string, kind: "title" | "description" | "body"): Promise<string> {
	if (!text.trim()) return "";
	const userPrompt =
		kind === "body"
			? `Translate the following markdown blog post body to English. Follow every rule from the system message strictly.\n\n${text}`
			: `Translate the following ${kind} to natural English. Output ONLY the translation, no quotes, no labels, no commentary.\n\n${text}`;
	const out = await callDeepSeek([
		{ role: "system", content: SYSTEM_PROMPT },
		{ role: "user", content: userPrompt },
	]);
	return out.trim();
}

// ---------- chunked body translation for long posts ----------
const CHUNK_THRESHOLD = 6000; // Chinese chars; above this we try to split.
const CHUNK_MAX_SIZE = 5000; // Hard ceiling per chunk; recursively split bigger ones.

/** Split a markdown body at any line whose content matches `headingRegex`. */
function splitByHeading(body: string, headingRegex: RegExp): string[] {
	const lines = body.split("\n");
	const chunks: string[] = [];
	let current: string[] = [];
	let inFence = false;
	for (const line of lines) {
		// don't split inside fenced code blocks
		if (line.startsWith("```")) inFence = !inFence;
		if (!inFence && headingRegex.test(line) && current.length > 0) {
			chunks.push(current.join("\n"));
			current = [line];
		} else {
			current.push(line);
		}
	}
	if (current.length > 0) chunks.push(current.join("\n"));
	return chunks.filter((c) => c.trim().length > 0);
}

/** Split a too-large chunk by paragraph blank lines as a last resort. */
function splitByBlankLine(body: string, maxSize: number): string[] {
	const paras = body.split(/\n\s*\n/);
	const out: string[] = [];
	let current = "";
	for (const p of paras) {
		if (!p.trim()) continue;
		const next = current ? `${current}\n\n${p}` : p;
		if (next.length > maxSize && current) {
			out.push(current);
			current = p;
		} else {
			current = next;
		}
	}
	if (current) out.push(current);
	return out;
}

/** Build chunks under maxSize; try H2, then H3, then paragraph split. */
function buildChunks(body: string, maxSize = CHUNK_MAX_SIZE): string[] {
	let chunks = splitByHeading(body, /^## /);
	if (chunks.length <= 1) chunks = splitByHeading(body, /^### /);
	if (chunks.length <= 1) chunks = splitByBlankLine(body, maxSize);
	// further break any chunk that's still too large
	const final: string[] = [];
	for (const c of chunks) {
		if (c.length <= maxSize) {
			final.push(c);
		} else {
			final.push(...splitByBlankLine(c, maxSize));
		}
	}
	return final;
}

async function translateBodyChunked(body: string): Promise<string> {
	if (body.length < CHUNK_THRESHOLD) {
		return translate(body, "body");
	}
	const chunks = buildChunks(body);
	if (chunks.length <= 1) {
		return translate(body, "body");
	}
	console.log(`  chunking into ${chunks.length} sections`);
	const translatedChunks: string[] = [];
	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i]!;
		console.log(`    section ${i + 1}/${chunks.length} (${chunk.length} chars)`);
		const userPrompt = `Translate this markdown section (part ${i + 1} of ${chunks.length}) of a Chinese tech blog post. Maintain consistent terminology with the surrounding sections. Follow every rule from the system message.\n\n${chunk}`;
		const out = await callDeepSeek([
			{ role: "system", content: SYSTEM_PROMPT },
			{ role: "user", content: userPrompt },
		]);
		translatedChunks.push(out.trim());
		await new Promise((r) => setTimeout(r, 300));
	}
	return translatedChunks.join("\n\n");
}

// ---------- per-post pipeline ----------
async function translateOne(filepath: string): Promise<"translated" | "skipped" | "failed"> {
	const enPath = filepath.replace(/\.md$/, ".en.md");
	if (fs.existsSync(enPath) && !force) return "skipped";

	const split = splitFrontmatter(filepath);
	if (!split) {
		console.warn("  no frontmatter, skipping");
		return "failed";
	}

	const fm = parseFrontmatter(split.fmRaw);
	const title = fm.title ?? path.basename(filepath, ".md");

	if (dryRun) {
		console.log(`  [dry-run] would translate title + ${fm.description ? "description + " : ""}body (${split.body.length} chars) → ${path.basename(enPath)}`);
		return "translated";
	}

	console.log(`  translating title…`);
	const titleEn = await translate(title, "title");

	let descriptionEn = "";
	if (fm.description) {
		console.log(`  translating description…`);
		descriptionEn = await translate(fm.description, "description");
	}

	console.log(`  translating body (${split.body.length} chars)…`);
	const bodyEn = await translateBodyChunked(split.body);

	const enFm: Fm = { ...fm };
	enFm.title = titleEn;
	if (descriptionEn) enFm.description = descriptionEn;
	delete enFm.aiSummary;
	delete enFm.aiSummaryEn;
	delete enFm.translationEn;

	const out = buildFrontmatter(enFm) + "\n" + bodyEn.trim() + "\n";
	fs.writeFileSync(enPath, out, "utf-8");
	console.log(`  wrote ${path.basename(enPath)} (${out.length} chars)`);
	return "translated";
}

// ---------- main ----------
async function main() {
	const files = fs
		.readdirSync(POSTS_DIR)
		.filter((f) => f.endsWith(".md") && !f.endsWith(".en.md"))
		.filter((f) => !slugFilter || f.includes(slugFilter))
		.sort();

	if (files.length === 0) {
		console.error(`No matching posts (slug filter=${slugFilter || "none"})`);
		process.exit(1);
	}

	const todo = limit > 0 ? files.slice(0, limit) : files;

	console.log(`model    : ${MODEL}`);
	console.log(`base_url : ${BASE_URL}`);
	console.log(`posts    : ${todo.length}/${files.length} match\n`);

	let translated = 0;
	let skipped = 0;
	let failed = 0;

	for (const file of todo) {
		const filepath = path.join(POSTS_DIR, file);
		const enPath = filepath.replace(/\.md$/, ".en.md");

		if (fs.existsSync(enPath) && !force) {
			console.log(`[skip] ${file} (${path.basename(enPath)} already exists)`);
			skipped++;
			continue;
		}
		console.log(`[do  ] ${file}`);
		try {
			const result = await translateOne(filepath);
			if (result === "translated") translated++;
			else if (result === "skipped") skipped++;
			else failed++;
		} catch (err) {
			failed++;
			console.error(`  error: ${err instanceof Error ? err.message : String(err)}`);
		}
		await new Promise((r) => setTimeout(r, 500));
	}

	console.log(`\ndone. translated=${translated} skipped=${skipped} failed=${failed}`);
	if (failed > 0) process.exit(1);
}

main().catch((err) => {
	console.error("fatal:", err);
	process.exit(1);
});
