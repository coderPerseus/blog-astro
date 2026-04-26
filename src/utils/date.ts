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

type DatedEntry = { data: { publishDate: Date } };

export function collectionDateSort<T extends DatedEntry>(a: T, b: T) {
	return b.data.publishDate.getTime() - a.data.publishDate.getTime();
}
