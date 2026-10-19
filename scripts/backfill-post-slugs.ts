/**
 * Add stable, AI-generated canonical slugs to existing Chinese and English posts.
 *
 * Usage:
 *   npx tsx scripts/backfill-post-slugs.ts          # preview only
 *   npx tsx scripts/backfill-post-slugs.ts --apply  # write frontmatter
 */

import * as fs from "node:fs";
import * as path from "node:path";
import {
	fallbackSlugFromEnglishTitle,
	getPostIdentifier,
	makeUniquePostSlug,
} from "./lib/post-slug";

const POSTS_DIR = path.resolve(import.meta.dirname, "../src/content/post");
const BATCH_SIZE = 20;
const apply = process.argv.includes("--apply");
const force = process.argv.includes("--force");
const allowFallback = process.argv.includes("--allow-fallback");

loadDotenv(path.resolve(import.meta.dirname, "../.env"));

const API_KEY = process.env.DEEPSEEK_API_KEY;
const BASE_URL = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/+$/, "");
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";

if (!API_KEY) {
	throw new Error("DEEPSEEK_API_KEY is required to generate historical slugs");
}

type PostInput = {
	id: string;
	zhPath: string;
	enPath?: string;
	titleZh: string;
	titleEn: string;
};

type SlugResult = { id: string; slug: string };

function loadDotenv(envPath: string) {
	if (!fs.existsSync(envPath)) return;
	for (const raw of fs.readFileSync(envPath, "utf-8").split("\n")) {
		const line = raw.trim();
		if (!line || line.startsWith("#")) continue;
		const separator = line.indexOf("=");
		if (separator < 0) continue;
		const key = line.slice(0, separator).trim();
		let value = line.slice(separator + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		if (process.env[key] === undefined) process.env[key] = value;
	}
}

function splitFrontmatter(content: string): { raw: string; body: string } {
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
	if (!match?.[1] || match[2] === undefined) throw new Error("Post is missing frontmatter");
	return { raw: match[1], body: match[2] };
}

function readStringField(raw: string, key: string): string | undefined {
	const match = raw.match(new RegExp(`^${key}\\s*:\\s*(.+)$`, "m"));
	if (!match?.[1]) return undefined;
	const value = match[1].trim();
	if (
		(value.startsWith('"') && value.endsWith('"')) ||
		(value.startsWith("'") && value.endsWith("'"))
	) {
		try {
			return JSON.parse(value.replace(/^'/, '"').replace(/'$/, '"'));
		} catch {
			return value.slice(1, -1);
		}
	}
	return value;
}

function setRouteFields(content: string, slug: string, legacySlug: string): string {
	const { raw, body } = splitFrontmatter(content);
	const withoutRouteFields = raw
		.split("\n")
		.filter((line) => !/^(slug|legacySlugs)\s*:/.test(line))
		.join("\n");
	const lines = withoutRouteFields.split("\n");
	const titleIndex = lines.findIndex((line) => /^title\s*:/.test(line));
	const insertAt = titleIndex >= 0 ? titleIndex + 1 : 0;
	lines.splice(
		insertAt,
		0,
		`slug: ${JSON.stringify(slug)}`,
		`legacySlugs: ${JSON.stringify([legacySlug])}`,
	);
	return `---\n${lines.join("\n")}\n---\n${body}`;
}

function readPosts(): PostInput[] {
	return fs
		.readdirSync(POSTS_DIR)
		.filter((file) => file.endsWith(".md") && !file.endsWith(".en.md"))
		.sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
		.map((file) => {
			const zhPath = path.join(POSTS_DIR, file);
			const enPath = zhPath.replace(/\.md$/, ".en.md");
			const zh = splitFrontmatter(fs.readFileSync(zhPath, "utf-8"));
			const en = fs.existsSync(enPath)
				? splitFrontmatter(fs.readFileSync(enPath, "utf-8"))
				: undefined;
			const titleZh = readStringField(zh.raw, "title") ?? path.basename(file, ".md");
			const titleEn = en ? (readStringField(en.raw, "title") ?? titleZh) : titleZh;
			return {
				id: path.basename(file, ".md"),
				zhPath,
				...(en ? { enPath } : {}),
				titleZh,
				titleEn,
			};
		})
		.filter((post) => {
			if (force) return true;
			const { raw } = splitFrontmatter(fs.readFileSync(post.zhPath, "utf-8"));
			return !readStringField(raw, "slug");
		});
}

async function generateBatch(posts: PostInput[]): Promise<Map<string, string>> {
	const input = posts.map(({ id, titleZh, titleEn }) => ({ id, titleZh, titleEn }));
	const prompt = `Create canonical URL slugs for these personal technology blog posts.

Return ONLY a JSON array with this exact shape: [{"id":"original id","slug":"short-slug"}].

Rules for every slug:
- 3 to 8 meaningful English words, at most 72 characters.
- lowercase ASCII letters, numbers, and hyphens only.
- preserve important product names, technical terms, and versions.
- describe the article's specific topic or opinion; avoid filler such as article, post, thoughts, introduction, guide, and how-to unless essential.
- do not include the issue number, year, author, language, or a translation marker.
- do not translate established product names.

Posts:
${JSON.stringify(input)}`;

	const response = await fetch(`${BASE_URL}/chat/completions`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: MODEL,
			messages: [
				{
					role: "system",
					content:
						"You are an expert technical editor. Produce concise, durable, human-readable URL slugs.",
				},
				{ role: "user", content: prompt },
			],
			thinking: { type: "disabled" },
			temperature: 0.1,
			stream: false,
			max_tokens: 4096,
		}),
	});

	if (!response.ok) {
		throw new Error(`DeepSeek ${response.status}: ${(await response.text()).slice(0, 300)}`);
	}
	const data = (await response.json()) as {
		choices?: { message?: { content?: string } }[];
	};
	const content = data.choices?.[0]?.message?.content?.trim();
	if (!content) throw new Error("DeepSeek returned no slug data");
	const json = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
	const parsed = JSON.parse(json) as SlugResult[];
	const results = new Map(parsed.map((item) => [item.id, item.slug]));
	for (const post of posts) {
		if (!results.has(post.id)) throw new Error(`DeepSeek omitted ${post.id}`);
	}
	return results;
}

async function main() {
	const posts = readPosts();
	if (posts.length === 0) {
		console.log("All posts already have canonical slugs.");
		return;
	}
	const generated = new Map<string, string>();

	for (let index = 0; index < posts.length; index += BATCH_SIZE) {
		const batch = posts.slice(index, index + BATCH_SIZE);
		console.log(`Generating slugs ${index + 1}-${index + batch.length} of ${posts.length}`);
		try {
			const results = await generateBatch(batch);
			for (const [id, slug] of results) generated.set(id, slug);
		} catch (error) {
			if (!allowFallback) throw error;
			console.warn(`AI batch failed; deterministic fallbacks will be used: ${String(error)}`);
		}
	}

	const reserved = new Set<string>();
	let changed = 0;
	for (const post of posts) {
		const identifier = getPostIdentifier(post.id);
		const candidate = generated.get(post.id) ?? fallbackSlugFromEnglishTitle(post.titleEn);
		const slug = makeUniquePostSlug(candidate, reserved, post.titleEn, identifier);
		console.log(`${post.id} -> ${slug}`);
		if (!apply) continue;

		const zhContent = fs.readFileSync(post.zhPath, "utf-8");
		fs.writeFileSync(post.zhPath, setRouteFields(zhContent, slug, post.id), "utf-8");
		if (post.enPath) {
			const enContent = fs.readFileSync(post.enPath, "utf-8");
			fs.writeFileSync(post.enPath, setRouteFields(enContent, slug, post.id), "utf-8");
		}
		changed++;
	}

	console.log(`${apply ? "Updated" : "Would update"} ${apply ? changed : posts.length} posts.`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
