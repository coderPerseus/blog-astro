import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { withBlogBacklink } from "./lib/issue-backlink";

test("sync ignores backlink edits but refreshes changed source and translation", () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "blog-backlinks-"));
	try {
		fs.mkdirSync(path.join(root, "scripts/lib"), { recursive: true });
		fs.writeFileSync(path.join(root, "package.json"), '{"type":"module"}');
		for (const file of ["fetch-issues.ts", "lib/issue-backlink.ts"]) {
			fs.copyFileSync(path.join(import.meta.dirname, file), path.join(root, "scripts", file));
		}
		fs.writeFileSync(
			path.join(root, "run.ts"),
			`
import fs from "node:fs";
const issue = JSON.parse(fs.readFileSync(new URL("./issue.json", import.meta.url), "utf8"));
globalThis.fetch = async (url) => new Response(JSON.stringify(String(url).endsWith("page=1") ? [issue] : []));
await import("./scripts/fetch-issues.ts");
`,
		);
		const issue = {
			number: 1,
			title: "Test",
			body: "原始正文",
			labels: [],
			state: "open",
			created_at: "2026-01-01T00:00:00Z",
			updated_at: "2026-01-01T00:00:00Z",
		};
		function sync() {
			fs.writeFileSync(path.join(root, "issue.json"), JSON.stringify(issue));
			const result = spawnSync(process.execPath, [...process.execArgv, path.join(root, "run.ts")], {
				encoding: "utf8",
			});
			assert.equal(result.status, 0, result.stderr);
		}
		sync();
		const post = path.join(root, "src/content/post/1-test.md");
		const translation = post.replace(/\.md$/, ".en.md");
		const original = fs.readFileSync(post, "utf8");
		fs.writeFileSync(translation, "cached translation");
		issue.body = withBlogBacklink(issue.body, "published-slug", 1);
		issue.updated_at = "2026-02-01T00:00:00Z";
		sync();
		assert.equal(fs.readFileSync(post, "utf8"), original);
		assert.equal(fs.readFileSync(translation, "utf8"), "cached translation");
		issue.body = withBlogBacklink("新正文", "published-slug", 1);
		issue.updated_at = "2026-03-01T00:00:00Z";
		sync();
		assert.equal(fs.existsSync(translation), false);
		assert.match(fs.readFileSync(post, "utf8"), /新正文/);
		assert.equal(fs.readFileSync(post, "utf8").includes("文章同步在我的博客"), false);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});
