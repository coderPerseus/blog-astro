---
title: "Your AI isn't 'dumb', it just needs a better Harness"
publishDate: "2026-04-16T11:30:50Z"
updatedDate: "2026-04-16T11:30:50Z"
tags: ["AI","harness engineering"]
description: "TL;DR: Agents fail not because the model is too weak, but because the system isn't clearly defined.\n\nA good harness does four things:\n\n- Limits what the model can do\n- Externalizes what the model must remember\n- Validates every step it takes\n- Recovers execution when errors occur\n\nThe problem: collapse at step ten\n\nImagine you deploy an autonomous Agent to compile a market research report. Steps 1 to"
---

# Your AI Isn’t “Dumb”—It Just Needs a Better Harness

**TL;DR:** Agents don't usually fail because the model is too weak—they fail because the system wasn’t clearly defined.

A good harness does four things:

- Limits what the model can do
- Externalizes what the model must remember
- Validates every step it takes
- Recovers execution when something goes wrong

## The Problem: Ten Steps to Collapse

Imagine you deploy an autonomous agent to compile a market research report. Steps 1 through 3 go fine: it plans the task, searches the web, and extracts competitor data.

But by step 7, it starts hallucinating statistics because the search tool’s payload exceeded the context window and was silently truncated. By step 10, it outputs malformed JSON because there’s no schema validator in the entire pipeline. The whole pipeline crashes.

We’ve all seen this kind of “agentic collapse.” And in moments like this, it’s tempting to blame the model’s reasoning ability. But in real production AI systems, the problem is usually not the horse—it’s the reins.

## Root Cause: A Paradigm Shift in AI Engineering

For the past two years, the industry has treated AI failures as a “communication problem.” If the model answered incorrectly, we assumed we just hadn’t asked well enough or hadn’t fed it the right documents. But in long-horizon, autonomous execution scenarios, this approach quickly hits a ceiling.

We are entering the era of **Harness Engineering**—the engineering discipline of designing systems around the model. An agent is not just the LLM. It’s the LLM embedded within a complete set of rigid scaffolding, including code, state management, and recovery flows.

The evolution in this area looks roughly like this:

| Era                  | Focus                         | Limitation                      |
| -------------------- | ----------------------------- | ------------------------------- |
| Prompt Engineering   | Instructions: how to ask      | Fragile; no persistence across steps |
| Context Engineering  | Information: what to know, e.g., RAG | Stateless; can’t control long-horizon execution |
| Harness Engineering  | System design: how to constrain and run | Solves control problems for continuous, multi-step execution |

Each new phase doesn’t replace the previous one—it absorbs it. Good harness engineering still needs good prompts and good context; it just adds the real execution layer, which neither of the others can provide.

The natural next question is: **What does this execution layer actually look like?**

Not conceptually—structurally. If the model is no longer the system itself, where does it sit inside the system? What wraps around it? Who constrains it?

At a high level, a production-grade agent system looks something like this:

```text
          ┌─────────────────────────────────┐
          │          User Request           │
          └────────────────┬────────────────┘
                           ▼
          ┌─────────────────────────────────┐
          │       HARNESS (7 layer stack)   │
          │  ┌───────────────────────────┐  │
          │  │     LLM (The Model)       │  │
          │  └───────────────────────────┘  │
          └────────────────┬────────────────┘
                           ▼
          ┌─────────────────────────────────┐
          │        Verified Output          │
          └─────────────────────────────────┘
```

The model sits **inside** the harness. It doesn’t speak directly to the user, and it doesn’t touch the outside world without supervision. All inputs are filtered before entering, and all outputs are validated before leaving.

---

## Design Principles of a Good Harness

Before diving into the specific layers, let’s clarify the principles that every design decision should follow. When you’re unsure whether your harness is actually working, come back to these four standards.

**1. Rely on constraints, not persuasion.**  
If you can programmatically limit the model’s choices, don’t expect it to “choose correctly” on its own. A prompt saying “always output valid JSON” is just hope; a schema validator that rejects illegal output is a guarantee.

**2. Externalize state.**  
Any information critical to task continuity—what’s been done, what’s left, where failures occurred—must live outside the context window. The context window is volatile; disk files are not.

**3. Make every step verifiable.**  
If you can’t check it, you can’t trust it. Every layer of the harness should produce results that can be validated by something *other than the model that generated them*.

**4. Fail locally, not globally.**  
A single tool call failure should only trigger a retry of that step, not restart the entire pipeline from scratch. The blast radius of failure should be as small as possible.

These aren’t abstract ideas—they’re engineering constraints that directly affect implementation. You’ll see their echoes in every layer that follows.

---

## The Seven-Layer Harness Stack

A robust harness doesn’t just shuttle text between modules. It orchestrates a typed, stateful, observable system. A truly production-ready stack looks something like this.

### 1. Cognition

This is the bottom layer, defining the boundaries within which the model operates. Instead of stuffing a giant system prompt into the model, give it a “map” that’s locally relevant to the current task: what role it plays, what success looks like, and what strict negative constraints—i.e., **what it must not do**—apply.

In essence, this is more like giving the model a job description than an encyclopedia.

In practice, this typically takes the form of structured system prompts, role files (like `agents.md`), or dynamically generated task descriptions tied to the current step.

### 2. Tools

The harness shouldn’t just dump raw tool output back into the LLM. It should act as a strict middleware layer, handling at least these tasks:

- **Ranking**: use embedding similarity or BM25 to keep only the most relevant results
- **Deduplication**: remove duplicate information before it enters the context, to avoid wasting tokens
- **Token budget truncation**: impose a hard ceiling on tool returns, preventing context overflow—exactly the cause of failure in the earlier example

### 3. Contracts & Interfaces

This is the layer most teams skip, and it’s also the one most likely to cause production incidents.

The model speaks probabilistically; the harness must speak **typefully**.

Every boundary in the system—between LLM and tool, between one agent and another, between the harness and the outside world—should have a clear contract: a strict JSON schema, a typed function signature, or a versioned API spec.

Without this, you’ll run into **schema drift**. One time the model outputs `price` as a string, another time as a float. The downstream pipeline may not fail immediately, but the final result will quietly degrade.

The contract layer’s job is to validate input and output on every cross-boundary transfer, catching errors before they propagate. This is the real-world implementation of “rely on constraints, not persuasion.” Without contracts, you can easily spread a bad schema into downstream systems without realizing it.

### 4. Orchestration

Without this layer, LLMs can easily fall into infinite loops, skip critical steps, or declare task completion prematurely.

The harness should explicitly enforce a workflow structure—a DAG, a state machine—that defines legal transition paths: *Plan → Gather → Draft → Verify*. The model can suggest actions, but the harness decides which actions are allowed.

### 5. Memory & State

State must be managed explicitly, or the system will eventually “forget.” A mature harness typically splits memory into two layers:

- **Working memory (short-term)**: the immediate conversation and context window needed for the current step
- **Persistent state (long-term)**: structured files, like `state.json`, that accurately record which subtasks are pending, in progress, or completed. It survives context resets and even across different sessions

This is the engineering manifestation of “externalize state.” If information only exists in the context window, it will eventually be lost.

### 6. Evaluation & Observation

A system can’t rely on “just another LLM prompt” for validation. The evaluation layer must be heterogeneous:

- **Rule-based checks**: JSON schema validation, string length checks, required field presence
- **Tool-based checks**: feeding code to a compiler, running test suites, or actually clicking through a UI with browser automation (e.g., Playwright)
- **LLM-as-judge**: used only for subjective or semantic judgments—tone, coherence, friendliness—that can’t be checked deterministically

### 7. Constraints & Recovery

In autonomous environments, tool failures and API timeouts aren’t exceptions—they’re the norm.

The harness must enforce **idempotency**. If a step fails, the system should retry only that step, without damaging the overall state or repeating already-completed work. This is what turns a fragile demo into a resilient system—the engineering version of “fail locally, not globally.”

---

## A Complete Agent Execution Example

To see how these layers prevent system collapse, let’s walk through a full flow using the market research agent from earlier, including one real failure.

**Step 1: User request**  
“Compare pricing between Competitor A and Competitor B.”

**Step 2: Orchestration & state**  
The planner LLM decomposes this into a DAG with two parallel branches. `state.json` marks “scrape Competitor A” as `IN_PROGRESS`.

**Step 3: Tool call**  
The LLM triggers a web search. The Tool layer retrieves 50 results, runs BM25 ranking, removes duplicate snippets, and returns only the top 3,000 tokens, keeping the overall budget in check. The Contract layer then validates the tool output against its expected schema before passing it to the model.

**Step 4: Evaluation**  
The LLM generates pricing data. The Evaluation layer runs a rule-based schema check and finds that the JSON is missing a required field: `currency`.

**Step 5: Recovery**  
The harness intercepts the error before the user sees it. Because the action is idempotent, it sends the precise error trace back to the LLM, allowing the model to perform a local retry on just this one step, rather than restarting the entire pipeline.

**Step 6: State update**  
The corrected data passes validation. `state.json` marks Competitor A as `COMPLETED`, and the harness proceeds to Competitor B.

**Step 7: Hard failure**  
The web search tool returns an empty result for Competitor B because the target site is down. The harness detects the empty payload, logs the failure, and triggers a fallback: retry with a different query. Crucially, `state.json` is *not* updated before this, so no partial or corrupted data is written.

**Step 8: Fallback succeeds**  
The alternative query returns valid results. The Contract layer validates the schema, the Evaluation layer confirms all required fields are present, and only then does `state.json` mark Competitor B as `COMPLETED`.

This loop repeats dozens or hundreds of times for long tasks. Unlike the “ten steps to collapse” at the beginning, here even a real tool failure is absorbed and recovered by the system. No hallucinations, no silent failures, no pipeline crash.

---

## Four Frontline Experiences: Advanced Pitfalls

When you scale this architecture to run for hours continuously, new failure modes appear that no amount of prompt tuning can solve. These are the four most common traps production teams hit.

### Trap 1: Context Anxiety

As an agent works continuously and the context window gradually fills, models often exhibit what engineers call “context anxiety.”

When token usage approaches the limit—typically above 70% capacity—or when latency spikes, the model may start skipping steps or finishing early. It looks like it’s in a hurry, as if it feels the “wall closing in.”

**Solution:**  
In-place summarization isn’t enough—it still keeps the model running in a noisy, degraded context. A more reliable approach is a **Context Reset**. The harness should monitor utilization and trigger a reset programmatically:

```python
# This threshold is empirical; adjust based on your model and workload.
if (tokens_used / max_context) > 0.7:
    save_state_to_disk(state)
    terminate_current_instance()
    launch_fresh_agent(state)
```

The harness saves the exact project state to persistent storage, terminates the current LLM instance, then spins up a new agent with a completely clean context. That new agent reads the state file, orients itself, and continues executing. This is more expensive, but for very long tasks, it’s far more reliable.

### Trap 2: Self-Evaluation Hallucination

If you ask an AI to score its own work, it tends to display unwarranted confidence in outputs that are actually mediocre.

This isn’t a bug specific to any one model—it’s a structural flaw. The same weights that generated the result aren’t well-suited to critically evaluate that same output.

**Solution:**  
Use a **Sprint Contract** to enforce separation of duties. Before work begins, the Generator Agent and an independent Evaluator Agent agree on a specific, verifiable definition of “done.” Two rules are non-negotiable:

First, the Evaluator must actually **execute**. It should run code, verify a UI with a headless browser, or validate the output against a schema—not just read the text and give an opinion. Only unfakeable validation counts.

Second, the Evaluator must work in a clean context, not read the Generator’s full chain of thought. Otherwise it inherits the Generator’s assumptions and blind spots, breaking “independent review.” Give the Evaluator only the output and the success criteria, not the entire reasoning trace.

### Trap 3: Optimizing for “Looks Correct”

When an LLM is placed under impossible or conflicting constraints—like “fix this bug, but don’t change any code,” or “make it shorter, but keep all information”—practitioners repeatedly observe a fixed behavior pattern:

The model stops genuinely solving the problem and starts optimizing for *looking correct*. Results become fluent but hollow: fabricated data, logically plausible but non-executable code, or outputs that literally satisfy the prompt while betraying the true intent.

Recent research on steering vectors and model internals—including Anthropic’s probing of language model internal states—suggests this may not be just a surface-level text prediction drift. Models facing conflicting pressures seem to undergo measurable changes in internal state, though this direction is still early.

**Solution:**  
The practical takeaway is direct. LLMs predict the next token along the current context trajectory. If your harness feeds back emotional, accusatory error messages like “you’re so stupid, this is completely wrong,” you’re effectively pushing the context toward a “failure narrative,” and the model’s subsequent output quality usually degrades further.

The feedback the harness gives the model must be strictly objective: compilation errors, assertion failures, schema mismatches. Give the model a problem to solve, not a bad reputation to escape.

### Trap 4: Memory Consolidation Loops

If an agent is to exist as a long-running system, persistent state management isn’t a one-time setup.

Over time, the memory log grows bloated and contradictory: old decisions conflict with new ones, duplicate entries waste tokens on every read.

Some production agent systems employ a pattern commonly called **Memory Consolidation**—periodically automatically processing and compressing the agent’s accumulated work logs. Public references and practices in some open-source frameworks show this pattern is highly effective. A representative case: a harness compressed 32K tokens of noisy, repetitive history into a clean 7K token state file with virtually no information loss.

**Solution:**  
Implement an automated consolidation loop. When the agent is idle—between tasks, or in low-priority time windows—trigger a background job that reads the raw logs, deduplicates, resolves conflicts by taking the latest as truth, and writes back a clean, compressed state file. This makes the next run faster, cheaper, and more accurate. Think of it as “disk defragmentation for AI working memory.”

---

## Where to Start: Minimum Viable Harness

If this seven-layer stack feels overwhelming, don’t try to build everything on day one. Start with layer 7—Constraints & Recovery—and work backward.

You can tolerate prompts that aren’t perfect. You can tolerate tool integrations that are rough. But you cannot tolerate an agent that corrupts its own state on failure or silently swallows errors.

A harness you should have from day one includes at least these four things:

- **`state.json`**: a structured file tracking task state. Even if the process dies, you know where to resume
- **Retry wrapper**: every tool call wrapped in `try/catch` with at least one automatic retry and exponential backoff
- **Schema validator**: every LLM output run through JSON schema validation; if format is wrong, trigger a retry instead of crashing the system
- **Tool output truncation**: a hard token limit on all tool returns. Silent truncation inside the context window is one of the most common sources of hallucinations

These four components can be put together in an afternoon. Once your agent learns to “fail gracefully,” you’ve earned the right to make it smarter.

## Conclusion

The future of software is moving agent-first.

As models gradually acquire the raw ability to autonomously generate and verify complex systems, the center of gravity for human value is shifting. What matters most going forward is no longer just whether you can write syntax, but whether you can design a system of constraints that keeps autonomous execution reliable.

The most successful builders of the next decade won’t be the ones who write the prettiest code. They’ll be the ones who build the best harnesses. They’ll craft the steadiest reins for the fastest horses. And those reins, at their core, are just a few principles applied consistently: constrain, externalize, validate, recover.

---

*If you want to see implementation details behind each layer—state storage, validation nodes, sprint contracts, and where to start—check out the companion FAQ:* [**From Theory to Production: A Practical Guide to Harness Engineering**](https://blog.ltbase.dev/posts/agents/harness-engineering-faq.html)
