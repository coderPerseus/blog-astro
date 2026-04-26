---
title: "My First Agent Skills: auto-flow"
publishDate: "2026-04-09T16:33:39Z"
updatedDate: "2026-04-09T16:33:39Z"
tags: ["AI","agent skills"]
description: "Hi everyone, I'm luckySnail. I wonder if you, like me, find yourself doing the same repetitive browser tasks every day — like publishing content to some platform, listing products, doing research, and so on. As long as you're doing something repetitive in the browser every day, you need autoflow. Today I'm introducing autoflow. autoflow is a Skill — it lets you interact with Codex /"
---

Hi everyone, I'm luckySnail. I wonder if you, like me, go through the same repetitive browser operations every day—publishing content to platform X, listing products, doing research, whatever. If you use a browser to do the same things over and over, then you need **auto-flow**. Today I'm introducing **auto-flow**, a Skill that lets you perform browser operations by chatting with Codex / Claude Code, and records that operation flow as a workflow. Do it once, and you can reuse that workflow to repeat the task later, every time.

## What can auto-flow do?

One sentence: **turn your repetitive browser actions into one-click replayable "workflows".**

### Pre-built workflows

| Workflow | What it does |
|----------|--------------|
| Upload assets on Qianniu | Automatically opens the Qianniu backend and uploads product images |
| Ask multiple AIs simultaneously | Sends one question to ChatGPT, Gemini, Kimi, DeepSeek, and 7 other AIs |
| Translate X (Twitter) posts | Converts tweet threads into local Markdown files, auto-uploads images to an image host |
| Export articles as Markdown | One-click exports any web article to Markdown |
| Publish on WeChat Official Account | Auto-sends Markdown articles to the WeChat Official Account draft box |
| Markdown to image | Renders Markdown into watermarked image cards |

See the pattern? These are all **things you do repeatedly day to day**. Before, you had to click through everything manually. Now, one sentence gets it done.

## How does it work?

### Principle: operates the browser like a human

auto-flow is not some black magic scraper. Its approach is pretty intuitive—**it's like someone sitting next to you and helping you use the computer**.

It uses the Chrome browser you already use every day. You're already logged into Taobao, WeChat Official Account, whatever—it directly uses your existing sessions, no need to re-enter passwords.

Concretely, it has two kinds of "hands" to operate the browser:

1. **agent-browser**: looks at the page like a human, finds buttons, clicks and fills in inputs. It numbers every interactive element on the page (`@e1`, `@e2`...) and then precisely clicks or fills them.
2. **CDP operations**: lower-level, directly manipulates the webpage with code. Good for scenarios that need precise control, like batch data extraction.

Think of it like this: agent-browser is using a mouse, CDP is using code. You can mix both.

### Core concept: Workflow

The workflow is the soul of auto-flow. Think of it as a **step-by-step instruction manual** that records every step to finish a task:

```
Step 1: Open the Qianniu backend → verify: Is the URL the Qianniu address?
Step 2: Click "Media Center" → verify: Is the media list visible on the page?
Step 3: Click the upload button → verify: Did the file picker pop up?
...
```

Each step has three parts:
- **command**: what operation to perform
- **description**: what this step actually does (in plain English)
- **verify**: how to check if the step succeeded

### The clever part: it adapts when things go wrong

This is the coolest thing about auto-flow. Web pages change—the button might be on the left today, moved to the right tomorrow.

Traditional automation scripts just crash. But auto-flow doesn't:

```
Command succeeds → verification passes → move to next step ✅
Command fails ─┐
Verification fails ─┘ → AI re-examines the page, understands the current state, figures out how to proceed → verify again
```

For example: the workflow says "click the upload button", but the site got redesigned and now the button is an icon. auto-flow will rescan the page, realize "oh, that icon is the upload function", and click it.

Even better—after each execution, it **reviews and summarizes**:

- Which steps succeeded on the first try? Keep them.
- Which steps needed a "workaround"? Update the workflow with the workaround.
- More than half the steps failed? The site probably had a major redesign—suggest re-recording.

This means **the workflow gets more accurate over time**, kind of like the AI is "learning" how the site changes.

## How to install and use it?

### Installation (3 steps)

**Prerequisite: you need Claude Code installed first.**

1. Install the auto-flow skill:
```bash
npx skills add https://github.com/coderPerseus/auto-flow
```

2. Make sure you have Node.js 22+ and install agent-browser:
```bash
npm i -g agent-browser
```

3. Enable Chrome remote debugging:
   - Enter `chrome://inspect/#remote-debugging` in Chrome's address bar
   - Check **Allow remote debugging for this browser instance**
   - You may need to restart the browser

### Usage (just speak)

Once installed, use natural language in Claude Code:

```
# See what workflows are available
"What workflows do I have?"

# Run an existing workflow
"Run the 'Ask multiple AIs' workflow, question: What is quantum computing?"

# Create your own workflow
"Create a workflow: auto-sign in to XX website every day"

# Update an existing workflow
"Re-run the 'Upload assets on Qianniu' workflow and update it"
```

### Creating your own workflow

This is the most fun part of auto-flow. You don't need to write any code—just **chat with the AI** and tell it what you want to automate:

1. You say: "Create a workflow that does XX on YY website"
2. The AI tries each step in the browser
3. As it succeeds, it records each step
4. Once everything works, it saves it as a workflow file
5. Later, you say "Run XX workflow" and it replays automatically

It's like giving the AI a "demonstration"—it remembers and can do it on its own.

## Pros and cons

### Pros

**1. Truly "no-code" automation**

No need to learn Python, no web scraping skills required. Just describe what you want in natural language, and the AI records the workflow. Very beginner-friendly for non-technical people.

**2. Uses your own browser—no re-login**

Many automation tools require you to put account credentials in a config file (insecure) or log in again in a new browser (inconvenient). auto-flow uses your everyday Chrome, with all your sessions ready.

**3. Intelligent error handling—unfazed by site changes**

Traditional scripts break on site updates. auto-flow has the AI as a fallback, adapting to the actual page state. And after each run it self-improves, recording effective fixes.

**4. Workflows are shareable and reusable**

Each workflow is a plain Markdown file. You can share it with others, or publish it on GitHub for more people to benefit.

**5. Supports parallel execution**

Need to handle multiple pages at once (like asking 7 AIs simultaneously)? auto-flow can open multiple tabs and process them in parallel—much faster than you manually switching tabs.

### Cons

**1. Requires some technical know-how to install**

While using it requires no coding, the installation involves the command line, Node.js, and configuring Chrome debugging. That first step might trip up absolute beginners. I'd suggest asking a tech-savvy friend to help you set it up once.

**2. Stability depends on the target website**

Even with intelligent fallback, if the site undergoes a massive redesign or has strong anti-bot measures (CAPTCHA, human detection), auto-flow might fail. In that case you'd need to step in manually or re-record the workflow.

**3. Not super fast**

Because it "acts like a human" (loads pages, waits for content, finds elements, clicks...), it's slower than calling an API directly. If you need to process thousands of records, it might not be the best choice.

**4. Be security-conscious**

It operates inside your real browser and can theoretically do anything you can do. Although it has safety limits (won't touch your existing tabs, won't close the browser), you're still letting an AI handle your accounts—make sure you understand what it's doing.

## Who is it for?

| You are... | Recommendation | Why |
|------------|----------------|-----|
| E-commerce operator (frequently upload assets, list products) | ⭐⭐⭐⭐⭐ | Designed exactly for you |
| Content creator (multi-platform distribution) | ⭐⭐⭐⭐⭐ | One-click publish to WeChat Official Account, export articles—too good |
| AI enthusiast (compare answers from multiple AIs) | ⭐⭐⭐⭐ | The multi-AI simultaneous query feature is very practical |
| Developer (want to automate testing or data collection) | ⭐⭐⭐⭐ | More convenient than writing scraping scripts, but has performance limits |
| Absolute beginner (never used command line) | ⭐⭐ | Installation has a learning curve; ask someone for help |

## Comparison with other automation tools

| Feature | auto-flow | Selenium/Playwright | Browser extensions (e.g., iMacros) |
|---------|-----------|---------------------|------------------------------------|
| Need to code | No | Yes | No |
| Intelligent error handling | AI adapts | None | None |
| Learning curve | Medium (installation) | High | Low |
| Self-improvement | Yes | No | No |
| Large-scale data processing | Average | Strong | Average |
| Login state | Reuse existing | Must configure | Reuse existing |

## Final thoughts

The core idea of auto-flow is simple: **let AI handle your repetitive browser labor.**

It's not perfect—installation has a barrier, it's not lightning fast, and it can get stuck against strong anti-bot measures. But in the scenarios it's good for (daily repetitive web tasks, multi-platform content distribution, information gathering), it can save you a ton of time.

If you find yourself doing the same browser operations day after day, give it a try. Record once, reuse over and over, and it only gets more accurate—that's the beauty of auto-flow.

---

> GitHub: https://github.com/coderPerseus/auto-flow
>
> Install command: `npx skills add https://github.com/coderPerseus/auto-flow`
