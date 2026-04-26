/**
 * Fetch GitHub Issues from coderPerseus/blog and convert them to
 * MD/MDX files in src/content/post/ for Astro content collections.
 *
 * Behavior:
 *   - Match existing local posts by issue number prefix `<number>-*.md`
 *   - New issue → write new file
 *   - Existing issue, remote `updated_at` newer than local `updatedDate` → rewrite
 *     and remove the sibling `.en.md` so the translate step regenerates it
 *   - Existing issue with no changes → leave file alone
 *   - Files without a numeric prefix (manually added) → never touched
 *
 * Usage:
 *   npx tsx scripts/fetch-issues.ts
 *
 * Environment:
 *   GH_TOKEN - GitHub personal access token (optional, but recommended for rate limits)
 */

import * as fs from "node:fs";
import * as path from "node:path";

const GITHUB_REPO = "coderPerseus/blog";
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/issues`;
const OUTPUT_DIR = path.resolve(import.meta.dirname, "../src/content/post");
const PER_PAGE = 100;

const GH_TOKEN = process.env.GH_TOKEN;

// Labels that indicate a non-content issue (blog infrastructure, CI/CD for the blog itself)
const EXCLUDE_LABELS = new Set(["codex", "bug"]);

// Labels that are purely for blog infrastructure and not content
const INFRASTRUCTURE_TITLES = [
	"build 失败",
	"Prevent duplicate Sync Post workflow runs",
	"Add christmas theme experience",
	"优化帖子内容页布局与移动端适配",
	"feat: redesign posts page with timeline view",
	"Implement timeline view for posts",
	"codex 配置自定义模型异常",
];

interface GitHubIssue {
	number: number;
	title: string;
	body: string | null;
	labels: { name: string; color: string }[];
	created_at: string;
	updated_at: string;
	state: "open" | "closed";
	html_url: string;
}

interface ParsedFrontmatter {
	title?: string;
	description?: string;
	tags?: string[];
	publishDate?: string;
	updatedDate?: string;
	aiSummary?: string;
	aiSummaryEn?: string;
	translationEn?: boolean;
	pinned?: boolean;
	draft?: boolean;
	originalBody: string;
}

function parseFrontmatter(body: string): ParsedFrontmatter {
	const result: ParsedFrontmatter = { originalBody: body };

	// Check if body starts with YAML frontmatter
	const fmMatch = body.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
	if (!fmMatch) return result;

	const yamlBlock = fmMatch[1]!;
	const content = fmMatch[2]!;
	result.originalBody = content;

	// Simple YAML parser for flat key-value pairs
	for (const line of yamlBlock.split("\n")) {
		const kvMatch = line.match(/^(\w[\w-]*)\s*:\s*(.+)$/);
		if (!kvMatch) continue;
		const [, key, rawValue] = kvMatch;
		const value = rawValue!.trim().replace(/^["']|["']$/g, "");

		switch (key) {
			case "title":
				result.title = value;
				break;
			case "description":
				result.description = value;
				break;
			case "tags":
				result.tags = value
					.split(",")
					.map((s) => s.trim())
					.filter(Boolean);
				break;
			case "publishDate":
				result.publishDate = value;
				break;
			case "updatedDate":
				result.updatedDate = value;
				break;
			case "aiSummary":
				result.aiSummary = value;
				break;
			case "aiSummaryEn":
				result.aiSummaryEn = value;
				break;
			case "translationEn":
				result.translationEn = value === "true";
				break;
			case "pinned":
				result.pinned = value === "true";
				break;
			case "draft":
				result.draft = value === "true";
				break;
		}
	}

	return result;
}

function slugify(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^\w\s\u4e00-\u9fff\u3400-\u4dbf-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim()
		.replace(/^-+|-+$/g, "");
}

function issueToMarkdown(issue: GitHubIssue): { filename: string; content: string } | null {
	if (issue.state !== "open") return null;

	// Check exclude labels
	if (issue.labels.some((l) => EXCLUDE_LABELS.has(l.name))) return null;

	// Check infrastructure titles
	if (INFRASTRUCTURE_TITLES.includes(issue.title)) return null;

	const fm = parseFrontmatter(issue.body || "");

	const title = fm.title || issue.title;
	const publishDate = fm.publishDate || issue.created_at;
	const updatedDate = fm.updatedDate || issue.updated_at;

	// Extract tags from labels (filter out infrastructure labels)
	const labelTags = issue.labels
		.filter((l) => !EXCLUDE_LABELS.has(l.name))
		.map((l) => l.name);

	const tags =
		fm.tags && fm.tags.length > 0
			? [...new Set([...fm.tags, ...labelTags])]
			: labelTags;

	// Description from frontmatter or extract from body
	const description =
		fm.description ||
		(fm.originalBody
			?.replace(/^#\s+.+/m, "")
			.replace(/!\[.*?\]\(.*?\)/g, "")
			.replace(/\[([^\]]*)\]\([^)]+\)/g, "$1")
			.replace(/[#*`>~\-|]/g, "")
			.trim()
			.slice(0, 160) || title);

	// Build frontmatter
	const frontmatter: Record<string, unknown> = {
		title: JSON.stringify(title),
		publishDate: JSON.stringify(publishDate),
		updatedDate: JSON.stringify(updatedDate),
		tags: JSON.stringify(tags),
		description: JSON.stringify(description),
	};

	if (fm.pinned) frontmatter.pinned = "true";
	if (fm.draft) frontmatter.draft = "true";
	if (fm.aiSummary) frontmatter.aiSummary = JSON.stringify(fm.aiSummary);
	if (fm.aiSummaryEn) frontmatter.aiSummaryEn = JSON.stringify(fm.aiSummaryEn);
	if (fm.translationEn) frontmatter.translationEn = "true";

	const fmLines = Object.entries(frontmatter).map(([k, v]) => `${k}: ${v}`);

	const md = `---
${fmLines.join("\n")}
---

${fm.originalBody || ""}
`;

	const slug = slugify(title);
	const number = issue.number;
	const filename = `${number}-${slug}.md`;

	return { filename, content: md };
}

async function fetchAllIssues(): Promise<GitHubIssue[]> {
	const headers: Record<string, string> = {
		Accept: "application/vnd.github+json",
		"User-Agent": "luckysnail-blog-sync",
	};
	if (GH_TOKEN) {
		headers.Authorization = `Bearer ${GH_TOKEN}`;
	}

	const allIssues: GitHubIssue[] = [];
	let page = 1;

	while (true) {
		const url = `${GITHUB_API}?state=all&per_page=${PER_PAGE}&page=${page}`;
		console.log(`Fetching page ${page}: ${url}`);

		const res = await fetch(url, { headers });
		if (!res.ok) {
			throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
		}

		const issues: GitHubIssue[] = await res.json();
		console.log(`  Got ${issues.length} issues`);

		if (issues.length === 0) break;

		allIssues.push(...issues);
		page++;
	}

	return allIssues;
}

function readLocalUpdatedDate(filepath: string): Date | null {
	try {
		const content = fs.readFileSync(filepath, "utf-8");
		const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
		if (!fmMatch) return null;
		const updMatch = fmMatch[1]!.match(/^updatedDate\s*:\s*"?([^"\n]+?)"?\s*$/m);
		if (!updMatch) return null;
		const d = new Date(updMatch[1]!);
		return Number.isNaN(d.getTime()) ? null : d;
	} catch {
		return null;
	}
}

async function main() {
	console.log("Fetching issues from GitHub...");
	const issues = await fetchAllIssues();
	console.log(`Total issues fetched: ${issues.length}`);

	fs.mkdirSync(OUTPUT_DIR, { recursive: true });

	// Map issue number → existing zh-source file (ignore .en.md siblings).
	// Match by number prefix so a renamed issue (different slug) is still resolved.
	const existingFiles = fs
		.readdirSync(OUTPUT_DIR)
		.filter((f) => f.endsWith(".md") && !f.endsWith(".en.md"));
	const numberToFile = new Map<number, string>();
	for (const file of existingFiles) {
		const m = file.match(/^(\d+)-/);
		if (m) numberToFile.set(Number(m[1]), file);
	}

	let added = 0;
	let updated = 0;
	let unchanged = 0;
	let skipped = 0;

	for (const issue of issues) {
		const result = issueToMarkdown(issue);
		if (!result) {
			skipped++;
			continue;
		}

		const existingFile = numberToFile.get(issue.number);
		if (!existingFile) {
			fs.writeFileSync(path.join(OUTPUT_DIR, result.filename), result.content, "utf-8");
			added++;
			continue;
		}

		const existingPath = path.join(OUTPUT_DIR, existingFile);
		const localUpdated = readLocalUpdatedDate(existingPath);
		const remoteUpdated = new Date(issue.updated_at);

		if (localUpdated && remoteUpdated <= localUpdated) {
			unchanged++;
			continue;
		}

		// Issue updated upstream — replace the zh source and drop the cached translation
		// so the next translate step regenerates the .en.md.
		fs.unlinkSync(existingPath);
		const enFile = existingFile.replace(/\.md$/, ".en.md");
		const enPath = path.join(OUTPUT_DIR, enFile);
		if (fs.existsSync(enPath)) fs.unlinkSync(enPath);

		fs.writeFileSync(path.join(OUTPUT_DIR, result.filename), result.content, "utf-8");
		updated++;
	}

	console.log(
		`Done! Added ${added}, updated ${updated}, unchanged ${unchanged}, skipped ${skipped}.`,
	);
}

main().catch((err) => {
	console.error("Error:", err);
	process.exit(1);
});
