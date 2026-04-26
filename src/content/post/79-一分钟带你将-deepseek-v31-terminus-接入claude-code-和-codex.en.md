---
title: "Integrate DeepSeek-V3.1-Terminus into Claude Code and Codex in One Minute"
publishDate: "2025-09-24T07:10:54Z"
updatedDate: "2026-01-28T08:53:09Z"
tags: ["AI"]
description: "Just recently, DeepSeek released the ultimate version of V3. Since I've been running into rate limits with Claude Code and Codex, follow along as I quickly integrate the latest DeepSeek into cc and Codex!\nIntegrating with Claude Code\n\n1️⃣ 全局安装\n\n```bash\nnpm install g @anthropicai/c\n```"
---

Just recently, DeepSeek released the ultimate version of V3. I've been getting rate-limited using Claude Code and Codex lately, so follow along as I quickly integrate the latest DeepSeek into cc and Codex!

## Integrating with Claude Code

1️⃣ Global Installation

```bash
npm install -g @anthropic-ai/claude-code
```

2️⃣ Configure Environment Variables

First, go to the DeepSeek official API dashboard to generate an API key.

![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/20250923235052.png)

Then configure in the terminal:

```bash
export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic     
export ANTHROPIC_AUTH_TOKEN=你的DEEPSEEK_API_KEY     
export ANTHROPIC_MODEL=deepseek-chat
export ANTHROPIC_SMALL_FAST_MODEL=deepseek-chat
```

3️⃣ Test Usage

Run `claude` to start, then we see:

![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/20250923235905.png)

This means success! 🎉

## Codex

> Codex is OpenAI's terminal coding agent CLI, similar to Claude Code.

1️⃣ Installation

```bash
npm install -g @openai/codex
```

2️⃣ Configuration

```toml
# 定义一个 DeepSeek 提供方（OpenAI 兼容）
[model_providers.deepseek]
name = "DeepSeek"
base_url = "https://api.deepseek.com/v1"
wire_api = "chat"
env_key = "DEEPSEEK_API_KEY"

[profiles.deepseek-chat]
model_provider = "deepseek"
model = "deepseek-chat" 
```

3️⃣ Test Usage

```bash
export DEEPSEEK_API_KEY="sk-xxx"
codex --profile deepseek-chat
```

Seeing the following means success!

![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/20250924004121.png)

## References

1. Claude Code official documentation: https://claude.com/product/claude-code
2. Codex official documentation: https://developers.openai.com/codex/cli/
