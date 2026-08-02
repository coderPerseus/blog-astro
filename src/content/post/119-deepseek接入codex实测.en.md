---
title: "DeepSeek Integrated with Codex: A Hands-On Test"
publishDate: "2026-08-02T06:39:34Z"
updatedDate: "2026-08-02T06:39:34Z"
tags: ["AI"]
description: "Yesterday DeepSeek released deepseekv4flash, which significantly improves Agent capabilities. I integrated it into Codex (now ChatGPT, referred to as ChatGPT throughout this post) and tested it myself—it's really impressive. Below I'll share my hands-on experience and takeaways, hoping it helps you. Here's a quick overview of what's covered:\n\n- What did DeepSeek release on 0731?\n- How to"
---

Yesterday DeepSeek released deepseek-v4-flash, which significantly improves agent capabilities. I integrated it into Codex myself (now ChatGPT, I'll refer to it as ChatGPT throughout) and tested it — it's genuinely impressive. Here's my hands-on experience and takeaways, hope it helps. Quick overview:

- What did DeepSeek release on 07-31?
- How to integrate DeepSeek into ChatGPT?
- Hands-on testing of DeepSeek's capabilities inside ChatGPT.
- Which scenarios are a good fit for DeepSeek?
- A quick summary!

Let's dive in.

## 07-31 DeepSeek Update

This update covers two main areas:

1) Released the DeepSeek-V4-Flash stable version, but it's API-only for now, so the web and client apps you use are still on the old model.

2) Agent capabilities got a major boost, with native support for ChatGPT (Responses API). The official docs provide a one-click configuration method, after which you can use it in the ChatGPT CLI, ChatGPT desktop app, and the ChatGPT extension in VS Code. What I'm most interested in is the DeepSWE score of 54.4, up from 7.3 before — that's a massive leap. Looking at the latest DeepSWE leaderboard, DeepSeek beats GLM 5.2 by ten percentage points and sits in the same tier as Claude Sonnet 5 and Grok 4.5.

![image-20260801203702887](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image-20260801203702887.png)

You might think it still lags far behind the top-tier models like GPT-5.6 Sol and Claude Opus 5, but let's compare the prices and you'll see how generous DeepSeek is.

| Model                  | Input           | Output          | Cache hit | Output price multiplier | Notes                        |
| --------------------- | -------------- | -------------- | -------- | ---------- | ---------------------------- |
| **DeepSeek V4-Flash** | ¥1 ($0.14)     | ¥2 ($0.28)     | ¥0.02    | ×1         | Roughly doubles during peak hours; DeepSWE 54.4 |
| GPT-5.6 Luna          | $0.20 (≈¥1.4)  | $1.20 (≈¥8.4)  | $0.02    | ×4.3       | Price after 7/30 reduction   |
| GLM-5.2 (Zhipu)       | $1.40 (≈¥10)   | $4.40 (≈¥31)   | $0.28    | ×15.7      | Open weights                 |
| Grok 4.5              | $2 (≈¥14)      | $6 (≈¥42)      | $0.30    | ×21.4      | Long context $4/$12          |
| Claude Sonnet 5       | $2 (≈¥14)      | $10 (≈¥70)     | $0.20    | ×35.7      | Promo price until 8/31       |
| Claude Opus 5         | $5 (≈¥35)      | $25 (≈¥175)    | $0.50    | ×89.3      | Fast mode $10/$50            |
| GPT-5.6 Sol           | $5 (≈¥35)      | $30 (≈¥210)    | $0.50    | ×107.1     | Priority mode $10/$60        |

> Note: Official API list prices as of 2026-08-01; CNY converted at 1 USD ≈ ¥7; DeepSeek price is off-peak.

The chart below makes the comparison even clearer (note that GPT-5.6 Luna here reflects the recent price cut).

![image-20260801211411843](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image-20260801211411843.png)

As you can see, DeepSeek's output cost is roughly 1/90 of Claude's. If Claude and ChatGPT are the leaders of AI, pushing the frontier and giving those who can afford it access to the smartest services, then DeepSeek is the democratizer — it lets ordinary people use cutting-edge AI capabilities without breaking the bank. Now let's look at how DeepSeek performs in real-world scenarios.

## Integrating DeepSeek into ChatGPT

![image-20260801222936809](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image-20260801222936809.png)

There's not much to explain here — just follow the official docs: https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/codex/ , it's straightforward. The only prerequisite is that you already have ChatGPT installed.

## Hands-on Testing DeepSeek in ChatGPT

I've already used DeepSeek in ChatGPT for quite a few things. Here are four representative tasks:

- **Agent development**: Testing the model's coding ability to see if it can build features based on a framework.
- **Bug diagnosis and fixing**: Finding the root cause in a real scenario and applying a sensible fix.
- **Browser operation testing**: Testing the extension's ability to control the browser.
- **Learning assistance**: Using matt's `/teach` for post-training-assisted learning and testing frontend web aesthetics.

### Agent Development

First up, I tested its full-stack development skills to see if it could actually build something usable. This time I asked it to create an agent that finds a book and downloads it locally. Here's the prompt and the result:

![image-20260801224558416](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image-20260801224558416.png)

It finished in 21 minutes, and I tested it myself — it actually works. It successfully downloaded an epub version of the book locally, though it was the English edition:

![image-20260801225123535](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image-20260801225123535.png)

Here's the implementation from GPT-5.6 Luna, which is at a similar level:

![ddc4f75d3aadad2419b2bfdf7b2b4860](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/ddc4f75d3aadad2419b2bfdf7b2b4860.jpg)

Both finished in about the same time, but DeepSeek is much cheaper.

### Bug Diagnosis and Fixing

The most common scenario in development is hitting a bug, figuring out the cause, and fixing it. I asked it to fix a bug in a real project where both the frontend and backend had issues. The symptoms were:

- Backend API requests timing out due to cross-table join queries, missing index usage, excessive redundant data in responses, and poor SQL query statement ordering.
- Frontend making duplicate API requests due to incorrect state updates and dependencies.

I had DeepSeek investigate, and it found about 80% of the root causes, but missed the deeper bug. So the approach can be: let DeepSeek do a first round of fixes, then have ChatGPT do a code review and polish.

![image-20260802003745248](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image-20260802003745248.png)

### Browser Operations & Computer Use

1) First, let's look at computer use.

I asked it to comment on a Bilibili video. It succeeded, but it took 13 minutes, so it's still pretty clunky. Looking at why it took so long: it first got stuck on an authorization issue, which ate up a lot of time just getting the channel connected. Then, the DeepSeek model doesn't support reading images yet, so it had to rely on OCR tools as a workaround. Finally, Bilibili has RPC restrictions that caused the initial publish to fail, so it had to find a way around. The end result was good though — the task was completed. **But if you need computer operation, don't use DeepSeek — it's slow and wastes money.** For computer use tasks, stick with ChatGPT.

![image-20260801225832123](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image-20260801225832123.png)

![image-20260801225904442](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image-20260801225904442.png)

2) Browser operation capabilities.

If you have any browser-related work, I recommend installing the ChatGPT browser extension. Installation is simple:

![image-20260801231018011](/Users/zozy/Library/Application Support/typora-user-images/image-20260801231018011.png)

Once installed, you'll see a ChatGPT icon in the browser's extension bar. Clicking it opens a sidebar on the right — it's a chatbox that syncs with your local ChatGPT (it also requires the local app to work together). You can search your ChatGPT chat history at the top, and conversations here sync to the desktop app as well.

![image-20260801231308748](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image-20260801231308748.png)

Many people haven't used the ChatGPT extension yet. In one sentence: it lets ChatGPT directly control and operate your real Chrome browser (with your login session — that's why the local app's built-in browser isn't enough and this extension is needed). This way, ChatGPT can do work for you in the browser you actually use.

I tested it in the extension by asking it to summarize the current page, analyze how the page is implemented, and inspect API requests — it handled all of these perfectly. If you're a heavy browser user who does most of your work there but haven't tried the extension yet, I'd suggest installing it right now. You'll thank me later.

### Learning Assistance

This DeepSeek update is actually a post-training of the previous DeepSeek model, so I wanted to learn what post-training actually does. It took just three minutes to create the learning materials for me.

![image-20260802003359057](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image-20260802003359057.png)

Going through it myself, I found the quality of the generated content to be quite high. Notice that it didn't jump straight into explaining what post-training is — it first walked me through the prerequisite knowledge I needed, then helped me understand what post-training means. The page UI also looked pretty nice. I tried DeepSeek a few more times afterward and found that its aesthetic sense is still pretty weak when building real web pages. For UI aesthetics, I'd currently recommend Grok 4.5 — in my testing, the web UIs it generates are quite good.

## Scenarios Where DeepSeek Shines

Based on my usage over the past few days, my hands-on impression matches the DeepSWE score: DeepSeek is excellent at everyday problems and medium-difficulty tasks. Most importantly, its speed is genuinely fast — it feels great to use.

If you're a heavy ChatGPT user, you've probably noticed it sometimes just stops mid-task and gets stuck. So I'm planning to hand my daily work to DeepSeek and let ChatGPT handle review and fallback. DeepSeek's speed is just that good.

Here are the scenarios I'd recommend DeepSeek for:

- Research and summarization work with the browser extension.
- Content creation assistance and learning support.
- Everyday tasks.

Scenarios I'd avoid:

- Tasks requiring image understanding or recognition, e.g., computer use.
- Anything that conflicts with security — the Codex harness has fairly strict security constraints.
- Complex problems.

## Summary

DeepSeek's agent capabilities aren't particularly outstanding, but its price is unbelievably cheap, and the results are solid. My top recommendation is to use it inside Codex — the official docs have a very detailed tutorial, it's a one-line command to integrate, and you can remove it anytime.

![image-20260802005001266](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image-20260802005001266.png)

I've been using it steadily for two days without any errors or crashes, so you can confidently integrate DeepSeek into Codex for your daily work.
