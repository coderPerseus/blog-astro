---
title: "Anthropic Officially Releases Claude Code Best Practices"
publishDate: "2025-04-20T01:59:01Z"
updatedDate: "2025-04-20T01:59:01Z"
tags: ["AI","AI 提示词"]
description: "Hi everyone, I'm luckySnail. Just yesterday the Anthropic team published their curated \"Claude Code: Best Practices for Agentic Coding\" at: https://www.anthropic.com/engineering/claudecodebestpractices\n\nBelow is the reviewed translation. Let's see how to do better AI programming."
---

Hi everyone, I'm luckySnail. Just yesterday, the Anthropic team released their curated *Claude Code: Best Practices for Agentic Coding*, original article: https://www.anthropic.com/engineering/claude-code-best-practices

Below is the verified translation. Let's see how to do AI programming better!

---

We recently [released Claude Code](https://www.anthropic.com/news/claude-3-7-sonnet), a command-line tool for agentic coding. Developed as a research project, Claude Code provides a more native way for Anthropic engineers and researchers to integrate Claude into their coding workflows.

Claude Code is intentionally designed to be low-level and unopinionated, offering near-raw access to the model without forcing users into a specific workflow. This design philosophy creates a powerful tool that is flexible, customizable, scriptable, and safe. While powerful, this flexibility means there's a learning curve for engineers new to agentic coding tools — at least until they've developed their own best practices.

This article outlines some general patterns that have proven effective, both for teams inside Anthropic and for external engineers using Claude Code across various codebases, languages, and environments. Nothing on this list is set in stone or universally applicable; treat these suggestions as starting points. We encourage you to experiment and find what works best for you!

Want more details? Our comprehensive documentation at [claude.ai/code](https://claude.ai/code) covers all features mentioned here, with additional examples, implementation details, and advanced tips.

## 1. Customize Your Setup

Claude Code is an agentic coding assistant that automatically pulls context into its prompt. This context gathering process consumes time and tokens, but you can optimize it by adjusting your environment.

### a. Create a CLAUDE.md file

`CLAUDE.md` is a special file whose contents are automatically pulled into context when Claude starts a conversation. This makes it an ideal place to document:

-   Commonly used bash commands
-   Core files and utility functions
-   Code style guidelines
-   Testing instructions
-   Repository conventions (e.g., branch naming, merge vs rebase, etc.)
-   Developer environment setup (e.g., pyenv usage, which compilers are available)
-   Any project-specific unexpected behavior or gotchas
-   Other information you want Claude to remember

There is no required format for `CLAUDE.md`. We recommend keeping it concise and human-readable. For example:

```bash
# Bash commands
- npm run build: Build the project
- npm run typecheck: Run the typechecker

# Code style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')

# Workflow
- Be sure to typecheck when you’re done making a series of code changes
- Prefer running single tests, and not the whole test suite, for performance
```

You can place `CLAUDE.md` files in several locations:

-   **Root of your repository**, or the directory where you run the `claude` command (most common usage). Name it `CLAUDE.md` and commit it to git for sharing across sessions and team members (recommended), or name it `CLAUDE.local.md` and add it to `.gitignore`.
-   **Any parent directory of the directory where you run `claude`**. This is most useful for monorepos with multiple projects, where you might run `claude` in `root/foo` and have `CLAUDE.md` files both at `root/CLAUDE.md` and `root/foo/CLAUDE.md`. Both files will be automatically pulled into context.
-   **Any subdirectory of the directory where you run `claude`**. This is the reverse of above, where Claude pulls `CLAUDE.md` files on demand when you work with files in that subdirectory.
-   **Your home folder** (`~/.claude/CLAUDE.md`), which applies to all your `claude` sessions.

When you run the `/init` command, Claude will automatically generate a `CLAUDE.md` file for you.

### b. Refine your CLAUDE.md files

Your `CLAUDE.md` files become part of Claude's prompt, so they should be iteratively refined like any frequently used prompt. A common mistake is adding a lot of content without verifying its effectiveness. Take time to experiment and determine what helps the model best follow instructions.

You can manually add content to `CLAUDE.md`, or press `#` to give Claude an instruction, and it will automatically incorporate that instruction into the relevant `CLAUDE.md`. Many engineers use `#` frequently while coding to document commands, files, and style guides, then include the `CLAUDE.md` changes in their commits so team members benefit too.

At Anthropic, we occasionally use a [prompt improver](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-improver) on `CLAUDE.md` files and often tweak instructions (e.g., using "IMPORTANT" or "YOU MUST" for emphasis) to improve adherence.

![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/20250419191653.png)

_Figure: Claude Code tool allowlist settings interface_

### c. Manage Claude's allowed tool list

By default, Claude Code asks for permission on any operation that could modify your system: file writes, many bash commands, MCP tools, etc. We deliberately took this conservative approach in designing Claude Code to prioritize safety. You can customize the allowlist to allow additional tools you know are safe, or potentially unsafe ones that are easy to undo (e.g., file edits, `git commit`).

There are four ways to manage allowed tools:

-   Choose **"Always allow"** when prompted during a session.
-   Use the **`/allowed-tools` command** after starting Claude Code to add or remove tools from the allowlist. For example, you can add `Edit` to always allow file edits, `Bash(git commit:*)` to allow git commits, or `mcp__puppeteer__puppeteer_navigate` to allow navigation with the Puppeteer MCP server.
-   **Manually edit** your `.claude/settings.json` or `~/.claude.json` (we recommend checking the former into source control to share with your team).
-   Use the **`--allowedTools` command-line flag** for session-specific permissions.

### d. If using GitHub, install the gh CLI

Claude knows how to use the `gh` CLI to interact with GitHub: creating issues, opening pull requests, reading comments, etc. Without `gh` installed, Claude can still use GitHub APIs or an MCP server if you have one configured.

## 2. Give Claude More Tools

Claude has access to your shell environment, where you can build a set of convenience scripts and functions for it, just like for yourself. It can also leverage more complex tools via MCP and REST APIs.

### a. Using Claude with bash tools

Claude Code inherits your bash environment, giving it access to all your tools. While Claude knows about common utilities like Unix tools and `gh`, it won't know your custom bash tools without instruction:

1.  Tell Claude the tool name and an example of its usage
2.  Tell Claude to run `--help` to view tool documentation
3.  Document commonly used tools in `CLAUDE.md`

### b. Using Claude with MCP

Claude Code acts as both an MCP server and client. As a client, it can connect to any number of MCP servers to access their tools in three ways:

-   **In the project config** (available when running Claude Code in that directory)
-   **In the global config** (available across all projects)
-   **In a checked-in `.mcp.json` file** (available to anyone working in your codebase). For example, you can add Puppeteer and Sentry servers to your `.mcp.json` so every engineer working in your repo can use these tools out of the box.

When using MCP, starting Claude with the `--mcp-debug` flag can also help identify configuration issues.

### c. Using custom slash commands

For repetitive workflows—debugging loops, log analysis, etc.—store prompt templates in Markdown files inside the `.claude/commands` folder. These templates become available via the slash command menu when you type `/`. You can check these commands into git to make them available to rest of your team.

Custom slash commands can include the special keyword `$ARGUMENTS` to pass arguments from the command invocation.

For example, here's a slash command that can automatically pull and fix a GitHub issue:

```
Please analyze and fix the GitHub issue: $ARGUMENTS.

Follow these steps:

1. Use `gh issue view` to get the issue details
2. Understand the problem described in the issue
3. Search the codebase for relevant files
4. Implement the necessary changes to fix the issue
5. Write and run tests to verify the fix
6. Ensure code passes linting and type checking
7. Create a descriptive commit message
8. Push and create a PR

Remember to use the GitHub CLI (`gh`) for all GitHub-related tasks.
```

Place the above in `.claude/commands/fix-github-issue.md` to make it available as the `/project:fix-github-issue` command in Claude Code. Then you could, for example, use `/project:fix-github-issue 1234` to have Claude fix issue #1234. Similarly, you can add your own personal commands to the `~/.claude/commands` folder for use across all sessions.

## 3. Try Common Workflows

Claude Code doesn't impose a specific workflow, giving you the flexibility to use it your way. Within the space this flexibility provides, several patterns of successful Claude Code usage have emerged from our user community:

### a. Explore, plan, code, commit

This general workflow works for many problems:

1.  **Have Claude read relevant files, images, or URLs** with general guidance ("read the file that handles logging") or specific filenames ("read logging.py"), but explicitly tell it not to write any code yet.
    1.  This part of the workflow is where you should especially consider using subagents, particularly for complex problems. Having Claude use subagents to verify details or investigate specific questions—especially early in the conversation or task—often preserves context budget without sacrificing too much efficiency.
2.  **Have Claude create a plan to solve the specific problem.** We recommend using the word "think" to trigger extended thinking mode, which gives Claude extra compute time to more thoroughly evaluate alternatives. These specific phrases map directly to increasing thinking budget levels in the system: "think" < "think hard" < "think harder" < "ultrathink". Each level allocates an increasing thinking budget for Claude to use.
    1.  If the result of this step looks reasonable, you can have Claude create a document or a GitHub issue with its plan, so you can reset to this point if the implementation (step 3) doesn't meet your requirements.
3.  **Have Claude implement its solution in code.** This is also a good time to have Claude explicitly verify its solution as it implements various parts.
4.  **Have Claude commit the result and create a pull request.** If relevant, this is also a good time to have Claude update any READMEs or changelogs, explaining what it just did.

Steps #1–#2 are critical—without them, Claude tends to jump straight into coding a solution. While sometimes that's what you want, asking Claude to research and plan first can significantly improve performance for problems that need deeper upfront thinking.

### b. Write tests, commit; code, iterate, commit

This is one of the favorite workflows inside Anthropic, suitable for changes that can be easily verified with unit tests, integration tests, or end-to-end tests. Test-driven development (TDD) becomes even more powerful with agentic coding:

1.  **Have Claude write tests based on expected input/output.** Clearly state that you're doing test-driven development, so it will avoid creating mock implementations, even for functionality that doesn't yet exist in the codebase.
2.  **Tell Claude to run the tests and confirm they fail.** Explicitly telling it not to write any implementation code at this stage is often helpful.
3.  When you're happy with the tests, **have Claude commit the tests**.
4.  **Have Claude write the code to pass the tests**, instructing it not to modify the tests. Tell Claude to keep going until all tests pass. It usually takes several iterations where Claude writes code, runs tests, adjusts code, then runs tests again.
    1.  During this phase, having it use independent subagents to verify the implementation isn't overfitting the tests can be helpful.
5.  When you're happy with the changes, **have Claude commit the code**.

Claude performs best when it has a clear target to iterate against—a visual model, a test case, or other output. By providing an expected output like tests, Claude can make changes, evaluate results, and progressively improve until successful.

### c. Write code, screenshot result, iterate

Similar to the test workflow, you can provide Claude with a visual target:

1.  **Give Claude a way to take a screenshot of the browser** (e.g., using the [Puppeteer MCP server](https://github.com/modelcontextprotocol/servers/tree/c19925b8f0f2815ad72b08d2368f0007c86eb8e6/src/puppeteer), [iOS Simulator MCP server](https://github.com/joshuayoes/ios-simulator-mcp), or manually copy/paste screenshots to Claude).
2.  **Give Claude a visual mock** by copying/pasting or dragging an image, or providing an image file path.
3.  **Have Claude implement the design in code**, take a screenshot of the result, and iterate until the result matches the mock.
4.  When you're satisfied, **have Claude commit**.

Like humans, Claude's output usually improves significantly with iteration. While the first version might be okay, it often looks much better after 2–3 iterations. Give Claude tools that let it see its own output for best results.

![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/20250419191950.png)

_Figure: Using Safe YOLO mode in an isolated container_

### d. Safe YOLO mode

You can let Claude work unsupervised by using `claude --dangerously-skip-permissions` to bypass all permission checks, allowing Claude to work uninterrupted until completion. This works great for workflows like fixing lint errors or generating boilerplate code.

**Warning:** Letting Claude run arbitrary commands is risky and can lead to data loss, system corruption, or even data leakage (e.g., through prompt injection attacks). To minimize these risks, use `--dangerously-skip-permissions` in a container without internet access. You can follow this [reference implementation](https://github.com/anthropics/claude-code/tree/main/.devcontainer) using Docker Dev Containers.

### e. Codebase Q&A

When approaching a new codebase, use Claude Code for learning and exploration. You can ask Claude the same kinds of questions you'd ask another engineer on the project during pair programming. Claude can intelligently search the codebase to answer general questions such as:

-   How does logging work?
-   How do I create a new API endpoint?
-   What does `async move { ... }` on line 134 of foo.rs do?
-   What edge cases does `CustomerOnboardingFlowImpl` handle?
-   Why do we call `foo()` instead of `bar()` on line 333?
-   What is the Java equivalent of line 334 in `baz.py`?

At Anthropic, using Claude Code this way has become a core part of our onboarding process, significantly reducing the time to get up to speed on projects and reducing the burden on other engineers. No special prompt needed! Just ask, and Claude will explore the code to find answers.

![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/20250419192018.png)

_Figure: Using Claude to write git commit messages_

### f. Using Claude with git

Claude can handle many git operations effectively. Many Anthropic engineers use Claude for over 90% of their `git` interactions:

-   **Search `git` history** to answer questions like "What changes went into version v1.2.3?", "Who was responsible for this particular feature?", or "Why was this API designed this way?" Explicitly prompt Claude to look at git history for such queries.
-   **Write commit messages.** Claude automatically looks at your changes and recent history to craft a message that considers all relevant context.
-   **Handle complex git operations** like reverting files, resolving rebase conflicts, and comparing and grafting patches.

### g. Using Claude with GitHub

Claude Code can manage many GitHub interactions:

-   **Create pull requests:** Claude understands the shorthand "pr" and will generate appropriate commit messages based on the diff and surrounding context.
-   **Implement one-click fixes for simple code review comments:** Just tell it to fix comments on your PR (optionally with more specific instructions), and push back to the PR branch when done.
-   **Fix failing builds** or linter warnings.
-   **Triage and sort open issues** by having Claude iterate over open GitHub issues.

This eliminates the need to remember `gh` command syntax while automating routine tasks.

### h. Using Claude with Jupyter notebooks

Anthropic's researchers and data scientists use Claude Code to read and write Jupyter notebooks. Claude can interpret outputs, including images, providing a fast way to explore and interact with data. There's no required prompt or workflow, but one we recommend is opening Claude Code and an `.ipynb` file side by side in VS Code.

You can also have Claude clean up or beautify your Jupyter notebook before showing it to colleagues. Explicitly telling it to make the notebook or its data visualizations "aesthetically pleasing" often helps remind it that it's optimizing for human viewing.

## 4. Optimize Your Workflow

The following suggestions apply to all workflows:

### a. Be specific in instructions

Claude Code's success rate improves significantly with more specific instructions, especially on the first try. Giving clear direction upfront reduces the need for later corrections.

For example:

| Less effective instruction | Good instruction |
| --- | --- |
| Add tests for foo.py | Write a new test case for foo.py covering the edge case where the user is not logged in. Avoid using mocks. |
| Why is the ExecutionFactory API so weird? | Check the git history of ExecutionFactory and summarize how its API evolved. |
| Add a calendar widget | Look at how existing widgets on the homepage are implemented to understand the pattern, especially how code and interfaces are separated. HotDogWidget.php is a good starting point. Then, following that pattern, implement a new calendar widget that allows users to select a month and navigate years by flipping forward/backward. Don't use libraries other than those already used in the codebase; build from scratch. |

Claude can infer intent, but it can't read your mind. Specificity aligns better with expectations.

![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/20250419192425.png)

_Figure: Providing images to Claude as context_

### b. Give Claude images

Claude works excellently with images and diagrams through several methods:

-   **Paste screenshots** (pro tip: in macOS, press cmd+ctrl+shift+4 to take a screenshot to clipboard, then ctrl+v to paste)
-   **Drag and drop** images directly into the prompt input
-   **Provide a file path** to an image

This is especially useful when working with design mocks as a reference for UI development, and for analysis and debugging with visual diagrams. Even if you don't add visuals to the context, explicitly telling Claude that the result should be visually appealing is still helpful.

![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/20250419192441.png)

_Figure: Using tab completion to reference files_

### c. Mention files you want Claude to look at or work with

Use tab completion to quickly reference files or folders anywhere in the repository, helping Claude find or update the right resources.

![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/20250419192453.png)

_Figure: Providing URLs to Claude as context_

### d. Give Claude URLs

Paste specific URLs next to your prompt to have Claude fetch and read them. To avoid repeated permission prompts for the same domain (e.g., docs.foo.com), use `/allowed-tools` to add the domain to your allowlist.

### e. Course correct early and often

While auto-accept mode (toggle with shift+tab) lets Claude work autonomously, you'll often get better results by being an active collaborator and directing Claude's approach. You can start by thoroughly explaining the task to Claude for best results, but you can also course-correct at any time.

These four tools help with course correction:

-   **Ask Claude to make a plan before coding.** Explicitly tell it not to code until you confirm the plan looks good.
-   **Press Escape to interrupt** Claude at any stage (thinking, tool calls, file edits) while preserving context, so you can redirect or expand instructions.
-   **Double-press Escape to go back in history**, edit your previous prompt, and explore a different direction. You can edit prompts and repeat until you get the result you want.
-   **Ask Claude to undo changes**, often combined with option #2 to take a different approach.

Although Claude Code can sometimes solve a problem perfectly on the first try, using these course-correction tools usually produces better solutions faster.

### f. Use /clear to keep context focused

During long sessions, Claude's context window can fill up with irrelevant conversation, file contents, and commands. This degrades performance and sometimes distracts Claude. Use the `/clear` command frequently between tasks to reset the context window.

### g. Use checklists and scratchpads for complex workflows

For large tasks with multiple steps or that require exhaustive solutions—such as code migrations, fixing many lint errors, or running complex build scripts—you can improve performance by having Claude use Markdown files (or even GitHub issues!) as checklists and working scratchpads.

For example, to fix a large number of lint issues, you could:

1.  **Tell Claude to run the lint command** and write all resulting errors (including filenames and line numbers) into a Markdown checklist.
2.  **Instruct Claude to address each issue one by one**, fixing and verifying before checking it off and moving to the next.

### h. Pass data to Claude
There are several ways to provide data to Claude:

-   **Copy-paste directly** into your prompt (most common)
-   **Pipe input into Claude Code** (e.g., `cat foo.txt | claude`), particularly useful for logs, CSVs, and large data
-   **Tell Claude to pull data via bash commands, MCP tools, or custom slash commands**
-   **Have Claude read files** or fetch URLs (also works for images)

Most sessions involve a combination of these methods. For example, you could pipe in a log file, then tell Claude to use tools to pull additional context for debugging the log.

## 5. Automate Your Infrastructure with Headless Mode
Claude Code includes [headless mode](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview#automate-ci-and-infra-workflows), designed for non-interactive environments like CI, pre-commit hooks, build scripts, and automation. Enable headless mode with the `-p` flag accompanied by a prompt, and use `--output-format stream-json` for streaming JSON output.

Note that headless mode does not persist across sessions. You must trigger it in each session.

### a. Using Claude for issue triage

Headless mode can drive automations triggered by GitHub events, such as when a new issue is created in your repository. For example, the public [Claude Code repository](https://github.com/anthropics/claude-code/blob/main/.github/actions/claude-issue-triage-action/action.yml) uses Claude to inspect incoming issues and assign appropriate labels.

### b. Using Claude as a linter

Claude Code can provide [subjective code review](https://github.com/anthropics/claude-code/blob/main/.github/actions/claude-code-action/action.yml), going beyond what traditional linting tools can detect, identifying issues like typos, outdated comments, misleading function or variable names, etc.

## 6. Scale Up with Multi-Claude Workflows

Beyond using it alone, some of the most powerful applications involve running multiple Claude instances in parallel:

### a. Have one Claude write code; use another to verify
A simple but effective approach: have one Claude write code while another reviews or tests it. Similar to collaborating with multiple engineers, sometimes having separate contexts is beneficial:

1.  Use Claude to write code.
2.  Run `/clear` or start a second Claude in another terminal.
3.  Have the second Claude review the first Claude's work.
4.  Start another Claude (or `/clear` again) to read the code and the review feedback.
5.  Have this Claude edit the code based on the feedback.

You can do something similar with tests: have one Claude write tests, then have another Claude write code to pass them. You can even have your Claude instances communicate by giving them independent working scratchpads and telling them which one to write to and which one to read from.

This separation often produces better results than having a single Claude handle everything.

### b. Have multiple codebase checkouts

Instead of waiting for Claude to finish each step, many Anthropic engineers do this:

1.  **Create 3–4 git checkouts** in different folders.
2.  **Open each folder in a different terminal tab**.
3.  **Start Claude in each folder** and assign different tasks.
4.  **Rotate between them** to check progress and approve/deny permission requests.

### c. Use git worktrees

This approach is particularly effective for multiple independent tasks, providing a more lightweight alternative to multiple checkouts. Git worktrees allow you to check out multiple branches of the same repository into different directories. Each worktree has its own independent working directory and files, while sharing the same Git history and reflog.

Using git worktrees enables you to run multiple Claude sessions simultaneously on different parts of a project, each focused on its independent task. For instance, you might have one Claude refactor your authentication system while another builds a completely unrelated data visualization component. Since the tasks don't overlap, each Claude can work at full speed without waiting for the other's changes or dealing with merge conflicts:

1.  **Create worktrees**: `git worktree add ../project-feature-a feature-a`
2.  **Start Claude in each worktree**: `cd ../project-feature-a && claude`
3.  **Create additional worktrees** as needed (repeat steps 1–2 in new terminal tabs)

Some tips:

-   Use consistent naming conventions.
-   Keep a terminal tab open for each worktree.
-   If using iTerm2 on Mac, [set up notifications](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview#notification-setup) for when Claude needs attention.
-   Use separate IDE windows for different worktrees.
-   Clean up when done: `git worktree remove ../project-feature-a`

### d. Combine headless mode with a custom harness

`claude -p` (headless mode) can integrate Claude Code programmatically into larger workflows while leveraging its built-in tools and system prompts. Two main modes for using headless mode:

1.  **Fanning out** for large migrations or analysis (e.g., analyzing sentiment in hundreds of logs or analyzing thousands of CSVs):
    
    1.  Have Claude write a script to generate a task list. For example, generate a list of 2000 files that need migrating from framework A to framework B.
    2.  Loop over the tasks, programmatically invoking Claude for each with a task and a set of tools it can use. For example: `claude -p "Migrate foo.py from React to Vue. When done, if successful, you must return string OK, and FAIL if the task fails." --allowedTools Edit Bash(git\ commit:*)`
    3.  Run the script multiple times and refine your prompt to get the desired results.
2.  **Pipelining** to integrate Claude into an existing data/processing pipeline:
    
    1.  Call `claude -p "<your prompt>" --json | your_command`, where `your_command` is the next step in your processing pipeline.
    2.  That's it! JSON output (optional) can help provide structure for easier automated processing.

For both use cases, using the `--verbose` flag for Claude call debugging can be helpful. We generally recommend turning off verbose mode in production for cleaner output.

___

What tips and best practices do you have for using Claude Code? Feel free to tag @AnthropicAI and show us what you're building!

**Acknowledgments**

Written by Boris Cherny. This work draws on best practices from the broader Claude Code user community, whose creative approaches and workflows continue to inspire us. Special thanks to Daisy Hollman, Ashwin Bhat, Cat Wu, Sid Bidasaria, Cal Rueb, Nodir Turakulov, Barry Zhang, Drew Hodun, and many other Anthropic engineers whose valuable insights and hands-on experience with Claude Code helped shape these recommendations.

---

You're awesome for reading all the way through! Give a thumbs up before you go! Thank you.

## Ad

If you want to learn programming, find a job, or prepare for an interview, feel free to message me privately. I have rich resources and tools to help you become a better programmer faster, plus great benefits:

- Programming navigation membership discount
- Interview Duck membership discount
- Sha Yu's [Frontend Master Growth Path] discount
