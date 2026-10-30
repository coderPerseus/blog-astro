import assert from "node:assert/strict";
import { test } from "node:test";
import { issueSourceHash, stripBlogBacklink, withBlogBacklink } from "./issue-backlink";

test("backlink uses the published slug and is idempotent", () => {
	const original = "---\ntitle: 示例\n---\n\n正文\n\n[其他链接](https://example.com)";
	const body = withBlogBacklink(original, "my-post", 1);
	assert.match(body, /文章同步在我的博客：\[https:\/\/luckysnail.cn\/zh\/posts\/my-post\]/);
	assert.match(
		body,
		/欢迎在\[评论区\]\(https:\/\/github.com\/coderPerseus\/blog\/issues\/1\)讨论交流。/,
	);
	assert.equal(withBlogBacklink(body, "my-post", 1), body);
	assert.equal(stripBlogBacklink(body), original);
	const changed = withBlogBacklink(body, "new-slug", 1);
	assert.equal(changed.includes("my-post"), false);
	assert.equal(stripBlogBacklink(changed), original);
});

test("footer-only edits preserve source identity, genuine changes invalidate it", () => {
	const issue = { title: "标题", body: "正文", labels: [{ name: "AI" }, { name: "Blog" }] };
	const hash = issueSourceHash(issue);
	assert.equal(
		issueSourceHash({ ...issue, body: withBlogBacklink(issue.body, "my-post", 1) }),
		hash,
	);
	assert.equal(issueSourceHash({ ...issue, labels: [...issue.labels].reverse() }), hash);
	assert.notEqual(issueSourceHash({ ...issue, title: "新标题" }), hash);
	assert.notEqual(issueSourceHash({ ...issue, body: "修改正文" }), hash);
	assert.notEqual(issueSourceHash({ ...issue, labels: [{ name: "New" }] }), hash);
});
