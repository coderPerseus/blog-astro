/** Add the deployed canonical post URL to its source issue. Defaults to dry-run. */
import * as fs from "node:fs";
import * as path from "node:path";
import { issueSourceHash, withBlogBacklink } from "./lib/issue-backlink";

const apply = process.argv.includes("--apply");
const token = process.env.GH_TOKEN;
if (apply && !token)
	throw new Error("GH_TOKEN with Issues write access to coderPerseus/blog is required");
const headers: Record<string, string> = {
	Accept: "application/vnd.github+json",
	"Content-Type": "application/json",
	"User-Agent": "luckysnail-blog-sync",
	...(token ? { Authorization: `Bearer ${token}` } : {}),
};
const postsDir = path.resolve(import.meta.dirname, "../src/content/post");
const distDir = path.resolve(import.meta.dirname, "../dist");
let updated = 0;

for (const file of fs.readdirSync(postsDir)) {
	const number = file.match(/^(\d+)-.*(?<!\.en)\.md$/)?.[1];
	if (!number) continue;
	const source = fs.readFileSync(path.join(postsDir, file), "utf8");
	const fm = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
	if (!fm || /^draft:\s*true\s*$/m.test(fm)) continue;
	const slug = fm.match(/^slug:\s*["']?([a-z0-9]+(?:-[a-z0-9]+)*)["']?\s*$/m)?.[1];
	const hash = fm.match(/^issueSourceHash: "([a-f0-9]+)"$/m)?.[1];
	// Only link content included in this build, with a known source revision.
	if (!slug || !hash || !fs.existsSync(path.join(distDir, "zh/posts", slug, "index.html")))
		continue;
	const endpoint = `https://api.github.com/repos/coderPerseus/blog/issues/${number}`;
	const response = await fetch(endpoint, { headers });
	if (!response.ok) throw new Error(`Read issue #${number}: HTTP ${response.status}`);
	const issue = await response.json();
	if (issue.pull_request || issue.state !== "open" || issueSourceHash(issue) !== hash) {
		console.log(`Skip #${number}: source changed since this build`);
		continue;
	}
	const body = withBlogBacklink(issue.body ?? "", slug, Number(number));
	if (body === issue.body) continue;
	if (apply) {
		const result = await fetch(endpoint, {
			method: "PATCH",
			headers,
			body: JSON.stringify({ body }),
		});
		if (!result.ok) throw new Error(`Update issue #${number}: HTTP ${result.status}`);
		// Avoid secondary rate limits when backfilling existing articles.
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
	console.log(
		`${apply ? "Updated" : "Would update"} #${number}: https://luckysnail.cn/zh/posts/${slug}`,
	);
	updated++;
}
console.log(`${apply ? "Updated" : "Would update"} ${updated} issue backlinks.`);
