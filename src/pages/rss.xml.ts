import rss from "@astrojs/rss";
import { getAllPosts } from "@/data/post";
import { siteConfig } from "@/site.config";

export const GET = async () => {
	const posts = await getAllPosts();
	const site = siteConfig.url;

	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.publishDate,
			link: `zh/posts/${post.id}/`,
			categories: post.data.tags,
		})),
	});
};
