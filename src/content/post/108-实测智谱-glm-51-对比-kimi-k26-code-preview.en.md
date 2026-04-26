---
title: "Hands-on Test: Zhipu GLM 5.1 vs Kimi K2.6-code-preview"
publishDate: "2026-04-21T01:01:36Z"
updatedDate: "2026-04-21T01:01:45Z"
tags: ["AI","LLM"]
description: "Stop trying to grab Zhipu—my real-world test shows Kimi's latest K2.6-codepreview absolutely crushes GLM 5.1\n\nSince Claude Code is getting stricter and stricter, and I can't seem to send money to Claude, I went ahead and subscribed to Zhipu's Max plan for a top-tier domestic model. But after putting it to the test, the results were still underwhelming.\n\nSo I switched to Kimi's Max plan, and it just so happens they've released the K2.6-codepreview."
---

Stop scrambling for Zhipu — I tested Kimi's latest K2.6-code-preview and it crushes GLM 5.1

Because Claude Code keeps getting stricter, I couldn't pay for Claude anymore, so I ordered the Max plan from the domestic top-tier model Zhipu. After actually using it, the results were still not great.

![image-20260420120746536](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420120746536.png)

So I bought Kimi's Max plan instead. They just released the K2.6-code-preview model. Below I'll show two examples that clearly and comprehensively demonstrate the gap between the two models. In coding, Kimi is definitely ahead of Zhipu. While not many people know about this yet, I suggest you go subscribe quickly — I suspect after people find out, it'll sell out. Also I noticed Kimi is hiring AI infra engineers recently, probably preparing for the upcoming traffic surge.

![image-20260420121125143](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420121125143.png)

My test setup:

1. On a Mac, using Claude Code as the harness agent, TypeScript as the programming language.
2. Full evaluation through two tasks: **template project scaffolding** and **blog project development**, using the same prompts and environment.
3. Using Claude model as the code and system architecture quality judge, while I'm in charge of actual testing and giving conclusions.

Alright, I bet you're curious now. Let's dive in. (Oh, and if you want to know how to integrate GLM, Kimi with Claude Code, see the end of the article.)

### 1) fastify template project scaffolding

Prompt:

```bash
Now search the web, and based on the web create a lightweight, high-quality fastify typescript starter template for me to use as a backend service base starter. Also I need you to use git to make one commit per step, and finally publish the project using gh after completion.
```

This prompt tests the model's ability to gather and organize web information, understand requirements, break down tasks, etc. Let's see how Kimi and GLM performed.

**Kimi**:

![image-20260420164824600](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420164824600.png)
After starting, the API service works normally.

**GLM**:

![image-20260420170444307](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420170444307.png)
After starting, it doesn't work — had to fix a bug before it worked.

Finally I had Claude Code analyze the code, and the result: Kimi wins.

![image-20260420191549080](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420191549080.png)
The `fastify-demo` here is Kimi's version. Claude Code gave clear reasoning why Kimi's implementation is better.

### Long task test

Prompt:

```bash
Now I want to refactor my blog. Its URL is: https://luckysnail.cn/ , the corresponding GitHub repo is: https://github.com/coderPerseus/blog . I want to rebuild it using Astro, based on https://github.com/chrismwilliams/astro-theme-cactus . Requirements:
1. Improve the UI and page design based on astro-theme-cactus's current clean style — make it look better, with Chinese elements, but keep it simple.
2. Use a suitable light purple as the theme color.
3. Sync the current blog data. The data is currently stored in GitHub issues, and I want to keep using this repo's issues as the data source.
4. It should be AI-friendly: the blog supports AI automatic translation to English, and an AI short summary at the beginning.
5. Support English and Chinese, light and dark themes (with transition animations when switching).
```

This is a large, complex task requiring many steps. It tests the AI model's ability in:
- Long task execution
- Front-end aesthetics
- Backend data and AI integration
- Working with existing data and resources — also the most common scenario in daily work

After about half an hour, both models finished their work. Let's see the results.

**Kimi**:

![image-20260420194352943](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420194352943.png)

Zhipu GLM:

![image-20260420203037591](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420203037591.png)

It's very obvious — Zhipu's implementation is simply not good, and it even had errors initially, which for someone doing vibe coding is completely unacceptable.

Out of curiosity, I also compared MiniMax and Codex with the same prompt.

MiniMax:

![image-20260420200408594](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420200408594.png)

Codex:

![image-20260420194435507](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420194435507.png)

I didn't have Claude model do the development. Two reasons:

1. I need Claude to be the judge — if Claude were one of the participants, it might be unfair.
2. Claude is way too expensive — if I let it run, my 5-hour quota would probably be used up before it finishes.

Now let's look at Claude model's summary of the code and results from these four models.

![image-20260420193729999](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420193729999.png)

Here's my prompt, and below is the conclusion:

![image-20260420193805997](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420193805997.png)

The conclusion says Codex is best, followed by Kimi. Although Codex's implementation had bilingual support, it wasn't really fully functional. If we ignore the code, I think Kimi is the best, because Kimi's front-end aesthetic is on point. Codex is indeed much weaker in terms of front-end aesthetics.

### Real project development experience

After testing, I used Kimi's K2.6-code-preview model for two days on real projects. I'm even more convinced that it's truly powerful. Here's a record of a problem that Codex failed to solve twice, but Kimi fixed in one go:

Problem: After confirming a click in a scrollable area, auto-scroll to top fix.

![image-20260420142324178](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420142324178.png)

I had tried with Codex 5.4 twice without success, but Kimi fixed it in one try. Codex is the model I consider most powerful for debugging, but it lost to Kimi here. In the end, I had Codex learn from Kimi's problem-solving approach — a domestic AI rising star.

![image-20260420143742036](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420143742036.png)

## Summary

Through testing and deep usage, I believe Kimi's K2.6-code-preview is definitely a dark horse that hasn't been discovered yet. If you're still considering which big model to subscribe to, I recommend getting Kimi's starter plan — 49 yuan per month, and under normal usage you probably won't use up the quota.

## MiniMax, Kimi, GLM integration with Claude Code

```bash
# MiniMax
export ANTHROPIC_AUTH_TOKEN=sk-xxx
export ANTHROPIC_BASE_URL=https://api.minimax.io/anthropic
export ANTHROPIC_DEFAULT_OPUS_MODE=MiniMax-M2.7
export ANTHROPIC_SMALL_FAST_MODEL=MiniMax-M2.7
export ANTHROPIC_DEFAULT_SONNET_MODEL=MiniMax-M2.7
export ANTHROPIC_DEFAULT_HAIKU_MODEL=MiniMax-M2.7
export API_TIMEOUT_MS=3000000
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
# kimi
export ANTHROPIC_BASE_URL=https://api.kimi.com/coding/
export ANTHROPIC_API_KEY=sk-xxx
export ANTHROPIC_DEFAULT_OPUS_MODE=K2.6-code-preview
export ANTHROPIC_DEFAULT_SONNET_MODEL=K2.6-code-preview
export ANTHROPIC_DEFAULT_HAIKU_MODEL=K2.6-code-preview
export API_TIMEOUT_MS=3000000
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
# zai glm
export ANTHROPIC_AUTH_TOKEN=xxx
export ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
export ANTHROPIC_DEFAULT_OPUS_MODE=glm-5.1
export ANTHROPIC_DEFAULT_SONNET_MODEL=glm-5.1
export ANTHROPIC_DEFAULT_HAIKU_MODEL=glm-5.1
export API_TIMEOUT_MS=3000000
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
```

Since I also have an official Claude subscription provided by my company, I usually just paste the corresponding service into the terminal, use it temporarily in that window, and manage it conveniently with a clipboard tool.

You might see a warning in the terminal like below, but it's fine — just use it as normal.

![image-20260420164648079](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420164648079.png)

Thanks for reading! Hope this article helps you choose your AI service.

(This article is 100% handcrafted, no AI involved.)
