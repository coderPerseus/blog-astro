import type { SatoriOptions } from "satori";
import RobotoMonoBold from "@/assets/roboto-mono-700.ttf";
import RobotoMono from "@/assets/roboto-mono-regular.ttf";

const CJK_RE = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/;

async function loadGoogleFontSubset(
	family: string,
	weight: 400 | 700,
	text: string,
): Promise<ArrayBuffer | null> {
	if (!text) return null;
	// v1 css endpoint + ancient UA forces Google Fonts to serve TTF instead of WOFF2;
	// satori's bundled opentype.js fork can't decompress WOFF2.
	const familyParam = `${family.replace(/ /g, "+")}:${weight}`;
	const url = `https://fonts.googleapis.com/css?family=${familyParam}&text=${encodeURIComponent(text)}`;
	try {
		const cssRes = await fetch(url, {
			headers: { "User-Agent": "Mozilla/4.0" },
		});
		if (!cssRes.ok) return null;
		const css = await cssRes.text();
		const fontUrl = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
		if (!fontUrl) return null;
		const fontRes = await fetch(fontUrl);
		if (!fontRes.ok) return null;
		return await fontRes.arrayBuffer();
	} catch (err) {
		console.warn(`[og-image] Failed to load ${family} ${weight}:`, err);
		return null;
	}
}

export async function buildOgFonts(
	...textSources: string[]
): Promise<SatoriOptions["fonts"]> {
	const cjkChars = Array.from(
		new Set(textSources.join("").split("").filter((c) => CJK_RE.test(c))),
	).join("");

	const [cjkRegular, cjkBold] = await Promise.all([
		loadGoogleFontSubset("Noto Sans SC", 400, cjkChars),
		loadGoogleFontSubset("Noto Sans SC", 700, cjkChars),
	]);

	const fonts: SatoriOptions["fonts"] = [
		{
			data: Buffer.from(RobotoMono),
			name: "Roboto Mono",
			style: "normal",
			weight: 400,
		},
		{
			data: Buffer.from(RobotoMonoBold),
			name: "Roboto Mono",
			style: "normal",
			weight: 700,
		},
	];
	if (cjkRegular)
		fonts.push({
			data: cjkRegular,
			name: "Noto Sans SC",
			style: "normal",
			weight: 400,
		});
	if (cjkBold)
		fonts.push({
			data: cjkBold,
			name: "Noto Sans SC",
			style: "normal",
			weight: 700,
		});
	return fonts;
}
