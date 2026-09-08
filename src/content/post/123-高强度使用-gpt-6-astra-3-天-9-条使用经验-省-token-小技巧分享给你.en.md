---
title: "After 3 days of heavy use with GPT-6 Astra, here are 9 practical tips and token-saving tricks to share with you."
publishDate: "2026-09-08T05:25:52Z"
updatedDate: "2026-09-08T05:25:52Z"
tags: ["AI","经验"]
description: "After GPT6 Astra launched, I went all in and used it for three straight days of development. It's genuinely great to work with, but it absolutely burns through tokens—my 20x account's weekly quota nearly ran out in a single day. Here are some takeaways from my experience and token-saving tricks I've tested.\n\n## Usage Notes\n\n### 1) Close the testing loop\n\nThe biggest bottleneck in AI-assisted development right now is the lack of a closed loop: once the code is written, there's no guarantee it runs, the page behaves correctly when clicked,"
---

After GPT-6 Astra launched, I spent 3 intense days building with it. It's genuinely great, but it burns through tokens like crazy—my 20x account's weekly quota nearly ran out in a single day. Here are my takeaways and some token-saving tricks I've tested.

## Usage Notes

### 1) Close the test loop

The biggest bottleneck in AI-assisted development right now is the lack of a closed loop: after the code is written, someone still has to verify it runs, click through the UI, and confirm it works. What Astra strengthens is precisely Computer Use, especially long-horizon computer control. My current approach is to bake the acceptance criteria directly into the task description: "After making the changes, start the service, open the browser, walk through the xxx flow, take a screenshot to confirm, and fix it yourself if it fails." It will actually open a terminal, launch a browser, click buttons, read error messages, go back to the code, and keep iterating until it passes. This takes the "write → verify → fix" loop out of human hands, which is where I think Astra delivers the most value.

### 2) Pinpoint the agent's error chain

During development, agents inevitably make mistakes and hallucinate. If you just correct them directly, the same issue will likely recur. So I usually dig into *why* it went wrong. Previously, in long conversations, once the context got compressed, early error messages and reasoning traces were lost—the AI itself couldn't figure out where things went off the rails. But Astra uses a different context-handling approach: instead of compressing the entire history into a lossy summary, it keeps searchable notes across context windows. Early error logs, failed approaches, and previous test results can all be pulled back up. Now I can just ask it, "What was your basis the first time you changed xxx?" and it can surface its original reasoning chain, making it easy to pinpoint the root cause (usually: it misread a file, assumed an API that doesn't exist, or got misled by an outdated rule in AGENTS.md). Then I write the fix into AGENTS.md or the relevant Skill so the agent doesn't repeat the same mistake.

### 3) Switch reasoning effort on demand

Astra has 5 reasoning effort levels: low, medium, high, xhigh, and max (note that none is no longer supported—the API will reject it outright). The level doesn't change the per-token price; it only changes how long it "thinks" and how many tokens it burns.

Three ways to switch:

1. `~/.codex/config.toml`, global default:

```ini
model = "gpt-6-astra"
model_reasoning_effort = "medium"   # low | medium | high | xhigh | max
```

2. Per-task override:

```bash
codex -m gpt-6-astra --reasoning-effort xhigh "Refactor the retry logic in the payment module"
```

3. Switch mid-conversation with `/model`—no need to start a new chat.

The official recommendation: use medium for agentic coding and research, high for complex debugging, and xhigh only when your own evaluations prove it pays off. My practical experience: the higher the level, the broader it explores (running more commands, reading more files), which is worth it for tasks where missing one relevant path means another full round-trip. But for tasks that are obvious at a glance, high and low produce nearly identical results—you just spend twice the time and three times the tokens.

### 4) Optimize your Skills based on official docs

Astra follows instructions extremely literally, and the old guardrails I'd set up now get in the way. So cramming large spec blocks into a main file that gets read every turn no longer suits Astra. You can trim and optimize manually, or follow the official guidance to do it. You can also curb its tendency to over-test and steer it toward minimal changes. The model got smarter—old constraints now hinder its performance.

## Token-Saving Tricks

### 1) Default to Astra low

Honestly, about 60% of daily development work is pretty basic—low handles it fine. Use medium for the more complex tasks, and I only reach for high on large feature code reviews. My reasoning is based on the score-to-cost comparison across levels (Artificial Analysis intelligence index):

| **Level** | **Index** | **Cost per task** | **Output tokens** |
| --------- | -------- | ---------------- | ----------------- |
| **low**   | 49       | $0.63            | 5.4M              |
| **medium**| 52       | $1.16            | 12M               |
| **high**  | 53       | $1.41            | 19M               |
| **xhigh** | 54       | $1.85            | 30M               |
| **max**   | 55       | $2.57            | 49M               |

Going from low to medium buys you 3 points for $0.53; from xhigh to max gets you 1 point for $0.72. From low to max, the score only rises 6 points while token consumption jumps 9x. ChatGPT plans draw from your quota, and OpenAI hasn't published exactly how different levels are metered, but from feel, it's based on actual consumption—so your level choice directly determines how many days your quota lasts.

### 2) Avoid long conversations

Astra's context window is 1.05M, which makes it tempting to think "it fits, so I'll just keep chatting." But that's exactly the most token-hungry pattern:

- **Every turn resends the history**: the longer the conversation, the more input each request carries, and input tokens stack linearly. On the API, inputs over 272K also incur a surcharge (2x for input, 1.5x for output). Plan users don't see a bill, but the quota drains just as fast.
- **One task, one session**: when a feature is done, hit `/new`. Don't go from requirements to deployment in a single conversation. Persist state that needs to carry over in AGENTS.md or have it write a notes file—next session, have it read the file, not the chat log.
- **Leverage its cross-context notes**: Astra keeps notes across windows on its own, so starting a new session costs far less than before. No need to worry that "it'll forget everything in a new chat."
- **Compact when needed**: in long debugging sessions, proactively run `/compact`, or lower `auto_compact_token_limit` in config.toml so it shrinks earlier rather than waiting until it's full.

### 3) Audit your MCP servers and Skills

This one saved me the most in practice. Once an MCP server is attached, every tool definition gets stuffed into the context of each request. One server with dozens of tools, a dozen servers—that's tens of thousands of tokens of fixed overhead, paid on every single turn. Skills work similarly: Codex puts the name, description, and path of every installed Skill into the context, capped at 2% of the model's context window. Installing too many not only eats quota but can also truncate descriptions or even drop some Skills entirely (with a warning).

My approach:

- Run `/mcp` to see which servers are attached. Anything I haven't used in a week gets deleted or commented out of `config.toml`; I re-enable it when needed.
- Keep project-level MCPs in `.codex/config.toml` instead of piling everything into the global config. When working on a frontend project, there's no need to carry the database MCP around.
- For Skills, use `[[skills.config]]` to disable the rarely used ones rather than deleting them. Trim descriptions to a sentence or two and put trigger keywords up front.
- Prefer Astra's tool search capability—let it retrieve tools on demand instead of laying every tool out in the context at once.

### 4) Turn repeated workflows into Skills

If you've run a workflow more than 3 times, it should become a Skill. This saves both time and tokens, for a straightforward reason: a one-off described workflow means retyping a few hundred characters of prompt each time, and the agent has to re-explore "which files to read, which commands to run"—that exploration is pure token waste. Once it's a Skill, it only costs the description line before triggering, and after triggering it follows the fixed steps in SKILL.md, skipping the exploration phase entirely.

A few I've baked in: a pre-PR self-check flow, the "three-piece set" for new endpoints (route + types + tests), and a step-by-step for investigating production errors. I use `$skill-creator` to generate the skeleton, run it twice to verify triggering is accurate, then fine-tune the description.

One last personal product share: if you're someone who frequently watches videos on Bilibili or YouTube for learning, or listens to podcasts, I highly recommend the browser extension **Lumi**: bilingual subtitles for Bilibili and YouTube videos, plus AI summaries and an AI chat assistant. Details at: https://islumi.com/
