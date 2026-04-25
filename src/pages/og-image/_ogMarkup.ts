import { html } from "satori-html";
import { siteConfig } from "@/site.config";

// OG image markup, use https://og-playground.vercel.app/ to design your own.
export const ogMarkup = (title: string, pubDate: string) =>
	html`<div tw="flex flex-col w-full h-full bg-[#1a1530] text-[#d4cee8]">
		<div tw="flex flex-col flex-1 w-full p-10 justify-center">
			<p tw="text-2xl mb-6 text-[#9b8ec4]">${pubDate}</p>
			<h1 tw="text-6xl font-bold leading-snug text-[#ede8f7]">${title}</h1>
		</div>
		<div tw="flex items-center justify-between w-full p-10 border-t border-[#7b61c8] text-xl">
			<div tw="flex items-center">
				<svg height="60" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0"></svg>
				<p tw="ml-3 font-semibold">${siteConfig.title}</p>
			</div>
			<p>by ${siteConfig.author}</p>
		</div>
	</div>`;
