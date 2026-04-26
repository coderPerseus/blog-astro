---
title: "My Best Practices After Two Months of Using Claude Code"
publishDate: "2025-07-20T08:59:20Z"
updatedDate: "2025-07-20T08:59:20Z"
tags: ["AI","教程"]
description: "Hi everyone, I'm luckySnail, and I've been using Claude Code for over two months now! Thanks to my company's support, I got to use what is currently the most powerful coding tool out there. Since getting Claude Code, my development efficiency has truly doubled! Claude Code is a programming assistant integrated into the terminal (a CLI tool) that uses Anthropic's own strongest model, Sonnet 4, and"
---

Hi everyone, I'm luckySnail, and I've been using Claude Code for over two months now! Thanks to my company's support, I got access to the most powerful coding tool currently available. With Claude Code, my development productivity has truly doubled! Claude Code is a terminal-integrated programming assistant (CLI tool) powered by Anthropic's strongest models — Sonnet 4 and Opus 4. Let's take a look at how to use it! I'll introduce it in the following order to help you get started quickly with Claude Code:

- How to install
- Getting started
- Advanced usage
- Practical project experience
- Summary and references

## Installation

> You need Node.js 18 or higher

```bash
# install
npm i -g @anthropic-ai/claude-code
# valid install 
claude -v
```

If the version number is printed, installation succeeded! Now let's start using it (you need to prepare your own tools, otherwise running `claude` will give a 403 error).

## Getting started

You can think of Claude Code as an AI coding assistant in your terminal. To use it, navigate to your project directory (or create a new project folder), open the terminal, and enter (the first time you type `claude`, it will install the corresponding plugins for better coding assistance):

```bash
claude 
# You can also type claude xxx, i.e.: claude [prompt] - send a prompt directly to Claude
```

Here are the common commands for this CLI tool:

```bash
update: update the Claude CLI to the latest version
mcp: manage MCP service configuration
--dangerously-skip-permissions: auto-confirm, skipping confirmation prompts before executing commands. Useful for long-running tasks, but it's a dangerous operation
--add-dir <directories...> - add extra directories for the tool to access
-c, --continue - continue the most recent conversation
-r, --resume [sessionId] - resume a conversation - provide a session ID or interactively choose which conversation to resume
```

Once you launch Claude, there are also many commands and shortcuts you can use:

```bash
# Exit the current execution. Use this when you want to terminate a running command.
ESC
# Exit Claude Code
command + c (twice)
# Initialize the project, build a project index, and generate CLAUDE.md
/init
# Reference a file (@ + filename), adding the current file to the context
@xxx
# Add a memory. Type # followed by your memory content. Can be configured as project / user memory.
`# xxx`
# Clear context
/clear
# Compact context
/compact
# Claude configuration - configure themes, whether to use to-do lists, prompts, model selection, etc.
/config
# View costs
/cost
# View status, including version, model, working directory
/status 

```

## Advanced usage

```bash
# Manage MCP
/mcp
# Manage memories
/memory
# Hooks system - allows you to execute custom shell commands at specific points during Claude Code processing.
/hooks
# Resume a conversation
/resume
# Configure an alias
alias cc="claude --dangerously-skip-permissions"
```

## Practical project experience

Here are some of my experiences using Claude Code (abbreviated as `cc`) in production development!

1. When `cc` starts, it prompts you to install the corresponding editor plugin. Once installed, `cc` can detect the currently open directory, quickly add context to `cc`, and even let you view changes directly in the code.
2. Feel free to use `claude --dangerously-skip-permissions`, because `cc` has made significant efforts in terms of safety.
3. After completing each small requirement, you should commit to Git. More precisely, after each conversation ends, you should stage your changes in Git so the working directory stays clean. This way, if `cc`'s updates go wrong, you can quickly revert.
4. Review code: `cc` has strong Git capabilities. You can ask it to use `git diff` for code reviews.
5. Break down complex requirements, confirm them, then develop. Although `cc` has a to-do list feature, it tends to create a to-do list and then immediately execute it. This doesn't work well for complex requirements. For complex requirements, you can ask it to first create a plan, confirm it with you, and then proceed to the next step. This greatly reduces issues caused by wrong directions.
6. Search the web and think deeply. Tell it to search the web, and it will first look up information. Append `ultrathink`, and it will think deeply.
7. Launch multiple sub-tasks in parallel. `cc` is capable of launching multiple subagents in parallel by itself, without third-party tools. Just add the magic phrase: `YOU MUST use subagents in parallel to speed up the progress.`
8. Clear context. Often, a new question is unrelated to the previous one. In that case, you should run `/clear` to clear the context. Otherwise, the current context might affect the answer to the new question. For each new question, you should either clear the context or start a new conversation.
9. If `cc` can't do something right after two tries, don't ask it again — just do it yourself!
10. `cc` has a good memory system. If you have any rules specific to a project or across all projects, you can use `/memory` to record them.
11. `cc` is not only good at helping you get your work done, but also very useful for learning. Besides learning, you can also get creative and ask it to organize folders, search the web and organize content, write articles, and so on.
12. `npx ccusage` lets you see your usage, so you know if you're getting your money's worth! Oh, and try to use Opus as much as possible for the best development experience.

In short, `cc` is a powerful CLI tool that can call upon many commands to help it accomplish various tasks. In my view, it's like a martial arts master — it's great for solving difficult problems. For simple problems, you can use Cursor. By combining Cursor's smooth tab completion with Claude Code's powerful complex problem-solving ability, we can greatly boost our development efficiency. As large model capabilities continue to improve, AI coding tools will only get stronger. We have to ask ourselves every day: "If writing code is no longer the hard part, where does your competitive edge lie?"

## References

1. Claude Code reverse engineering research: https://github.com/shareAI-lab/analysis_claude_code
2. Claude Code guide: https://github.com/zebbern/claude-code-guide
3. Commands: https://claude.ai/public/artifacts/e2725e41-cca5-48e5-9c15-6eab92012e75
4. Official guide: https://docs.anthropic.com/en/docs/intro
