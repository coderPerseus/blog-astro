---
title: "Codex Gets Slower with Use: Root Cause Found and Fixed"
publishDate: "2026-05-21T11:00:58Z"
updatedDate: "2026-05-21T11:06:23Z"
tags: ["AI"]
description: "Recently, many people have been running into a common issue: in the past, hitting the key to launch Codex would get you in almost instantly, but now startup keeps getting slower, with the terminal stuck on a bunch of \"Booting MCP server...\" and \"Starting MCP servers...\" messages.\n\nAfter some investigation, it turns out neither the main Codex process nor the model is the bottleneck — the real problem is that it pulls in too many surrounding services when it starts.\n\nYou can Codex C"
---

Recently, many people have noticed a phenomenon: before, tapping `codex` would get you in quickly, but now startup is getting slower and slower, with the terminal stuck on a bunch of `Booting MCP server...` and `Starting MCP servers...` messages.

After some investigation, it turns out that neither the Codex main program nor the model itself is slow — it's that Codex pulls in too many surrounding services when starting up.

Think of Codex CLI as an editor. The editor itself opens fast, but if you've loaded a bunch of plugins that each start a browser plugin, a cloud service plugin, a design tool plugin, a filesystem plugin on every launch, startup naturally becomes slow.

## What's really happening at startup

Run:

```bash
codex --dangerously-bypass-approvals-and-sandbox
```

Codex does roughly the following during startup:

1. Reads `~/.codex/config.toml`
2. Reads login state and local database
3. Loads skills
4. Loads plugins
5. Starts MCP servers
6. Starts built-in Apps / Connectors
7. Enters the TUI interface

The first few steps are usually fast. The biggest slowdowns come at steps 5 and 6 — the various MCP services.

MCP can be thought of as Codex's external tool interface. For example, letting Codex control a browser, call Cloudflare, manipulate desktop applications, read design tools — many of these capabilities come through MCP.

## Why does it get slower over time

At first, you might just have a bare CLI. Then you add browser, Playwright, Chrome DevTools, Computer Use, Cloudflare, GitHub, Notion, Pencil, all sorts of plugins. Each addition adds one more startup item.

It's like booting up a computer. When it's new, it's fast. Later, you set WeChat, Feishu, cloud drives, Docker, proxies, input methods, and various sync software to auto-start. Of course, booting gets slower and slower. Codex is the same.

For example, a config like this:

```toml
[mcp_servers.playwright]
command = "npx"
args = ["@playwright/mcp@latest"]

[mcp_servers.chrome-devtools]
command = "npx"
args = ["-y", "chrome-devtools-mcp@latest", "--autoConnect"]

[mcp_servers.pencil]
command = "/Applications/Pencil.app/Contents/Resources/app.asar.unpacked/out/mcp-server-darwin-arm64"
args = ["--ws-port", "49458"]
```

Every time Codex starts, it may try to launch these services.

If some use `npx ...@latest`, the startup also goes through npm/npx's resolution pipeline. Even if the package is cached, it's still slower than executing a local fixed path directly.

## Most common slowdown points

1. Too many MCP services: clean up unused MCP periodically
2. Remote service login expired: if an MCP service requires login, an expired session can also slow down startup
3. Local service unreachable: for example, my Pencil MCP kept showing: `failed to connect WebSocket: dial tcp [::1]:49458: connect: connection refused` — this took a few seconds
4. `npx @latest` is slow on every startup

A config like this:

```toml
command = "npx"
args = ["@playwright/mcp@latest"]
```

is convenient, but the downside is that startup isn't snappy.

A better approach is to install the package locally and configure it with a fixed version or fixed path. That way, Codex doesn't have to ask npm every time: where's the latest package, does resolution need to happen, did the cache hit.

## How to quickly tell if MCP is slowing things down

Try a lightweight bash test:

```bash
codex --disable apps --disable plugins \
  -c 'mcp_servers.playwright.enabled=false' \
  -c 'mcp_servers.chrome-devtools.enabled=false' \
  -c 'mcp_servers.pencil.enabled=false' \
  --dangerously-bypass-approvals-and-sandbox
```

If this is noticeably faster, you've confirmed the bottleneck is in Apps, Plugins, or MCP — not the Codex main program.

This command doesn't modify your config file; it just temporarily disables things for this run.

## Solutions for slowness

First, list what you have:

```bash
codex mcp list
```

Then check details for a service:

```bash
codex mcp get playwright
codex mcp get chrome-devtools
codex mcp get cloudflare-api
```

Remove unused ones:

```bash
codex mcp remove playwright
codex mcp remove chrome-devtools
codex mcp remove pencil
```

If a login expired, re-login:

```bash
codex mcp login cloudflare-api
```

If you just want to temporarily skip loading plugins, start like this:

```bash
codex --disable plugins
```

If you don't want Apps either:

```bash
codex --disable apps --disable plugins
```

If you only want to skip certain MCPs for this launch, use:

```bash
codex -c 'mcp_servers.playwright.enabled=false'
```

## A bad SKILL.md can also ruin the experience

Sometimes you'll see this at startup:

```text
Skipped loading 2 skill(s) due to invalid SKILL.md files
```

This type of problem is usually not the biggest slowdown, but it clutters the startup output and may repeat warnings.

If you see specific paths, for example:

```text
/Users/xxx/.agents/skills/url-design-kit/SKILL.md
/Users/xxx/code/personal/debug/SKILL.md
```

Go fix the YAML frontmatter in those two files. A valid `SKILL.md` header typically looks like:

```markdown
---
name: xxx
description: xxx
---
```

If the `---` is missing or the YAML is malformed, Codex will skip it.

## The most practical long-term strategy

I recommend splitting Codex's tools into two categories.

Common tools stay auto-start. Low-frequency tools — like Cloudflare, Pencil, Playwright, Chrome DevTools — should not start by default. Enable them on demand, and prepare two startup commands.

Daily lightweight version:

```bash
codex --dangerously-bypass-approvals-and-sandbox --disable apps --disable plugins \
  -c 'mcp_servers.playwright.enabled=false' \
  -c 'mcp_servers.chrome-devtools.enabled=false' \
  -c 'mcp_servers.pencil.enabled=false'
```

Full-featured version:

```bash
codex --dangerously-bypass-approvals-and-sandbox
```

This way, daily startup is fast. When you need browser, Cloudflare, or design tools, use the full mode.

## Summary

Treat Codex, Claude Code, and similar tools as your partner. When you make them do more, and they do it for a long time, issues can arise. At that point, you need to care for them — clean up unnecessary stuff — so they can keep working well. I plan to develop an agent-docker skills later, enabling AI agents to repair themselves.

Thanks for reading.
