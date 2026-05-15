---
title: "Deep Dive into the Technical Details of the New Raycast"
publishDate: "2026-05-15T04:10:22Z"
updatedDate: "2026-05-15T04:10:22Z"
tags: ["产品","好文翻译"]
description: "原文链接：https://www.raycast.com/blog/atechnicaldeepdiveintothenewraycast\n作者：Petr Nikolaev, Thomas Paul Mann\n发布日期：20260514\n\nThe inside story of Raycast's cross-platform rewrite and the technologies that make it feel fast, delightful, and familiar."
---

# A Technical Deep Dive into the New Raycast

> Original link: https://www.raycast.com/blog/a-technical-deep-dive-into-the-new-raycast
> Authors: Petr Nikolaev, Thomas Paul Mann
> Published: 2026-05-14

The story behind the cross-platform rewrite of Raycast, and the technical details that make it feel fast, delightful, and familiar.

We just released the public beta of Raycast 2.0. It's the biggest update since we first launched Raycast in **2020**, and the first version to support both macOS and Windows.

![Raycast 2.0 on macOS and Windows](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/e144d8784aa8ba6f.png)

![image-20260515114528443](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image-20260515114528443.png)

> Raycast 2.0 on macOS and Windows

To achieve this, we rewrote the entire app from scratch. A new architecture and a hybrid tech stack combining TypeScript, Swift, C#, Rust, Node, and React. Web technologies have been part of Raycast from the start, powering Extensions and Notes. In v2, we doubled down on web technologies while keeping the app feeling just as native and fast as ever.

If the [announcement post](https://raycast.com/blog/the-new-raycast) is about what's new, this one is about how it's built. The behind-the-scenes story of the rewrite, the decisions we made along the way, and what it takes to pull off a rewrite of this scale. The hard part isn't making Raycast work — it's making it feel right.

## [Where We Started](#where-we-started)

Raycast v1 is essentially a native macOS app built with Swift using AppKit. We almost never use standard UI components. They aren't designed for the keyboard-first, power-user workflows we focus on, **so we built all components ourselves. Every list item, every keyboard shortcut, every default behavior was handled by us.** We also barely used SwiftUI. It evolved alongside Raycast and never met our standards for performance and control. The only part of v1 that uses SwiftUI is the annual Wrapped feature, which is completely isolated from the rest of the app.

![Raycast v1 overview](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/4bb239a4ef8729d1.png)

> Raycast v1 overview

The extension ecosystem, on the other hand, is built on a completely different tech stack: React, TypeScript, and Node.js, with the UI described declaratively and rendered by the native app. Felix describes the architecture in detail [here](https://www.raycast.com/blog/how-raycast-api-extensions-work). Choosing a familiar tech stack for third-party developers was a major factor in the store now having thousands of extensions covering almost every tool people use. The API was also designed with portability in mind. Extension code makes no assumption that it only runs on macOS, which allowed us to bring a large portion of the extension catalog to Windows last year.

Raycast Notes is our first use of a WebView in the app to build a major feature. The editor is a React app mounted inside a WebView within a native window. It was a test of "Can we build a feature UI entirely with web technologies without breaking the user experience of the rest of the app?" It succeeded, and Notes is heavily used daily by both macOS and iOS users.

While v1’s core is a native app, we’ve always adopted web technologies when they were the right choice. Ultimately, people love Raycast for how it feels, not what technology powers it underneath.

## [Why the Rewrite](#why-the-rewrite)

By the end of 2023, we started thinking about bringing Raycast to Windows. This had been the plan from day one, but early on we wanted to focus on one platform, nail the experience, and then think about expanding.

By that point, Raycast had grown from a launcher into a broader productivity platform, with features like AI Chat, Notes, extensions, sync, and file search. The architecture originally built for the launcher was starting to constrain what we could build next. Compile times were getting longer, AppKit was increasingly getting in our way, and finding talent with deep native macOS expertise was becoming harder. Even without the Windows plans, we needed to rethink most of the architecture.

So we set out to determine the tech stack for both the new Windows client and the existing macOS client. But first, any such project needs a good codename. We called it "X-Ray", short for cross-platform Raycast.

## [Picking a Stack](#picking-a-stack)

We started by looking into what’s available for building native applications on Windows — and frankly, the state of Windows native UI frameworks leaves a lot to be desired. Microsoft has a history of shipping a UI framework and then pivoting to something new. WPF, UWP, and now WinUI 3, which is still fairly young and not battle-tested at scale. If building a polished native app on macOS with AppKit is already challenging, doing the same thing on Windows with WinUI 3 feels even riskier. Plus, given that most of Raycast’s extensions should behave consistently across both platforms, the idea of running two separate native apps also made us uneasy. Maintaining two independent UI stacks means double the work without delivering a faster experience.

That quickly ruled out the fully native route. And since the vast majority of Raycast’s codebase is UI, we couldn’t just share a backend and build separate frontends for each platform. That pushed us toward a web-based stack. It renders UI cross-platform by default, has a massive library ecosystem, a great developer experience, and a talent pool orders of magnitude larger than native desktop development. Raycast’s extensions are already built on a web stack and have worked well for us, so exploring that for the entire app felt natural. Even if we were only building a Windows version, the web would be a reasonable choice (Microsoft [lists](https://learn.microsoft.com/en-us/microsoft-edge/webview2/) hybrid apps as one of the recommended approaches for building desktop applications). Its inherently cross-platform nature also made us consider using it for macOS.

So we evaluated three options: Electron, Tauri, and building our own hybrid stack.

**Electron** would be the obvious choice. To be honest, for most companies it’s probably the right way to build a desktop app. It’s well-maintained, battle-tested, and has a huge ecosystem. Apps like VS Code, Linear, or Superhuman prove you can build excellent products with it. Apple and Microsoft don’t make it easy to build complex desktop applications for their platforms with a large team, which is why Electron fills that gap. We genuinely think that’s a good thing.

But for Raycast, it isn’t the best fit. Our app is deeply integrated with the operating system. We rely on global hotkeys, clipboard management, accessibility APIs, window management, custom panels that float above other apps without stealing focus, and more. We need access to low-level native code to have fine-grained control over our app’s behavior. Even small details like the transparency of internal panels matter a lot to us. Electron can do some of these things, but the boundary between web code and native code can be painful. We also didn’t want to bundle Chromium on macOS when we have the system WebKit available. Simply put, we need to be in control of every piece of the stack and be able to fall back to native easily when needed. Electron wasn’t the best choice for that.

**Tauri** had similar limitations. It offers even less control on the native side, and at the time it was still young enough that we didn’t want to bet the company on it. So we quickly ruled it out.

That led us to a **hybrid approach**. Building our own native shell to wrap the system WebView turned out to give us exactly what we needed. On macOS it’s a full Xcode project; on Windows it’s a Visual Studio project. Full access to platform APIs. Using the system’s own WebView to render UI. Complete control over how each part communicates with each other. To verify this was actually feasible, we built a prototype early on. Could we make translucent windows? Could we have native tooltips layered above the WebView content? Would it look and feel like Raycast? The prototype came out looking almost identical to a native app. The transparent WebView blended with the window background, with native overlays for things like tooltips and action panels. Essentially the same visual language we had been building for years.

It’s not a silver bullet, though. This approach has real overhead. Beyond your application, you’re effectively building and maintaining infrastructure that Electron provides out of the box. IPC between the WebView, the native shell, and the Node.js backend needs to be wired up, debugged, and optimized on each platform. There’s no community solving those problems for you. We chose it because of the way Raycast works. That tradeoff wouldn’t make sense for most other desktop apps. Electron handles it well enough and saves you months of infrastructure work.

We also looked at a few other options: Flutter, Qt, desktop React Native, and running Swift on both platforms (props to [The Browser Company’s guts](https://speakinginswift.substack.com/p/swift-meet-winrt), but we weren’t as bold). But we ruled them out early. They either lacked the native control we needed or weren’t mature enough for our user base — or both.

## [How It’s Built](#how-its-built)

At a high level, Raycast 2.0 is made up of four parts:

- **Host App:** Each platform has its own application—macOS is written in Swift + AppKit, Windows in C# + .NET 8 + WPF. The app controls everything that must be platform-native: managing windows, listening to global hotkeys, configuring the menu bar / tray, and so on. It also loads the web frontend in a platform WebView (WKWebView on macOS, WebView2 on Windows) and manages the Node backend.
- **Web Frontend:** The frontend is a React + TypeScript project shipped to both platforms. It contains all the UI code and builds separate entry points per window (launcher, AI Chat, Notes, Settings, etc.). The codebase is identical across the two OSes.
- **Node Backend:** A long-running Node process holds the application’s business logic—database access, the extension runtime, other persistent services. Node is the shared layer that both platforms talk to, meaning feature work only needs to be done once.
- **Rust Core:** Rust is used where performance and portability matter more than convenience. Our data layer is shared with the iOS app. Cloud sync shares schemas with its server-side counterpart. Our custom file indexer is heavily optimized to scan an entire hard drive in seconds.

With multiple runtimes (Swift/C#, Node, WebView) working together, the layers need to communicate. We use a mix of platform message handlers and stdio transports to wire everything together. To keep things safe, interfaces are declared in one place and type-safe clients are generated for each end. This gives us compile-time guarantees across all four runtimes.

![Raycast v2 tech stack](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/503ef6f483393310.png)

> Raycast v2 tech stack

In practice, most of the team works on the web frontend and Node backend—that’s where features are built. The native shell is only touched when we need to expose new capabilities from the OS or optimize the native experience (more on that below). Once the boundaries between the four parts are defined, most product work doesn’t cross them.

### [New File Indexer](#new-file-indexer)

In v1, file search relied on Spotlight metadata. It worked (most of the time), but we were limited to what Spotlight already indexed, and it simply didn’t work on Windows. In v2, we built our own file indexer from scratch in Rust. It runs as a standalone process, scans the filesystem directly, builds a search index, and stays up to date via filesystem events.

On Windows, walking the NTFS filesystem in the normal way was far too slow for the scan speeds we needed. So we built a specialized NTFS scanner that reads the Master File Table directly—the only practical way to index an entire drive in seconds instead of minutes.

The indexer is one of the places where Rust’s performance shines brightest. Scanning hundreds of thousands of files and building a search index needs to happen in the background without affecting the rest of the application. Predictable memory usage and no GC pauses make that possible.

## [Making It Feel Like a Native App](#making-it-feel-at-home)

When the UI runs in a WebView, what does "native feel" actually mean? For us, it boils down to a simple test: if someone uses Raycast without knowing what technology it's built with, would they assume it's a regular Mac app? If anything feels off—wrong animations, hover states that don't belong, popovers clipped at the window edge—we haven't done our job.

![Raycast v2 overview](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/dee6b1ec84f294b2.png)

> Raycast v2 overview

One of our Windows engineers put it well: we're not a web app with a few native hooks sprinkled on top. We're a native app that uses web technologies for its UI. That distinction shapes where we invest our time. Most of the work below isn't about making things look right—it's about making things behave right.

### [Platform Conventions](#platform-conventions)

The easiest way to make a web app feel wrong on the desktop is to follow web conventions where native conventions exist. Here are some things we deliberately match or avoid:

- **No `cursor: pointer` on interactive controls.** Desktop apps don't do that. It's a small detail, but it immediately signals "this is a website."
- **No hover highlights on most controls.** On macOS, buttons and list items don't highlight on hover like they do on the web.
- **Settings open in a separate native window, not a modal or sidebar.**
- **Popovers and tooltips render as native windows, not as DOM elements inside the WebView.** They can extend beyond the window boundary, just like native popovers.
- **On macOS Tahoe, we adopted Apple's new Liquid Glass material, making Raycast feel at home with the system's updated visual language from day one.**
- **No flickering when views appear or transition.** This is a common characteristic of web apps, and we've done a lot of work to eliminate it.

These are the obvious things. The less obvious work is below.

### [Working With (and Around) WebKit](#working-with-and-around-webkit)

WebKit is a great rendering engine, but it was built for web browsing, not for a desktop app that shows and hides itself hundreds of times a day. Out of the box, it makes assumptions that are perfectly reasonable for Safari but cause problems for us. We've spent a lot of time learning how to work around them.

- **Throttling.** WebKit throttles `requestAnimationFrame`, CSS animations, and timers when it considers the view invisible. For a launcher that's constantly shown and hidden, this breaks functionality. We solve it by keeping the window frontmost but visually hidden (`alphaValue = 0`), and disabling WebKit's occlusion detection (`windowOcclusionDetectionEnabled = false`). Before showing the window, we trigger rendering inside a `requestAnimationFrame` to avoid flicker.
- **Occluded frame rendering.** When Raycast expands from compact mode to full size, WebKit leaves a frame or two of blank space in the previously hidden area—it's throttling what it considers "off-screen." We solve this by keeping the WKWebView's frame always at the expanded size, even when the window itself is compact. The WebView renders beyond the visible window boundary, so when the window expands, the content is already there.
- **Window resizing.** WebKit pauses drawing during animated window resizing, which causes visible stutter. We solve it by overriding `NSWindow.setFrame` and replacing the animated call with implicit Core Animation, so the WebView continues rendering while the window resizes.
- **Flickering on window open.** We use `_doAfterNextPresentationUpdate` (a WebKit API for synchronizing rendering state with native presentation) to ensure the WebView finishes drawing before the window becomes visible. Without it, you'd see a flash of stale or blank content.
- **Emoji rendering.** Our emoji picker was initially slow because WebKit walks the font fallback chain for every emoji glyph. The fix was simple—prewarm the emoji font at startup—but it took a while to figure out what was going on.

We also built infrastructure to toggle WebKit feature flags at runtime (the same ones available in Safari's Develop menu). We use it internally to unlock the 60 FPS cap and enable `requestIdleCallback` for scheduling non-critical work.

### [On Windows](#on-windows)

WebView2 is based on Chromium, and Chromium has its own ideas about throttling, rendering, and process management. Making the acrylic blur background effect work with a custom title bar requires careful coordination between the native shell and the WebView2 runtime. We control all initialization parameters ourselves, which lets us avoid the white rectangle flicker common in WebView2 apps at startup.

Managing multiple windows is also more complex than on macOS—each window needs its own WebView2 environment configured with the right combination of acrylic effect, custom border, and input handling. We also had to do specific work to ensure Chromium doesn't throttle our WebView when the window isn't focused, because Raycast often needs to update while sitting behind other applications.

## [Memory & Performance](#memory-and-performance)

The most common criticism of web-based desktop apps is that they’re slow, bloated, and memory hungry. That’s a fair concern, and we want to address it honestly.

Short version: Yes, Raycast v2 uses more memory than v1. The increase is real, but it’s bounded, measurable, and something we can continuously improve. The team treats performance and memory as first-class priorities, not something to deal with later.

### [The Numbers](#the-numbers)

Raycast v1 (fully native UI, Node backend for extensions) typically sits around 200–300 MB after extended use. Raycast v2 is roughly 350–450 MB under similar conditions. Exact numbers depend on how many extensions you have, which features you use, and how much content you’ve loaded.

That’s higher, and we don’t want to hide it. These numbers aren’t final either—memory optimization is an active area of focus, and we expect memory usage to drop further as we come out of beta. Here’s the rough memory breakdown for v2 when the main window is hidden (which is how Raycast spends most of its time):

- WebView (WebContent): ~120–200 MB
- Node.js backend: ~150–200 MB
- Native app (Swift shell): ~40 MB
- WebKit GPU process: ~18 MB
- WebKit Networking: ~12 MB

The native shell is lightweight. When the window is hidden, the WebKit GPU process drops below 20 MB (it can spike higher during active Raycast usage, but that memory is freed when you close the window). The two main overheads are the WebView and the Node backend.

For comparison, an empty WebView (no content) has a baseline overhead of about 50 MB, and a bare Node.js process with no imports uses about 12 MB. Those baselines are part of the trade-off. The rest is our application code, loaded modules, icons, and cached resources—things we can control and optimize continuously.

### [Not All Memory Is the Same](#not-all-memory-is-the-same)

That doesn’t mean the higher footprint doesn’t matter, but it helps explain the numbers you see in Activity Monitor. When you open Activity Monitor on your Mac, the numbers shown per process aren’t as straightforward as they seem. macOS aggressively uses available memory—it caches files, compresses inactive pages, and keeps content in memory to make the system faster.

A few things worth knowing:

- **Compressed memory.** When physical memory runs low, macOS compresses inactive pages instead of writing them to disk. This is fast and means a process that appears to use 200 MB might actually be consuming far fewer real resources. An idle Node backend with a large heap can compress quite well.
- **Dirty vs. clean pages.** Not all resident memory costs the same. Clean pages (like mapped binary code) can be discarded and re-read from disk at no cost. Dirty pages (like V8 heap or decoded images) are the ones that really consume resources. The bulk of our binary on disk is clean memory that the operating system can reclaim instantly.
- **Shared frameworks.** Activity Monitor apportions system framework memory (WebKit, system libraries) to each process that uses them. When you sum up the memory numbers across Raycast’s processes, you’re double-counting shared pages. The true system cost is lower than what Activity Monitor shows.
- **Memory pressure is what really matters.** The graph at the bottom of Activity Monitor’s Memory tab is the real indicator of whether your Mac is struggling. If it’s green, the system has plenty of headroom, even if individual process numbers look high. The OS is doing its job—using available memory to stay fast, ready to free it when something else needs it.

None of this is an excuse to be careless with memory. We track `phys_footprint` (the metric closest to what Activity Monitor shows) and actively work to reduce it. We’ve already cut v2’s memory usage significantly during development—early builds had much higher numbers than what we have now. We also specifically test on low-memory machines, because that’s where it matters most. But we want readers to have the right mental model when they see these numbers.

Beyond memory, v2 is noticeably faster than v1 in several areas.

- **Search.** v2’s root search includes full file search powered by our new Rust-based file indexer. In v1, file search was only available through a separate command and relied on Spotlight metadata. The new indexer searches your files directly, without depending on Spotlight, while keeping the search experience responsive.
- **Text rendering.** AI Chat and any feature involving rich text rendering is where WebKit truly shines. Decades of optimization for web text layout and rendering come through here—scrolling through long conversations, rendering Markdown, handling code blocks with syntax highlighting. TextKit on macOS is capable, but WebKit has far more investment in this kind of workload.

We’re not done. Memory and performance are active areas of focus, and we know there’s room for improvement. The team is working to further reduce steady-state memory usage, make the frontend and backend more lazy-loaded, optimize icon and image handling, and tighten the V8 heap. After all, it’s still in beta.

## [Trade-offs](#trade-offs)

No rewrite is free. Here's what got better and what got harder.

### [What's Better](#whats-better)

Starting with the good news. Here are the areas where Raycast's second version feels like an improvement:

- **Development speed.** This is the biggest one. Hot reload means UI changes appear in under a second, whereas v1 required recompiling the Swift target and restarting the app. We can prototype, iterate, and fix bugs much faster. That directly benefits users — features ship sooner, fixes land faster.
- **One team, two platforms.** Most product work happens in a shared web front end and Node backend. When we ship a feature, it works on both macOS and Windows. In v1, every UI change was essentially macOS-only. As an added bonus, the mobile team benefits from the Rust model layer and the new sync engine.
- **Hiring.** It's much easier to find engineers who can work with React, TypeScript, and Node than engineers with deep AppKit experience. That doesn't mean we no longer need native engineers — we still have dedicated Swift and C# engineers working on the host apps — but most product work no longer requires specialized platform knowledge.
- **Richer UI.** Some things are just easier to do well with a web tech stack: rich text editing, Markdown rendering, complex layouts with animations. Notes and AI Chat both benefit from this. It also gives us mature building blocks for editing, parsing, and rendering, while still keeping us in control of what makes Raycast feel like Raycast.
- **Extensions became simpler.** Since Node.js is now bundled in the app, you no longer need a separate download the first time you install an extension from the store. And because the app itself runs on the same tech stack as extensions (React, TypeScript, Node), building internal features feels nearly identical to building an extension.

### [What's Harder](#whats-harder)

Not everything is perfect. Here are the downsides of a more complex tech stack:

- **Higher memory baseline.** As covered in the previous section, v2 uses more memory than v1. The WebView and Node processes add a baseline cost that a fully native app doesn't have. Keeping memory low with a web tech stack is possible; it just takes more deliberate effort. We're actively working to narrow the gap and expect these numbers to come down as we exit beta.
- **Tech stack complexity.** Four runtimes (Swift or C#, Node, WebView, Rust) means more moving parts. Debugging an issue can require tracing from the React front end through IPC to the Node backend into a Rust module. Typed IPC code generation helps keep things in sync, but the stack is objectively more complex than a single-language native app.
- **Windows diversity.** Windows is a more diverse platform than macOS. Users run different OS versions, hardware configurations, and display settings — running 8 GB of RAM on a 4K monitor with an older CPU isn't unusual. Using the system WebView also means the WebView2 version can differ between machines, so we have to account for different rendering behavior and API availability. There's more surface to test and more edge cases.
- **Some native details are harder.** Things you get for free in AppKit — like certain accessibility behaviors, drag-and-drop edge cases, or IME handling — require explicit work in a WebView. We've handled the important ones, but there's a long tail of small platform behaviors to care about, and we're still working through them.
- **Window launch on demand.** In v1, windows like AI Chat and Notes stayed in memory once invoked, so they appeared instantly when you hit the hotkey. In v2, we reclaim memory from inactive windows more aggressively, which means a short delay when you cold-launch them. We're working on finding the right balance — adding a grace period to keep windows "warm" while you rapidly switch between them, but still reclaiming memory when you're not using them.

We believe these trade-offs are worth it. Not because the downsides are unimportant, but because the gains in development speed, cross-platform coverage, and hiring translate directly into a better product over time. The hard parts can be solved with engineering effort. The good parts would be hard to get any other way.

## [Future Direction](#where-we-go-from-here)

If you've made it this far, you might be expecting a conclusion about which approach is "best." That's not how we think about it. We see code as a means to an end. What matters to us is the product, not the tech stack. We are our own users—we use Raycast on every machine we own, every day. If it doesn't feel right, we won't ship it. That's the standard, and it's why this rewrite took so long.

Raycast 2.0 is now in public beta. If anything feels off, slow, or not like Raycast, please tell us. That's exactly the kind of feedback we need right now.

A quick shout-out to the team that pulled off this feat. Starting from a prototype, now it's in the hands of everyone who wants to try it. This wouldn't have been possible without an immense amount of effort and attention to detail.

Our goal is to keep pushing what desktop productivity can mean, especially at a time when AI is changing how people interact with their machines. With this new codebase, we can move fast, ship high-quality apps on both platforms, and stay close to what users actually need. There's more on the way. See you around!
