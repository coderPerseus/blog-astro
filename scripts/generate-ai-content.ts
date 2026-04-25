/**
 * Generate AI summaries and translations for blog posts.
 * Uses OpenAI-compatible API to generate:
 *  - Chinese AI summary (aiSummary)
 *  - English AI summary (aiSummaryEn)
 *  - English translation flag (translationEn)
 *
 * Usage:
 *   OPENAI_API_KEY=sk-xxx OPENAI_BASE_URL=https://api.openai.com/v1 \
 *   npx tsx scripts/generate-ai-content.ts
 *
 * Environment:
 *   OPENAI_API_KEY  - API key
 *   OPENAI_BASE_URL - API base URL (default: https://api.openai.com/v1)
 *   OPENAI_MODEL    - Model name (default: gpt-4o-mini)
 */

import * as fs from "node:fs";
import * as path from "node:path";

const POSTS_DIR = path.resolve(import.meta.dirname, "../src/content/post");
const API_KEY = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
const BASE_URL =
	process.env.OPENAI_BASE_URL ||
	process.env.ANTHROPIC_BASE_URL ||
	"https://api.openai.com/v1";
const MODEL =
	process.env.OPENAI_MODEL || process.env.ANTHROPIC_DEFAULT_SONNET_MODEL || "gpt-4o-mini";

function parsePost(filepath: string): { frontmatter: Record<string, string>; body: string } | null {
	const content = fs.readFileSync(filepath, "utf-8");
	const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!fmMatch) return null;

	const fmRaw = fmMatch[1]!;
	const body = fmMatch[2]!;

	const frontmatter: Record<string, string> = {};
	for (const line of fmRaw.split("\n")) {
		const m = line.match(/^(\w[\w-]*)\s*:\s*(.+)$/);
		if (!m) continue;
		const key = m[1]!;
		let value = m[2]!.trim();
		if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
			value = value.slice(1, -1);
		}
		frontmatter[key] = value;
	}

	return { frontmatter, body };
}

function writePost(filepath: string, frontmatter: Record<string, string>, body: string): void {
	const fmLines = Object.entries(frontmatter).map(([k, v]) => {
		const needsQuotes = v.includes('"') || v.includes("\n");
		return needsQuotes ? `${k}: "${v.replace(/"/g, '\\"')}"` : `${k}: "${v}"`;
	});
	const content = `---\n${fmLines.join("\n")}\n---\n\n${body}`;
	fs.writeFileSync(filepath, content, "utf-8");
}

async function chatCompletion(systemPrompt: string, userPrompt: string): Promise<string> {
	const url = `${BASE_URL}/chat/completions`;
	const res = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${API_KEY}`,
		},
		body: JSON.stringify({
			model: MODEL,
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
			temperature: 0.3,
			max_tokens: 2048,
		}),
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`API error ${res.status}: ${text.slice(0, 200)}`);
	}

	const data = (await res.json()) as {
		choices: { message: { content: string } }[];
	};
	return data.choices[0]?.message?.content || "";
}

function stripMarkdown(text: string, maxLen = 500): string {
	return text
		.replace(/!\[.*?\]\(.*?\)/g, "")
		.replace(/\[([^\]]*)\]\([^)]+\)/g, "$1")
		.replace(/[#*`>~\-|]/g, "")
		.replace(/\n{3,}/g, "\n\n")
		.trim()
		.slice(0, maxLen);
}

async function generateAiSummary(title: string, body: string): Promise<string> {
	const stripped = stripMarkdown(body, 3000);
	const prompt = `You are a helpful assistant. Write a concise summary in Chinese (2-3 sentences) of the following blog post titled "${title}". Only output the summary, nothing else.

Content:
${stripped}`;

	return chatCompletion(
		"你是一个帮助总结中文技术博客文章的助手。请用中文简洁地总结。",
		prompt,
	);
}

async function generateAiSummaryEn(title: string, body: string): Promise<string> {
	const stripped = stripMarkdown(body, 3000);
	const prompt = `Write a concise summary in English (2-3 sentences) of the following Chinese blog post titled "${title}". Only output the summary, nothing else.

Content:
${stripped}`;

	return chatCompletion(
		"You are a helpful assistant that summarizes Chinese tech blog posts in English. Be concise.",
		prompt,
	);
}

async function main() {
	if (!API_KEY) {
		console.error("Error: No API key found. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.");
		process.exit(1);
	}

	const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
	console.log(`Found ${files.length} posts. Will generate AI summaries.\n`);

	let processed = 0;
	let skipped = 0;

	for (const file of files) {
		const filepath = path.join(POSTS_DIR, file);
		const parsed = parsePost(filepath);
		if (!parsed) {
			skipped++;
			continue;
		}

		const { frontmatter, body } = parsed;
		const title = frontmatter.title?.replace(/"/g, "") || file;

		// Skip if already has both summaries
		if (frontmatter.aiSummary && frontmatter.aiSummaryEn) {
			console.log(`[SKIP] "${title}" - already has summaries`);
			skipped++;
			continue;
		}

		console.log(`[PROCESS] "${title}"`);

		try {
			// Generate Chinese summary if missing
			if (!frontmatter.aiSummary) {
				console.log("  Generating Chinese summary...");
				const aiSummary = await generateAiSummary(title, body);
				frontmatter.aiSummary = aiSummary;
				console.log(`  → ${aiSummary.slice(0, 80)}...`);
			}

			// Generate English summary if missing
			if (!frontmatter.aiSummaryEn) {
				console.log("  Generating English summary...");
				const aiSummaryEn = await generateAiSummaryEn(title, body);
				frontmatter.aiSummaryEn = aiSummaryEn;
				console.log(`  → ${aiSummaryEn.slice(0, 80)}...`);
			}

			frontmatter.translationEn = "true";
			writePost(filepath, frontmatter, body);
			processed++;
		} catch (err) {
			console.error(`  Error processing "${title}":`, err);
		}

		// Rate limiting
		await new Promise((r) => setTimeout(r, 1000));
	}

	console.log(`\nDone! Processed ${processed} posts, skipped ${skipped}.`);
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
