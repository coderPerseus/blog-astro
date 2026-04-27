---
title: "Hands-on test: Zhipu GLM 5.1 vs Kimi K2.6-code-preview"
publishDate: "2026-04-21T01:01:36Z"
updatedDate: "2026-04-21T01:01:45Z"
tags: ["AI","LLM"]
description: "I tested Zhipu GLM 5.1 against Kimi's latest K2.6-code-preview, and Kimi came out far ahead.\n\nSince Claude Code has become stricter and I could no longer pay for Claude smoothly, I subscribed to Zhipu's Max plan to try a top domestic model. After real use, the results were still underwhelming.\n\nSo I switched to Kimi's Max plan. Kimi had just released K2.6-code-preview."
---

I tested Zhipu GLM 5.1 against Kimi's latest K2.6-code-preview, and Kimi came out far ahead.

Because Claude Code has become stricter and I could no longer pay for Claude smoothly, I subscribed to Zhipu's Max plan to try a top domestic model. After real use, the results were still not great.

![image-20260420120746536](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420120746536.png)

So I bought Kimi's Max plan instead. Kimi had just released the K2.6-code-preview model. Below are two examples that show the gap between the two models. For coding, Kimi is clearly ahead of Zhipu. Not many people know this yet, so if you are interested, subscribe early. I suspect the plan may sell out once more people find out. I also noticed Kimi has been hiring AI infrastructure engineers recently, probably to prepare for a traffic spike.

![image-20260420121125143](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420121125143.png)

My test setup:

1. On a Mac, using Claude Code as the harness agent, TypeScript as the programming language.
2. Full evaluation through two tasks: **template project scaffolding** and **blog project development**, using the same prompts and environment.
3. I used Claude to evaluate code and system architecture quality while I handled the actual testing and drew the conclusions.

You are probably curious now, so let's get into it. If you want to know how to integrate GLM and Kimi with Claude Code, see the end of the article.

### Fastify template project scaffolding

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
After starting the service, it did not work. I had to fix a bug before it would run.

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

The difference is obvious: Zhipu's implementation was weak, and it even failed at first. For vibe coding, that is unacceptable.

Out of curiosity, I also compared MiniMax and Codex with the same prompt.

MiniMax:

![image-20260420200408594](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420200408594.png)

Codex:

![image-20260420194435507](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420194435507.png)

I didn't have Claude model do the development. Two reasons:

1. I needed Claude to act as the judge. If Claude were also a participant, the comparison might be unfair.
2. Claude is too expensive. If I let it run, my 5-hour quota would probably be used up before it finished.

Now let's look at Claude model's summary of the code and results from these four models.

![image-20260420193729999](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420193729999.png)

Here is my prompt, followed by the conclusion:

![image-20260420193805997](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420193805997.png)

The conclusion says Codex is best, followed by Kimi. Although Codex's implementation had bilingual support, it wasn't really fully functional. If we ignore the code, I think Kimi is the best, because Kimi's front-end aesthetic is on point. Codex is indeed much weaker in terms of front-end aesthetics.

### Real project development experience

After testing, I used Kimi's K2.6-code-preview model for two days on real projects. I am now more convinced that it is powerful. Here is a problem that Codex failed to solve twice, but Kimi fixed in one try:

Problem: After confirming a click in a scrollable area, auto-scroll to top fix.

![image-20260420142324178](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420142324178.png)

I tried Codex 5.4 twice without success, but Kimi fixed it in one try. I still consider Codex one of the strongest debugging models, but it lost to Kimi here. In the end, I had Codex learn from Kimi's approach. This is a serious domestic AI contender.

![image-20260420143742036](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420143742036.png)

## Summary

Through testing and real use, I believe Kimi's K2.6-code-preview is an under-the-radar dark horse. If you are still deciding which large model to subscribe to, I recommend Kimi's starter plan. It costs 49 yuan per month, and under normal use you probably will not use up the quota.

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
# Kimi
export ANTHROPIC_BASE_URL=https://api.kimi.com/coding/
export ANTHROPIC_API_KEY=sk-xxx
export ANTHROPIC_DEFAULT_OPUS_MODE=K2.6-code-preview
export ANTHROPIC_DEFAULT_SONNET_MODEL=K2.6-code-preview
export ANTHROPIC_DEFAULT_HAIKU_MODEL=K2.6-code-preview
export API_TIMEOUT_MS=3000000
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
# Zhipu GLM
export ANTHROPIC_AUTH_TOKEN=xxx
export ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
export ANTHROPIC_DEFAULT_OPUS_MODE=glm-5.1
export ANTHROPIC_DEFAULT_SONNET_MODEL=glm-5.1
export ANTHROPIC_DEFAULT_HAIKU_MODEL=glm-5.1
export API_TIMEOUT_MS=3000000
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
```

Since my company also provides an official Claude subscription, I usually paste the corresponding service configuration into the terminal, use it temporarily in that window, and manage the snippets with a clipboard tool.

You might see a warning in the terminal like the one below, but it is fine. Use it as normal.

![image-20260420164648079](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260420164648079.png)

Thanks for reading! Hope this article helps you choose your AI service.

(This article is 100% handcrafted, no AI involved.)
