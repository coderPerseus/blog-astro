export interface SiteConfig {
	author: string;
	date: {
		locale: string | string[] | undefined;
		options: Intl.DateTimeFormatOptions;
	};
	defaultOgImage: string;
	description: string;
	lang: string;
	logo: string;
	ogLocale: string;
	socialLinks: string[];
	themeColor: string;
	title: string;
	url: string;
}

export interface PaginationLink {
	srLabel?: string;
	text?: string;
	url: string;
}

export interface SiteMeta {
	alternateLangs?: ("zh" | "en")[] | undefined;
	articleDate?: string | undefined;
	articleModifiedDate?: string | undefined;
	description?: string | undefined;
	ogImage?: string | undefined;
	tags?: string[] | undefined;
	title: string;
}

export type AdmonitionType = "tip" | "note" | "important" | "caution" | "warning";
