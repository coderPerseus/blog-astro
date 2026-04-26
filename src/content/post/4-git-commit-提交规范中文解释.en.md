---
title: "Git Commit Conventions Explained in Chinese"
publishDate: "2024-08-03T11:56:59Z"
updatedDate: "2024-08-03T11:57:36Z"
tags: ["git","笔记"]
description: "These are common commit types defined in the @commitlint/configconventional configuration. Their meanings are as follows:\n1. build: Changes that affect the build system or external dependencies (e.g., gulp, broccoli, npm)\n2. chore: Other changes that do not modify source code or test files. Usually used for maintenance work\n3. ci: Continuous integration configuration"
---

These are the commonly used commit types defined in the `@commitlint/config-conventional` configuration. The meaning of each type is as follows:

1. build: Changes that affect the build system or external dependencies (e.g., gulp, broccoli, npm)
2. chore: Other changes that do not modify source code or test files. Typically used for maintenance work.
3. ci: Changes to continuous integration configuration files and scripts (e.g., Travis, Circle, BrowserStack, SauceLabs)
4. docs: Documentation only changes
5. feat: A new feature
6. fix: A bug fix
7. perf: Code changes that improve performance
8. refactor: Code changes that neither fix a bug nor add a feature
9. revert: Reverts a previous commit
10. style: Changes that do not affect the meaning of the code (whitespace, formatting, missing semicolons, etc.)
11. test: Adding missing tests or correcting existing tests

These types help developers quickly understand the purpose of each commit, making the version history clearer and facilitating automated tools to generate changelogs. Using these standardized commit types can improve project maintainability and collaboration efficiency.
