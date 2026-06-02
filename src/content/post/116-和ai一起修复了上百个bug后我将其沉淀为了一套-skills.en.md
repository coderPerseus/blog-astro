---
title: "After fixing hundreds of bugs with AI, I distilled them into a set of Skills"
publishDate: "2026-06-01T11:50:19Z"
updatedDate: "2026-06-01T11:50:19Z"
tags: ["AI","经验"]
description: "Hi everyone, I'm Lucky Snail. Today I want to share a really practical skill that helps you quickly pinpoint the root cause of a bug during web development, fix it, and then produce a bug-fix document to capture what you learned. This is an extremely useful and important skill.\n\nPersonally, 70–80% of my time during AI vibe coding is actually spent on—"
---

Hi everyone, I'm Lucky Snail. Today I want to share a really practical skill that helps you rapidly pinpoint the root cause of bugs during web development, fix them, and then produce a bug-fix document for future reference. It's a very useful and important skill.

In my own AI vibe-coding workflow, seventy to eighty percent of my time is spent dealing with issues where the AI didn't fully understand the requirements, or where it relied on outdated training data, misleading context, or various other reasons. In short: I'm fixing bugs. Often I feel like it'd be faster to just debug it myself.

When I finally got fed up, I carefully observed why AI often fails at fixing bugs. I realized that many times it lacks context, or treats assumptions as facts. So, based on my constant bug-fixing experience, I developed a skill called **bug-hunt**. Simply put, it forces the AI to follow a fixed process: "get evidence first, then change a single line of code," instead of just randomly guessing and modifying.

## First, why is AI so bad at fixing bugs?

If you often use AI to write code, these scenarios will sound familiar:

- **Misunderstanding causes unnecessary changes:** You say "this button doesn't respond when clicked," and AI directly changes three files. The button still doesn't work, but now two new bugs appear.
- **Treating a wrong assumption as fact:** For example, I recently asked AI to fix an element's positioning issue. It assumed `fixed` positioning is relative to `body`, but it wasn't.
- **Loves to add fallback logic:** Often, AI doesn't actually find the real cause of a problem, but it still wants to "solve" it. So it adds fallback logic based on your prompt. This is the scariest, because when you test it, it seems fixed, but it only works for that specific case.
- **Does unnecessary side tasks:** One of the most annoying things AI does is that while fixing a bug, it might say "I found another issue" and fix that too, causing unintended side effects.

All these behaviors share a common root: **AI starts guessing reasons and changing code without any evidence.** It directly treats "I think it might be X" as "it is X," then modifies everything based on that assumption. Worse, much of its knowledge comes from outdated blogs and wrong answers copied from places like CSDN — when you ask it to check a library's behavior, it gives you logic from three versions ago.

But how do humans debug? First reproduce, then add logs, see real runtime data, then draw conclusions. What bug-hunt does is formalize this logic into a contract that AI must follow.

## Core of bug-hunt: Five phases

The whole methodology boils down to five phases. AI must follow them in order. **If later evidence contradicts earlier conclusions, go back and start over. Never jump directly to "let me change the code."**

**Phase 0 — Reproduce & Frame.** The first thing is not to change code, but to stably reproduce the issue and define a **verifiable success criterion**. Key distinction: the success criterion cannot be vague like "it doesn't freeze." It must be something like "the spinner disappears within 5 seconds of page load, and the price area renders a number greater than 0." Why so strict? If you only focus on "no freeze," AI might declare victory as soon as the first symptom is alleviated — the spinner is gone, but the number is wrong, and you've deployed a more subtle bug.

**Phase 1 — Top-down localization.** Starting from the UI line where you see the symptom, trace upwards layer by layer: who wrote this value? Where did its parent come from? Record `file:line` for each layer, eventually forming a "layer table" and producing a few **named hypotheses** (H1, H2, H3). Continue until you reach network boundaries, raw user input, or you can make a specific guess. This step uses data and logic flow to gradually locate the real cause.

**Phase 2 — Full-chain instrumentation.** This is the most hardcore step. AI must insert **structured logs** at every layer, using a **single unique log prefix** (e.g., `[YUGU_DEBUG]`) for easy cleanup later. Logs aren't just `console.log(variable)`. Use `JSON.stringify(obj, null, 2)` to output structured data containing:

- **Identity info:** which call site, which iteration, which element;
- **Sentinel values:** the boolean check that determines downstream behavior, e.g., `willTriggerLoading: x === 0`;
- **Data shape:** `Object.keys()`, `length`, `typeof`, not just the value;
- **First sample:** `arr[0]` to confirm element structure without flooding.

A few practical tips: Never log the `Error` object directly (`JSON.stringify(err)` returns `"{}"`); unpack it into `{ message, stack, raw }`. If an `await` never returns, log before and after it — the last line printed is where it hangs. After instrumentation, **AI must stop and ask you to reproduce and paste back the console logs**. No more code changes until real output is obtained.

**Phase 3 — Layered root cause.** High-quality debugging often reveals more than one layer; it's a chain of causality: symptom → direct cause → deeper cause → root cause. How to know you haven't reached the root? Simple — if you can meaningfully ask "why is that?" again, you're not done yet. This phase also has a crucial rule called **source grading**, which I'll explain separately because it's the key to curing AI's habit of treating outdated blogs as facts.

**Phase 4 — Surgical fix.** After finding the root cause, modify only the **minimum set of code** that fixes the proven cause. No refactoring, no renaming for convenience, no deleting unrelated dead code. After the fix, **rerun with Phase 2 logs** to confirm each previously erroneous log now outputs expected values, boolean sentinels have flipped, and unaffected paths still work. There's also a specific anti-pattern list — none of these count as a fix:

- `value || 0` hiding `undefined` — just pushes the bug downstream;
- `try { ... } catch {}` — hides the next bug;
- `setTimeout(check, 100)` — you didn't solve the race condition;
- `// HACK: ...` — writing "I surrender" in code.

If AI tries any of the above, send it back to Phase 1.

**Phase 5 — Document + cleanup.** The investigation isn't done until documentation is written. AI should generate a `bugfix-<slug>.md` in the `docs/` folder following a template: symptom, root cause chain, investigation process (Phase 1 layer table + Phase 2 key logs), fix diff, before/after verification table, changed files list, and future recommendations. Finally, a `grep` cleanup removes all debug logs — **expected result: 0 hits**. Debug logs that leak to production are bugs themselves.

## Solving AI's "treating wrong info as fact": Source grading

Earlier I said AI is stupid at bug fixing largely because it "treats assumptions as facts." These assumptions often come from garbage on the internet. In Phase 3, bug-hunt defines a **strict source priority** that forces AI to only trust high-quality sources:

- **Tier 1 (always check first):** Official docs, library source code itself on GitHub, official changelog/migration guides, type definition files, official specs (RFC/W3C).
- **Tier 2:** GitHub issues and discussions in the maintainer's own repo, especially closed issues linked to commits/PRs — these often contain authoritative explanations of behavior changes.
- **Tier 3 (only if tiers 1&2 can't find it):** Engineering blogs by library authors or platform officials, Stack Overflow answers endorsed by maintainers or highly upvoted that reference tier 1/2 sources.

The following are **explicitly forbidden**: CSDN, low-quality blog garden mirrors, Baidu Zhidao/Baidu Experience, 360doc, various content farms, machine-translated articles, authorless/dateless AI SEO articles. The reason: these sources frequently misattribute causes, and AI uses them to "verify" its assumptions, then deploys a fix on the wrong layer. All external references must be recorded in the bug report, making the entire chain auditable.

In plain English: **Tell AI to read the actual library source code, not some blog from three years ago.**

## Real case: YouTube quote card stuck loading forever

Just describing the method is too abstract. Let me walk through a real case from my own debugging experience.

**Symptom:** In a browser extension, the "estimated quote" area on a YouTube creator's info card spins forever, but the same code works fine on TikTok/Instagram.

**Phase 0** defined success: spinner disappears within 5 seconds, renders an amount, and the magnitude is correct (a creator with ~27.5K median views should show a four-digit USD amount, not "$30"). That last condition "magnitude should be correct" saved me later.

**Phase 1** Tracing up from the spinner, I found `isLoading = medianViews === 0`. So the question became "why is `medianViews` 0?" All the way to the call to the `youtubei.js` library.

**Phase 2** Instrumented with `[YUGU_DEBUG]` prefix at each layer, logging before and after each `await`.

**Phase 3** This is where it got interesting — I uncovered a **four-layer** causal chain:

1. Logs showed the query resolved fine, but the `videos` array was empty.
2. When I dumped the response's memo, the 30 videos were actually there, but classified as `LockupView` — a new container type YouTube had introduced. My `youtubei.js@10.3.0`'s `.videos` getter didn't recognize it.
3. After upgrading to v17, **looking at the library's source type definitions** revealed that the `Feed.videos` union type **still omitted `LockupView`** — this would never be found by reading blogs, because all blogs describe the old response structure.
4. After bypassing the getter to read videos directly, the count was correct, but the median view count came out as `30` (should be 27K). Turns out `LockupView` stores view count as a UI string like `"4.6K views"`, and the downstream `extractCount` function uses `replace(/[^0-9]/g, '')` to strip all non-digits, turning `"4.6K"` into `46` — the `K` representing "thousand" was eaten.

The full causal chain:

```
YouTube migrated to lockupViewModel
  └─ youtubei.js@10.3.0 doesn't parse it → videos: []
      └─ Upgraded to v17, but Feed.videos union type still missing LockupView → still []
          └─ LockupView from memo contains "4.6K views" UI string
              └─ extractCount removes K → median scaled down by 1000
                  → medianViews: 30 → spinner gone but number wrong
```

See? If I had only focused on "spinner is gone," I'd have stopped at layer 3, then deployed a ridiculous "$30" quote. The Phase 0 success criterion of "magnitude must be correct" forced me to dig to layer 4.

**Phase 4** Finally, only two files with three changes: upgrade the library version, fall back to `memo.get('LockupView')` when array is empty, and expand `K/M/B` into full integers before passing downstream. `extractCount` itself **was not touched**, so TikTok/IG paths remain unaffected.

**Phase 5** Wrote the fix document, `grep` confirmed zero `YUGU_DEBUG` residual. Done.

This case almost perfectly demonstrates all the mistakes AI usually makes: wanted to add fallback on empty array (blocked), trusted blogs for old structures (blocked by source grading), would have multiplied numbers randomly if magnitude wasn't checked (no, because each layer required evidence).

## How to use?

This skill supports both **Claude Code** and **OpenAI Codex CLI** — same source code, no forking. Installation is simple:

```bash
git clone https://github.com/coderPerseus/skills ~/code/personal/skills-luckySnail
~/code/personal/skills-luckySnail/scripts/install.sh
```

The script symlinks each skill to `~/.claude/skills/` and `~/.agents/skills/`. After that, a `git pull` updates everything without reinstallation. To install only bug-hunt:

```bash
~/code/personal/skills-luckySnail/scripts/install.sh --only bug-hunt
```

After installation, when you tell AI "investigate why X isn't working" or "debug this bug" or "why is X broken," it will automatically follow these five phases instead of randomly editing.

## Final thoughts

At its core, bug-hunt doesn't address "AI can't write code." It addresses "AI is too confident, too eager to guess." It breaks down debugging — the most experience- and patience-intensive task — into a pipeline that even AI can follow: **reproduce, localize, full-chain instrumentation with real data, layered root cause, minimal fix with verification, and document everything.** Every step requires evidence; no guessing allowed.

In my own usage, the biggest change is that AI no longer "pretends" to fix things. It honestly asks me to paste logs, admits "we haven't reached the root cause yet," and refuses to write cover-up fallback code. This kind of "slowness" is actually much faster than the old "quickly break everything, then quickly create new bugs" approach.

The repository is here. Welcome to try it out and give it a star: https://github.com/coderPerseus/skills

If this post helped you, please like and follow. I'm Lucky Snail. See you next time!
