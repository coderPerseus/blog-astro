import type { AstroExpressiveCodeOptions } from "astro-expressive-code";
import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
	url: "https://luckysnail.cn/",
	title: "幸运的蜗牛",
	author: "LuckySnail",
	description: "前端开发者博客 | 探索 AI、React、TypeScript 与开源世界",
	defaultOgImage: "/og-image/site.png",
	logo: "/logo.png",
	lang: "zh-CN",
	ogLocale: "zh_CN",
	socialLinks: [
		"https://github.com/coderPerseus",
		"https://www.xiaohongshu.com/user/profile/5e2d938d000000000100ac82",
		"https://space.bilibili.com/1695997565",
	],
	themeColor: "#f7f3ea",
	date: {
		locale: "zh-CN",
		options: {
			year: "numeric",
			month: "long",
			day: "numeric",
		},
	},
};

export const menuLinks: { path: string; title: string }[] = [
	{ path: "/", title: "首页" },
	{ path: "/posts/", title: "博客" },
	{ path: "/rss.xml", title: "RSS" },
];

export const expressiveCodeOptions: AstroExpressiveCodeOptions = {
	styleOverrides: {
		borderRadius: "4px",
		codeFontFamily:
			'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
		codeFontSize: "0.875rem",
		codeLineHeight: "1.7142857rem",
		codePaddingInline: "1rem",
		frames: {
			frameBoxShadowCssValue: "none",
		},
		uiLineHeight: "inherit",
	},
	themeCssSelector(theme, { styleVariants }) {
		if (styleVariants.length >= 2) {
			const baseTheme = styleVariants[0]?.theme;
			const altTheme = styleVariants.find((v) => v.theme.type !== baseTheme?.type)?.theme;
			if (theme === baseTheme || theme === altTheme) return `[data-theme='${theme.type}']`;
		}
		return `[data-theme="${theme.name}"]`;
	},
	themes: ["dracula", "github-light"],
	useThemedScrollbars: false,
};
