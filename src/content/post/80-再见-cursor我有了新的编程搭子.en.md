---
title: "Goodbye Cursor, I have a new coding buddy!"
publishDate: "2025-10-02T13:33:12Z"
updatedDate: "2025-10-02T13:33:12Z"
tags: ["AI"]
description: "Since Cursor was officially released in 2023, I've been using it—now over two years! It gained popularity through Tab completion, and with its Agent capability, it made me ditch VSCode completely. But now I'm about to abandon Cursor! Because its recent pricing strategy has become increasingly strict—everything is pay-as-you-go, and the credits burn through extremely fast, barely lasting. It keeps me constantly worrying about running out while coding."
---

I started using Cursor back in 2023 when it officially launched, and it's been over two years now! Cursor made its name with the Tab feature, and its Agent capability is what finally made me ditch VSCode. But now I'm about to ditch Cursor! Their recent pricing policies are getting increasingly restrictive—everything is usage-based, and the quota burns through so fast it barely helps. It constantly leaves me worrying about running out of credits during development.

## From industry darling to community outcast

![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/20251002203050.png)

For a long time, Cursor Pro's pricing was a model of industry goodwill: $20 per month gave you roughly 500 fast requests (usually for calling cutting-edge models like GPT-4) plus unlimited slower requests. The model was clear, transparent, and let me integrate AI into every part of my daily development without worry. It wasn't just a tool—it was like a tireless, ever-ready programming partner.

But everything changed on June 16, 2025. The Cursor team announced a major pricing overhaul. They replaced the old "request count" model with a dollar-based "usage pool" system. The new Pro plan, while still nominally $20/month, only includes $20 worth of "frontier model" usage credits.

I understand that Cursor couldn't sustain the massive API costs, but as a regular user, I feel cheated. Cursor took away what was rightfully mine. Sure, Cursor's Tab feature is still irreplaceable by any other product right now, but that's not enough to convince me to pay $20 a month just for auto-tab. And more importantly, after trying other AI coding tools, looking at Cursor's current Agent output quality, it's not even on the same level. So, goodbye 👋!

## My new Vibe Coding setup

Here's my new Vibe Coding stack, which I believe is the best choice for ordinary developers right now:
- ChatGPT Plus
    - Codex lightweight quota; if used sparingly, it's enough
    - Codex cloud coding — my go-to for simple tasks, excellent experience, I think it's the future paradigm of programming
- Warp: integrates multiple large models into a modern terminal with editing experience comparable to native code editors
- VSCode: you always need a coding tool, and VSCode is still the no-brainer choice. I used Zed for a while too, but it still feels immature
- Claude Code + GLM-4.6: Zhipu's latest model is incredibly powerful and fast; integrated with Claude it's really smooth
- Neovate: when I need to use multiple models and debug their output, this is my go-to—works great!

And lastly, here are some handy MCP tools I've been using recently:
1. chrome-devtools: officially released by Google, provides Coding Agents with direct control over Chrome browser, supporting debugging web pages, inspecting DOM, monitoring network requests, viewing Console logs, performance profiling, etc.
2. playwright: the MCP extension for the Playwright browser automation framework maintained by Microsoft. It calls Playwright APIs within the MCP environment to automate browser actions like clicking, typing, screenshots, navigation, etc. Use it for end-to-end testing, web scraping, UI automation verification.
3. context7: provides AI coding assistants with the **latest and most accurate code documentation**
4. Figma: directly access structural info from Figma files, components, and design drafts via MCP, then convert it to code

Thanks for reading! If you have any great Vibe Coding tips or useful AI coding tools, feel free to share!

Oh, and Happy National Day!
