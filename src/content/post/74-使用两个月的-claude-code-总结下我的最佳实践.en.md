---
title: "My best practices after two months with Claude Code"
publishDate: "2025-07-20T08:59:20Z"
updatedDate: "2026-07-16T01:22:38Z"
tags: ["AI","教程"]
description: "Hi everyone, I'm luckySnail, and I've been using Claude Code for over two months now! Thanks to my company's support, I got access to what's currently the most powerful coding tool out there. With Claude Code, my development productivity has genuinely doubled! Claude Code is a coding assistant integrated into the terminal (a CLI tool), powered by Anthropic's own strongest model, Sonnet 4, and"
---

Hi everyone, I'm luckySnail, and I've been using Claude Code for over two months now! Thanks to my company's support, I got access to what I consider the most powerful coding tool out there. With Claude Code, my development productivity has genuinely doubled! Claude Code is a terminal-integrated coding assistant (CLI tool) powered by Anthropic's own top-tier Sonnet 4 and Opus 4 large models. Let's take a look at how to use it! I'll walk you through the following steps to get you up to speed with Claude Code quickly:

- How to install
- Getting started
- Advanced usage
- Real-world project experience
- Summary and references

## Installation

> You'll need Node.js > 18

```bash
# install
npm i -g @anthropic-ai/claude-code
# valid install 
claude -v
```

If it prints a version number, the installation was successful! Now let's move on to usage (you'll need to have your own API access ready, otherwise running `claude` will throw a 403 error).

## Getting Started

Think of Claude Code as your AI coding assistant right in the terminal. To use it, navigate to your project directory (or create a new project folder), then run the following in your terminal (the first time you run `claude`, it will install the necessary plugins for better coding assistance):

```bash
claude 
# You can also run claude xxx, i.e., claude [prompt] - sends a prompt directly to Claude
```

Here are some common commands for this CLI tool:

```bash
update: Updates the Claude CLI to the latest version
mcp: Configure and manage MCP services
--dangerously-skip-permissions: Auto-confirms, skipping confirmation prompts when executing commands. Useful for long-running tasks, but it's a risky operation
--add-dir <directories...> - Adds additional directories that tools are allowed to access
-c, --continue - Continues the most recent conversation
-r, --resume [sessionId] - Resumes a conversation - you can provide a session ID or interactively select one to resume
```

Once Claude is running, there are also several commands and shortcuts you can use:

```bash
# Exit the current execution - use this to terminate a running command
ESC
# Exit Claude Code
command + c (twice)
# Initialize the project, build the project index, and generate CLAUDE.md
/init
# Reference a file (@ + filename), adding the current file to the context
@xxx
# Add a memory note - type # followed by your memory content, which can be configured as project/user memory
`# xxx`
# Clear the context
/clear
# Compact the context
/compact
# Claude configuration - theme, to-do list usage, prompts, model selection, etc.
/config
# View costs
/cost
# View status - version, model, working directory, etc.
/status 

```

## Advanced Usage

```bash
# Manage MCP
/mcp
# Manage memory
/memory
# Hooks system - allows you to run custom shell commands at specific points during Claude Code's processing
/hooks
# Resume a conversation
/resume
# Configure an alias
alias cc="claude --dangerously-skip-permissions"
```

## Real-World Project Experience

Here are some lessons I've learned from using Claude Code (cc for short) in production development:

1. When cc starts, it prompts you to install the corresponding editor plugin. Once installed, cc can detect the currently open directory, quickly add context to cc, and even let you view changes directly in your code.
2. Don't hesitate to use `claude --dangerously-skip-permissions` — cc has put a lot of effort into safety.
3. After completing each small requirement, commit to Git. More precisely, after every conversation ends, stage your changes in Git to keep your working directory clean. That way, if cc's updates go wrong, you can quickly roll back.
4. Review code: cc has strong Git capabilities. You can ask it to use `git diff` for code reviews.
5. For complex requirements, break them down, confirm the plan, and then develop. While cc has a todo feature, it tends to create todos and execute them right away, which isn't ideal for complex tasks. Instead, have it draft a plan first, confirm it with you, and then proceed step by step. This significantly reduces issues caused by going in the wrong direction.
6. Search the web and think deeply. Tell it to search the web, and it will look up information first. Add "ultrathink" at the end, and it will engage in deeper reasoning.
7. Launch multiple subtasks in parallel. cc can spin up multiple subagents on its own without third-party tools — just add the magic phrase: YOU MUST use subagents in parallel to speed up the progress.
8. Clear the context. Often, a new question has nothing to do with the previous one. In that case, run `/clear` to wipe the context; otherwise, the existing context might skew the answer to your new question. Every new question should start with a fresh context or a new conversation.
9. If cc fails at something twice, don't keep pushing it — just do it yourself.
10. cc has a solid memory system. If you have rules specific to a project or across all projects, you can record them with `/memory`.
11. cc isn't just about getting work done better — it's also incredibly useful for learning. Beyond that, you can get creative and have it organize your folders, search and compile web content, write articles, and more.
12. `npx ccusage` shows you your usage stats, so you can tell whether you're getting your money's worth! Oh, and try to use Opus whenever possible for the best development experience.

All in all, cc is a powerful CLI tool that can invoke a ton of commands to help it tackle various tasks. To me, it feels like a martial arts master — great for solving tough problems. For simpler issues, you can use Cursor. Combining Cursor's smooth Tab completion with Claude Code's ability to handle complex problems can massively boost our development efficiency. As large models keep improving, AI coding tools will only get more capable. We have to ask ourselves every day: "If writing code is no longer the hard part, where does your competitive edge lie?"

## References

1. Claude Code reverse engineering research: https://github.com/shareAI-lab/analysis_claude_code
2. Claude Code guide: https://github.com/zebbern/claude-code-guide
3. Command: https://claude.ai/public/artifacts/e2725e41-cca5-48e5-9c15-6eab92012e75
4. Official guide: https://docs.anthropic.com/zh-CN/docs/intro
