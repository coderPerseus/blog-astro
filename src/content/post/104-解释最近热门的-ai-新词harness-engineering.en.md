---
title: "Explaining the Latest AI Buzzword: Harness Engineering"
publishDate: "2026-02-26T06:05:33Z"
updatedDate: "2026-02-26T06:05:33Z"
tags: ["AI","Agent"]
description: "Title: The Emerging \"Harness Engineering\" Guide\n\nSource: https://x.com/charlierguo/status/2026009225663750512\n\nAuthor: Charlie Guo\n\nTranslator: Grok 4.2 beta (Recommended to use the \"🥥 Coconut Translate\" browser extension, supports page translation, selection translation, AI"
---

> Title: The Emerging "Harness Engineering" Guide

> Source: https://x.com/charlierguo/status/2026009225663750512

> Author: [Charlie Guo](https://substack.com/@charlieguo)

> Translator: Grok 4.2 beta (Recommended browser extension: 「🥥 Coconut Translator」, supporting web page translation, word translation, AI translation, YouTube subtitle translation, and many more capabilities)

![Gemini_Generated_Image_yzdvnqyzdvnqyzdv.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/Gemini_Generated_Image_yzdvnqyzdvnqyzdv.png)

This article covers the convergence of best practices for building coding agents, from OpenAI to Stripe to OpenClaw.

Earlier this month, Greg Brockman [posted a thread](https://x.com/gdb/status/2019566641491963946) about how OpenAI is restructuring its engineering teams to be more effective when using agents. The initiative was sparked by how much things have changed internally:

> Yesterday some excellent OpenAI engineers told me that their work has fundamentally changed since December. Before, they could use Codex for unit tests; now, it writes almost all the code and does a ton of ops and debugging. Not everyone has made the leap, but it's usually because of factors beyond model capability.

I [previously mapped out](https://www.ignorance.ai/p/idle-thoughts-on-programming-and-ai) the progression from Copilot to chatbot to agent to background agent to agent fleet. Each step is faster than the last. But in the past few months, something qualitatively different has emerged—yes, models have gotten better, but we're also seeing concrete evidence of what happens when entire teams reorganize around them.

Consider these data points:

Peter Steinberger, creator of OpenClaw, [told Pragmatic Engineer](https://newsletter.pragmaticengineer.com/p/the-creator-of-clawd-i-ship-code) that he ships code he hasn't read. One person, 6,600+ commits in a month, running 5-10 agents concurrently.

An OpenAI team built a [million-line internal product in five months with three engineers](https://openai.com/index/harness-engineering/). Zero lines hand-written (by design). Average of 3.5 PRs per engineer per day—and throughput increased as the team grew.

Stripe's internal coding agent, called [Minions](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents), now produces over a thousand merged pull requests per week. A developer posts a task in Slack; the agent writes code, passes CI, and opens a PR ready for human review, with zero interaction in between.

For me, it's clear we're past demos and side projects; these are production systems at real scale. And while the specifics differ—Steinberger is a solo operator, the OpenAI team is a squad, Stripe is a 10,000-person company—the patterns they converge on are remarkably similar.[1](https://www.ignorance.ai/p/the-emerging-harness-engineering#footnote-1-188778904)

This post is my attempt to map those patterns. The practices are still emerging and will undoubtedly evolve, but they're converging fast enough that it's worth writing down what's becoming clear.

## The engineer's job is splitting in two

Right now, I see the AI space reflecting and evolving my own observations about [the shift from maker schedule to manager schedule](https://www.ignorance.ai/p/the-ai-managers-schedule):

> I'm moving away from chatting with AI to managing them. You can see the progression in these tools. Today they're primarily designed around coding, but it's a short step to extending them to general knowledge work. That means those of us on the frontier will shift our schedules and workflows from maker to manager.

That framework still holds, but watching these teams work sharpens it. The engineer's job isn't just to become a "manager" in a general sense—it's splitting into two distinct parts, and you need both.

The first part is building the harness. The OpenAI team was blunt: the bottleneck was never the agent's ability to write code, but the lack of structure, tools, and feedback loops around it. Their focus shifted from implementation to enabling: when Codex got stuck, they treated it as a harness design problem and asked what was missing for the agent to reliably continue. And this, I think, is the key piece missing from my earlier writing.

The second part is management work. It's what Steinberger does when he spends significant time planning with agents before starting execution, or acts as "benevolent dictator" over OpenClaw's architecture while shipping code he hasn't read. It's what Brockman means when he recommends each team designate an "agent captain"—someone responsible for thinking about how agents fit into the team's workflow.

These two parts are not sequential (at least not yet). You don't build the harness and then manage agents inside it. You do both simultaneously, each informing the other. Agent failures tell you what the harness lacks; a better harness lets you manage with less friction.

## Building the Harness

There's no official term yet, but I appreciate the one used by Mitchell Hashimoto (creator of Terraform, Ghostty, and many other software tools): "[harness engineering](https://mitchellh.com/writing/my-ai-adoption-journey)." A harness is the collection of constraints, tools, documentation, and feedback loops that keep agents efficient and on track. Think of it as the difference between a new employee thrown into a company without onboarding versus one at a company with clear architecture docs, linting rules, fast CI pipelines, and well-defined module boundaries.

According to Hashimoto, "It's the idea that every time you find an agent making a mistake, you spend time designing a solution so that the agent never makes that mistake again." In the examples I've seen, four practices keep surfacing.

### Architecture as guardrails

The OpenAI team enforces a strict layered architecture where code within each domain has very rigid dependencies and interfaces. Anything outside the architecture is forbidden and mechanically enforced:

> Agents work best in environments with strict boundaries and predictable structure⁠, so we built the application around a rigid architectural model. Each business domain is split into a fixed set of layers with strictly enforced dependency direction and limited allowed edges. These constraints are mechanically enforced via custom linters (generated by Codex, of course!) and structural tests.
> ...
> In a human-first workflow, these rules might feel pedantic or restrictive. But for agents, they become multipliers: once encoded, they apply everywhere instantly.

As Birgitta Böckeler [notes on Martin Fowler's site](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html), this suggests a counterintuitive future: increasing trust and reliability in AI-generated code requires constraining the solution space rather than expanding it. We might end up choosing tech stacks and codebase structures not because they're the most flexible, but because they're the most harnessable.

Stripe takes a different but complementary approach. Their Minions run in isolated, pre-warmed "devboxes"—the same development environment used by human engineers, but sandboxed from production and the internet. Agents access over 400 internal tools via MCP servers. Key insight: agents need the same context and tools as human engineers, not a bolt-on afterthought.

### Tools as foundation and feedback

Brockman's recommendation for teams is direct: "Maintain a list of tools your team depends on, and make sure someone is responsible for making them agent-accessible (e.g. via CLI or MCP server)." If agents can't access your tools, they can't help.

Stripe's implementation is arguably the most mature example of this. Their Minions connect to 400+ internal tools through a centralized MCP integration called Toolshed. Agents run in the same development environment as human engineers—same tools, same context, same access.

But making tools accessible is just the start. More importantly, the right tools don't just extend what agents can do—they improve the reliability of everything they already do.

In my own experience, giving Codex clear instructions on which linters and test suites to run before committing has dramatically increased my confidence in each diff. Without those tools, I'm flying blind, relying on my own manual review to catch things. Similar to the OpenAI and Anthropic teams, I've found that prompting agents to use browser automation tools for end-to-end testing greatly improves thoroughness and accuracy—agents can catch bugs that aren't visible from code alone.

The OpenAI team goes further, with what might be the smartest idea in these articles: custom linter error messages that double as remediation instructions. When an agent violates an architecture constraint, the error message doesn't just flag the violation—it tells the agent how to fix it. The tools teach the agent as they work. In Brockman's words: "Write fast-running tests, and create high-quality interfaces between components."

### Documentation as record system

But how do you turn these processes into repeatable *systems*? Again, Brockman's thread includes a specific recommendation: "Create and maintain an AGENTS.md for any project you work on; update AGENTS.md whenever an agent does something wrong or struggles with a task." This turns documentation into a feedback loop rather than a static artifact.

For those unfamiliar: AGENTS.md is an emerging open convention—essentially a README for AI agents.[2](https://www.ignorance.ai/p/the-emerging-harness-engineering#footnote-2-188778904) It's a Markdown file at the root of the repo that encodes what agents should read at the start of every session. It tells agents what they need to know about your project: build steps, test commands, coding conventions, architecture constraints, and common pitfalls.

But what makes AGENTS.md load-bearing infrastructure rather than another piece of rotting documentation is the usage pattern described by Brockman and Hashimoto. You don't write it once and forget it. You update it every time an agent does something wrong.

> Every time you find an agent making a mistake, you spend time designing a solution so that the agent never makes the same mistake again.

For simple things—an agent ran the wrong command or found the wrong API—that means an AGENTS.md update. Hashimoto points to examples from his terminal emulator Ghostty, where every line in the file corresponds to a specific past agent failure that has now been prevented.

But the OpenAI team goes further. Instead of maintaining a single giant instruction file, they built a small AGENTS.md that points to deeper sources of truth—design documents, architecture maps, execution plans, quality tiers—all versioned and maintained in the repo. A background agent periodically scans for outdated documentation and opens cleanup PRs: agent documentation, created by agents.

Anthropic's engineering team, in a post about [effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents), discovered similar patterns from the opposite direction. Their core problem was that each new agent session started without memory of what had happened before. The solution was structured progress files and feature lists that let a new agent quickly understand the state of work, similar to a shift handoff between engineers who have never met. They even found that using JSON for feature tracking was better than Markdown, because agents are less likely to inappropriately edit or overwrite structured data.

## Becoming an AI Manager

But of course, the harness is only half the equation. The other half is the day-to-day practice of directing agent work—what I've called the AI Manager's Schedule. Here too, the practitioners on the frontier are converging on similar approaches.

### Planning is the new coding

By now, many developers emphasize extensive upfront planning when using AI—so much so that most AI coding tools now include a dedicated "more planning" mode. Only when they're satisfied do engineers launch execution and move to the next task.

Boris Tane, Head of Observability for Workers at Cloudflare, has [an entire blog post](https://boristane.com/blog/how-i-use-claude-code/) dedicated to this principle: never let an agent write code until you've reviewed and approved a written plan. In his words:

> This separation of planning and execution is the single most important thing I do. It prevents wasted effort, gives me control over architectural decisions, and produces significantly better results with minimal token usage compared to jumping straight to code.

Anthropic's approach to long-running agents formalizes this further. Their "initialization agent" generates a comprehensive feature list from a high-level prompt—200+ individual features for a single web application, each with explicit test steps, all initially marked as "fail." This upfront decomposition prevents the agent from trying to tackle the entire project at once or declaring victory prematurely.

I [went through this shift myself](https://www.ignorance.ai/p/the-codex-app-has-upended-my-daily). When the Codex App upended my daily workflow, I stopped spending time implementing and started spending it scoping, directing, and reviewing. The most important work now happens before any code is written.

### Say No to Slop

Brockman's recommendation #5 is blunt:

> Make sure someone is responsible for any merged code. As a code reviewer, maintain at least the same standards as you would for human-written code, and make sure the author understands what they're submitting.

This is the principle of "say no to slop," and it runs counter to the temptation of speed. When an agent can produce PRs faster than you can review them, the instinct is to lower the bar. Every source I've read pushes back against that.

Steinberger, despite shipping code he hasn't read line by line, deeply cares about architecture and scalability. He acts as the architectural gatekeeper for OpenClaw. In his Discord with contributors, he doesn't talk about code—only architecture and big decisions. Gergely Orosz of Pragmatic Engineer observed that Steinberger "gives me the impression of being a software architect who keeps the high-level structure of the project in his head."

I've [struggled with this](https://www.ignorance.ai/p/idle-thoughts-on-programming-and-ai) for a while, but as models get good enough, I find it easier to think of them as experienced subcontractors:

> I like the woodworking or carpenter analogy. For a junior carpenter (i.e., an "apprentice"), the job might be just about output—turning a design or idea into a finished product. But for a more senior person ("journeyman" or "craftsman"), their job is usually to understand what the client wants, understand the realities of the materials, and design something that fits the requirements.
>
> Ultimately, if I'm working with a senior carpenter to help design something, I don't particularly care whether they're the one actually doing the sawing and gluing. I'm partnering with them on the finished product, not the specific mechanical steps.

That's what Steinberger is doing. He's the master carpenter. The agents are doing the sawing and gluing. His job is to know what good looks like and reject what doesn't meet the standard—some might call it "taste."

I call it "[baloney detection](https://www.ignorance.ai/p/the-ai-managers-schedule)," and it becomes more critical as output volume increases, not less. You're reviewing at a higher level of abstraction now. Does the code feel too clever, or too repetitive? Are there patterns here that will cause maintenance headaches in six months? Are the abstractions at the right level?

### Orchestrating, not just delegating

The ultimate management skill is parallelization, but to be clear, not everyone can (or needs to) do it. Steinberger runs 5-10 agents concurrently. Stripe engineers launch multiple Minions in parallel from Slack. I do the same with work trees in the Codex app—three sessions discussing different features simultaneously, context-switching between them as a reviewer rather than an implementer.

But a key distinction emerges between two modes of parallel work. What Steinberger and I do is attended parallelization—you actively manage several agent sessions, checking in on each, redirecting when needed. What Stripe's Minions represent is closer to unattended parallelization—a developer posts a task and walks away. The agent handles everything through CI, and the human only re-enters the loop at review time.

These are genuinely different management styles with different trade-offs. Attended parallelization gives you more control and catches problems earlier, but is cognitively demanding. Unattended parallelization scales better but requires heavy investment in the harness—it has to be good enough that you trust the agent from task to PR without oversight. Stripe can do this because they built Toolshed, pre-warmed devboxes, and tight CI integration. Most teams aren't there yet.

Where your team sits on this spectrum depends on two things: how mature your harness is, and how much you trust agents with your codebase. As harnesses improve and models get better at sustaining longer tasks without derailing, I expect the balance to shift toward unattended work. But for now, most of us are in the middle—attended for complex tasks, unattended for scoped ones.

## What Remains Difficult

The practices above represent genuine convergence. But there are several open questions that nobody has a convincing answer to yet.

The first is Brockman's closing remark: how to prevent "functionally correct but unmaintainable code" from creeping into the codebase? The Harness Engineering post calls this phenomenon "entropy"—agent-generated code accumulates differently than human-written code. They've started running periodic "garbage collection" agents to find inconsistencies and violations, but they acknowledge this is still an emerging practice.

The second is validation at scale. Böckeler's critique of the Harness post is sharp: the article lacks validation of functionality and behavior. Anthropic's long-running agent research also found this gap—agents would mark features as complete without proper end-to-end testing, and without explicit prompting, they failed to recognize when something didn't work. Even with browser automation, limits on visual and tool access mean some bugs go missed.

The third is the retrofitting problem. All these success stories involve teams building new projects or building the harness from scratch. Applying these techniques to a ten-year-old codebase with no architecture constraints, inconsistent tests, and patchy documentation is a much more complex problem. Böckeler compares it to running it on a codebase that never had static analysis tools—you'd be drowning in alerts. How harness engineering applies to legacy brownfield projects is an open question.

The fourth, and perhaps the biggest, is cultural adoption.

Reading through all these examples, one thing becomes clear: none of this happens by accident. **Someone has to build this stuff.** Someone in each organization has to do the work of figuring out how agents fit into their team's workflow—creating the harness, defining the processes, and iterating based on what works.

The good news is that the investment compounds. Every AGENTS.md update prevents a class of future failures. Every custom linter teaches every future agent session. Every tool you expose via MCP makes every subsequent task faster. The upfront cost is significant, but the returns accelerate.

## The Shape of Things

Steinberger observed that engineers who enjoy solving algorithmic puzzles struggle to shift to agent-native work, while engineers who like shipping products adapt quickly.[5](https://www.ignorance.ai/p/the-emerging-harness-engineering#footnote-5-188778904) This aligns with what I've seen firsthand—when I stopped writing code with my own hands, I had to learn to let go of the craft of software engineering.

But despite the bittersweetness, I'm fascinated by what's happening here. This is a new discipline forming in real time—one that draws from classic challenges in software architecture and team management while weaving in context engineering. The playbook is still being written, but for the first time I feel like its shape is coming into focus.
