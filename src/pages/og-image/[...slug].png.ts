import { Resvg } from "@resvg/resvg-js";
import type { APIContext, InferGetStaticPropsType } from "astro";
import satori from "satori";
import { getAllPosts, getAllPostsEn } from "@/data/post";
import { siteConfig } from "@/site.config";
import { getFormattedDate } from "@/utils/date";
import { type Lang, t } from "@/utils/i18n";
import { ogImageSlug } from "@/utils/og";
import { buildOgFonts } from "./_fonts";
import { ogMarkup } from "./_ogMarkup";

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export async function GET(context: APIContext) {
	const { lang, pubDate, title } = context.props as Props;

	const postDate = getFormattedDate(
		pubDate,
		{ month: "long", weekday: "long" },
		lang,
	);
	const localizedSiteTitle = t("site.title", lang);
	const fonts = await buildOgFonts(title, postDate, localizedSiteTitle, siteConfig.author);
	const svg = await satori(ogMarkup(title, postDate, lang), {
		fonts,
		height: 630,
		width: 1200,
	});
	const pngBuffer = new Resvg(svg).render().asPng();
	const png = new Uint8Array(pngBuffer);
	return new Response(png, {
		headers: {
			"Cache-Control": "public, max-age=31536000, immutable",
			"Content-Type": "image/png",
		},
	});
}

export async function getStaticPaths() {
	const [zhPosts, enPosts] = await Promise.all([getAllPosts(), getAllPostsEn()]);

	const zhPaths = zhPosts
		.filter(({ data }) => !data.ogImage)
		.map((post) => ({
			params: { slug: ogImageSlug(post.id) },
			props: {
				lang: "zh" as Lang,
				pubDate: post.data.updatedDate ?? post.data.publishDate,
				title: post.data.title,
			},
		}));

	const enPaths = enPosts
		.filter(({ data }) => !data.ogImage)
		.map((post) => ({
			params: { slug: `${ogImageSlug(post.id)}.en` },
			props: {
				lang: "en" as Lang,
				pubDate: post.data.updatedDate ?? post.data.publishDate,
				title: post.data.title,
			},
		}));

	return [...zhPaths, ...enPaths];
}
