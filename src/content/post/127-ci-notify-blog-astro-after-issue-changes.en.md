---
title: "ci: notify blog-astro after issue changes"
publishDate: "2026-10-19T04:02:27Z"
updatedDate: "2026-10-19T04:02:36Z"
tags: []
description: "Summary\n Dispatch a blogissuesupdated event to coderPerseus/blogastro after every issue sync\n Tolerate issue events that do not change generated files\n Remove u"
---

## Summary
- Dispatch a `blog-issues-updated` event to `coderPerseus/blog-astro` after every issue sync
- Tolerate issue events that do not change generated files
- Remove unsupported issue action names

## Verification
- `git diff --check`
- Prettier check from the blog-astro workspace
