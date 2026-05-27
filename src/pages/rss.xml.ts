import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getAllPosts } from "@/data/post";
import { siteConfig } from "@/site.config";
import { collectionDateSort } from "@/utils/date";

export const GET = async ({ site: astroSite }: APIContext) => {
	const posts = (await getAllPosts()).sort(collectionDateSort);
	const site = astroSite ?? new URL(siteConfig.url);
	const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
	const rssPath = `${basePath}/rss.xml`.replace(/\/+/g, "/");

	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site,
		xmlns: {
			atom: "http://www.w3.org/2005/Atom",
		},
		customData: [
			`<language>${siteConfig.lang}</language>`,
			`<atom:link href="${new URL(rssPath, site).href}" rel="self" type="application/rss+xml" />`,
		].join(""),
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			content: post.rendered?.html,
			pubDate: post.data.publishDate,
			link: `${basePath}/zh/posts/${post.id}/`.replace(/\/+/g, "/"),
			categories: post.data.tags,
		})),
	});
};
