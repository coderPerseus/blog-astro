const MAX_SLUG_LENGTH = 72;

const STOP_WORDS = new Set([
	"a",
	"an",
	"and",
	"are",
	"as",
	"at",
	"be",
	"by",
	"for",
	"from",
	"how",
	"in",
	"into",
	"is",
	"it",
	"of",
	"on",
	"or",
	"the",
	"this",
	"to",
	"using",
	"with",
]);

export function normalizeSlugCandidate(value: string): string {
	return value
		.normalize("NFKD")
		.toLowerCase()
		.replace(/```(?:json)?/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, MAX_SLUG_LENGTH)
		.replace(/-+$/g, "");
}

export function fallbackSlugFromEnglishTitle(title: string): string {
	const normalized = normalizeSlugCandidate(
		title
			.replace(/c\+\+/gi, "cpp")
			.replace(/c#/gi, "csharp")
			.replace(/\.js\b/gi, "js"),
	);
	const words = normalized
		.split("-")
		.filter(Boolean)
		.filter((word) => !STOP_WORDS.has(word))
		.slice(0, 9);
	return normalizeSlugCandidate(words.join("-"));
}

export function isValidPostSlug(slug: string): boolean {
	return (
		slug.length >= 3 && slug.length <= MAX_SLUG_LENGTH && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
	);
}

export function makeUniquePostSlug(
	candidate: string,
	reserved: Set<string>,
	fallbackTitle: string,
	identifier: string,
): string {
	let slug = normalizeSlugCandidate(candidate);
	if (!isValidPostSlug(slug)) slug = fallbackSlugFromEnglishTitle(fallbackTitle);
	if (!isValidPostSlug(slug)) slug = `post-${identifier}`;
	if (reserved.has(slug)) {
		slug = normalizeSlugCandidate(`${slug}-${identifier}`);
	}
	if (reserved.has(slug)) {
		throw new Error(`Unable to create a unique slug for ${identifier}`);
	}
	reserved.add(slug);
	return slug;
}

export function getPostIdentifier(entryId: string): string {
	return entryId.match(/^\d+/)?.[0] ?? entryId.slice(0, 12);
}
