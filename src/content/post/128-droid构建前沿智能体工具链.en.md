---
title: "Droid: Building a cutting-edge agent toolchain"
issueSourceHash: "691aa92f33d46fae8c0e85e7fe13b862d5dcdb3d046205947311af90a2c0edb5"
publishDate: "2026-11-03T02:56:01Z"
updatedDate: "2026-11-03T07:21:47Z"
tags: ["AI","harness engineering"]
description: "A new engine built for Factory's enterprise-grade agents, designed for both complex projects and everyday development.\nPublished: October 29, 2026 · Author: Factory Research Team \n\nOriginal: https://factory.com/news/frontierharness\n\nOver the past year, we've worked alongside hundreds of thousands of developers at some of the world's largest enterprises. Working side by side with these teams"
slug: "droid-building-cutting-edge-agent-toolchain"
legacySlugs: ["128-droid构建前沿智能体工具链"]
---

# Droid: Building a Frontier Agent Harness

**A new engine built for Factory's enterprise-grade agents, designed for complex projects and everyday development.**
Published: October 29, 2026 · Author: Factory Research Team

Original: https://factory.com/news/frontier-harness

*Over the past year, we've worked alongside hundreds of thousands of developers at some of the world's largest enterprises. Working shoulder to shoulder with these teams, we built and refined a frontier agent harness that directly addresses the core needs of enterprise development: delivering high-quality results on complex tasks, using compute efficiently, and offering strong security controls.*

Today, we're officially launching **Droid 1.0**: with new design principles and a Programmatic Tool-Calling engine, it's more precise, more efficient, and faster than ever before.

Droid is our agent harness. The agent harness covers everything around the model: the prompt, the toolset, how tool execution results are returned, and the main loop that drives it all. Today's agents can work continuously for hours or even days, across hundreds of turns of interaction, and every turn re-sends the instructions, tool definitions, and history.

Today's update to Droid is the largest one yet. On identical tasks, Droid is up to **20%** more efficient than native harnesses purpose-built for a specific model. It's also ready for the next working paradigm: when frontier models can plan an entire workflow as code, Droid lets them execute hundreds of tool calls within a single model request.

Factory is **model-independent** by design. We firmly believe the best agent harness should be built for every model, so users can freely choose the strongest models on the market, and let Droid pick the most efficient model combination through its automatic model router, **Factory Router**.

Optimizing the harness for multiple models in tandem makes the harness itself more robust. When you tune for a single model, it's hard to tell which changes are genuine architectural progress and which are just accommodations for a particular model's quirks. Cross-model development ensures that the most important improvements generalize, and remain solid beyond the model that originally inspired them.

This is the core idea behind our internal **Agent Factory**. Agents analyze both benchmark failures and the friction points users hit in real sessions, propose draft improvements, and test each one across every affected model family. Our engineers then review the empirical evidence and decide which changes ship.

The result is the most efficient enterprise coding agent on the market, deeply tuned for every frontier model, whether open-weight or closed-source.

This post covers the head-to-head benchmark results, the design principles behind the harness, how we built the internal Agent Factory, and the core architectural change that delivered the biggest performance breakthrough.

## 01 The most efficient toolchain on the market

Using the same underlying model on the same tasks, Droid scores higher than every other toolchain we tested, at a lower cost per task.

![Figure 1: Terminal-Bench 4 benchmark results](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/typora/fig1.jpg)

**Figure 1: Terminal-Bench 4 benchmark results**
* **GPT-6.1 Sol**: Droid's score (**57.6%**, **$0.79** per task) is 3.5 percentage points higher than Codex (54.0%) at 12% lower cost, and 6.6 to 12.6 points higher than OpenCode (51.0%) and Devin (45.0%). (Note: Cursor is not shown because it has no access to OpenAI models.)
* **Claude Opus 5.5**: Droid's score (**65.2%**, **$4.73** per task) is 3.0 to 7.6 percentage points higher than Cursor (62.1%), OpenCode (62.1%), Devin (59.6%), and Claude Code (57.6%), at up to **24%** lower cost.

This gap matters more as agent runs get longer. On long tasks spanning hundreds of steps, a better agent makes fewer mistakes and lays a more reliable foundation for the steps that follow, while a cheaper agent lets you run more instances in parallel on the same budget. Droid optimizes prompts, tool descriptions, and tool-calling patterns separately for each model it supports, so every supported model benefits from these gains (including BYOK setups with your own API key).

The biggest architectural change behind these results is letting models **call tools from program code**.

## 02 Programmatic Tool Calling

In a standard agent loop, the model calls tools directly, and every tool output is appended straight to the model's context. **Programmatic Tool Calling (PTC)** takes a completely different approach to long-running tasks: the agent calls tools by writing a program.

With PTC, the agent can reason globally up front, write out a complete tool-calling workflow as code, and then execute the whole program end to end in a single call. For example, it can write a workflow that iterates over hundreds of files and filters down to the few that mention a specific topic, batch-classify dozens of Linear tickets, or step through a complex database migration in a deterministic sequence.

Research on CodeAct (Wang et al., 2024) showed that taking actions via code execution outperforms JSON and plain-text tool calling across 17 models. Cloudflare and Anthropic brought the idea into production in late 2025, and Codex brought it to coding agents this year.

We made PTC the default mode in Droid 1.0 for three main reasons:
1. **Keep the context window clean**: The model only receives the final printed output of its program. Ordinary intermediate tool outputs (raw files, search results, long logs) stay inside the program as variables.
2. **Drastically reduce the number of model requests**: A single program can complete many tool calls, making complex tasks faster and cheaper to execute.
3. **Improve agent reliability**: Checking logic and loop control run as deterministic code, which eliminates any chance of the model "slacking off" midway or skipping branches of the original plan.

### 2.1 Script Mode

Droid implements PTC as a tool called **Script**. The model writes JavaScript code that runs in a secure sandbox with no independent file system, network, or system access.

A single Script can issue hundreds of tool calls within one model request, so system instructions and conversation history only need to be sent once instead of being resent every few calls. Printed output is capped in size, and full results are written to logs that the model can retrieve later on demand. Calls with no dependencies on each other run concurrently, so the time for a whole batch is determined by the slowest single call.

![Figure 2: Programmatic tool calling vs. direct calling](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/typora/fig2.jpg)

**Figure 2: Programmatic tool calling vs. direct calling (a typical session replay of fixing failing unit tests with GPT-6.1 Sol in high reasoning mode)**
* **Direct Tool Calls**: The model has to be re-requested every 1 to 2 tool calls. Total: **10 model calls**, **15 tool calls**, 42.3 seconds of model reasoning, **56.8 seconds** total.
  * Call breakdown: #1 model call (8.52s) → TodoWrite (5ms), Read invoice.ts (14ms) → #2 model call (3.27s) → Read invoice.test.ts (22ms) → #3 model call (4.04s) → Execute git status (218ms) → #4 model call (3.42s) → Read tax.ts (14ms) → #5 model call (3.55s) → Read money.ts (20ms) → #6 model call (3.57s) → TodoWrite (5ms), ApplyPatch invoice.test.ts (1.05s) → #7 model call (3.42s) → TodoWrite (6ms), Execute vitest run (3.59s) → #8 model call (4.73s) → Execute eslint (7.94s), Execute prettier --check (432ms) → #9 model call (5.49s) → Execute git diff --check (120ms), Execute git status (271ms) → #10 model call (2.33s) → TodoWrite (7ms) and output the final answer.
* **Script Tool**: Each model call writes a script that runs tool calls in batches and returns a single aggregated result. The same **15 tool calls** need only **5 model calls**, model reasoning drops to 28.0 seconds, and total time shrinks to **41.6 seconds (15.2 seconds faster)**.
  * Call breakdown: #1 model call (8.64s) → single Script (421ms, concurrently running TodoWrite, reading 4 source files, and git status) → #2 model call (5.35s) → single Script (1.25s, running TodoWrite and ApplyPatch) → #3 model call (3.36s) → single Script (3.78s, running TodoWrite and vitest run) → #4 model call (8.42s) → single Script (8.14s, running eslint, prettier, git diff, git status) → #5 model call (2.27s) → TodoWrite (7ms) and output the final answer.

Because these calls are code, the result of one step can directly determine the logic of the next. For example, a program can search, read every match, and filter the results in a single pass; with direct calls, each of those steps would cost a model request.

Compared with direct tool calling, Script mode cut Droid's cost by **15%** on Claude Opus 5.5. Most Scripts are small, and the per-task savings are concentrated in long-tail scripts containing 6 or more tool calls (12.5% of all scripts).

Two long-tail cases from our internal real-world sessions (simplified and redacted) show this power up close. In each case, the Script and direct calling performed exactly the same tool operations; the core difference is the number of model requests consumed:

1. **Linear ticket cleanup task**: Moving 151 approved tickets between queues and verifying one by one that each move only changed the status field, for **312 tool calls** in total. With direct calling, every request would resend roughly 28,000 tokens of fixed instructions plus an ever-growing history; even at 10 calls per request, that's **36 model requests** (107 requests at 3 calls per request), reading about **3.1 million input tokens** cumulatively. Using Script took only **2 model requests** and about **61,000 tokens**: the first request wrote the program, and the second read the 6-line summary the program printed.
2. **CI batch inspection task**: Checking 5,384 desktop build jobs across 547 runs, for **550 tool calls** in total (60 concurrent per batch). Script finished in **2 requests** work that would have taken an estimated 59 to 187 direct requests. The model ultimately saw only a five-number summary that included 41 failed jobs, with less than **0.1%** of the raw tool results entering the model's context. The inspection script ran in the background for about 8 minutes, during which the model could work on other tasks.

![Figure 3: The same 312 tool calls executed two ways](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/typora/fig3.jpg)

**Figure 3: The same 312 tool calls executed two ways**

Below is the real simplified script the model wrote in request 1 of the Linear ticket cleanup task (it prints condensed results into the model's context via the `text()` function):

```javascript
const remaining = new Set(readReport('<report>').notAttempted) // 151 pending tickets

// Read both queues in parallel
const queues = await Promise.all([listAll('Triage'), listAll('<queue 2>')])
const targets = queues.flat().filter((i) => remaining.has(i.id))

const verified = [], failures = []
for (const batch of chunks(targets, 3)) { // process 3 tickets concurrently
  await Promise.allSettled(batch.map((i) => setStatus(i, 'Backlog')))
  const after = await Promise.allSettled(batch.map((i) => getIssue(i)))
  after.forEach((r, n) =>
    (onlyStatusChanged(batch[n], r.value) ? verified : failures).push(batch[n].id))
  if (failures.length) break // abort immediately on any unexpected field change
  if (verified.length % 30 === 0) text(`${verified.length} of 151 verified`)
}

writeResult('<result file>', { verified, failures })
text({ verified: verified.length, failures })
```

### 2.2 How it improves quality

* **Cleaner context**: Raw file contents, search results, and run logs all stay inside the program, so the model reasons with far less noise.
* **Loops and workflows run deterministically**: In the Linear cleanup task above, the script compared 15 fields precisely before and after each write, kept exact counts, and was set to stop immediately if any other field changed.
* **Planning comes first**: The model works out the full sequence during reasoning, and the program it writes is itself the execution plan. Stronger models plan further ahead, write more complex Scripts, and get more work done per request.

Frontier models already benefit enormously from programmatic tool calling, and those gains will keep growing as base models improve. Script mode is currently on by default for **GPT-6.1 Sol, GPT-6.1 Terra, GPT-6 Astra, GPT-6 Sol, GPT-5.6 Sol, Claude Fable 5.1, Claude Fable 5, Claude Opus 5.5, Claude Opus 5**, and **Kimi K3**.

### 2.3 Key design decisions

Programmatic tool calling looks easy to wire up, but it's full of pitfalls. Here are the five core design decisions that made the difference:

| Design decision | How it works | Core value |
| :--- | :--- | :--- |
| **Programs fetch real structured data** | Provide the program with complete files plus structured, strongly typed search results directly. | Filtering and counting happen in code, with zero token cost. |
| **Literal text is transmitted as-is** | File contents, code patches, and terminal commands go into raw input blocks, with no string escaping needed. | Uses fewer tokens and drastically reduces malformed calls. |
| **Edit operations return a short summary** | File edits inside the program work like direct edits and return only a short summary. | Avoids pasting the full modified file back into context. |
| **Never block on long-running tasks** | The program waits at most 5 minutes, then hands back whatever output has been produced so far; it can also start a task in the background and return immediately. | The model can keep working on other things without blocking. |
| **No polling cost** | Dedicated tools check, wait on, or terminate running programs; when a background task finishes, Droid wakes the model up. | No model requests are wasted repeatedly asking "is the task done yet?" |

## 03 The Agent Factory

Script mode, along with the strategy for deciding whether to enable it for different models, came out of the same automated evolution loop (most of Droid's improvements originate here). New models and new snapshots appear every few weeks, and no human engineering team can keep pace with every model's iteration cadence through manual tuning.

![Figure 4: How Droid is built (the five-step Agent Factory loop)](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/typora/fig4.jpg)

**Figure 4: How Droid is built (the five-step Agent Factory loop)**
1. **01 Bring In**: Connect the new model to Droid and run basic behavior assertion checks.
2. **02 Evaluate**: All models run the same benchmark tasks and real production environment evaluations.
3. **03 Read Traces**: Agents automatically investigate the common causes behind failed runs.
4. **04 Propose**: Generate draft changes with explicit hypotheses.
5. **05 Test**: Run controlled experiments across all affected model families, then have engineers review and merge. The improved Droid then takes over the next cycle.

When a new model first becomes available (usually an early preview snapshot), this automated system—which tracks over 20 models—kicks in, connects it to Droid, and runs behavior assertion checks. Passing the assertions is only the minimum bar, far from a release standard. After that, every available model goes through comprehensive evaluation via the product itself: live production environments, QA quality tests, and daily benchmarks. Real-time error logs and the friction points users hit in real sessions are aggregated into each model's evaluation results, so the reviewing agent can compare benchmark failures and real user sessions side by side.

A single failure doesn't tell you much, so the agent focuses on finding common root causes that recur across tasks and models. It turns each finding into an improvement proposal that states a hypothesis, then quantifies the change's effect through controlled experiments on every model involved.

Since the vast majority of changes are written by agents, the proposing agent and the reviewing human engineer must hold exactly the same standard for "what makes a good change." Every turn of interaction resends the entire request, so a single misplaced instruction or one stale tool output never causes damage just once—it keeps distracting the model in every subsequent turn, degrading output quality, token budget, and response time. All proposals must strictly follow these five principles:

* **Account for every token**, and save large tool outputs to files.
* **Grow the request in append-only fashion**, always keeping the prompt cache valid.
* **Profile the reasoning hot path**, and cache everything that can be cached.
* **Track background work** (such as long-running commands and subagents), and proactively wake the model when a task completes.
* **Always have a clear next action when the agent stalls**: nudge, retry, summarize, or stop.

The improvements Droid proposes depend on the objective being optimized, with one hard requirement: **each objective must hold across all model families simultaneously**. For example, when we tuned Script mode on GPT-6.1 Sol, Claude Opus 5.5, GLM 5.3, and Kimi K3, one objective was "when both Script and direct tools are available, the model should proactively prefer Script." The loop produced three changes for this: adjusting the system prompt, modifying the descriptions of the tools Script calls internally, and refining the structure of Script's returned results. No single change worked on all models alone, but combined, every model met the objective.

Another objective was to make Script mode cheaper than direct calls across all model families. Adding line numbers to every line when reading files successfully stopped GPT-6.1 Sol from repeatedly re-reading files through the shell just to get line numbers, and cut Claude Opus's cost by **22%** on one task. But it also added about 2 tokens per line on every read, raising GLM's cost by **8%** and Kimi's by **32%**—models that never had the re-reading problem to begin with. In the end, the feature was designed as an optional parameter, enabled only when a model explicitly requests line numbers.

Human engineers sit at the final link of the loop. They review every proposal and its experimental data, verify it against the core principles, and make the call on which changes ship. This keeps our toolchain in sync with how the major model vendors evolve.

## 04 Full-pipeline optimization beyond programmatic tool calling

Programmatic tool calling is the biggest change to come out of the evolution loop, but it's far from the only one. The remaining improvements are finer-grained and span the whole toolchain: how much of a request prefix a model provider can reuse, what exactly each request contains, how the main loop recovers when a turn goes wrong, and how fast each request can be sent to the model.

### 4.1 Keeping the prompt cache warm

Model providers cache requests by prefix, so any change within that prefix invalidates everything cached after that point. Droid's requests were already append-only, with one exception: **tool discovery**. Tool definitions usually sit at the very top of a request, so loading MCP tools or connector tools mid-session meant reprocessing the entire conversation history. Droid now appends newly discovered tools to the end of the request, leaving the cached prefix untouched.

![Figure 5: Measured cache reuse when loading new tools mid-session and for various kinds of changes](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/typora/fig5.jpg)

**Figure 5: Measured cache reuse when loading new tools mid-session and for various kinds of changes**

| Change made mid-session | Cache read ratio on the next request |
| :--- | :--- |
| **Git status change** (test environment: 19,976 tokens reused, only 176 new) | **99.1%** |
| **Session rolled back** (test environment) | **99.8%** |
| **Starting a second subagent of the same type** (test environment) | **96.5%** |
| **Dynamically loading a new tool** (Azure before/after: all 26,400 tokens reused 100%) | **100%** |

In production, a typical request reads **98%** of its input straight from cache, and **98.6%** of requests strictly follow the append-only rule. A dedicated monitor diffs each request against the previous one and flags any field that breaks the cache. Cache invalidation is expensive: a single token change near the front of a request forces the whole context to be recomputed. This is exactly where Agent Factory shines, and it has already shipped several prompt-cache fixes: after a Git status change, the next request adds only 176 new tokens; session rollback reuses 99.8% of the cache; a second subagent of the same type reuses 96.5%. Errors don't reset the cache either, because Droid retries failed requests directly on the provider node that already holds it.

### 4.2 Trimming the base prompt by 37%

The first turn of a session carries the system instructions, tool definitions, and startup context, and all of it rides along on every turn after that, which is why it got the heaviest cuts. Between Droid 0.170.0 and 0.250.0, first-turn input dropped from **20,887 tokens to 13,055 tokens (a 37% reduction)**.

Most of the savings came from tool definitions. Droid used to send 11 tool definitions up front at startup; now it sends **2**, and rarely used tools load dynamically when the model needs them. Tool definition size fell **46%**, and the reminders Droid attaches at startup shrank by nearly a third (**32%**). The system prompt itself, by contrast, grew **33%** (though most of the old prompt's rules were condensed and compressed). The growth comes from new guidance in two areas: how the agent communicates with the user, and how it handles environment details like images, connected apps, and personal data.

![Figure 6: Prompt budget comparison for the first turn of a session](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/typora/fig6.jpg)

**Figure 6: Prompt budget comparison for the first turn of a session (user input "hi") (0.170.0 on Opus 4.8 vs 0.250.0 on Opus 5.5)**
*Note: because the two versions run on different models, tokenizers differ slightly; measured in tokenizer-independent characters, request size fell from 57,035 to 36,802 characters (a 35% reduction).*

Much of the prompt rewriting was done by the model itself. An automated pipeline periodically hands Droid's system instructions to a model and asks it to find duplicated, contradictory, or vague guidance. Each finding becomes a proposed change and goes through the same rigorous experimental testing as any other code change.

### 4.3 Bounded autonomy

The longer an agent runs on its own, the more likely it is to hit a dead end, repeat wasted work, or drift off task entirely. Droid detects each of these failure states precisely and has a clear next action for each: nudge, retry, or stop. These controls live in the toolchain's main loop rather than relying on the model itself, so they apply uniformly across every model provider Droid supports, and any newly integrated model gets them automatically on day 0.

* **Getting stuck**: usually shows up as an interrupted stream. On Factory-hosted Anthropic streams, **4 minutes** with no response counts as a dropped stream and triggers a retry. Responses that hit the hard timeout get up to two retries; partial responses cut off mid-stream are cleared entirely before retrying, so the model always builds on a complete answer.
* **Repeated work**: caught by counters. After **3 turns** in a row with no visible output, Droid stops outright; **3 identical** tool calls in a row trigger a nudge, and **6** force the loop to terminate. But if a repeated call returns new results (polling build progress, say), it's allowed to continue.
* **Dropping the task**: task loss most often happens when a long conversation gets compacted into a summary. We doubled the cap on these compaction summaries from 8,000 to **16,000 tokens**, because by our estimates a third or more of long-session summaries had already filled the old limit.
* **Background sleep and wake**: not every long wait is a failure. When the model kicks off a long-running task (a subagent or a long terminal command), it can hand that task off to the background and go to sleep. When the background task finishes, Droid wakes the model with a reminder.

### 4.4 Profiling the hot path

Once requests are cache-optimized and slimmed down, the model's own inference time is largely out of our hands, but **how fast we can get the request to the model** is entirely an engineering problem. Droid used to rebuild the connected apps list on every turn, and as conversation history grew, pre-flight tool lookups before each request got slower and slower.

First-turn overhead was especially bad: login checks did redundant work and ran serially; the startup request had to wait for all of Droid's code to load; the first model request had to wait for every MCP server to finish initializing; and users on their own Amazon Bedrock credentials hit extra latency while those credentials loaded.

In the latest update, all of that waiting has been eliminated or moved off the critical path:
* **Connected apps list caching**: Droid reuses the connected apps list until the connection state changes, cutting per-turn prep to **24 ms**. In controlled tests, this one change alone moved median time-to-completion **13%** earlier.
* **Incremental history lookup**: Droid now reads only the newest part of the conversation history, bringing pre-flight tool lookups down to about **1 ms**.
* **Parallel login checks**: login checks now run in parallel with no duplicate work, dropping median time from 101 ms to **59 ms**.
* **Concurrent request and code loading**: `droid exec` now fires auth, feature-flag, org-policy, and connector requests concurrently while code is still loading, cutting median prep time before the first model request from 1,741 ms to **646 ms**.
* **Async MCP startup and credential warm-up**: MCP servers start in parallel with the first turn (a server that takes 3 seconds to initialize no longer blocks the first request), and Bedrock credentials are ready before the first request.
* **Inference proxy routing fix**: outside the user's machine, we fixed a routing cost in the inference proxy layer, shaving **150 ms** off every model call.

These optimizations pay off immediately in real production agent interactions: from the user pressing Enter to the model request going out, Droid takes just **124 ms** (97 ms gathering context, 27 ms building the request). That means when users wait for the first token (TTFT), **97% of that wait is the model's own inference**.

### 4.5 Lightning fast from launch

Outside the agent loop, Droid 1.0 also cut the latency users feel in the client app itself: opening the app, starting a session, running several sessions at once, and quitting.

* **First paint 3.8x faster**: median from 1,839 ms to **488 ms**
* **Ready for the first prompt 3.0x faster**: median from 1,876 ms to **618 ms**
* **Quit in just 30 ms**: median production quit time from 648 ms to **30 ms**

Opening the app is the first wait of every session. Across releases from August 25 to October 20, median first paint fell from 1,839 ms to 488 ms, and time until Droid can accept a prompt fell from 1,876 ms to 618 ms, both close to **70%** reductions. Most of that came from doing less work before the first frame: Droid now ships precompiled code and no longer parses roughly 6,000 modules at startup; it responds to keystrokes in real time during the final stage of startup; and if any code change pushes P95 first-keystroke latency past 250 ms, CI fails the build. Upgrading to **Bun 1.4.2** cut P95 startup time by **13% to 22%** on Linux, macOS, and Windows; on Windows, Droid also skips the cumbersome console initialization and caches the system certificate list.

Sessions on remote machines run in a daemon, and nothing can start until the daemon is ready. The daemon used to wait for the login shell, certificates, locales, and skills to finish loading; now all of those load **just in time**. On a developer's Mac, median time from launch to ready fell from 1,956 ms to **392 ms** (and from 887 ms to **376 ms** with an empty shell config).

The deepest change is architectural. Running several sessions at once used to mean launching separate processes at about 350 MB each, so five parallel subagents plus the main session ate over 2 GB. Now all sessions share a single daemon, each additional session costs about **20 MB**, and `/new` creates a session almost instantly.

Quitting was the last remaining wait, and it used to be gated on network requests. Now Droid hands unsent telemetry and session sync work to a detached background process and the main process exits immediately. Median production quit time dropped from 648 ms to **30 ms**.

## 05 Unprecedented execution speed

The changes that save tokens also save time: Script mode makes fewer model requests, and each remaining request is smaller and mostly cache hits. On Claude Opus 5.5, Droid finishes a single passing task **26%** faster than Claude Code while using **17%** fewer tokens. On GPT-6.1 Sol, it uses **12%** fewer tokens than Codex but takes 10% longer.

![Figure 7: Terminal-Bench 4 per-task cost and time comparison](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/typora/fig7.jpg)

**Figure 7: Terminal-Bench 4 per-task cost and time comparison**
* **Claude Opus 5.5**: Droid averages **42.6 minutes** per task (cost **$4.73**), **16% to 26%** faster than every other toolchain tested (26% faster than Cursor and Claude Code, 24% faster than OpenCode, 16% faster than Devin).
* **GPT-6.1 Sol**: Droid averages **25.8 minutes** per task (cost **$0.79**), 12% cheaper than Codex but 10% slower, while still 4% faster than OpenCode and 11% faster than Devin.

The times above only cover task execution itself. Beyond each task, the time Droid takes to open the app, start a session, and exit is only a fraction of what it was in August this year, so starting a new session or switching between sessions costs almost nothing.
