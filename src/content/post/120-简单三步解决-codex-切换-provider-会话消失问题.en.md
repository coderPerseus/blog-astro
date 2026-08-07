---
title: "Fix Codex Provider Switch Losing Session in Three Simple Steps"
publishDate: "2026-08-06T16:15:09Z"
updatedDate: "2026-08-06T16:15:09Z"
tags: ["AI"]
description: "Lately I've been hooking DeepSeek into Codex. For some tasks I let Codex's official service handle them, and for others I use DeepSeek, so I end up switching back and forth. During these switches, Codex has a mechanism that filters out conversations that don't belong to the current provider, so when I switch to my custom provider, the official conversations disappear. Seeing the left sidebar that was once full suddenly empty..."
---

Recently I integrated DeepSeek into Codex. Some tasks I let the official Codex service handle, and others I delegate to DeepSeek, so I switch between them. During switching, Codex has a mechanism that filters out conversations that don't belong to the current provider, so when I switched to my custom provider, the official conversations disappeared. Seeing my once-full conversation list on the left suddenly empty, my heart sank. After some searching, I found a lifesaver: **codex-provider-sync**, a project that already has 3k stars. I tried it and it works really well and is super simple. Seeing my conversations come back, I had to recommend it to anyone using custom providers in Codex!

![image-20260806234022026](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260806234022026.png)

## Using codex-provider-sync

It's very simple: install => run

But before you start, there are two prerequisites:

1) Quit Codex first: because Codex can't operate on its conversation database while it's running.

2) Have Node.js installed: if you're using Codex, you definitely have a Node.js environment, right?

**Step 1: Install the tool**

```bash
npm install -g git+https://github.com/Dailin521/codex-provider-sync.git
```

After installation, you'll have a command:

```bash
codex-provider
```

**Step 2: Use the tool**

```bash
codex-provider sync
```

On success, you'll see something like:

```text
Synchronized provider: deepseek
Updated rollout files: 2108
Updated SQLite rows: 5905
Backup: ~/.codex/backups_state/provider-sync/时间戳
```

Actually, before using it, you can also check the current status, but it's not required:

```bash
codex-provider status
```

You'll see something like:

```text
Current provider: deepseek
Rollout files:
  sessions: openai: 800, deepseek: 12
SQLite state:
  sessions: openai: 790, deepseek: 12
```

The above is the macOS tutorial. For Windows, the official repo also provides a GUI — check the README in the official repository, it's clearly documented.

## Registering DeepSeek as a Native Custom Subagent in Codex

Wait, there's more. We don't actually have to switch providers at all — we can have Codex's subagents use DeepSeek instead, so we don't have to deal with conversation migration. Use this repository: [oil-oil/codex-deepseek-subagent](https://github.com/oil-oil/codex-deepseek-subagent). Here's how:

1. First, install the Skill globally (requires Node.js):
   ```bash
   npx skills add oil-oil/codex-deepseek-subagent -g -y
   ```

2. **Restart** the ChatGPT / Codex desktop app, then start a new task.

3. In the new task, just say:
   ```
   Configure DeepSeek as a native subagent in Codex.
   ```

4. If you haven't configured an API Key yet, it will ask for your DeepSeek API Key (it's securely saved to the system credential store via standard input, not written in plaintext to any file).

5. Once you see `status: ready`, **restart the desktop app again** and create a new task.

6. After that, you can directly use:
   ```
   Check this project with the DeepSeek subagent.
   ```
   Or have the main agent invoke it:
   ```text
   spawn_agent(agent_type="DeepSeek", fork_turns="none")
   ```

After successful configuration, the agent file will be at `~/.codex/agents/DeepSeek.toml`.

This approach automatically handles compatibility issues (pinning the parent model's `multi_agent_version` to `v1` and disabling `multi_agent_v2`), because DeepSeek doesn't currently support V2's encrypted task delivery (`encrypted_content` gets dropped).

## Summary

Let's wrap this up simply: if you're looking to use DeepSeek in Codex recently, I recommend going with the subagent approach. If you've run out of official credits, then switch providers and migrate your conversations to the new provider.
