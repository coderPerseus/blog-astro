/**
 * Simple i18n system for the blog.
 * Supports zh (Chinese) and en (English).
 */

export type Lang = "zh" | "en";

const LANG_KEY = "blog-lang";

const translations: Record<string, Record<Lang, string>> = {
	"site.title": {
		zh: "幸运的蜗牛",
		en: "Lucky Snail",
	},
	"site.description": {
		zh: "前端开发者博客 | 探索 AI、React、TypeScript 与开源世界",
		en: "Frontend Developer Blog | Exploring AI, React, TypeScript & Open Source",
	},
	"nav.home": { zh: "首页", en: "Home" },
	"nav.posts": { zh: "博客", en: "Posts" },
	"nav.about": { zh: "关于", en: "About" },
	"nav.rss": { zh: "RSS", en: "RSS" },
	"nav.tags": { zh: "标签", en: "Tags" },
	"footer.copyright": { zh: "保留所有权利", en: "All rights reserved" },
	"posts.title": { zh: "博客", en: "Posts" },
	"posts.pinned": { zh: "置顶文章", en: "Pinned Posts" },
	"posts.no_posts": { zh: "暂无文章", en: "No posts yet" },
	"posts.previous": { zh: "← 上一页", en: "← Previous Page" },
	"posts.next": { zh: "下一页 →", en: "Next Page →" },
	"posts.view_all_tags": { zh: "查看全部", en: "View all" },
	"posts.tags": { zh: "标签", en: "Tags" },
	"posts.reading_time": { zh: "阅读时间", en: "reading time" },
	"posts.ai_summary": { zh: "AI 摘要", en: "AI Summary" },
	"posts.ai_summary_en": { zh: "AI Summary (English)", en: "AI Summary" },
	"posts.translation": { zh: "英文翻译", en: "Translation" },
	"posts.original": { zh: "原文", en: "Original" },
	"search.open": { zh: "打开搜索", en: "Open Search" },
	"search.close": { zh: "关闭", en: "Close" },
	"search.dev_warning": {
		zh: "搜索仅在构建后的版本可用。请尝试构建并预览站点来测试。",
		en: "Search is only available in production builds. Try building and previewing the site to test.",
	},
	"theme.light": { zh: "浅色模式", en: "Light Mode" },
	"theme.dark": { zh: "深色模式", en: "Dark Mode" },
	"theme.system": { zh: "跟随系统", en: "System" },
	"lang.switch": { zh: "Switch to English", en: "切换到中文" },
	"lang.label": { zh: "EN", en: "中文" },
	"404.title": { zh: "404 | 页面未找到", en: "404 | Page Not Found" },
	"404.message": { zh: "请使用导航找到你要的内容", en: "Please use the navigation to find your way back" },
	"about.title": { zh: "关于", en: "About" },
	"about.description": {
		zh: "前端开发者 | AI 探索者 | 终身学习者",
		en: "Frontend Developer | AI Explorer | Lifelong Learner",
	},
	"skip.content": { zh: "跳转到内容", en: "Skip to content" },
	"back.top": { zh: "回到顶部", en: "Back to top" },
	"toc.title": { zh: "目录", en: "Table of Contents" },
};

export function t(key: string, lang: Lang): string {
	return translations[key]?.[lang] ?? translations[key]?.zh ?? key;
}

export function getLangFromRequest(url: URL): Lang {
	const pathLang = url.pathname.split("/")[1];
	if (pathLang === "en") return "en";
	return "zh";
}

export function setLang(lang: Lang): void {
	if (typeof localStorage !== "undefined") {
		localStorage.setItem(LANG_KEY, lang);
	}
}

export function getStoredLang(): Lang {
	if (typeof localStorage !== "undefined") {
		const stored = localStorage.getItem(LANG_KEY);
		if (stored === "en" || stored === "zh") return stored;
	}
	return "zh";
}
