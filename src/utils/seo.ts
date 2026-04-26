import { siteConfig } from "@/site.config";
import type { Lang } from "@/utils/i18n";
import { languages, stripLangFromPath, t, withLangPath } from "@/utils/i18n";

export const hreflangByLang = {
	zh: "zh-CN",
	en: "en",
} as const satisfies Record<Lang, string>;

type JsonLd = Record<string, unknown>;

interface StructuredDataInput {
	article?:
		| {
				dateModified?: string | undefined;
				datePublished: string;
				tags?: string[] | undefined;
		  }
		| undefined;
	canonicalUrl: string;
	description: string;
	imageUrl: string;
	lang: Lang;
	pathname: string;
	title: string;
}

export function getCanonicalPath(pathname: string, lang: Lang): string {
	return withLangPath(stripLangFromPath(pathname), lang);
}

export function getCanonicalUrl(pathname: string, lang: Lang): URL {
	return new URL(getCanonicalPath(pathname, lang), siteConfig.url);
}

export function getAlternateUrls(
	pathname: string,
	alternateLangs: readonly Lang[] = languages,
): Partial<Record<Lang | "x-default", URL>> {
	const alternatePath = stripLangFromPath(pathname);
	const urls: Partial<Record<Lang | "x-default", URL>> = {};
	for (const lang of alternateLangs) {
		urls[lang] = new URL(withLangPath(alternatePath, lang), siteConfig.url);
	}
	if (alternateLangs.includes("zh")) {
		urls["x-default"] = new URL(withLangPath(alternatePath, "zh"), siteConfig.url);
	}
	return urls;
}

export function getAbsoluteSiteUrl(pathOrUrl: string): string {
	if (/^(https?:)?\/\//.test(pathOrUrl)) return pathOrUrl;
	return new URL(pathOrUrl, siteConfig.url).href;
}

export function buildStructuredData({
	article,
	canonicalUrl,
	description,
	imageUrl,
	lang,
	pathname,
	title,
}: StructuredDataInput): JsonLd[] {
	const siteUrl = siteConfig.url.replace(/\/$/, "");
	const personId = `${siteUrl}/#person`;
	const websiteId = `${siteUrl}/#website`;
	const inLanguage = hreflangByLang[lang];

	const publisher: JsonLd = {
		"@type": "Person",
		"@id": personId,
		name: siteConfig.author,
		url: siteUrl,
		image: getAbsoluteSiteUrl(siteConfig.logo),
		sameAs: siteConfig.socialLinks,
	};

	const website: JsonLd = {
		"@type": "WebSite",
		"@id": websiteId,
		url: siteUrl,
		name: t("site.title", lang),
		description: t("site.description", lang),
		inLanguage,
		publisher: { "@id": personId },
	};

	const mainEntity: JsonLd = article
		? {
				"@type": "BlogPosting",
				"@id": `${canonicalUrl}#article`,
				mainEntityOfPage: canonicalUrl,
				headline: title,
				description,
				image: [imageUrl],
				inLanguage,
				datePublished: article.datePublished,
				dateModified: article.dateModified ?? article.datePublished,
				author: { "@id": personId },
				publisher: { "@id": personId },
				isPartOf: { "@id": websiteId },
				keywords: article.tags?.join(", "),
			}
		: {
				"@type": "WebPage",
				"@id": `${canonicalUrl}#webpage`,
				url: canonicalUrl,
				name: title,
				description,
				inLanguage,
				isPartOf: { "@id": websiteId },
				about: { "@id": personId },
			};

	const breadcrumb = buildBreadcrumbList(pathname, lang, title);
	return [publisher, website, mainEntity, ...(breadcrumb ? [breadcrumb] : [])];
}

export function safeJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}

function buildBreadcrumbList(pathname: string, lang: Lang, title: string): JsonLd | undefined {
	const path = stripLangFromPath(pathname).replace(/\/+$/, "") || "/";
	if (path === "/") return undefined;

	const items = [
		{
			"@type": "ListItem",
			position: 1,
			name: t("nav.home", lang),
			item: new URL(withLangPath("/", lang), siteConfig.url).href,
		},
	];

	let currentPath = "";
	const segments = path.split("/").filter(Boolean);
	segments.forEach((segment, index) => {
		currentPath += `/${segment}`;
		const isLast = index === segments.length - 1;
		items.push({
			"@type": "ListItem",
			position: index + 2,
			name: getBreadcrumbName(segment, isLast, title, lang),
			item: new URL(withLangPath(currentPath, lang), siteConfig.url).href,
		});
	});

	return {
		"@type": "BreadcrumbList",
		itemListElement: items,
	};
}

function getBreadcrumbName(segment: string, isLast: boolean, title: string, lang: Lang): string {
	if (isLast) return title;
	if (segment === "posts") return t("posts.title", lang);
	if (languages.some((language) => language === segment)) return t("nav.home", lang);
	return decodeURIComponent(segment).replace(/-/g, " ");
}
