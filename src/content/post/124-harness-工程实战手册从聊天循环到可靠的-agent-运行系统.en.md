---
title: "The Harness Engineering Handbook: From Chat Loops to Reliable Agent Runtime Systems"
publishDate: "2026-09-10T01:44:31Z"
updatedDate: "2026-09-10T01:44:31Z"
tags: []
description: "Repost and translation notes\n\n This is a Chinese translation of the Stencil team article \"The Harness Playbook,\" written by Can Bölük and originally published on September 2, 2026. Copyright for the article and original images belongs to the original author and relevant rights holders.\n\n Recommended intro: When agents move from a single conversation to long tasks, multi-agent collaboration, and remote execution, the hard part becomes state recovery,"
---

# The Harness Engineering Playbook: From a Chat Loop to a Reliable Agent Runtime

> **Repost and translation notes**
>
> This is a Chinese translation of *The Harness Playbook* by the Stencil team. The original author is **Can Bölük**, and the article was published on **September 2, 2026**. Copyright for the article and its original images belongs to the author and the relevant rights holders.
>
> **Why it's worth reading:** Once an agent moves from a single conversation to long-running tasks, multi-agent collaboration, and remote execution, the hard problems land on state recovery, tool execution, permission boundaries, and real-time interfaces. Drawing on lessons learned from omp, this article discusses how a runtime framework should absorb that complexity. Recommended for engineers building agent products, SDKs, and extension systems.
>
> **Original URL:** [The Harness Playbook — Stencil](https://stencil.so/blog/harness-playbook)
>
> **Translation engine:** OpenAI GPT-6 (Codex). The Chinese translation and terminology review were done by AI, with no claim of human proofreading.
>
> **Translation notes:** The original structure, code, technical judgments, and argumentative tone are preserved; code and formal specifications are kept as-is. In this article, "harness" refers to the runtime framework that carries agent state, execution, control, and interaction, and the English term is kept throughout. Demo videos and interactive content from the original are presented as screenshots and source links; text inside images is left untouched, while captions are translated into Chinese. "We" and "I" throughout refer to the original author and their team; feature status reflects the time of original publication.

---

*Before we start, a word of thanks. Hundreds of thousands of users have used omp, reported failures, asked for missing capabilities, and collectively shaped what it is today. This article, and omp² itself, exist because of you.*

When people hear about omp², their first reaction is often: "But why build this?"

Wrapping fetch in a while loop sounds simple enough. But there's a reason OpenCode, Pi, OpenClaw, and omp all set out to rebuild from the ground up at the same time: this category of software never existed before. Only by building the simple version first can we see the cracks, and from there move toward a better design.

Someone has to absorb the complexity that can't be avoided. Right now, the scales of the [law of conservation of complexity](https://en.wikipedia.org/wiki/Law_of_conservation_of_complexity) tip toward extensions and users, to the point where building reliable software on top of omp or Pi has become impossible. I've already heard people say: "What? Extending it is obviously so simple and so pleasant." Give me a few chapters, and let me try to change your mind.

Dijkstra wrote that ["simplicity is a prerequisite for reliability"](https://www.cs.virginia.edu/~evans/cs655/readings/ewd498.html), yet he's best known for solving pathfinding with an algorithm. Why not just brute-force the search? He certainly didn't mean the "**simple is good, complex is bad**" mantra we repeat today. That advice was meant to help implementers reason. But we're embarrassed to admit that we've turned it into an excuse for implementers not to think.

Ousterhout fills in the other half in his Stanford lectures. He tells module authors to ["take the pain"](https://web.stanford.edu/~ouster/cgi-bin/cs190-spring16/lecture.php?topic=modularDesign). Take on the hard problems, solve them thoroughly, and then let everyone else use the result with ease. Sink complexity into the module so a small number of implementers carry it, instead of every caller shouldering their own smaller, slightly different copy.

---

I'm sure many readers remember the tweet comparing Claude Code to a game engine, and the wave of memes it set off. The analogy sounds like a stretch, but set rendering aside for a moment, and list out a harness's responsibilities item by item — the resemblance is real.

It maintains an authoritative world, keeps a change log, runs untrusted actions, replicates state into multiple views, schedules actors, interprets commands, adapts incompatible protocols, and renders a live interface.

Sound familiar? Game engines seem to have spent decades absorbing the same categories of complexity.

What follows is both a retrospective and a playbook:

- **Lessons from omp**: where we ran into failures in a system real users depend on.
- **What omp² changes**: the alternative architecture — some of it already built, some still being worked out.

## Table of contents

- [01 The design envelope](#the-design-envelope)
- [02 The state](#the-state)
- [03 The runtime](#the-runtime)
- [04 The control plane](#the-control-plane)
- [05 The inference](#the-inference)
- [06 The tool surface](#the-tool-surface)
- [07 The interface](#the-interface)
- [08 The stack](#the-stack)
- [09 Closing notes](#closing-notes)
- [Appendix A: State failures in the official examples](#appendix-a-state-failures-in-the-official-examples)
- [Appendix B: Elastic speculative slots](#appendix-b-elastic-speculative-slots)

<a id="the-design-envelope"></a>

## 01 Designing the boundaries

> Decide on the operating modes first; every subsystem has to hold up under all of them.

Before discussing any subsystem of an agent harness, imagine four very different products that would depend on it:

- **Multiplexed workspace**: a local environment where multiple agents and subagents work in the same folder.
- **Remote driver**: controlling a cloud agent, or an agent on the machine under your desk, through a remote client on your phone.
- **Bystander**: watching a Claude agent work through a web client.
- **Factorio**: an automated software factory that uses the SDK and handles untrusted input.

These aren't marketing personas; they're architecture tests. Together they vary several dimensions, and those dimensions are exactly what stops a harness from being just a chat loop:

| Test scenario | Local or remote | Interactive or autonomous | Trust boundary | Concurrency |
| --- | --- | --- | --- | --- |
| Multiplexed workspace | Local | Interactive | Mostly trusted | Multiple agents, one workspace |
| Remote driver | Remote | Interactive | Host and client separated | One or more agents |
| Bystander | Remote view | Observational | Untrusted display input | Multiple viewers |
| Factorio | Remote or cluster | Autonomous | Malicious repos and tool input | Multiple jobs |

A design that only works for the first scenario tends to sneak the controller into the TUI, leave state in closures, run extensions inside the engine process, and assume someone can always bail the system out of an unbounded call. To hold up across all four scenarios, the design has to draw better boundaries.

What follows revolves around five requirements that fall out of this:

1. **A single authoritative session.** Rollback, forking, resuming, copying, and inspection must all derive from the same logged state.
2. **A trusted control plane.** Policy and session ownership stay on the host side; the sandbox only receives execution requests with clearly defined boundaries.
3. **Bounded work.** Tool calls, subagents, and background jobs are all cancellable streams with centrally managed limits and observability.
4. **Explicit compatibility.** Model- and provider-specific behavior should become structured knowledge, not conditional branches scattered across call sites.
5. **Views are just projections.** The TUI, web client, remote client, and subagent inspector all render the same state, and none of them becomes a new source of authority.

These constraints tie the rest of this piece together. Whether the later sections introduce a DOM, a convar, a Director, a small VM stub, or a component renderer, each one solves one of these five requirements rather than adding a subsystem for its own sake.

The first one is foundational: before deciding where code runs or how it renders, the harness has to know what the real state actually is.

<a id="the-state"></a>

## 02 State

> If you can't derive authoritative state from the log, then rollback, forking, and recovery are all lies.

<a id="what-must-survive"></a>

### What has to survive

If you want something to persist, roll back, survive crashes, and support forking, you have three options:

1. Keep the history that produced it.
2. Keep the property changes you care about.
3. Keep the machine itself.

![Figure 1: Three approaches to preserving state](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-01.png)

The Source engine's networking model uses a variant of the second approach. As for omp and Pi, neither one currently... follows any of them all the way through. Events exist, but state doesn't truly derive from those events, which violates the first principle of event sourcing: **state must be derivable from the events alone.**

<a id="what-omp-taught-us-two-authorities"></a>

### What omp taught us: two sources of authority

![Figure 2: One source of authority vs. two](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-02.png)

*One source of authority vs. two: in Source, everything is an entity delta, so replay(.dem) == the original state. Pi's log only covers the message tree, while authoritative state lives outside the tree—so rollback, forking, and recovery all lose their truthfulness.*

There were understandable reasons for ending up here. Storing the system prompt and `AGENTS.md` in every log entry is genuinely wasteful; but you can solve that by hashing the template and storing the variables. And TypeScript doesn't really have runtime types, so this style of state modeling isn't common in its ecosystem either.

But the result is still the same: two sources of truth in the system.

| Comparison | Source engine | Pi-style harness |
| --- | --- | --- |
| **Source of truth** | Only `entity list`. Server simulates, client predicts. | The message tree, **plus** todo state, retry counters, subagent registries, streaming flags, and other state invisible to persistence |
| **Unit of delta Δ** | `{ Δ entity ... }`; every delta is an entity delta, so it covers all fields | `message` / `custom` / `custom_message`; no engine-managed state reduction, each extension derives its own |
| **Global variables** | `CCSGameRules` is a singleton **entity**, no special handling needed | Split into three layers, only one of which is effective |
| **Plugin state** | Plugins write to entity fields, so state syncs over the network and replays by default | Module-level closures: `let turnCount = 0`, `new Map()`, `new Set()` |
| **Replay** | Load the `.dem`, seek to a tick, then re-derive | Load the `.jsonl`; the leaf pointer moves, but other authoritative state resets or persists arbitrarily |

The "global variables" row is the interesting one. Source has no session globals; they're just properties of some entity. Our globals have their own hierarchy:

![Figure 3: The three-layer structure of session globals](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-03.png)

*Session globals split into three layers, only one of which is effective.*

Source's correctness wasn't bought with carefully written coordinators or great documentation. It makes unreplayable state structurally *unrepresentable*. **Correctness comes from that constraint**, not from hoping every extension author remembers to register two hooks and define an update format.

<a id="the-evidence-correctness-is-optional-in-the-api"></a>

### The evidence: correctness is optional in this API

We examined 78 official Pi extension examples. 60 of them are stateless; of the 17 stateful ones, only two are correct.

> Translator's note: the counts above are kept as written in the original; "60 stateless + 17 stateful" doesn't add up to 78, and the original doesn't explain the discrepancy.

| Example | State detached from the source of authority | User-visible failure |
| --- | --- | --- |
| `git-checkpoint.ts` | Checkpoint references held in a temporary `Map` | `agent_settled` already cleared the checkpoint before `/fork` runs |
| `plan-mode/index.ts` | Restores plan mode from the whole file instead of the selected branch | Restrictions still apply after rollback; restoring can resurrect state from an abandoned branch |
| `status-line.ts` | Turn count kept in a closure | Rolling back from turn 3 to turn 1 makes the count 4; after restore it starts from zero |
| `dynamic-tools.ts` | Registry of running extensions | Tools still exist after rollback, but disappear after restoring the session |
| `snake.ts` | Scans abandoned branches on restore | Saves from abandoned branches reappear |
| `bookmark.ts` | "Last entry" determined by file order | A hidden assistant message on an abandoned branch gets bookmarked |
| `kimi-deferred-tools.ts` | Doesn't re-derive the enabled tool list | Rolling back to before `Calculator` was discovered leaves it still enabled |
| `auto-commit-on-exit.ts` | Shutdown conflates process exit with session switching | `/new`, `/resume`, or `/fork` commits the workspace |
| `tic-tac-toe.ts` | Live writes and restore reads use different entry types | A crash can make the user's move disappear |

See [Appendix A](#appendix-a-state-failures-in-the-official-examples) for details. The key point is that documentation can't fix this kind of pervasive bug. The engine needs to provide a single place for state to live.

![Figure 4: State loss in tic-tac-toe](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-04.png)

*In tic-tac-toe.ts, place an X, crash before O responds, then restore—and the X is gone. Live writes and restore reads use different entry types.*

[Original video](https://stencil.so/blog/harness-playbook/bugs/tic-tac-toe.mp4)

<a id="what-omp-changes-one-materialized-session"></a>

### What omp² changes: materializing the whole session as one thing

What if you materialized the entire session as **a single DOM**? You could of course also use an ECS system with serialization, or whatever other representation you prefer. I mainly chose XML because it makes state very easy to compose, inspect, and debug.

```
<meta>
   <todo>…</todo>          <!-- persistent components, journal-derived -->
   <jobs>…</jobs>
</meta>
<body>                     <!-- the live chain, entries as elements -->
   <user id="e12">…</user>
   <ai id="e13">…</ai>
   <Read id="e14" status="ok">
      <input path="src/main.rs:1-80"/>
      <result lines="80">…</result>
   </Read>
</body>
<queues>
   <steering>...</steering>
   <prompts>...</prompts>
</queues>
```

Its events are a stream of attribute changes:

```
: todo.done
event: patch@1
by: e41
data: {"ops":[["set",412,"status","completed"],["set",415,"status","in_progress"]]}
```

The tree is the source of authority, and the log stores deltas to the tree. Runtime objects can cache it or index it, but they can't become another place that holds the real state. At any point in the log, the harness can materialize the entire session, and therefore can snapshot it too.

<a id="what-one-authority-buys"></a>

### What a single source of authority buys you

When state and the session record live in the same tree, several hard problems collapse into the same operation.

**Rollback is a DOM diff.** Compare the current materialization against the target state. Did a `<subagent>` element disappear? Destroy the element, terminate it. Did one appear? Create the element, restore or start it. The delta itself is the complete lifecycle worklist.

> Adding a new stateful feature never requires adding another call site for rollback, forking, recovery, or duplication.

**Prompts become projections.** No more passing a 100-line state object into every template. The system prompt reads the same tree as everything else:

```
- {{ count(select("todo item[status!=completed]")) }} open items
```

**Replication becomes subscription.** We already have application state and a derivation mechanism. Remote clients consume the patch stream instead of tailing a file. Remote driver and spectator scenarios no longer need to each build their own state pipeline.

**Rendering becomes projection.** A component registry can render `Read`, `Bash`, messages, or subagents from the same element state. Streaming arguments modify `<input>`, streaming output modifies `<result>`. Chapter 7 develops this into typed interfaces instead of yet another bespoke renderer.

<a id="controller-and-actor"></a>

### Controller and actor

This separation also makes subagents inspectable. Pi's view reads live session state directly—the footer calls `sessionManager.getEntries()`—so adding an "inspect subagent" feature means threading controller state all the way through the UI internals.

The controller and the actor should be fully separated: the controller owns session state; the actor only renders its snapshots and patch stream. The TUI, remote clients, and the subagent inspector then stand on equal footing. Inspecting a subagent is just pointing the same actor at the subagent's state.

A real state model is the foundation. But if untrusted code controls the policy for mutating state, it can still be broken. The next chapter draws the runtime boundary.

<a id="the-runtime"></a>

## 03 Runtime

> Keep policy on the trusted host; put only a bandwidth-limited execution stub inside the sandbox.

The state chapter established what the harness recognizes. The runtime chapter decides who can change it, where untrusted work runs, and what "tool call" even means when execution can last for hours, stream continuously, or ignore polite stop requests.

<a id="the-sandbox-should-execute-not-decide"></a>

### The sandbox should execute, not decide

Start with the *Factorio* scenario from the design boundaries. Suppose we clone roboomp, have gpt spark replace every name with CodeWhatever, and start charging people thousands of dollars for this miracle technology. Who runs the tools? The VM, obviously. Well... is it?

Put the executor inside the VM and here's what happens:

![Figure 5: Putting the executor inside the VM](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-05.png)

Yeah, that doesn't work. Because:

- Programmatic tool use needs access to all tools, so you can't just split tools that manage harness state from tools that manage environment state.
- We'd have to build a bidirectional gateway so the VM can call host tools. Which means:
  1. Either you open the door to DoS, or you rate-limit certain actions from your own VM — defeating the whole point.
  2. Things get more complicated again. Forget it.

Fine, then put the driver app inside the VM too!

![Figure 6: Putting the driver app inside the VM as well](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-06.png)

- Now the app prompts and internal source code leak too. Unless you move the app back outside the VM, connect to the harness over network RPC, and move session storage out as well.
- But session storage being outside means you have to give the VM write access, and both previous problems come right back.

The fix: put only a small, obedient stub inside the VM, and be extremely careful about how much data it can send back — you don't want a single misused Read tool returning 2 GB:

![Figure 7: The boundary between host and execution stub](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-07.png)

These diagrams all point to the same boundary:

- The **host** owns session state, inference, policy, tool routing, approvals, limits, and logging.
- The **sandbox** handles in-environment execution through a small, obedient protocol.
- Every return stream must be bounded first, so the untrusted side can't exhaust host memory or context.

This arrangement satisfies Factorio without making local use worse. The same host can let the stub connect to a local process, a container, a VM, or a remote machine.

<a id="subagents-cross-the-same-boundary"></a>

### Subagents cross the same boundary

Deployment location isn't just a host-vs-VM distinction. At the filesystem level, subagents need the same boundary: a worktree only isolates version-controlled files; `pi-iso` gives each subagent a copy-on-write view of the entire workspace via APFS, btrfs, ZFS, overlayfs, ProjFS, or a fallback to copying. Subagents diverge on their own views, and the parent agent receives the diffs.

A subagent gets a view, returns changes, and never shares mutable authoritative state with the parent. That's the same host/sandbox rule expressed at the filesystem level.

<a id="what-omp-taught-us-one-call-three-disconnected-apis"></a>

### What omp taught us: one call, three disconnected APIs

But how exactly do you define a tool? We'll cover our initial changes later; the core contract stayed mostly the same:

```
export const myCustomTool: ToolDefinition = {
	name: "my_tool",
	parameters: mySchema,

	// 1. Called during argument streaming & before execute()
	renderCall(args, theme, context) {
		if (context.argsComplete) {
			// Trigger async preview computation
		}
		return new Text("Pre-execution preview UI...", 0, 0);
	},

	// 2. Main execution
	async execute(_id, params) {
		/* ... -> string */
	},

	// 3. Called after execute() settles
	renderResult(result, options, theme, context) {
		return new Text("Final execution result UI", 0, 0);
	},
};
```

The contract looks small and pleasant, but it splits a single operation into three unrelated phases. Preview, execution, the result for the model, the result for the human, diagnostics, streaming updates, cancellation, and logging all describe the same call. The API makes them pretend they have nothing to do with each other.

<a id="the-callback-split-duplicates-work"></a>

### Splitting the callbacks duplicates work

First, splitting the render path makes reactive updates something you have to opt into. Even when a tool's render output doesn't suddenly "jump" to a different shape, the author still has to duplicate a ton of display logic.

The bigger problem is how `execute` works. Take Edit:

- `renderCall` opens the file, hoping to cache the parts it read somewhere — where, exactly? — then applies the edit and renders the diff.
- `execute` opens the file again, applies all the modifications, writes the file back, and returns the diff in a format suited to the model.
- `renderResult` gets the diff and has to parse the arbitrary format we picked! Why? Because the human wants a colored, highlighted version, ideally with nice line numbers.

This intuitive implementation brings:

- Wasted I/O: the file is opened twice.
- Wasted CPU: the edit application isn't computed once or twice, but fully recomputed on every character change — `renderCall` is not a coroutine!
- Needless serialization/deserialization around an arbitrary format: to implement `renderResult`, you have to parse the output meant for the model, or stuff data into details and duplicate it in the logs.

To be more efficient, you'd have to drive a coroutine yourself outside this definition, find somewhere to store its handle, and you still can't avoid the result deserialization dance.

The problem isn't just code duplication. The contract lacks an authoritative object that carries state from "arguments streaming in" through "running" to "finished." Every implementation has to build its own side channel for this lifecycle.

<a id="what-omp-changes-execution-is-a-state-stream"></a>

### What omp² changes: execution is a state stream

> Tool execution is a bounded, cancellable state stream, not an async function that returns text.

There's also no general way to add structured warnings, diagnostics, or truncation notices. Most Pi tool implementations end up writing something like this:

```
text += `\n${theme.fg("warning", `[Truncated: ${truncation.outputLines} lines shown (${formatSize(truncation.maxBytes ?? DEFAULT_MAX_BYTES)} limit)]`)}`;
```

The model can only guess where the tool data ends and the harness's explanation begins. And since `execute` isn't a generator, streaming output requires yet another protocol layered on top of the update channel.

The DOM model eliminates both special cases:

- Streaming output modifies the contents of `<result>`.
- Adding a warning creates a `<diag severity="warn">`.

During execution, clients receive patches to this state; after execution ends, the final diff against the previous state is written to the log.

In the unified session model, a call is an element with structured children:

```
<Edit id="e41" status="running" version="3">
   <input i="Update the parser without changing the public API">…</input>
   <result>…streaming structured state…</result>
   <diag severity="warn">…</diag>
   <usage tokens="0" elapsed-ms="842"/>
</Edit>
```

The executor mutates this element while it runs. The model, the user, the logs, remote clients, and the test framework all observe different projections of the same state. When execution ends, the final diff is frozen; clients no longer have to parse a result string to recover the richer object that existed before serialization.

<a id="limits-are-part-of-the-primitive"></a>

### Limits are part of the primitive

Pi tools have no limits: return 1 MB of text and it goes straight to the model. Exposing such a low-level primitive directly isn't appropriate.

<a id="bound-output-once"></a>

#### Bound output in one place

Pi ran into this itself with `Bash` and `Read`, so it exports a truncation helper for implementations to share. omp builds on that with an artifact system, letting the model read back the full retained output, but like Pi it still leaves the responsibility to each implementation.

Sending 1 MB to the model may be worth keeping, but it should be truncated by default, allow opting out via an explicit `notrunc` attribute, and be implemented in one central place — rather than treating truncation as good design you have to opt into. Making the helper optional fails in both directions.

Most tools need some form of truncation, so an optional helper inevitably leads to uneven coverage:

- Authors who don't know it exists write their own, each with slightly different messages.
- Authors who never imagined huge results write nothing at all.

Truncating inside the tool implementation rather than at the conversation rendering layer also breaks Code mode:

- The agent can't rely directly on tool output inside `Eval`; it has to strip harness notices from the data before every use.
- The result of `Eval` itself can also be truncated, so a single call stacks N+1 independent truncation layers on top of the same data.

<a id="bound-blocking-time-once"></a>

#### Bound blocking time in one place

Moving *any work* to the background, and limiting how long a call can block, are also library-level responsibilities — not something every occasionally slow tool should handle on its own.

The first reason is caching and UX. Otherwise, an unexpectedly slow call leaves the agent unable to notice and adapt; the user comes back to a stuck session; autonomous jobs wait forever; and the provider's KV cache expires before the call even returns.

The second reason is duplicated effort, and omp made the same mistake. Once each tool has its own background execution mechanism, it comes with its own spawn, poll, message, kill, and list helpers. Look at this diagram Claude drew around its own `Task` and `Bash` tools:

![Figure 8: Task and Bash ultimately converge on the same job interface](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-08.png)

Both ultimately converge on a process interface: `signal` + `stream in` + `stream out`. Background shells, subagents, dev server daemons, remote functions, and ordinary calls that exceed their time budget are all essentially the same object: a job with stdin, stdout, exit status, and a signal handle. They should be wrapped in a single stdio-shaped job primitive.

That way, the blocking budget is enforced in one place, overflow output lands in a unified artifact path, and inspecting, messaging, or killing any job uses the same interface instead of being reimplemented per tool.

The same expectation applies to observability. A user who wants to see subagent status also wants to see background shells. An agent that messages peers across harness instances also wants to see the daemons those peers are running, so that N agents in the same directory can share one HMR-enabled `bun dev` instead of starting N copies on N ports.

<a id="cancellation-requires-a-kill-boundary"></a>

### Cancellation requires a boundary you can actually kill

Letting extensions—and therefore custom tools—share a JavaScript isolate with the engine is a disaster. Proper hot reload becomes nearly impossible, and once a tool call escapes cooperative cancellation, it cannot be forcibly stopped.

JavaScript and Go provide cancellation through `AbortSignal` and `context.Context` respectively. These protocols are useful, but they carry no enforcement power. Forgetting to pass the signal, calling a dependency that doesn't accept one, doing synchronous work, or entering an infinite retry loop all reduce a timeout to "telling the agent it may move on"—while the work itself may still be consuming resources in the background.

A safe host therefore needs an execution unit it can genuinely terminate: a process, a worker, a subinterpreter, a VM request, or an equivalent boundary. When that unit is killed, it must not take the session's authoritative state down with it. Cancellation is a runtime contract; it cannot depend on every tool author cooperating out of goodwill.

<a id="make-the-mandatory-boundary-pleasant"></a>

### Make the mandatory boundary pleasant to use

A deliberately simple sandbox stub also raises one last SDK problem: extension authors now face two filesystems. A custom edit function may have to read a file on one side, transfer it whole, and write it back on the other.

This is why omp² chose Python for writing extensions. Python can inspect its own AST through the standard library, package the source code a given function needs, and hand it off to another runtime; a single `@remote` decorator turns a function that looks like a local call into an RPC. Remote functions in systems like the Modal Python SDK feel natural for the same reason.

Bundling a Python runtime also makes `Eval` reliable, rather than leaving it to chance which interpreter happens to be installed on the machine. Two birds with one stone.

With a trusted work owner and a cancellable execution primitive in place, the harness still needs a coherent way to control configuration values and cross-turn behavior. That is the control plane.

<a id="the-control-plane"></a>

## 04 Control plane

The runtime juggles two different kinds of control. **Values** answer which model, service tier, theme, or policy is currently active; **behaviors** answer whether an agent may hand back control, whether it must run another turn, or whether it temporarily needs some capability. Both fall apart when every caller owns a private setter or flag.

<a id="values-declare-policy-with-the-setting"></a>

### Values: declare policy alongside the setting

> Scope, persistence, inheritance, and replication all belong in the setting's declaration, not scattered across setter call sites.

The config system becomes a minefield too: dirty-state tracking, plus global, session-level, and ephemeral layers all mixed together. As with Pi, most get/set operations go through the `AgentSession` type, because changes have to persist to JSONL.

You know which config system solved all of this years ago? That's right — the Source engine!

In particular, most people who've played a Valve game can tell you off the top of their head what `sv_cheats` does. People have been customizing configs for years, and I can't recall a single user complaining about it. What do you actually remember about other software's config?

A [convar](https://developer.valvesoftware.com/wiki/ConVar) is a typed variable with a name, a default value, help text, and a set of **flags** encoded as a bitfield — all declared once, at the definition site:

```
ConVar sv_gravity("sv_gravity", "800", FCVAR_REPLICATED | FCVAR_NOTIFY, "World gravity.");
```

Persistence, ownership, scope, replication, even replay fidelity — they're all **properties of the variable itself**, written down where the variable is born. No routing `set` through a god object, no hand-rolled dirty-state tracking.

![Figure 9: convar authoritative storage and client mirrors](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-09.png)

*The server holds a single authoritative store and mirrors it to every client. REPLICATED pushes values down, USERINFO sends client-owned variables up, CHEAT gates variables behind sv_cheats, and ARCHIVE decides what gets written to config.cfg; every change is recorded to the .dem.*

A convar isn't a second config database sitting next to the session DOM. A session-scoped convar is just another logged node in the authoritative tree; its flags declare how it participates in restore, rollback, derivation, replication, and archiving.

<a id="inheritance-should-not-require-a-second-setting"></a>

### Inheritance shouldn't need a second setting

Today in omp, the service tier — that's `/fast` — has a separate setting just for subagents.

```
tier:
  openai: priority
  subagent: inherit   # separate setting
```

In the convar world, `ai_fastmode` is just *one* variable with the `SESSION` flag: it's logged with the session, so restoring the session restores it. Inheritance needs no flag at all: a newly spawned child agent initializes *every* variable from the parent's live value by default, with nothing to opt into.

Want to pin a child agent's value? One line:

```
# subagent.cfg — auto-exec'd for every spawn
ai_fastmode 0

# sonic.cfg — auto-exec'd when a sonic spawns, class config
ai_model @smol
ai_thinking low
```

The main session uses `config.cfg`, any number of user cfgs can serve as profiles; every spawn auto-execs `subagent.cfg`, then layers `<agent>.cfg` on top. That also kills the god object with a thousand properties. TF2 figured this out ages ago!

Now a single value describes the main session and its children. Inheritance rules live at the value's definition, instead of becoming yet another property on an ever-growing session god object.

<a id="profiles-and-keybindings-stay-in-band"></a>

### Profiles and keybindings stay in-band

With cfg files, keybindings follow naturally. `bind`, `toggle`, and `alias` are console commands too, so the input patterns we keep inventing schemas for can stay in the same mechanism. A user wants a hotkey to hide the thinking stream?

```
bind ctrl+t "cl_showthinking 0"        # careful — one-way; the second press still writes 0
bind ctrl+t "toggle cl_showthinking"   # there we go; toggle also cycles value lists

alias +thinkhud "cl_showthinking 1"         # fires on key-down...
alias -thinkhud "cl_showthinking 0"         # ...and on key-up
bind ctrl+h +thinkhud                       # hold to peek at the thinking stream
```

That's what our hotkey layer should look like, instead of yet another bespoke schema with its own table of defaults!

The command stream ties it all together: cfg files, console input, aliases, keybindings, remote administration, and log replay all speak the same language around the same set of declared variables. Customization stops spawning one-off schema after one-off schema.

<a id="behaviors-the-loop-shaped-hole"></a>

### Behaviors: the loop-shaped hole

> Any behavior that persistently controls flow across turns belongs in the same composable, agent-owned Director primitive.

Extensibility is another topic worth caring about. I actually think Pi has a great extension layer, but there is a genuine loop-shaped hole in it.

I installed the most popular Plan and Goal implementations for Pi. Try enabling both at once and you get:

![Figure 10: Another workflow is already active, cannot start plan mode](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-10.png)

Okay! That's interesting, but Pi has no "workflow" API. So how did they do it? The implementer defined one:

```
export const WORKFLOW_MUTEX_CHANNEL = "workflow:mutex:v1";
export const AGENT_WORKFLOW_GROUP = "agent-workflow";

export class WorkflowMutex {
  private session: object | undefined;
  private readonly heldGroups = new Map<string, WorkflowMutexOwner>();
  private generation = 0;
  private readonly pi: Pick<ExtensionAPI, "events">;

  constructor(pi: Pick<ExtensionAPI, "events">) {
    this.pi = pi;
    pi.events.on(WORKFLOW_MUTEX_CHANNEL, (payload) => {
      this.answer(payload);
    });
  }
```

Of course! Both implementations come from the same author. He hit this problem and built a workaround that functions between his own plugins.

Encapsulating that kind of behavioral complexity is pushed onto plugin authors, and they can only build systems that work among their own extensions.

omp has a similar problem:

```
// modes/interactive-mode.ts — the exclusivity "system", in its entirety
if (this.goalModeEnabled || this.goalModePaused) { this.showWarning("Exit goal mode first."); return; }
if (this.vibeModeEnabled)                        { this.showWarning("Exit vibe mode first."); return; }
// …restated by hand at six other entry points
```

The missing abstraction only becomes visible once independently written behaviors collide. A private mutex keeps one author's Plan and Goal plugins from conflicting, but it can't make arbitrary extensions compose. omp's hand-written mode checks have the same limitation.

Two decisions follow: name the primitive that owns the loop the **Director**, and move more built-in behaviors onto the public extension interface, so the gap in that interface can no longer be ignored.

<a id="directors-own-candidate-yields"></a>

### Directors own candidate yields

The agent has one loop, and more and more things want to steer it: plan wants to keep going until a plan exists; goal wants to keep going until the objective is done; `/force` wants to modify the next inference; the todo reminder wants one last chance to object before control is handed back.

So provide an object at the **agent layer** that owns that decision: the Director stack.

"Stack" here means a live subtree in the session DOM, not a Python array that promises to serialize later. The DOM is the source of truth; the runtime just walks it.

```
candidate yield flows this way ────────────────────────────────┐
                                                               ▼
Base  →  TodoReminder  →  Goal  →  Plan  →  ForceTool(write)
                                                parent    child/top
```

The loop stays refreshingly plain:

```
while True:
    request = directors.prepare_inference(base_request)  # outside → inside
    turn = await inference(request)
    await execute_tools(turn)

    if turn.has_tool_calls:
        continue

    decision = await directors.on_yield(turn)            # inside → outside
    match decision:
        case Continue(): continue
        case Yield():    return
```

`prepare_inference` walks the stack from the outside in, letting the innermost behavior further adjust the request the parent layer is about to send; `on_yield` walks in the opposite direction, from the inside out. Each Director can:

- **Pass**: let the next Director inspect this candidate yield.
- **Continue**: consume this yield request and run another turn.
- **Yield**: consume the request and actually hand control back to the user.
- **Push**: push a child Director on top of itself.
- **Done**: pop itself, then hand the same candidate yield to the parent layer.
- **Fail**: exit the stack with an error.

So rollback removes Directors, recovery re-establishes them, and a remote inspector can see which behavior currently owns the candidate yield.

<a id="plan-mode-completely"></a>

### Implementing plan mode in full

Suppose plan mode is enabled, but the model tries to hand back control before it has written the plan file. Plan sees this candidate yield before any outer behavior does:

```
class Plan(Director):
    async def on_yield(self, agent, turn):
        if not turn.wrote(self.plan_file):
            return agent.force_tool(
                "write",
                until=lambda turn: turn.wrote(self.plan_file),
                reminder="Write the plan file before yielding.",
                retries=3,
            )

        if not turn.called("ask") and not turn.proposed_plan():
            return agent.force_tool(
                "required",
                until=lambda turn: turn.called("ask") or turn.proposed_plan(),
                reminder="Propose the plan, or ask the user what is missing.",
                retries=3,
            )

        return Yield()
```

In soft mode, `force_tool("write")` pushes a small built-in Director that adds this capability requirement to the next inference request:

```
class ForceTool(Director):
    def prepare_inference(self, request):
        return request.with_tool_choice(self.tool)

    async def on_yield(self, agent, turn):
        if self.until(turn):
            return Done()                    # pop; offer the yield back to Plan
        if self.retries_left:
            return Continue(self.reminder)
        return Fail("tool requirement exhausted")
```

Below Plan, the stack already has another Director:

```
Base → TodoReminder → Plan
```

The candidate yield reaches Plan first. As long as Plan is still working, it will continue, push a child layer, or hand back to the user directly. It never returns `Pass`, so the outer TodoReminder never sees this yield.

Extensions use exactly the same interface:

```
await agent.direct(VerifyBeforeYield(...))
```

```
<directors>
  <todo-reminder id="d1">
    <plan id="d2" plan-file="local://auth-plan.md">
      <force-tool id="d3" tool="write" attempts="1" max-attempts="3"/>
    </plan>
  </todo-reminder>
</directors>
```

This is a full composition mechanism, not yet another special mode. Plan owns the yield, temporarily pushes ForceTool, and once the child layer finishes, the same candidate yield returns to Plan, which then decides whether to keep going or hand back to the user.

<a id="hooks-directors-and-inference"></a>

### Hooks, Directors, and inference

- A **hook** observes or edits a single inference or a single turn.
- A **Director** can hold onto the flow across turns and intercept control handbacks.
- Directors can stack, nest, complete, and restore the parent layer in meaningful ways.

That's already enough for plan, goal, vibe, autoresearch, reminders, and external verification behaviors to share the same agent-layer primitive, without each of them having to understand the others' private flags.

`ForceTool` expresses a semantic requirement: "the next successful turn must call `write`." It doesn't know whether the selected provider has a native `tool_choice`, whether a forced call breaks the cache, or whether a local model needs an extra hint. Those translations belong to the inference layer.

The control plane can now express "what should happen." The next chapter makes that requirement mean the same thing across incompatible models and providers.

<a id="the-inference"></a>

## 05 Inference

> Model compatibility should be structured knowledge with explicit priorities, not provider-name branches scattered across the code.

The control plane states semantic requirements: stream this model, force that capability, constrain this structure, count these tokens. The inference layer has to translate those requests into "what this specific model, on this specific host, through this specific API, can actually do."

<a id="what-omp-taught-us-quirks-become-architecture"></a>

### What omp taught us: quirks grow into architecture

This one is easy to illustrate, because omp v1 already has a commit you can compare before and after.

Before `dd57045396`, the OpenAI-compatible logic lived in a single 880-line file built around one giant builder. Open the file and you're greeted with:

```
const isCerebras = modelMatchesHost(hostModel, "cerebras");
const isZai = modelMatchesHost(hostModel, "zai");
const isKimiModel = isKimiModelId(spec.id);
const isMoonshotKimi = isKimiModel && isMoonshotNative;
const isAnthropicModel =
    modelMatchesHost(hostModel, "anthropic") ||
    isClaudeModelId(spec.id) ||
    isAnthropicNamespacedModelId(spec.id);
// …then DeepSeek, Qwen, MiMo, Grok, Mistral, OpenCode, local servers
```

Those booleans fed into more booleans, several layers of nested ternaries, and eventually one enormous `compat` object. Does Kimi allow forced tool calls while thinking? Depends which Kimi, which host, which API. Does this loopback address mean llama.cpp, or LiteLLM proxying something else? Better add another special case.

Any single branch looks fine on its own! Each one fixed a real provider bug. The problem is that the same knowledge ended up encoded in multiple places:

- `compat/openai.ts`: 880 lines.
- `model-thinking.ts`: 977 lines.
- `variant-collapse.ts`: 1,776 lines.
- Separate Bedrock, Anthropic, and Devin compatibility builders.
- More name detection in discovery logic and provider serializers.

What replaced them?

```
taxonomy/   "what model is this string?"
classes/    "what is true of this model lineage?"
providers/  "what does this host change?"
```

So Anthropic thinking now reads like this:

```
class "anthropic" {
    on "anthropic" "amazon-bedrock" "google-vertex" {
        family "sonnet" {
            revision ">=3.7 <4.6" { thinking-mode "budget" }
        }
        revision ">=4.7" {
            thinking-mode "anthropic-adaptive"
        }
    }
}
```

That's the knowledge we actually meant to express! Sonnet versions before 4.6 use budget-based thinking; Anthropic 4.7 and later use adaptive thinking; and those rules only hold on verified hosts.

There's no magic in KDL itself. What kept us from rebuilding the mess in a prettier format was the compiler:

- Unknown directive or unknown value? Error.
- Two equally specific rules setting the same thing? Error — file order doesn't get to silently decide the winner.
- No matching rule? The result is unknown, not "false."

Did that make providers less quirky? Of course not. We still have compatibility dimensions like `requires-mistral-tool-ids`, `qwen-preserve-thinking`, `strip-deepseek-special-tokens`, plus ten different ways to say "disable reasoning." Look at those names and weep.

What it actually saves us is adding one more branch to four different functions just to express the next quirk. Now you write one rule in the place that owns the fact, and the compiler yells at you when the priority is ambiguous. The inference layer can finally answer: *what does this specific model on this specific host actually support?*

The win isn't fewer quirks — it's that each fact has exactly one owner, an explicit priority, and an `unknown` state for when the library hasn't figured out the answer yet. The rest of the harness no longer has to re-guess model identity from provider-name branches.

<a id="a-provider-is-more-than-stream"></a>

### A provider is more than `stream`

When I built the web search plugin for Pi, this nearly bit me immediately. In fact, the same pressure hit the repo's original minimal design too — just look at Pi's new [image model implementation](https://github.com/earendil-works/pi/blob/main/packages/ai/src/image-models.ts).

Pi basically modeled a provider as just `stream` and `streamSimple`! That's fine for quickly wiring up a provider, but it doesn't hold up as you keep piling capabilities on top, because:

- What about Anthropic's token counting endpoint?
- What about Codex's WebRTC voice endpoint and remote compaction?
- What about Anthropic/OpenAI web search?
- What about embeddings?
- What about image/video generation?
- What about tokenization?
- What about usage queries?
- What about model discovery?

Do you trust every extension that provides one of these to correctly implement synchronized OAuth refresh and retries?

Beyond that, having access to a provider's latest control capabilities is genuinely valuable, for example:

- Constrained sampling.
- OpenAI's text verbosity option.
- Google's context filtering options.
- Forced tool calls.
- The Developer role.
- Mid-conversation system prompts.
- …

Auth refresh, retries, token counting, search, generation, discovery, and provider-native controls are all shared infrastructure. Leave them to extensions and you just get multiple half-broken implementations of the same protocol.

<a id="capability-policy-forced-tool-calls"></a>

### Capability policy: forced tool calls

Forced tool calls show why "support a flag" is nowhere near enough:

- **Error out on unsupported providers**: if a native harness feature uses it, you exclude a huge swath of models.
- **Silently drop it**: callers get best-effort behavior without knowing, and have to invent their own enforcement loop.
- **Pass it through blindly**: provider side effects become product bugs. For example, Anthropic may let a forced call cause a cache miss for the entire conversation.
- **Just don't expose it**: knowledgeable callers patch around the library and redo all three failures above.

An ideal harness implementation should:

1. **Always inject a soft prompt** telling the model it must call that tool on the next turn. This is worth doing unconditionally: hosted APIs like OpenAI quietly prepend such reminders for you, but open-source inference engines don't. So a model behind vLLM faces a hard constraint it was never told about, and once reasoning is enabled it easily gets confused. The soft prompt closes that gap.
2. **Only set the native flag when it costs nothing extra.** If the provider supports forced tool calls with no side effects, pass it through; if there's a penalty, skip the native flag and rely on the soft prompt alone.
3. **Escalate when the requirement isn't met.** If the model doesn't call the tool, retry a bounded number of times; as a last resort, set the native flag even if it costs something. Once persuasion fails, correctness beats caching.

![Figure 11: Escalation strategy for forced tool calls](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-11.png)

*Forced calls start with a soft prompt; the native flag is only enabled when the provider supports it without side effects. If the model still won't call the tool, escalate through bounded retries to setting the flag even at a cost, and finally report failure to the caller.*

This is the provider-side implementation of the Director from the previous chapter. `ForceTool` declares the invariant; the inference layer picks the cheapest way to actually satisfy it, and escalates when the model disobeys.

<a id="tool-schemas-are-model-facing-protocols"></a>

### Tool schemas are model-facing protocols

A tool's `parameters` field strictly defines the argument structure. That's ideal for a human-facing API, but models aren't generic API clients. Their mistakes are often tied to tool names and the harnesses they saw during training.

An agent heavily optimized by RL may call a familiar tool with another harness's schema. Composer models sometimes emit `Grep` in the structure they expect, even when there's no `Grep` tool at all. Codex sees `paths: string[]` and, depending on its mood that day, sends a `;`- or `,`-separated string instead.

So the library should both validate **and** correct. Be strict about a tool's semantic contract, and tolerant of the model's dialect: when the mapping is unambiguous, repair `paths: "a,b"` into a list; otherwise return a structured, retryable error. A raw JSON Schema validator can't carry that layer on its own.

<a id="strict-sampling-needs-budgets-and-dialects"></a>

### Strict sampling needs budgets and dialect management

Constrained sampling was one of the first features we added to Pi:

```
+   strict?: boolean;
+   customFormat?: { syntax: "lark" | "regex"; definition: string };
+   customWireName?: string;
```

A few months later, Pi added LARK and strict support too, but exposed them as opaque structures passed straight through to the provider layer. Two system-level constraints make that insufficient:

1. **Strict schema capacity is a shared budget.** Many providers cap the number of strict schemas. Independently developed extensions can install enough of them that the provider rejects every request. Users shouldn't have to bisect and edit plugins just to get the harness working again.
2. **Grammar dialects vary by provider.** Passing a LARK grammar to every provider can itself be illegal. Extensions also can't maintain the compatibility mapping, because users may reach the same model through a native host, a proxy, or a custom provider.

So the implementation that looks "complex" belongs in the inference layer:

![Figure 12: The full machinery needed to actually deliver strict](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-12.png)

*Actually delivering strict requires provider capabilities, a prioritized strict-schema budget, per-dialect normalization, and a client-side repair path; an opaque pass-through structure provides none of these.*

Extensions declare intent: strictness, grammar, priority. The inference layer handles capabilities, budgets, dialect normalization, fallback, repair, and the final wire format.

<a id="corrective-inference"></a>

### Corrective inference

An inference library also needs to:

1. Repair malformed JSON.
2. Detect repetition loops in models like Gemini and DeepSeek.
3. Parse each model's output dialect and produce canonical `tool_call` and `think` blocks when structured output leaks into text.

![Figure 13: A leaked tool call rendered as plain text](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-13.png)

*Because this dialect wasn't parsed into a tool_call block, the leaked tool call got rendered as ordinary text.*

For more on the tool-calling side, you can read my [previous article](https://blog.can.ac/2026/08/03/the-minutiae-of-tool-calling/). Supporting a given provider or model means more than wiring up a URL — you also have to handle its own quirks.

Being able to open a stream doesn't mean the provider adapter is done. Even when bad JSON, duplicates, reasoning leaks, or model-specific tool-call dialects show up, the rest of the harness still needs to receive a canonical turn. Only then is it finished.

<a id="compaction-is-scheduled-not-triggered"></a>

### Context compaction should be scheduled ahead of time, not triggered at the limit

> Before hitting the limit, start generating a summary from a log snapshot; when the limit is reached, commit the summary only if that snapshot still corresponds to the current branch.

The most naive design here also produces the worst user experience: right when the user is deepest in their work, they have to wait on the single largest request in the entire session.

Beyond approaches like **[Snapcompact](https://stencil.so/blog/snapcompact)**, there's still plenty of room for improvement here.

![Figure 14: Compaction only starts after the limit is hit](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-14.png)

*Even frontier labs ship this naive design.*

A better approach is to speculatively kick off compaction when you're about 10% away from the limit. In practice, that means splitting the conversation into two parallel versions: one where the user and model keep working, and another where the model compacts the conversation.

![Figure 15: The trigger point for speculative compaction](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-15.png)

*See that layer icon indicating when speculative compaction fires?*

Once the result comes back, splice it into the other branch. This also preserves momentum: instead of facing a lone handoff message and getting lost, the model can see the follow-up progress it was *supposed* to make anyway.

Beyond prompts, you can also consider:

- **Remote compaction**: done server-side by the provider. The OpenAI API returns an opaque state block, but because it has access to the decrypted thinking content, it can significantly reduce context loss.
- **Handoff**: instead of asking for a summary, try having the model "hand off" the work.
- **Shake**: done entirely locally, simply trimming the bulky tool results out of the history.

This is also something to keep in mind when designing your UI-rendering and request-rendering abstractions. When users look at the history, they want all messages to remain as they were; but for the model, some of those messages no longer exist. So when constructing a request, you should model each entry in the prompt history as a reduction: `fn(this, req) -> req`, and handle it in the `<Handoff>` implementation.

<a id="use-small-local-models-for-harness-work"></a>

### Use small local models for harness-internal work

Tiny local models are incredibly useful! Even if you only use frontier models for real work, I'd recommend embedding some kind of `tiny` model — take a look at LiquidAI's models in particular. Classification, plus small tasks like generating titles, translation, and judging user satisfaction with the conversation's progress, can save you a ton of latency and cost. Another use is, of course, TTS/STT, which now reaches state-of-the-art quality locally too.

This isn't a second "agent" — it's a low-cost internal capability for small tasks that shouldn't have to pay frontier-model latency and prices.

Once compatibility and fixes are centralized, the resident tool interface can stay lean. The next chapter discusses what deserves a schema in every request, and what clearly doesn't.

<a id="the-tool-surface"></a>

## 06 Tool interfaces

> Every resident tool costs you on every turn; keep the tool list lean and let primitives carry the deep responsibilities.

The runtime chapter defined how work executes; the reasoning chapter defined how schemas adapt to models and providers. Now we can finally ask a product question: which operations deserve a permanent place in the model's grammar?

<a id="every-schema-has-a-tax"></a>

### Every schema has a cost

The best way to present most tools to the model is to **not put them in the resident tool list at all**.

A while back, someone complained that omp was slower than codex on the same task — not in token count, but in wall-clock time. I assumed there was nothing to it, but it turned out to be real, and nearly twice as slow!

![Figure 16: The impact of the tool list on wall-clock time](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-16.png)

*Median wall-clock time (thick bars, seconds) and request prefix (thin bars, thousands of tokens) across variants. The task is SOL, each variant runs 6 times with a fresh session each time; cyan represents omp variants, gray represents external references, and the annotated values are changes relative to the row above.*

The culprit was the tool list. After limiting it to five essential tools, the time dropped to `36.6s`, faster than Codex's `42.2s` and Pi's `37.0s`. Why? Tool grammar! To the model, even though it looks like plain text descriptions, on most frontier model providers it actively participates in token generation: beyond the tokens the descriptions themselves consume, it also influences the generation process, pushing the model to always produce valid JSON.

Don't fall into the trap of thinking that adding a tool is a free win "just in case the model needs it." Dynamic tool discovery is built on exactly this insight. But dynamic approaches invalidate the cache whenever the tool list changes, so we're not particularly fond of them.

Pi got one thing right, and we've always agreed: MCP is a terrible design and doesn't belong in the resident tool layer. So how do we satisfy both the user demand for Figma MCP and the reasoning constraints?

Dynamic tool discovery avoids the resident grammar overhead, but invalidates the cache every time the list changes. A better goal: a stable, tiny grammar paired with long-tail capabilities reachable through ordinary composition.

<a id="put-the-long-tail-behind-stable-surfaces"></a>

### Put the long tail behind stable surfaces

Meet the `dyn` CLI! Of course, it's not really a CLI — it's a built-in command exposed by our Bash implementation. It gives the model a stable discovery protocol that's easy to use through Bash and can also be called as a Python function inside `Eval`.

```
dyn
dyn --q github
dyn github/list_prs --state open | jq '.[] | .title'
cat query.sql | dyn database/query - --params limit=5
dyn image_gen "blueprint of a frog" > result.json
```

Once you find a tool you're interested in, use `--help` for details, just like tool search:

```
$ dyn github/create_pr --help
dyn github/create_pr <title> [OPTIONS]

Arguments:
  <title>

Options:
  -d, --draft / --no-draft
  -r, --reviewers <TEXT>[,…]  (repeatable)
  -p, --pr-meta.priority <INTEGER>
  -m, --pr-meta.notify / --no-pr-meta.notify
  -j, --json <JSON>
  -h, --help
```

These are of course synthesized from JSON schemas; the schema alone is enough to generate a decent CLI mapping.

This is especially pleasant when the input is large:

```
dyn database/query "SELECT 1"       # literal
dyn database/query @query.sql       # file contents
cat query.sql | dyn database/query - # stdin
```

There's also an edge case: what about tools that return images? How does omp show you an image? Sixel or the Kitty protocol, right? So why not parse the same output in the `Bash` tool and attach the image! This even supports viewing remote images over ssh. Nice.

If all operations belong to the same API, there's a second option: expose a code interface. Browser keeps `open` / `run` / `close`, running code on persistent tabs; Computer exposes `desktop`, `wait`, and `assert` in a persistent session. One stable schema, composing operations within a single call. **Bounded operation sets get schemas; open operation sets get code interfaces.**

These two forms serve different shapes of API. A finite operation set can stay as a schema; an open operation set is better served by a code or command interface that composes multiple operations within a single call. Neither requires changing the resident tool list after discovering capabilities.

<a id="contract-hygiene-intent-and-version"></a>

### Basic contract hygiene: intent and version

One small change to contracts deserves its own mention: every tool has an `i` intent parameter. It arrives as soon as arguments stream in, so `renderCall` can show what the model thinks it's doing before the call completes. Logs also get readable summaries without having to invent a `reason` / `purpose` for every tool.

You should **version your tools**.

This makes traces far more useful: for tools that change frequently, you can parse their inputs and outputs and track success rates over time without guessing which version of the contract each call used.

Name, version, intent, input, output, diagnostics, and usage are all protocol data. Once traces are used for evaluation or repair, guessing any of them becomes avoidable technical debt.

<a id="deep-builtins"></a>

### Deep built-ins

A lean tool list only works if the breadth of the primitives has a semantic justification, rather than cramming unrelated features into a switch statement. omp's built-in tools are a good example.

<a id="read-materialize-a-resource"></a>

#### Read: materialize a resource into a usable representation

The most boring tool in `omp` actually packs in capabilities that other systems might split into 20 tools.

- It can read directories, so no `Ls` needed.
- No need for a separate `ReadNotebook`; reading a `.ipynb` file gives you cleaned-up output by default.
- `.pdf`, `.docx`, `.pptx`, `.xlsx`, `.epub`? Returns extracted Markdown.
- `.cpuprofil, .sample.txt`? You guessed it, returns a bottleneck summary.
- `.sqlite`, `.sqlite3`, `.db`, `.db3`? You can list tables, inspect the schema and rows, even query.
- Images return the image; without vision capability, returns metadata. Preview SVG with `:img`.
- Address contents inside archives without unpacking, supporting not just ZIP and TAR but also JAR, wheel, and ASAR.
- The same projection applies to `http://...` online resources, reading ranges on demand; ordinary web pages are converted to Markdown, just like `web_fetch`.

This isn't polymorphism for show. From the model's perspective, they're all the same operation:

> Materialize this resource into the representation that best helps me reason.

For code, it can also return a structural summary, replacing large declaration bodies with ellipses. The model doesn't have to drag an entire large file into context just to find class `X`.

When you need raw bytes, `:raw` bypasses the projection. `:conflicts` makes each unresolved merge conflict block take up just one line, so the model doesn't have to hunt through the whole file.

Ranges can be open-ended, length-based, or non-contiguous:

```
:50
:50-
:50-200
:50+150
:5-16,960-973
:raw:50-100
:50-100:raw
```

There are also non-web URLs:

```
artifact://<id>
agent://<id>
history://<id>
issue://123
pr://123/diff/2
skill://react
rule://foo
memory://...
local://...
vault://...
security://...
omp://...
xd://browser
ssh://host/path
mcp://...
```

Repo info, MCP resources, subagent session records, skills, memory, local scratch space, omp docs, even remote machines over SSH — all fit into the same internal URL subsystem. We recommend this design.

`Read` also handles some less visible fault tolerance: repairing wrong absolute paths based on unique workspace suffixes, expanding `~` on Windows, and avoiding other path errors that waste turns for nothing.

Couldn't it just be this:

```
return await Bun.file(path).text();
```

Sure. And then extension authors write their own readers, or the model hunts for shell alternatives, while the harness exposes similar-shaped capabilities under different names like `web_fetch`.

That doesn't reduce complexity. The same complexity just gets copied into shell commands, prompts, extensions, and failed tool calls, with no one owning it and everyone implementing 30% of it in slightly different ways.

`Read` is complex so that reading isn't.

Complexity has exactly one owner. Operations stay stable, and resource-specific projections live behind them.

<a id="bash-a-policy-aware-command-language"></a>

#### Bash: a policy-aware command language

The Bash tool shouldn't just shell out to Bash. That sounds crazy.

omp ships a full bash parser, interpreter, and a complete set of coreutils in-process. It's a good choice for a simple reason:

- It preserves the model's muscle memory. It can keep using `grep`; because the interpreter is omp, we can intercept the command and route suitable arguments to our own ripgrep engine. No more burning context in `AGENTS.md` begging the model to use `rg`.
- Platform independence comes almost for free. No WSL or Git Bash needed: omp can execute most Bash calls in-process on Windows. Enough said.
- The console preserves state across calls, including variables, exit codes, `$!`, and so on.

The more interesting advantage shows up when Claude sends a call like this:

```
INC="…/10.0.22621.0"; declare -A R
for d in um shared ucrt; do while IFS= read -r f; do b="${f##*/}"; R["${b,,}"]="$f"; done \
  < <(find "$INC/$d" -maxdepth 1 -type f -name "*.[hH]"); done
n=0
while IFS= read -r ref; do case "$ref" in */*) continue;; esac; r="${R[${ref,,}]:-}"; \
  [ -n "$r" ] || continue; rd="${r%/*}"; rn="${r##*/}"; \
  if [ "$ref" != "$rn" ] && [ ! -e "$rd/$ref" ]; then ln -s "$rn" "$rd/$ref"; n=$((n+1)); fi; \
done < <(grep -rhoiE "#[[:space:]]*include[[:space:]]*<[^>]+>" "$INC/um" "$INC/shared" "$INC/ucrt" \
  | sed -E "s/.*<([^>]+)>.*/\1/" | sort -u)
```

Can you tell me what it does in 5 seconds? If you say yes, you're lying.

However you look at tool approval, this is bad: nobody reads it. Recent Anthropic research points to the same conclusion: auto mode, where another Claude reads the command, works far better than a human.

When omp explains the command itself, it can wait until execution actually reaches `ln` before asking; everything before that is read-only. If the user has already allowed writes to that directory, even that prompt can be skipped.

The harness thus shifts from a "Bash security checkpoint" to a capability approver: "May I push with Git?" Common commands like `find`, `cat`, and `ln` run in-process, query the access model when actually needed, and inherit the user's existing read/write policy.

Because common commands are interpreted by the host, approval can land on the capability boundaries that actually matter: `git push`, writes outside the workspace, network requests—rather than on hard-to-read shell string boundaries. The runtime policy from chapter three can finally be enforced, while preserving the model's muscle memory for using the shell.

<a id="autoqa-give-agents-a-bug-report-path"></a>

#### AutoQA: giving agents a path to report bugs

We added this tool a month after forking the project, earlier than Anthropic added similar capabilities to its own products.

Products usually give users a way to report problems, right? This is the agent-facing equivalent. It lets you collect information fully automatically: which parts of the tool agents like, where they get confused, which behaviors look wrong.

Report quality isn't *great* yet. Codex, for example, loves to blame `Read` for problems caused by external file edits, or blame the LSP tool when a rename goes wrong—*not my fault, bro, go ask the TypeScript folks*. But these false positives are easy to filter. After filtering, you get a lot of valuable signal about which tool failed and how it could be improved.

AutoQA closes the loop between tool design and post-deployment behavior. It's noisy, but once you filter out the obvious misattributions, you can see which operations confuse the model, which projections hide the data it needs, and which fixes belong in the harness.

Tools now have bounded runtimes, stable discovery interfaces, and structured state. To display that state safely, users shouldn't have to count on every tool author—often Claude itself—being an expert in terminal rendering and security.

<a id="the-interface"></a>
```

## 07 The interface

- **267 seconds → 90 milliseconds**: the render time for one session.
- **13%**: the share of profiled CPU taken up by a single `.includes`.
- **98.7 seconds**: the time spent on repeated wrapping in `wrapAnsi`.
- **0 images**: the number of images that session actually contained.

> An array of ANSI-escaped strings plus render() does not a good rendering primitive make.

The session DOM and tool state stream give every client the same facts, but they don't automatically produce a safe, fast, consistent interface. The renderer can still turn those facts into strings that get re-parsed over and over, into per-extension style conventions, and into scrollback bugs you can't undo.

<a id="what-omp-taught-us-strings-compound"></a>

### What omp taught us: strings compound the cost

This is basically the problem discussed in one of my earliest [PRs to pi-mono](https://github.com/earendil-works/pi/pull/1084). Before the change, if you profiled Pi during a task and looked at CPU usage, the leaderboard was almost entirely occupied by — you guessed it — the renderer!

![Figure 17: CPU profile of a Pi session dominated by the renderer](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-17.png)

*Treemap of time spent in a Pi session itself: the renderer dominates, and string scanning alone (red) burns a fifth of the session. The original interactive chart is hoverable to see the corresponding code.*

As a TypeScript CLI, some of this is unavoidable. Just the fact that strings are UTF-16 internally means every frame goes through a relatively expensive transcode, unless you're crazy enough to pass text around as Uint8Array everywhere.

But what really compounds the cost is the contract itself. Want to embed a child component? Now you have to deal with:

- Sanitizing this `string` and discarding ANSI escapes, or recognizing and skipping them.
- Handling padding, truncation, and measurement for every line.

Images can also be mixed into one of those lines as base64 text, which only makes it worse. Just calling `.includes` to figure out whether a line is an image line took up 20% of a session's total CPU cycles. That's not a cheap bill, and that session didn't even have images!

> Translator's note: the single `.includes` figure listed at the start of this chapter is 13%, while the body text here says 20%; both are kept as in the original, not silently unified.

And this chart only covers the JavaScript side. A rendering pipeline like this is basically a machine for churning the heap: constantly allocating, tearing apart, and discarding strings and string arrays; concatenating, splitting, truncating, padding, repeating every step along the way. Not great.

The same contract also leaves extensions without a shared design language. If you've used *any* Pi extension, you know there's no way to make them follow a consistent spec short of having Clawd redo the styles one by one and maintain them forever.

There's no contract for whether to use rounded borders, whether Nerd Font icons are allowed, or whether to use your favorite colors to convey action semantics. What you get is:

- 99% of the time, it does the bare minimum, like truncation and wrapping; every tool becomes an indistinguishable gray rectangle.
- 1% of the time, it tries too hard to be fancy and clashes with an otherwise minimal environment.

A community renderer in the Pi directory shows how this contract affects what actually ends up in users' hands:

```
  if (cq.sources.length > 0) {
    lines.push("");
    for (const s of cq.sources) {
      const domain = s.url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      const title = s.title.length > 50 ? s.title.slice(0, 47) + "..." : s.title;
      lines.push(theme.fg("muted", ` \u25b8 ${title}`) + theme.fg("dim", ` \u00b7 ${domain}`));
    }
  }
  lines.push("");
} else {
  const textContent = result.content.find((c) => c.type === "text")?.text || "";
  const preview = textContent.length > 500 ? textContent.slice(0, 500) + "..." : textContent;
  for (const line of preview.split("\n")) lines.push(theme.fg("dim", line));
}

if (details?.fetchUrls?.length) {
  if (details.curated) {
    lines.push(theme.fg("muted", `Fetching ${details.fetchUrls.length} URLs in background`));
  } else {
    lines.push(theme.fg("muted", "Fetching:"));
    for (const u of details.fetchUrls.slice(0, 5)) {
      const display = u.length > 60 ? u.slice(0, 57) + "..." : u;
      lines.push(theme.fg("dim", "  " + display));
    }
    if (details.fetchUrls.length > 5) lines.push(theme.fg("dim", `  ... and ${details.fetchUrls.length - 5} more`));
  }
}
```

There's quite a bit wrong here:

1. It slices text by code point rather than visible width; shrink the window below 40 columns and it overflows its line and crushes everything below it.
2. It isn't terminal-width aware, so it shows ellipses even when there's plenty of room!
3. Most importantly, it ignores the first rule of Pi components and doesn't sanitize external input. That means whatever it fetches only needs to supply the right ANSI escape to replace the entire UI with a picture of a duck. [Surely](https://www.sentinelone.com/vulnerability-database/cve-2023-32712/)[nothing](https://socprime.com/active-threats/cve-2025-55752/)[else](https://github.com/boxdot/gurk-rs/issues/384)[could ever](https://www.packetlabs.net/posts/weaponizing-ansi-escape-sequences/) [go wrong](https://www.packetlabs.net/posts/weaponizing-ansi-escape-sequences/)!

Push complexity onto an unsuspecting developer — usually Claude — and this is what naturally happens.

An LLM won't remember every internal detail of the harness every time it's asked to "build me a tool UI." Honestly, sometimes I don't want to remember them either; and if the smoke test looks usable, it passes.

The performance, security, and consistency problems all have the same root: an already-rendered string being treated simultaneously as a layout tree, a style tree, content, a transport medium, and a terminal program.

<a id="what-omp-changes-a-one-pass-primitive"></a>

### What omp² changes: a single-pass primitive

The lowest-level consumers — not you, unless you submit a PR — push *RichText* `(Style, String)` into the abstract pipeline `(&mut impl Out)` passed to them.

This brought the 267-second render time down to 90 milliseconds:

![Figure 18: From repeatedly parsing strings to single-pass RichText streaming](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-18.png)

*Before: render(): string[], N components × M transforms, re-parsing, measuring, and allocating every buffer on every frame. After: RichText fragments stream through the abstract pipeline, single-pass into the frame diff.*

Temporary objects, ANSI parsing, and grapheme handling **disappear entirely** at every layer below the frame renderer, of course!

If you can just stream out padding, then stream out your line of content, then repeat, why pad components with whitespace before passing them down? If you can discard the stream right after the ellipsis, or make line breaking part of the transform, why make yourself fully color-render a 255-line diff and then `.slice(0, 3)` just to truncate it into another array of string buffers?

The low-level primitive handles measurement and transformation uniformly. Higher layers should never have to parse ANSI again to discover the structure they just emitted.

<a id="a-typed-component-model"></a>

### A typed component model

Next, `string[]` gets replaced by a real component model. Higher-level users just stack boxes and let the LSP point the way:

![Figure 19: Typed markup](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-19.png)

*Typed markup: nesting an element inside `<Text>` produces a lint error at edit time, instead of a broken frame at runtime.*

![Figure 20: Markup in, picture out](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-20.png)

*Markup in, picture out: `<Box>`, `<Row>/<Col>`, `<ico:new/>` icons, a horizontal magenta-to-cyan gradient, and a ½ rendered live from a fraction formula.*

I may not like doing frontend, but I do love good abstractions. `(Element, Props, Children)` plus a layout engine is already enough to make all of this look far nicer by comparison.

The DOM chapter promised that any actor could render tool elements. This is what that promise actually looks like.

This is what the `Read` component looks like. Not bad, right?

```
<box bc=muted>
	<row kind=title gap=1>
		<text>•</text>
		<text bold>Read</text>
		<a href={input.path}>{input.label}</a>
		{#if status=error}<badge tone=error>exit {code}</badge>{/if}
	</row>
	{#if result.head}<pre lang={result.lang} wrap=word start={result.start}>{result.head}</pre>{/if}
	{#if @expanded}
		{#if result.blob}<pre lang={result.lang} numbers start={result.start} blob={result.blob}></pre>{/if}
	{/if}
	{#each diag as d}<callout tone={d.severity}>{d.msg}</callout>{/each}
	{#if result.src}
		<hr title="Output"/>
		<row gap=1 fg=muted>
			<text>⟨Resolved path:</text>
			<text>{result.src}⟩</text>
		</row>
	{/if}
	{@render usage}
</box>
```

Tool authors describe structure and semantics. The TUI, the web client, snapshot tests, and remote inspectors decide how to lay that structure out on their own surfaces.

<a id="presentation-policy-belongs-to-the-renderer"></a>

### Presentation policy belongs to the renderer

The component model brings two useful properties along for the ride:

1. `<ico:new/>` gives every plugin a convenient icon while respecting the user's choice of ASCII, Unicode, or Nerd Font. Same for borders.
2. Semantic colors no longer require threading a theme object through every renderer. Claude can ask for `info` without picking a specific color and praying it fits the user's theme.

![Figure 21: Semantic colors, borders, and gradients](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-21.png)

*border=round bc="info" resolves to a semantic color in the theme; fg="red..blue" means a gradient. No need to pass a theme object around everywhere.*

You also need to own the pacing of the text stream. Claude and Codex differ wildly in their chunking cadence: one emits a few words at a time, the other a few characters at a time. Smoothing out those differences changes how responsive the harness feels: steady movement means progress, a burst followed by a pause does not. Heh.

Semantic icons, borders, colors, truncation, and stream pacing now each have a single owner. Extensions just ask for `info`, `error`, or `<ico:new/>`, with no need to thread a theme object through every function or pick a Nerd Font glyph on behalf of every user.

<a id="verification-is-part-of-the-interface"></a>

### Verification is part of the interface

In today's development meta, the highest-return, nearly free investment is making the agent debug its protocol for any interactive TUI/GUI. If "how to verify" is unknown and undefined, the agent will build something off to the side that looks like verification—usually a test file that doesn't actually check anything.

Defining up front what "verification" means, and offering it in a convenient form, dramatically reduces friction and makes verification an active part of the development loop.

![Figure 22: Providing a debug and verification protocol for interactive interfaces](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-22.png)

The form itself doesn't matter and can change at any time: a custom tool, a Python package, an API. But you must provide a non-destructive, offscreen, multi-instance-capable *mechanism* to keep the agent from redefining—and usually lowering—the bar for success.

In other words, the debug protocol becomes a machine-readable definition of what the UI is, not just a testing aid.

<a id="the-transcript-is-a-protocol"></a>

### The transcript is a protocol

The truly impossible task for a TUI is driving the number of "it's broken" issues on GitHub to zero. People always idealize what they don't understand; unfortunately, many don't realize that the perfect TUI experience they want—every component updating dynamically and staying current no matter where it lives—is simply impossible.

<a id="blocks"></a>

#### Blocks

We define the canonical transcript as a list of blocks. Each block produces lines of text and goes through a lifecycle:

active → finalized → committed

While block *i* is alive, it displays the current snapshot *Wᵢ*, which is an array of lines. On finalization, it freezes into an immutable snapshot *Fᵢ*.

Blocks come in two modes:

- **Mutable**: each new snapshot may replace the previous one entirely, like a spinner or progress bar. Snapshots are speculative and never enter history; only *Fᵢ* does.
- **Append-only**: snapshots only grow, each one a prefix of the next, and the last snapshot is also a prefix of *Fᵢ*, like streaming text.

This distinction matters when a block exceeds the viewport space allocated to it. Mutable snapshots can't enter history early, because a later update might replace them; you'd have to pull back lines that have already scrolled away. Append-only blocks like assistant thinking only extend a stable prefix, so that prefix can start committing immediately.

<a id="terminal"></a>

#### Terminal

A terminal of width *W* and height *H* has two buffers:

- *V*: the viewport, containing *H* visible lines.
- *S*: native scroll history, unbounded and append-only.

Technically we could clear and rewrite scroll history, but users complain about that behavior constantly, so append-only is now an invariant.

The wrap function *wrapW* turns logical lines into physical lines, depending on the current width. There is no addressable region below the viewport. Writing past the bottom scrolls the terminal, pushing top lines irreversibly into *S*.

Logical history *L* is stored as unwrapped lines, so it's width-independent: the committed final snapshots in block order, each appearing exactly once, plus whatever portion of the current streaming block has been released. Let *c* be the last committed block, *j = c+1*:

L = F₁ · F₂ ⋯ F꜀ · Wⱼ[1..eⱼ]

where *eⱼ* counts how many lines the stream head has already emitted into history; unless block *j* is an append-only block that's currently streaming, *eⱼ = 0*.

Therefore:

- Committed final snapshots appear contiguously in block order, exactly once.
- Mutable speculative snapshots never enter *L*.
- An append-only head block can enter *L* line by line while streaming.
- Finalization writes nothing.
- Commit only appends the lines of *Fⱼ* that haven't been emitted yet.

<a id="resize"></a>

#### Resize

Resizing doesn't change the logic: every *Wᵢ*, every *Fᵢ*, and *c* stay the same; only wrapping and viewport allocation are recomputed. Lines that have already entered native scroll history can't be rewritten, so you need to pick an explicit policy for them:

- **Preserve**: leave the history the terminal emulator has already wrapped as-is.
- **Append**: append the re-rendered history, possibly duplicating physical lines.
- **Rebuild**: open a new physical epoch and replay history within it.

These rules separate three things that are easy to conflate: mutable presentation in the viewport, width-independent logical history, and irreversible terminal-native lines. Once you name them, resizing and streaming become explicit policy choices instead of word-of-mouth folklore.

<a id="specify-the-impossible-part"></a>

### Spec out the "impossible part"

Why put you through all this "math"? Because the algorithm is genuinely complex and hard to verify as sound. In the last round of implementation, we had to write a fuzzer just to reach a stable state; this time I wanted to avoid going down that road again.

So we modeled the above description in [TLA+](https://lamport.azurewebsites.net/tla/tla.html), then required iterating on how blocks commit and finalize until every explicitly stated invariant was satisfied.

If you want to change something later—say, committing partial results no matter what, or forbidding block truncation—you have an updatable reference, an extremely simple way to check whether it holds, and a counterexample when it fails.

The paper and the full `ElasticSlots.tla` source are in [Appendix B](#appendix-b-elastic-speculative-slots).

<a id="what-this-unlocks"></a>

### What this unlocks

A routine flex, then moving on! *Now when someone complains the TUI is broken, I can hand them a formal proof of why it can't be fixed. Excellent.*

![Figure 23: The omp² TUI during task execution](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-23.png)

*The omp² TUI during task execution: a command palette above live parallel shards, a session sidebar with per-file diff stats, and inline image thumbnails. Every element is a component on the same streaming pipeline.*

The TUI, the web client, and the remote inspector can lay things out differently, but the facts can't differ. Tool authors describe semantic state; the component system handles presentation; the transcript protocol handles exactly-once history.

The same design move shows up again: push hard-to-maintain invariants down to the layer that can actually enforce them. The stack you implement with should reinforce those invariants too, rather than encouraging every contributor and every coding agent to invent its own local style.

<a id="the-stack"></a>

## 08 Tech stack

> Choose languages whose own constraints push the agent toward a codebase you'd be willing to maintain.

The previous chapters were about architecture. Language choice determines how much resistance the codebase puts up when you try to move from the architecture to the next "well-intentioned" local exception. This matters even more when a large share of the implementation is generated by agents whose training has absorbed each ecosystem's defaults and pathologies.

<a id="language-choice-is-architecture"></a>

### Language choice is architecture

**Right now, unless you have to deal with frontend code, TypeScript is a bad choice.**

When you start a project today, one of the highest-leverage decisions is picking the right tool. Three years ago, if I'd seen an article open like this, I would have started arguing. But... if you don't believe me, try giving Claude the exact same prompt describing the little widget you want to build.

Then swap macOS (Swift) for Linux (Qt/JS). The former gives you a glassy widget that looks like it belongs to the OS. The latter gives you a rectangle with overlapping UI elements and questionable UX choices, as if you'd just finished reading the XML schema that defines what a UI is and were compiling for the first time.

Sure, how you write the prompt matters, and you can absolutely be more detailed. But after a while you'll notice that no matter what you do, one of them wins almost effortlessly over the other. macOS has historically done one thing well: forcing developers into a consistent design language. The same applies to LLMs.

The point isn't that Swift ships with taste and JavaScript doesn't. It's that defaults, standard libraries, typical project structure, compiler feedback, and ecosystem conventions become priors for the generated code. A language that allows twenty equally common local styles forces the model to make twenty decisions before it even touches your product problem.

<a id="typescript-becomes-your-language"></a>

### TypeScript ends up becoming "your language"

Unfortunately, the thing I used to like about TypeScript is exactly that it always ends up becoming *your* language:

- `camelCase` or `snake_case`? Or just name the library `$`?
- Write generics spanning 200 lines, or no generics at all?
- `Buffer` or `Uint8Array`?
- Zod or Typebox?
- `Array<T>` or `T[]`?
- ESM or CJS? And which extension: `.ejs`, `.cjs`, `.mjs`, `.js`?
- TypeScript or JSDoc?
- Classes or objects? Or even `new function()`?
- Default exports or not?
- Star re-exports or list every name?
- `private foo` or `#foo`?
- `module/index.ts` or `module.ts`?
- `const x = () => ..` or `function x() {`?
- `function x(args)` or `function x(...args)`?
- If the latter, `...args: any[]` or `...args: unknown[]`?
- `const X = 1`, `enum E { X = 1 }`, or `const enum E { X = 1 }`?

Look, I spent ten years of my life using C++, the most write-only language there is, so I genuinely do find joy in these choices. But when it's a choice between Zod and Typebox, your junior colleague will just hand-roll a so-called `isRecord`. Why use generics when you can use union types? Why make sure in your head that every branch works for both types when a little `typeof` special-casing will do? Why use classes when it's just objects and prototypes?

Maybe there's just too much bad JS out there, or maybe they swallowed a ton of minified code during training. Either way, I'm tired of it. Considering that same "junior colleague" can already find Linux zero-days, if I were you I wouldn't keep hoping for *the right model* or *the right code quality tool*, and I wouldn't keep taking all these detours.

Maybe EffectJS can change that. I think Go will win in the end, especially once the WASM GC proposal finally lands. The reasoning is similar to why Swift wins on design, plus compile speed and easy cross-compilation. Some scenarios need a lower-level systems language though, which is why we picked Rust here.

They still need frequent guidance: they always take the shortest path, allocate copies to dodge complex borrows, and pass errors as strings instead of using `thiserror`. But `std` plus the `serde` ecosystem already gives them most of what they need to work, and the compiler provides a fair amount of safety. So that's settled.

<a id="python-for-extensions"></a>

### Write extensions in Python

The next decision: should we bring TS back for extensibility? We said no, mainly because:

1. Agents write decent Python, so they write decent extensions too.
2. Shipping a spec-compliant JS *runtime* in a tiny footprint is basically impossible—thanks, Locale. And without an ecosystem, you might as well run Lua.
3. Extensions consume less than 1% of runtime, so there's really no need for a JIT.
4. Embedding a full Python runtime guarantees `eval` works out of the box; you don't have to ask users to install py3 and then never be able to rely on it in shipped workflows.
5. Python code can natively inspect its own AST. That's exactly what makes the `@remote` design in the runtime chapter work.

The runtime chapter covers the `@remote` boundary. Python's introspection and attribute model make that boundary easy to use: the SDK can inspect functions, bundle the relevant source, and run it in a sandboxed runtime, without every extension author hand-writing RPC.

Shipping our own runtime also makes `Eval` a reliable built-in capability, rather than a feature that only works if the user happens to have a compatible Python installed.

<a id="closing-notes"></a>

## 09 Conclusion

> An agent harness is systems software, not a `while` loop wrapped around `fetch`.

The question we opened with was: "But why?" The direct answer is that every category of software discussed in the chapters above comes with decades of prior art: replication, sandboxing, configuration, scheduling, protocol compatibility, real-time rendering, and language/runtime design.

omp² is still being built according to this document, with each part ranging from already shipped to still being thought through. But we're genuinely grateful to everyone who has tried it and shared their amazing omp use cases: from running a software factory with it, to building a camera app for themselves on the same phone.

![Figure 24: omp use cases shared by users](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-24.png)

[Original tweet](https://x.com/i/status/2092690773221458376)

You shaped omp, and we're excited for an equally amazing future!

---

<a id="appendix-a-state-failures-in-the-official-examples"></a>

## Appendix A: state failures in the official examples

The state chapter summarizes these failures by category. This appendix preserves the raw evidence: source links, minimal code snippets, and reproduction videos.

These aren't theoretical judgments. We examined 78 official extension examples: 60 are stateless; of the 17 stateful examples, only two are correct.

<a id="1-the-checkpoint-is-cleared-before-fork-can-use-it-git-checkpointts"></a>

#### 1. The checkpoint is cleared before `/fork` can use it: `git-checkpoint.ts`

[Source](https://github.com/earendil-works/pi/blob/853a80d26c90a14c1886f0ebb8ffaae133ca2185/packages/coding-agent/examples/extensions/git-checkpoint.ts#L11-L51): no persistent ownership of the checkpoint. `/fork` is invoked while idle, but `agent_settled` has already cleared the only map holding the stash reference.

```
const checkpoints = new Map<string, string>();
// …
pi.on("agent_settled", async () => {
  checkpoints.clear();
});
```

![Figure 25: git-checkpoint failure reproduction](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-25.png)

[Original video](https://stencil.so/blog/harness-playbook/bugs/git-checkpoint.mp4)

<a id="2-tree-navigation-does-not-restore-state-plan-modeindexts"></a>

#### 2. Navigating the tree does not restore state: `plan-mode/index.ts`

[Source](https://github.com/earendil-works/pi/blob/853a80d26c90a14c1886f0ebb8ffaae133ca2185/packages/coding-agent/examples/extensions/plan-mode/index.ts#L340-L352): missing `session_tree` and `getBranch()`. After rewinding, plan mode and its tool restrictions remain in effect, and resuming can resurrect a snapshot from an abandoned branch.

```
const entries = ctx.sessionManager.getEntries();
const planModeEntry = entries
  .filter((e) => e.type === "custom" && e.customType === "plan-mode")
  .pop();
```

![Figure 26: plan-mode failure reproduction](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-26.png)

[Original video](https://stencil.so/blog/harness-playbook/bugs/plan-mode.mp4)

<a id="3-the-counter-cannot-count-history-status-linets"></a>

#### 3. The counter cannot count history: `status-line.ts`

[Source](https://github.com/earendil-works/pi/blob/853a80d26c90a14c1886f0ebb8ffaae133ca2185/packages/coding-agent/examples/extensions/status-line.ts#L10-L23): missing branch-based derivation. Rewind from turn 3 to turn 1, and the next turn shows 4; resuming the session restarts from zero.

```
let turnCount = 0;
// …
pi.on("turn_start", async (_event, ctx) => {
  turnCount++;
```

![Figure 27: status-line failure reproduction](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-27.png)

[Original video](https://stencil.so/blog/harness-playbook/bugs/status-line.mp4)

<a id="4-a-dynamically-added-tool-survives-rewind-then-disappears-after-resume-dynamic-toolsts"></a>

#### 4. A dynamically added tool survives rewind, then disappears after resume: `dynamic-tools.ts`

[Source](https://github.com/earendil-works/pi/blob/853a80d26c90a14c1886f0ebb8ffaae133ca2185/packages/coding-agent/examples/extensions/dynamic-tools.ts#L25-L33): `/add-echo-tool echo_branch` only writes to the running extension registry; `/tree` does not restart that registry, so rewinding keeps the tool, but `--continue` builds a new registry and the tool vanishes.

```
const registeredToolNames = new Set<string>();
// …
registeredToolNames.add(name);
pi.registerTool({
```

![Figure 28: dynamic-tools failure reproduction](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-28.png)

[Original video](https://stencil.so/blog/harness-playbook/bugs/dynamic-tools.mp4)

<a id="5-a-save-returns-from-an-abandoned-branch-snakets"></a>

#### 5. A save from an abandoned branch reappears: `snake.ts`

[Source](https://github.com/earendil-works/pi/blob/853a80d26c90a14c1886f0ebb8ffaae133ca2185/packages/coding-agent/examples/extensions/snake.ts#L320-L328): resume scans the entire session file. Save on branch A, rewind to before the save, open `/snake`, and the abandoned save reappears.

```
const entries = ctx.sessionManager.getEntries();
for (let i = entries.length - 1; i >= 0; i--) {
  const entry = entries[i];
  if (entry.type === "custom" && entry.customType === SNAKE_SAVE_TYPE) {
```

![Figure 29: snake failure reproduction](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-29.png)

[Original video](https://stencil.so/blog/harness-playbook/bugs/snake.mp4)

<a id="6-last-message-means-last-in-the-file-bookmarkts"></a>

#### 6. "Last message" means last in the file: `bookmark.ts`

[Source](https://github.com/earendil-works/pi/blob/853a80d26c90a14c1886f0ebb8ffaae133ca2185/packages/coding-agent/examples/extensions/bookmark.ts#L19-L25): missing `getBranch()`. After rewinding, `/bookmark` may mark an assistant message on an abandoned branch that the user cannot see.

```
const entries = ctx.sessionManager.getEntries();
for (let i = entries.length - 1; i >= 0; i--) {
  const entry = entries[i];
  if (entry.type === "message" && entry.message.role === "assistant") {
```

![Figure 30: bookmark failure reproduction](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-30.png)

[Original video](https://stencil.so/blog/harness-playbook/bugs/bookmark.mp4)

<a id="7-calculator-stays-active-after-rewinding-before-discovery-kimi-deferred-toolsts"></a>

#### 7. `Calculator` stays active after rewinding past its discovery: `kimi-deferred-tools.ts`

[Source](https://github.com/earendil-works/pi/blob/853a80d26c90a14c1886f0ebb8ffaae133ca2185/packages/coding-agent/examples/extensions/kimi-deferred-tools.ts#L47-L60): `tool_search` activates `Calculator`, but there is no `session_tree` handler to re-derive the active list. Navigate to before the discovery, and `Calculator` is still active.

```
const active = pi.getActiveTools();
const added = active.includes("Calculator") ? [] : ["Calculator"];
if (added.length > 0) pi.setActiveTools([...active, ...added]);
// Missing: session_tree → derive active tools from selected branch.
```

![Figure 31: kimi-deferred-tools failure reproduction](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-31.png)

[Original video](https://stencil.so/blog/harness-playbook/bugs/kimi-deferred-tools.mp4)

<a id="8-switching-sessions-commits-the-worktree-auto-commit-on-exitts"></a>

#### 8. Switching sessions commits the worktree: `auto-commit-on-exit.ts`

[Source](https://github.com/earendil-works/pi/blob/853a80d26c90a14c1886f0ebb8ffaae133ca2185/packages/coding-agent/examples/extensions/auto-commit-on-exit.ts#L11-L42): it's missing a boundary that only targets process exit. `/new`, `/resume`, and `/fork` all trigger `session_shutdown`, which then stages and commits a workspace that has uncommitted changes.

```
pi.on("session_shutdown", async (_event, ctx) => {
  // …
  await pi.exec("git", ["add", "-A"]);
  await pi.exec("git", ["commit", "-m", commitMessage]);
});
```

![Figure 32: auto-commit-on-exit bug reproduction](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-32.png)

[Original video](https://stencil.so/blog/harness-playbook/bugs/auto-commit-on-exit.mp4)

<a id="9-live-and-restored-state-disagree-tic-tac-toets"></a>

#### 9. Live state and restored state disagree: `tic-tac-toe.ts`

[Restore logic](https://github.com/earendil-works/pi/blob/853a80d26c90a14c1886f0ebb8ffaae133ca2185/packages/coding-agent/examples/extensions/tic-tac-toe.ts#L631-L645); [user moves](https://github.com/earendil-works/pi/blob/853a80d26c90a14c1886f0ebb8ffaae133ca2185/packages/coding-agent/examples/extensions/tic-tac-toe.ts#L802-L810): the rebuild only accepts tool results, but user moves are recorded as custom entries. If it crashes after X moves and before O moves, X disappears.

```
if (entry.type !== "message") continue;
if (msg.role !== "toolResult") continue;
// User moves take a different path:
pi.appendEntry(SAVE_TYPE, getBoardDetails());
```

![Figure 33: tic-tac-toe bug reproduction](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-33.png)

[Original video](https://stencil.so/blog/harness-playbook/bugs/tic-tac-toe.mp4)

<a id="appendix-b-elastic-speculative-slots"></a>

## Appendix B: Elastic Speculative Slots

The UI chapter kept the protocol and conclusions on the main reading path. This appendix collects the paper, along with the complete [TLA+](https://lamport.azurewebsites.net/tla/tla.html) model used to check the session-record invariants.

![Figure 34: The Elastic Speculative Slots paper](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/figure-34.png)

*The "Elastic Speculative Slots" paper: the three-layer contract, the safety theorem, and the conditional progress result, each mapping one-to-one onto the full specification below. The complete PDF is linked below.*

[Original paper PDF](https://stencil.so/blog/harness-playbook/elastic-slots.pdf)

### ElasticSlots.tla: the full specification

The complete formal specification runs over 1,000 lines. The code and English comments are kept as-is for cross-checking, verification, and reuse. See [Appendix B of the original post](https://stencil.so/blog/harness-playbook#appendix-b-elastic-speculative-slots); the full local translation also includes the entire specification. Both the main text and the appendix notes here are translated in full.
