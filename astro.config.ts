import fs from "node:fs";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap, { ChangeFreqEnum } from "@astrojs/sitemap";
import tailwind from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import robotsTxt from "astro-robots-txt";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypeUnwrapImages from "rehype-unwrap-images";
import remarkDirective from "remark-directive";
import { remarkAdmonitions } from "./src/plugins/remark-admonitions";
import { remarkGithubCard } from "./src/plugins/remark-github-card";
import { remarkReadingTime } from "./src/plugins/remark-reading-time";
import { expressiveCodeOptions, siteConfig } from "./src/site.config";

const site = process.env.SITE || siteConfig.url;
const base = process.env.BASE_PATH || "/";
const normalizedBase = normalizeBasePath(base);
const englishPostIds = getEnglishPostIds();

// https://astro.build/config
export default defineConfig({
	site,
	base,
	trailingSlash: "ignore",
	build: {
		format: "file",
	},
	image: {
		domains: ["webmention.io"],
	},
	integrations: [
		expressiveCode(expressiveCodeOptions),
		icon(),
		sitemap({
			filter: (page) => !isLegacyDuplicatePage(page),
			i18n: {
				defaultLocale: "zh",
				locales: {
					zh: "zh-CN",
					en: "en",
				},
			},
			serialize(item) {
				const pathname = getSitePath(item.url);
				const isHome = pathname === "/zh" || pathname === "/en";
				const isPostsIndex = pathname === "/zh/posts" || pathname === "/en/posts";
				const isPost = pathname.includes("/posts/");
				const postSlug = getLocalizedPostSlug(pathname);
				const links =
					postSlug && !englishPostIds.has(postSlug)
						? item.links?.filter((link) => link.lang !== "en")
						: item.links;
				const { links: _links, ...rest } = item;
				const serializedItem = {
					...rest,
					changefreq: isHome || isPostsIndex ? ChangeFreqEnum.WEEKLY : ChangeFreqEnum.MONTHLY,
					priority: isHome ? 1 : isPostsIndex ? 0.9 : isPost ? 0.8 : 0.7,
				};
				return {
					...serializedItem,
					...(links?.length ? { links } : {}),
				};
			},
		}),
		mdx(),
		robotsTxt({
			policy: [{ userAgent: "*", allow: "/" }],
			sitemap: new URL(`${normalizedBase || ""}/sitemap-index.xml`, site).href,
		}),
	],
	markdown: {
		rehypePlugins: [
			rehypeHeadingIds,
			[rehypeAutolinkHeadings, { behavior: "wrap", properties: { className: ["not-prose"] } }],
			[
				rehypeExternalLinks,
				{
					rel: ["noreferrer", "noopener"],
					target: "_blank",
				},
			],
			rehypeUnwrapImages,
		],
		remarkPlugins: [remarkReadingTime, remarkDirective, remarkGithubCard, remarkAdmonitions],
		remarkRehype: {
			footnoteLabelProperties: {
				className: [""],
			},
		},
	},
	vite: {
		optimizeDeps: {
			exclude: ["@resvg/resvg-js"],
		},
		plugins: [tailwind(), rawFonts([".ttf", ".woff"])],
	},
	env: {
		schema: {
			GH_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
		},
	},
});

function rawFonts(ext: string[]) {
	return {
		name: "vite-plugin-raw-fonts",
		// biome-ignore lint/suspicious/noExplicitAny: vite plugin transform
		transform(_: string, id: string): any {
			if (ext.some((e) => id.endsWith(e))) {
				const buffer = fs.readFileSync(id);
				return {
					code: `export default ${JSON.stringify(buffer)}`,
					map: null,
				};
			}
		},
	};
}

function normalizeBasePath(value: string) {
	const normalized = `/${value}`.replace(/\/+/g, "/").replace(/\/$/, "");
	return normalized === "/" ? "" : normalized;
}

function getSitePath(page: string) {
	const pathname =
		(page.startsWith("http") ? new URL(page).pathname : page).replace(/\/$/, "") || "/";
	if (!normalizedBase) return pathname;
	if (pathname === normalizedBase) return "/";
	if (pathname.startsWith(`${normalizedBase}/`))
		return pathname.slice(normalizedBase.length) || "/";
	return pathname;
}

function isLegacyDuplicatePage(page: string) {
	const pathname = getSitePath(page);
	return pathname === "/" || pathname === "/posts" || pathname.startsWith("/posts/");
}

function getLocalizedPostSlug(pathname: string) {
	const match = /^\/(?:zh|en)\/posts\/(.+)$/.exec(pathname);
	if (!match?.[1]) return undefined;
	try {
		return decodeURIComponent(match[1]);
	} catch {
		return match[1];
	}
}

function getEnglishPostIds() {
	const postDir = new URL("./src/content/post/", import.meta.url);
	const ids = new Set<string>();

	function walk(dir: URL) {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const entryUrl = new URL(entry.name, `${dir.href}/`);
			if (entry.isDirectory()) {
				walk(entryUrl);
				continue;
			}
			if (!/\.en\.mdx?$/.test(entry.name)) continue;
			ids.add(entry.name.replace(/\.en\.(md|mdx)$/, ""));
		}
	}

	if (fs.existsSync(postDir)) walk(postDir);
	return ids;
}
