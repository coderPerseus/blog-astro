import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { checkPostImages } from "./check-post-images.mjs";

function fixture(t, files) {
	const root = mkdtempSync(path.join(os.tmpdir(), "blog-image-check-"));
	t.after(() => rmSync(root, { recursive: true, force: true }));
	for (const [name, content] of Object.entries(files)) {
		const filename = path.join(root, name);
		mkdirSync(path.dirname(filename), { recursive: true });
		writeFileSync(filename, content);
	}
	return root;
}

test("reports every missing image with article, original URL, and source line", (t) => {
	const root = fixture(t, {
		"src/content/post/128-droid.md": "---\ntitle: Droid\n---\n\n![图 1](images/fig1.jpg)\n",
		"src/content/post/128-droid.en.md": "![Figure 1](images/fig1.jpg)\n",
	});
	const result = checkPostImages(root);
	assert.equal(result.files, 2);
	assert.deepEqual(
		result.missing.map(({ article, url, line }) => ({ article, url, line })),
		[
			{ article: "src/content/post/128-droid.en.md", url: "images/fig1.jpg", line: 1 },
			{ article: "src/content/post/128-droid.md", url: "images/fig1.jpg", line: 5 },
		],
	);
	const cli = spawnSync(
		process.execPath,
		[fileURLToPath(new URL("./check-post-images.mjs", import.meta.url))],
		{
			cwd: root,
			env: { ...process.env, GITHUB_ACTIONS: "true" },
			encoding: "utf8",
		},
	);
	assert.equal(cli.status, 1);
	assert.match(
		cli.stderr,
		/src\/content\/post\/128-droid.md:5: Missing local image "images\/fig1.jpg"/,
	);
	assert.match(cli.stderr, /::error file=src\/content\/post\/128-droid.md,line=5,/);
	assert.match(cli.stderr, /2 missing local image/);
});

test("resolves relative, encoded, public, and source-alias images", (t) => {
	const root = fixture(t, {
		"src/content/post/nested/example.mdx": [
			'![relative](../images/chart.png "Chart title")',
			"![encoded](../images/chart%20one.png?width=800#figure)",
			"![public](/images/public.png)",
			"![alias](@/assets/chart.png)",
			"![reference][figure]",
			"[figure]: ../images/chart.png",
			'<img src="/images/public.png?width=800&amp;height=400" />',
		].join("\n\n"),
		"src/content/post/images/chart.png": "image",
		"src/content/post/images/chart one.png": "image",
		"public/images/public.png": "image",
		"src/assets/chart.png": "image",
	});
	assert.deepEqual(checkPostImages(root).missing, []);
});

test("checks reference and HTML images while ignoring code, comments, and remote URLs", (t) => {
	const root = fixture(t, {
		"src/content/post/example.md": [
			"![missing][chart]",
			"[chart]: images/reference.png",
			'<img alt="missing" src="images/html.png">',
			"![directory](images)",
			"![remote](https://example.com/image.png)",
			"![protocol relative](//example.com/image.png)",
			"![data](data:image/png;base64,AAAA)",
			"`![inline example](images/code.png)`",
			'```md\n![fenced example](images/fence.png)\n<img src="images/fence.png">\n```',
			'<!-- <img src="images/comment.png"> -->',
		].join("\n\n"),
		"src/content/post/images/exists.png": "image",
	});
	assert.deepEqual(
		checkPostImages(root).missing.map(({ url }) => url),
		["images/reference.png", "images/html.png", "images"],
	);
});
