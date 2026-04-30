/**
 * Build an ASCII-only slug for the satori-generated OG image URL.
 *
 * Why: og:image URLs containing percent-encoded UTF-8 (CJK characters)
 * trip up some social-card crawlers (notably X/Twitter), which fall back
 * to the small `summary` card with no image. Stripping CJK out of the
 * image path side-steps the issue without renaming post URLs themselves.
 */
export function ogImageSlug(postId: string): string {
	// Already ASCII-safe (e.g. "code-manager-way") — use as-is.
	if (/^[\x00-\x7F]+$/.test(postId)) return postId;
	// All CJK-titled posts in this blog have a numeric prefix like "107-..."
	const m = postId.match(/^(\d+)/);
	if (m?.[1]) return m[1];
	// Fallback for any future non-ASCII id without numeric prefix:
	// hex of UTF-8 bytes, truncated. Stable + ASCII.
	return Array.from(new TextEncoder().encode(postId))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("")
		.slice(0, 16);
}
