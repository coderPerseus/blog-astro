import type { CollectionEntry } from "astro:content";
import { siteConfig } from "@/site.config";
import { getLocale, type Lang } from "@/utils/i18n";

export function getFormattedDate(
	date: Date | undefined,
	options?: Intl.DateTimeFormatOptions,
	lang?: Lang,
): string {
	if (date === undefined) {
		return "Invalid Date";
	}

	return new Intl.DateTimeFormat(lang ? getLocale(lang) : siteConfig.date.locale, {
		...(siteConfig.date.options as Intl.DateTimeFormatOptions),
		...options,
	}).format(date);
}

export function collectionDateSort(a: CollectionEntry<"post">, b: CollectionEntry<"post">) {
	return b.data.publishDate.getTime() - a.data.publishDate.getTime();
}
