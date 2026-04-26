/**
 * Simple i18n system for the blog.
 * Supports zh (Chinese) and en (English).
 */

export type Lang = "zh" | "en";

export const languages = ["zh", "en"] as const satisfies Lang[];
export const defaultLang: Lang = "zh";

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
	"posts.description": {
		zh: "我的全部博客文章，按时间倒序排列。可按标签筛选。",
		en: "All blog posts in reverse chronological order. Filter by tag.",
	},
	"posts.pinned": { zh: "置顶文章", en: "Pinned Posts" },
	"posts.no_posts": { zh: "暂无文章", en: "No posts yet" },
	"posts.count_suffix": { zh: "篇", en: "posts" },
	"posts.sort_hint": { zh: "按时间倒序", en: "Newest first" },
	"posts.all": { zh: "全部", en: "All" },
	"posts.end": { zh: "已经到底了 ✦", en: "You are all caught up ✦" },
	"posts.empty": { zh: "没有匹配的文章", en: "No matching posts" },
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
	"search.dev_warning_line_1": {
		zh: "搜索仅在构建后的版本可用。",
		en: "Search is only available in production builds.",
	},
	"search.dev_warning_line_2": {
		zh: "请构建并预览站点来测试搜索。",
		en: "Build and preview the site to test search locally.",
	},
	"theme.light": { zh: "浅色模式", en: "Light Mode" },
	"theme.dark": { zh: "深色模式", en: "Dark Mode" },
	"theme.system": { zh: "跟随系统", en: "System" },
	"lang.switch": { zh: "Switch to English", en: "切换到中文" },
	"lang.label": { zh: "EN", en: "中文" },
	"home.meta_title": { zh: "首页", en: "Home" },
	"home.eyebrow": { zh: "你好，我是", en: "Hi, I'm" },
	"home.bio_1": {
		zh: "我是幸运的蜗牛，全栈开发（偏前端）。专注于 Web 技术、服务端技术和 AI Agent，目前在上海。",
		en: "I'm Lucky Snail, a full-stack developer (favoring front-end). Specialized in Web technologies, server-side technologies and AI Agent, currently in Shanghai.",
	},
	"home.bio_2": {
		zh: "技术栈：React/Vue、JavaScript/TypeScript、Next.js、Node.js、Fastify、Nest.js、PostgreSQL、React Native、Electron、Taro、Python等，目前在开发自己的 AI Agent 。这里记录我的所见，所闻，所思",
		en: "Technology stack: React/Vue, JavaScript/TypeScript, Next.js, Node.js, Fastify, Nest.js, PostgreSQL, React Native, Electron, Taro, Python, etc. Currently developing its own AI Agent. Here's a record of what I've seen, heard, and thought about",
	},
	"home.bio_3": {
		zh: "座右铭：提高认知，强化执行，在竞争中做到极致",
		en: "Motto: Enhance awareness, strengthen execution, and be the best in the competition",
	},
	"home.projects": { zh: "项目", en: "Projects" },
	"home.latest_posts": { zh: "最新文章", en: "Latest Posts" },
	"home.all_posts": { zh: "所有帖子 →", en: "All posts →" },
	"social.find_me": { zh: "找到我", en: "Find me" },
	"404.title": { zh: "404 | 页面未找到", en: "404 | Page Not Found" },
	"404.message": {
		zh: "糟糕，你要找的页面不存在。",
		en: "Oops, the page you’re looking for can’t be found.",
	},
	"404.heading": { zh: "页面未找到", en: "Page not found" },
	"404.cta": { zh: "返回首页", en: "Back to Home" },
	"about.title": { zh: "关于", en: "About" },
	"about.description": {
		zh: "前端开发者 | AI 探索者 | 终身学习者",
		en: "Frontend Developer | AI Explorer | Lifelong Learner",
	},
	"skip.content": { zh: "跳转到内容", en: "Skip to content" },
	"back.top": { zh: "回到顶部", en: "Back to top" },
	"toc.title": { zh: "目录", en: "Table of Contents" },
	"masthead.article": { zh: "文章", en: "Article" },
	"masthead.updated": { zh: "更新于：", en: "Updated:" },
	"projects.company": { zh: "公司", en: "Work" },
	"projects.open_source": { zh: "开源", en: "Open Source" },
	"projects.personal": { zh: "个人", en: "Personal" },
};

export function t(key: string, lang: Lang): string {
	return translations[key]?.[lang] ?? translations[key]?.zh ?? key;
}

export function isLang(value: string | undefined): value is Lang {
	return value === "zh" || value === "en";
}

export function getLangFromRequest(url: URL): Lang {
	const pathLang = url.pathname.split("/")[1];
	return isLang(pathLang) ? pathLang : defaultLang;
}

export function getLocale(lang: Lang): string {
	return lang === "zh" ? "zh-CN" : "en";
}

export function getOgLocale(lang: Lang): string {
	return lang === "zh" ? "zh_CN" : "en_US";
}

function getBasePath(): string {
	const base = import.meta.env.BASE_URL || "/";
	const normalized = `/${base}`.replace(/\/+/g, "/").replace(/\/$/, "");
	return normalized === "/" ? "" : normalized;
}

export function stripBaseFromPath(pathname: string): string {
	const canonical = pathname.replace(/\.html$/, "").replace(/\/index$/, "") || "/";
	const base = getBasePath();
	if (!base) return canonical;
	if (canonical === base) return "/";
	if (canonical.startsWith(`${base}/`)) return canonical.slice(base.length) || "/";
	return canonical;
}

export function withBase(pathname: string): string {
	if (
		/^(https?:)?\/\//.test(pathname) ||
		pathname.startsWith("mailto:") ||
		pathname.startsWith("#")
	) {
		return pathname;
	}

	const base = getBasePath();
	const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
	if (!base) return normalized;
	if (normalized === base || normalized.startsWith(`${base}/`)) return normalized;
	return `${base}${normalized === "/" ? "" : normalized}`;
}

export function stripLangFromPath(pathname: string): string {
	const canonical = stripBaseFromPath(pathname);
	const segments = canonical.split("/");
	const maybeLang = segments[1];
	if (!isLang(maybeLang)) return canonical || "/";

	const stripped = `/${segments.slice(2).join("/")}`;
	return stripped === "/" ? "/" : stripped.replace(/\/{2,}/g, "/");
}

export function withLang(pathname: string, lang: Lang): string {
	if (/^(https?:)?\/\//.test(pathname) || pathname.startsWith("mailto:")) return pathname;

	const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
	const stripped = stripLangFromPath(normalized);
	if (stripped === "/") return withBase(`/${lang}`);
	const trimmed = stripped.replace(/\/+$/, "");
	return withBase(`/${lang}${trimmed}`);
}

export function withLangPath(pathname: string, lang: Lang): string {
	if (/^(https?:)?\/\//.test(pathname) || pathname.startsWith("mailto:")) return pathname;

	const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
	const stripped = stripLangFromPath(normalized);
	if (stripped === "/") return `/${lang}`;
	const trimmed = stripped.replace(/\/+$/, "");
	return `/${lang}${trimmed}`;
}

export function switchLangPath(pathname: string, lang: Lang): string {
	return withLang(stripLangFromPath(pathname), lang);
}

export function getMenuLinks(lang: Lang): { path: string; title: string }[] {
	return [
		{ path: withLang("/", lang), title: t("nav.home", lang) },
		{ path: withLang("/posts", lang), title: t("nav.posts", lang) },
	];
}

export function localizeReadingTime(readingTime: string, lang: Lang): string {
	if (lang === "en") return readingTime;
	return readingTime.replace(/\bmins?\s+read\b/i, "分钟阅读");
}
