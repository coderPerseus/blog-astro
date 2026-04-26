import { type CollectionEntry, getCollection } from "astro:content";
import type { Lang } from "@/utils/i18n";

/** filter out draft posts based on the environment */
export async function getAllPosts(): Promise<CollectionEntry<"post">[]> {
	return await getCollection("post", ({ data }) => {
		return import.meta.env.PROD ? !data.draft : true;
	});
}

/** All English-translated posts (entries from the postEn collection). */
export async function getAllPostsEn(): Promise<CollectionEntry<"postEn">[]> {
	return await getCollection("postEn", ({ data }) => {
		return import.meta.env.PROD ? !data.draft : true;
	});
}

/** Convenience: pick the right collection by lang. Both share id with ZH. */
export async function getAllPostsByLang(lang: Lang) {
	return lang === "en" ? await getAllPostsEn() : await getAllPosts();
}

/** Get tag metadata by tag name */
export function getTagMeta(tag: string): { data: { title: string; description: string } } | undefined {
	return {
		data: {
			title: `#${tag}`,
			description: `所有关于 ${tag} 的文章`,
		},
	};
}

/** groups posts by year (based on option siteConfig.sortPostsByUpdatedDate), using the year as the key
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 */
export function groupPostsByYear(posts: CollectionEntry<"post">[]) {
	return Object.groupBy(posts, (post) => post.data.publishDate.getFullYear().toString());
}

type TaggedEntry = { data: { tags: string[] } };

/** returns all tags created from posts (inc duplicate tags) */
export function getAllTags(posts: TaggedEntry[]) {
	return posts.flatMap((post) => [...post.data.tags]);
}

/** returns all unique tags created from posts */
export function getUniqueTags(posts: TaggedEntry[]) {
	return [...new Set(getAllTags(posts))];
}

/** returns a count of each unique tag - [[tagName, count], ...] */
export function getUniqueTagsWithCount(posts: TaggedEntry[]): [string, number][] {
	return [
		...getAllTags(posts).reduce(
			(acc, t) => acc.set(t, (acc.get(t) ?? 0) + 1),
			new Map<string, number>(),
		),
	].sort((a, b) => b[1] - a[1]);
}
