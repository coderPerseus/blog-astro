import { createHash } from "node:crypto";

const START = "<!-- luckysnail-blog-link:start -->";
const END = "<!-- luckysnail-blog-link:end -->";

export function stripBlogBacklink(body: string): string {
	return body
		.replace(/\n*<!-- luckysnail-blog-link:start -->[\s\S]*?<!-- luckysnail-blog-link:end -->/g, "")
		.trimEnd();
}

export function withBlogBacklink(body: string, slug: string, issueNumber: number): string {
	const url = `https://luckysnail.cn/zh/posts/${slug}`;
	return `${stripBlogBacklink(body)}\n\n${START}\n文章同步在我的博客：[${url}](${url})\n\n欢迎在[评论区](https://github.com/coderPerseus/blog/issues/${issueNumber})讨论交流。\n${END}\n`;
}

export function issueSourceHash(issue: {
	title: string;
	body: string | null;
	labels: { name: string }[];
}): string {
	return createHash("sha256")
		.update(
			JSON.stringify({
				title: issue.title,
				body: stripBlogBacklink(issue.body ?? ""),
				labels: issue.labels.map((label) => label.name).sort(),
			}),
		)
		.digest("hex");
}
