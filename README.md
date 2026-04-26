# 幸运的蜗牛 Blog

这是 [luckysnail.cn](https://luckysnail.cn/) 的源码仓库，一个基于 Astro 的个人技术博客。项目从 Astro Cactus 主题演进而来，当前主要用于发布前端、AI、React、TypeScript、开源和工程实践相关内容。

## 技术栈

- [Astro 6](https://astro.build/) + Content Collections
- Tailwind CSS 4
- Markdown / MDX 内容写作
- 中英双语路由与文章集合
- Pagefind 静态搜索
- Expressive Code 代码高亮
- Satori + Sharp 生成文章 Open Graph 图片
- GitHub Actions 自动同步、翻译、构建并部署到 GitHub Pages

## 项目结构

```text
.
├── src/
│   ├── components/        # 页面、布局、搜索、主题切换等组件
│   ├── content/post/      # 博客文章，中文原文与 .en.md 英文译文
│   ├── data/post.ts       # 文章查询、标签统计等数据方法
│   ├── layouts/           # 基础布局和文章布局
│   ├── pages/             # Astro 路由，包含双语页面、RSS、OG 图片
│   ├── plugins/           # remark 插件
│   ├── styles/            # 全局样式和组件样式
│   └── utils/             # i18n、日期、目录生成等工具
├── scripts/
│   ├── fetch-issues.ts        # 从 GitHub Issues 同步文章
│   ├── translate-posts.ts     # 使用 DeepSeek 生成英文译文
│   └── generate-ai-content.ts # 生成 AI 摘要字段
├── public/                # favicon、manifest、验证文件等静态资源
└── .github/workflows/     # CI 与部署工作流
```

## 本地开发

建议使用 pnpm。

```bash
pnpm install
pnpm dev
```

开发服务器默认由 Astro 启动，通常是 `http://localhost:4321`。

## 常用命令

| 命令             | 作用                             |
| ---------------- | -------------------------------- |
| `pnpm dev`       | 启动本地开发服务器               |
| `pnpm build`     | 构建生产版本到 `dist/`           |
| `pnpm postbuild` | 为构建产物生成 Pagefind 搜索索引 |
| `pnpm preview`   | 本地预览构建产物                 |
| `pnpm check`     | 运行 `astro check` 与 Biome 检查 |
| `pnpm lint`      | 使用 Biome 自动修复可修复问题    |
| `pnpm format`    | 使用 Prettier 格式化项目文件     |

## 写文章

文章放在 `src/content/post/`。中文原文使用普通 Markdown / MDX 文件，英文译文使用同名 `.en.md` 文件。

示例：

```text
src/content/post/102-2026手写代码时代彻底结束了.md
src/content/post/102-2026手写代码时代彻底结束了.en.md
```

常用 frontmatter：

```yaml
---
title: "文章标题"
publishDate: "2026-01-01T00:00:00.000Z"
updatedDate: "2026-01-02T00:00:00.000Z"
tags: ["ai", "frontend"]
description: "文章摘要，用于 SEO 和列表展示"
draft: false
pinned: false
aiSummary: "中文 AI 摘要"
aiSummaryEn: "English AI summary"
translationEn: true
---
```

说明：

- `draft: true` 的文章在生产环境会被过滤。
- `pinned: true` 会让文章进入置顶区域。
- `tags` 会自动去重并转为小写。
- 英文文章通过 `postEn` collection 加载，`.en.md` 会和中文原文共享同一个文章 id。

## 内容自动化

### 同步 GitHub Issues

`scripts/fetch-issues.ts` 会从 `coderPerseus/blog` 的 GitHub Issues 拉取内容并写入 `src/content/post/`。

```bash
GH_TOKEN=xxx npx tsx scripts/fetch-issues.ts
```

同步规则：

- 只同步 open issue。
- 会跳过 `codex`、`bug` 等非内容标签。
- 已存在文章按 issue number 前缀匹配。
- 远端 issue 更新后会重写本地中文文章，并删除对应英文译文，方便重新翻译。

### 生成英文译文

`scripts/translate-posts.ts` 使用 DeepSeek 的 OpenAI 兼容接口，把缺失的中文文章翻译成 `.en.md`。

```bash
DEEPSEEK_API_KEY=xxx npx tsx scripts/translate-posts.ts
```

常用参数：

```bash
npx tsx scripts/translate-posts.ts --slug=104-
npx tsx scripts/translate-posts.ts --limit=1
npx tsx scripts/translate-posts.ts --dry-run
npx tsx scripts/translate-posts.ts --force
```

### 生成 AI 摘要

`scripts/generate-ai-content.ts` 会为文章补齐 `aiSummary` 和 `aiSummaryEn`。

```bash
OPENAI_API_KEY=xxx OPENAI_BASE_URL=https://api.openai.com/v1 npx tsx scripts/generate-ai-content.ts
```

也支持读取 `ANTHROPIC_API_KEY`、`ANTHROPIC_BASE_URL` 和 `ANTHROPIC_DEFAULT_SONNET_MODEL`。

## 站点配置

核心配置在 `src/site.config.ts`：

- `siteConfig.url`：站点域名
- `siteConfig.title`：站点标题
- `siteConfig.description`：站点描述
- `siteConfig.date`：日期本地化配置
- `expressiveCodeOptions`：代码块主题和样式

路由和语言相关逻辑在 `src/utils/i18n.ts`。当前支持：

- `/zh`：中文
- `/en`：英文

## 搜索

搜索基于 Pagefind。开发环境不会生成索引，需要先构建再预览：

```bash
pnpm build
pnpm postbuild
pnpm preview
```

## 部署

部署工作流位于 `.github/workflows/deploy.yml`。主流程是：

1. 安装依赖。
2. 从 GitHub Issues 增量同步文章。
3. 使用 DeepSeek 翻译新增或更新文章。
4. 将同步后的内容提交回 `main`。
5. 构建 Astro 站点。
6. 部署到 GitHub Pages。
7. 如果配置了宝塔服务器的 SSH 信息，同时构建并同步到宝塔站点目录。

需要在 GitHub 仓库中配置：

- `GH_TOKEN`
- `DEEPSEEK_API_KEY`

如果要同步部署到宝塔服务器，还需要配置：

- `BAOTA_HOST`：服务器 IP 或域名
- `BAOTA_PORT`：SSH 端口，未配置时默认使用 `22`
- `BAOTA_USER`：SSH 用户
- `BAOTA_PATH`：宝塔站点目录，例如 `/www/wwwroot/luckysnail.cn`
- `BAOTA_SSH_KEY`：可登录服务器的 SSH 私钥
- `BAOTA_SITE`：国内站点域名，未配置时默认使用 `https://luckysnail.cn`

## 致谢

项目最初基于 [Astro Cactus](https://github.com/chrismwilliams/astro-theme-cactus) 修改。

## License

MIT
