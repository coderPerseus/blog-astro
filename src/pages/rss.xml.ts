import rss from "@astrojs/rss";
import { getAllPosts } from "@/data/post";
import { siteConfig } from "@/site.config";

export const GET = async () => {
	const posts = await getAllPosts();
	const site = new URL(import.meta.env.BASE_URL, import.meta.env.SITE).href;

	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.publishDate,
			link: `posts/${post.id}/`,
		})),
	});
};
