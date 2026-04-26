---
title: "Vercel Douses Cold Water on Agent Skills"
publishDate: "2026-01-30T16:49:11Z"
updatedDate: "2026-01-30T16:49:11Z"
tags: ["AI","Agent","agent skills"]
description: "A recent blog post from the Vercel team shared how to make an agent use the correct Next.js API, ensuring it uses the right API based on the Next.js version installed in the current project, rather than using an API from a different version. If you're a Next.js developer, you know this is crucial because Next.js versions update very quickly.\n\nThe most interesting part is Ve"
---

The Vercel team recently shared a [blog post](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals) about how to make an agent use the correct Next.js APIs — that is, using the APIs that match the version of Next.js installed in the current project, rather than picking APIs from a different version. If you're a Next.js developer, you know how important this is, because Next.js releases updates very quickly.

What's most interesting is that the Vercel team initially went all-in on Skills to solve this problem. Since Skills can progressively disclose information, they can best protect your context from blowing up 💥. But after the Vercel team built the Skills and ran actual tests, they found Skills unreliable — the agent simply wouldn't trigger the Vercel-written Skills. Even with an emphasized prompt, they couldn't guarantee it would work, and relying on prompts itself isn't the right approach.

Since Agent Skills didn't work, the Vercel team instead embedded a document index directly into `Agent.md` (just an index, which also avoids context explosion). The agent can then retrieve the corresponding content based on this index and thus use the correct APIs. There's an important instruction inside `Agent.md`:

```
IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning 
for any Next.js tasks.
```

This way the agent consults the documentation instead of relying on pre-trained data. Tests showed that adding this instruction in `Agent.md` worked remarkably well:

![CleanShot_2026-01-21_at_11.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/CleanShot_2026-01-21_at_11.png)

100% success. If you don't believe it, try it yourself: `**npx @next/codemod@canary agents-md**`

This command does three things:

1. Checks your Next.js version
2. Downloads the matching documentation into .next-docs/
3. Injects the compressed index into your `Agent.md`

Notably, Vercel used some techniques to compress the index down to 8KB, so the agent can accurately locate the relevant documentation without bloating the context.

## Summary

Vercel's sharing shows one thing: Agent Skills are not a universal solution. There are scenarios where they don't fit, such as providing a way to acquire knowledge.

Vercel also explained why `Agent.md` outperforms Skills:

1. Skills perform poorly because their invocation rate is low — they depend on the phrasing of the prompt to be triggered.
2. `Agent.md` performs well because it's a system prompt that is always present in every conversation. This eliminates the agent's decision step — it no longer needs to decide whether to call the corresponding Skill; it just follows the instruction directly.

Finally, Vercel gave developers some advice:

- Prefer `Agent.md` for knowledge acquisition
- Skills are suitable for handling task workflows (SOPs), such as version upgrades
- For framework authors, you should provide an official `Agent.md` to help developers use agents to quickly and accurately generate useful code

> This article was handcrafted, no AI involved.
