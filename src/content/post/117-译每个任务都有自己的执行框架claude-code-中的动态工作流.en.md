---
title: "Every Task Has Its Own Execution Framework: Dynamic Workflows in Claude Code"
publishDate: "2026-06-03T16:29:07Z"
updatedDate: "2026-06-04T03:27:02Z"
tags: ["AI"]
description: "Last week, we released dynamic workflows in Claude Code. Now, Claude can instantly write its own harness—an execution framework tailored to the current task.\n\nThe default Claude Code harness is built for programming tasks, but it actually works well for many other types of tasks. As it turns out, many tasks are structurally similar to programming tasks. However, some tasks"
---

![ChatGPT Image Jun 4, 2026, 12_20_21 AM](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/ChatGPT%20Image%20Jun%204,%202026,%2012_20_21%20AM.webp)

Last week, we released [dynamic workflows](https://code.claude.com/docs/en/workflows) in Claude Code. Now, Claude can instantly write its own [harness](https://code.claude.com/docs/en/glossary#agentic-harness)—an execution framework tailored to the current task.

The default Claude Code harness is built for programming tasks, but it actually works well for many other types of tasks. As it turns out, a lot of tasks are structurally similar to programming. However, some task types need a custom harness built on top of Claude Code to achieve optimal performance, such as [research](https://support.claude.com/en/articles/11088861-using-research-on-claude), [security analysis](https://support.claude.com/en/articles/11932705-automated-security-reviews-in-claude-code), [agent teams](https://code.claude.com/docs/en/agent-teams), or [code review](https://code.claude.com/docs/en/code-review).

Workflows let you dynamically create harnesses on top of Claude Code, enabling Claude to solve these problems more natively. You can also share these workflows with others or reuse them.

In this post, I'll share some of my early experiences and insights with workflows to help you get the most out of them. Note that best practices are still evolving: dynamic workflows typically consume more tokens, so they're best suited for complex, high-value tasks.

## Example Prompts

Before diving into technical details, I'd like to show a few example prompts to help you understand what a **workflow** can do:

"This test fails about 1 in every 50 runs. Set up a workflow to reproduce it. Propose several competing theories about the race condition, and don't stop until the evidence supports only one theory."

"Use a workflow to review my last 50 sessions, mine the places where I repeatedly correct Claude, and compile those frequent issues into `CLAUDE.md` rules."

"Use a workflow to look at the #incidents channel in Slack over the past 6 months, find root causes that keep recurring but nobody creates a ticket for."

"Run a workflow on my business plan, letting different agents ruthlessly critique it from the perspectives of investors, customers, and competitors."

"Here’s a folder with 80 resumes. Use a workflow to sort them by backend job requirements and double-check the top 10. You can use the AskUserQuestion tool to interview me to determine scoring criteria."

"I need to name this CLI tool. Use a workflow to brainstorm a batch of candidate names, then use a tournament-style method to pick the top 3."

"Use a workflow to rename our User model to Account everywhere."

"Check my blog draft and use a workflow to verify every technical claim against the codebase. I don't want to publish anything wrong."

## How dynamic workflows work

A dynamic workflow executes a JavaScript file that contains special functions for creating and coordinating [sub-agents](https://code.claude.com/docs/en/sub-agents):

![Figure 1](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image1-zh-gen.png)

Dynamic workflows also include standard JavaScript functions, such as JSON, Math, and Array, to help process data.

One important detail: a dynamic workflow can decide which model a sub-agent uses and whether that sub-agent runs in its own worktree. This lets Claude choose the appropriate level of intelligence and isolation for the task at hand.

If the workflow is interrupted—for example, because the user manually stops it or the terminal exits—it can resume execution from where it left off when the session is restored.

## Why Dynamic Workflows Are Needed

When you ask the default Claude Code harness to execute a task, it must complete planning and execution within the same context window. For many programming tasks, this approach works very well. But for long-running, massively parallel, highly structured, or adversarial tasks, it can run into problems.

The reason: the longer Claude processes a complex task within a single context window, the more susceptible it becomes to several specific failure modes:

- **Agentic laziness**: Claude stops early before completing a complex, multi-step task and declares it done after making only partial progress. For example, during a security review, it might process only 35 out of 50 issues before finishing.
- **Self-preference bias**: Claude tends to trust its own results or findings more, especially when you ask it to verify or judge those results against a scoring criterion.
- **Goal drift**: After many rounds of conversation, especially after context compression, Claude gradually loses precise understanding of the original goal. Each summarization loses information, and constraints like edge-case requirements or "don't do X" are easily lost along the way.

Creating workflows can counteract these problems by orchestrating multiple independent Claude sub-agents. Each sub-agent has its own context window and a more focused, isolated goal.

## Dynamic Workflows vs Static Workflows

You've probably used the Claude Agent SDK or `claude -p` to create static workflows before, coordinating multiple Claude Code instances to work together.

But because static workflows need to handle every edge case, they tend to be more generic. Now, with [Claude Opus 4.8](https://www.anthropic.com/news/claude-opus-4-8) and dynamic workflows, Claude is smart enough to write a tailored harness for your specific use case.

![Figure 2](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image2-zh-gen.png)

## Useful Patterns When Using Dynamic Workflows

You can directly ask Claude to create a dynamic workflow, or use the trigger word “`ultracode`” to ensure Claude Code creates one.

However, if you build a mental model of how dynamic workflows work, you'll have a clearer idea of when to use them and how to guide Claude via prompts.

When building workflows, Claude may use and combine several common patterns:

![Figure 3](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image3-zh-gen.png)

### Classify and Execute

Use a classifier agent to determine the task type, then route to different agents or behaviors based on the task type. You can also use a classifier at the end of the workflow to judge the output.

### Fan-out and Synthesize

Break a task into many smaller steps, have each step handled by an agent, and then synthesize the results.

This pattern is especially useful for tasks with many steps, or situations where each step benefits from a clean, independent context window. This prevents interference between steps or cross-contamination of contexts.

The synthesis step acts as a barrier: it waits for all fanned-out agents to complete, then combines their structured outputs into a final result.

### Adversarial Validation

For each created agent, create an independent agent that performs adversarial validation on the output based on scoring criteria or judgment guidelines.

### Generate and Filter

Generate a batch of ideas around a topic, then filter them based on scoring criteria or validation results, remove duplicates, and finally return only the highest quality, tested ideas.

### Tournament

Instead of splitting work, have multiple agents compete on the same task.

Create N agents, each trying to complete the same task using different methods. Then, via prompts or the model, have a judge agent evaluate the results in pairwise comparisons until a final winner is selected.

### Loop Until Done

For tasks with unknown workload, instead of a fixed number of steps, continuously create agents until a stopping condition is met — for example, no new findings or no more errors in the logs.

## Use Cases

You can think more creatively about when and how to have Claude Code create dynamic workflows. I've found that workflows can sometimes be even more useful for non-technical tasks.

### Migration and Refactoring

[Bun](https://bun.com/) was rewritten from Zig to Rust using a workflow. You can see more details in [Jarred's X thread](https://x.com/jarredsumner/status/2060050578026189172).

The key is to break the task into a series of steps to handle, such as call sites, failing tests, modules, etc. For each fix task, spawn a sub-agent to complete the fix in a worktree. Then have another agent perform an adversarial review, and finally merge the results.

You might consider telling the agents not to use resource-intensive commands, so you can maximize parallelism without exhausting local resources.

### Deep Research

We released a deep research skill in Claude Code, `/deep-research`, which uses dynamic workflows. Specifically, it fans out multiple web searches, fetches sources, adversarially verifies claims found in them, and synthesizes a report with citations.

However, this kind of research isn't limited to web search. For example, you could have Claude write a status report based on Slack context, or explore a codebase to understand how a feature works.

### Deep Verification

![Figure 4](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image4-zh-gen.png)

On the other hand, if you have a report and want to examine and trace each factual claim it references, you can generate a workflow: first have an agent identify all factual claims, then spawn a sub-agent for each claim to perform a detailed check.

You can also set up a verification agent to check the sub-agent responsible for source tracing, ensuring that the sources it references are of sufficiently high quality.

### Sorting

![Figure 5](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image5-zh-gen.png)

You might have a set of items you want to sort by some qualitative metric that you think Claude Code is good at evaluating. For example: sorting support tickets by bug severity.

But if you try to sort over 1000 lines of data in a single prompt, quality degrades and context won't fit.

A better approach is to run a tournament, or set up a pipeline of pairwise comparison agents. Pairwise comparisons are usually more reliable than absolute scoring. You can also do parallel bucketed rankings and then merge the results.

Each comparison is done by an independent agent, so a deterministic loop maintains the overall tournament bracket, and the context only needs to retain the current running order.

### Memory and Rule Adherence

![Figure 6](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image6-zh-gen.png)

If you notice Claude frequently misses or struggles to follow certain rules, even after you've written them into the `CLAUDE.md` file, you can create a workflow that lists these rules and has a verification agent check each one. Each rule corresponds to one verification agent.

Creating a "skeptic persona" sub-agent to review these rules can also help avoid generating too many false positives.

The reverse also works: mine your recent conversations and code review comments to find corrections you make repeatedly; cluster them using parallel agents; adversarially validate each candidate rule, for example by asking "does this rule actually prevent a real bug"; then distill the validated rules back into `CLAUDE.md`.

### Root Cause Investigation

The most effective way to debug is to propose several independent hypotheses, then verify each separately. But if you use a single context window, Claude might fall into self-preference bias.

Workflows can structurally avoid this issue: they can spawn multiple agents to generate hypotheses based on independent sources of evidence. For example, separate agents for logs, files, and data. Then each hypothesis can be reviewed by a set of verifiers and refuters.

This isn't limited to code. Workflows can also be used for sales analysis, like "Why did March sales drop?"; for data engineering, like "Why did this pipeline fail?"; or for any post-mortem scenario.

### Large-Scale Triage

![Figure 7](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image7-zh-gen.png)

Every team has support queues, bug reports, or other backlogs that can't be fully handled by humans.

A triage workflow classifies each item, deduplicates against what's already tracked, then takes action. That might mean attempting to fix the issue, or escalating to a human user.

A useful pattern in triage workflows is a "quarantine zone". It prevents agents that read untrusted public content from performing high-privilege operations. The actual high-privilege operations are performed by agents responsible for taking action based on the information.

You can pair the triage workflow with `/loop` to have Claude continuously run these kinds of tasks.

### Exploration and Taste

Workflows are useful when you need to explore different directions for a solution. Especially in tasks with aesthetic judgments like design or naming, and even more so when paired with a scoring rubric.

You can have Claude explore a batch of solutions, then give the reviewing agent a rubric for judging "good solutions". When the reviewing agent thinks the criteria are met, the task is done.

These solutions can also be sorted or filtered via a tournament based on the rubric.

### Evaluation

You can run lightweight evaluations for specific tasks: spawn multiple independent agents to complete the task in their own worktrees, then spawn a comparison agent to compare and score the outputs against a rubric.

For example, you can use this to evaluate and improve a skill you created, to see if it meets specific criteria.

### Model and Intelligent Routing

You can create a classifier agent tuned to your task, which decides which model should be used.

This approach is especially useful when your task requires extensive tool calls and some research before execution, because the upfront research can help identify the most suitable model for the task.

For example, for a task like "explain how the auth module works", the most suitable model depends on how many files the auth module contains and the overall codebase structure. The classifier agent can do this research first, then route the task to Sonnet or Opus based on the expected complexity.

## When Not to Use Dynamic Workflows

Workflows are still a new feature. While they can deliver far better results than conventional approaches in many scenarios, not every task needs one—and they can end up consuming significantly more tokens.

It's best to use workflows creatively, pushing Claude Code in directions you haven't tried before. For ordinary programming tasks, ask yourself first: does it really need more computational resources?

For example, most conventional programming tasks don't require a review panel of five reviewers.

## Suggestions for Building Dynamic Workflows

### Prompts

For dynamic workflows, using more detailed prompts and explicitly applying the specific techniques mentioned earlier usually yields the best results.

Workflows aren't just for large tasks. You can also prompt the model to use a "quick workflow." For example, you can create a fast adversarial review process to check a hypothesis.

### Combining `/goal` and `/loop`

When using workflows that need to run repeatedly—such as triage, research, or validation—pair them with `/loop` to run at fixed intervals, and use `/goal` to set a hard completion requirement.

### Token Usage Budget

You can set an explicit token usage budget for dynamic workflows, limiting how many tokens a task can consume at most.

For example, you can write "use 10k tokens" in the prompt, which sets an upper bound.

### Saving and Sharing Dynamic Workflows

You can save a workflow by pressing "s" in the workflow menu. Workflows can be saved to `~/.claude/workflows` or distributed via skills.

![Figure 8](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image8-zh-gen.png)

To share a workflow through a skill, place the JavaScript workflow file in the skill folder and reference it in [SKILL.MD](http://skill.md/).

For more flexibility, you may want to prompt Claude to treat the workflow in a skill as a template rather than a script that must be executed verbatim.

![Figure 9](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image9-zh-gen.png)

## A New Starting Point for Exploration

Workflows are a helpful new way to extend Claude Code. I encourage you to think of them as a starting point for exploring new ways to get things done with Claude. There's still a lot to discover about how to use them best. Let me know what you find.

This article was written by Thariq Shihipar and Sid Bidasaria, who are members of Anthropic's technical team working on Claude Code.
