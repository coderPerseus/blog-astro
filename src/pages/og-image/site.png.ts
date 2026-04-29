import { Resvg } from "@resvg/resvg-js";
import type { APIContext } from "astro";
import satori from "satori";
import { siteConfig } from "@/site.config";
import { buildOgFonts } from "./_fonts";
import { ogMarkup } from "./_ogMarkup";

export async function GET(_context: APIContext) {
	const fonts = await buildOgFonts(
		siteConfig.title,
		siteConfig.description,
		siteConfig.author,
	);
	const svg = await satori(ogMarkup(siteConfig.title, siteConfig.description), {
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
