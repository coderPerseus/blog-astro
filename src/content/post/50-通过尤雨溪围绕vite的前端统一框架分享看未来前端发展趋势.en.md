---
title: "Future Frontend Trends from Evan You's Talk on a Unified Vite-Centric Frontend Framework"
publishDate: "2025-03-16T10:22:18Z"
updatedDate: "2025-03-16T10:22:18Z"
tags: ["JavaScript","前端基建"]
description: "Vite history\n\nJust look at the slides!\n\nSummary: Vite is currently the undisputed top choice for frontend build tools.\n\nVite Present\n\nWeekly downloads: 22 million+, surpassed Next.js in 2023.\nState of JS 2024: Vite and Vitest are the most noticed and loved tools.\n\nVite Ecosystem\n\nAmong meta frameworks, besides Next.js"
---

![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/20250316161306.png)

## Vite History

Check the slides!
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/20250316161602.png)

Summary: Vite is undeniably the top choice for frontend build tools today.

## Vite Current Status

- 22M+ weekly downloads, surpassed Next.js in 2023.
- State of JS 2024: Vite and Vitest are the most loved and popular tools.

## Vite Ecosystem

Among meta-frameworks, almost all except Next.js use Vite — well, Next.js has its own Turbopack now. Haha.

![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/20250316161806.png)

Let's take a look at what these are!

**First row**

1. **Astro:** A modern static site generator known for its Islands Architecture, building fast websites by loading only necessary JavaScript.
   - **GitHub:** https://github.com/withastro/astro
2. **React:** A JavaScript library for building user interfaces, developed by Facebook, known for its component-based architecture and virtual DOM.
   - **GitHub:** https://github.com/facebook/react
3. **Vue.js:** A progressive JavaScript framework for building user interfaces and single-page applications.
   - **GitHub:** https://github.com/vuejs/
4. **oxc:** A high-performance JavaScript/TypeScript linter.
   - **GitHub:** https://github.com/oxc-project/oxc
5. **Svelte:** A different approach to building web apps — it's a compiler that converts your application code into efficient JavaScript at build time, rather than interpreting it at runtime.
   - **GitHub:** https://github.com/sveltejs/svelte
6. **Nuxt:** A full-stack web framework based on Vue.js.
   - **GitHub:** https://github.com/nuxt/nuxt
7. **solidjs:** A declarative, efficient, and flexible JavaScript library for building user interfaces.
   - **GitHub:** https://github.com/solidjs/solid

**Second row**

1. **storybook:** A tool for building, documenting, and testing UI components in isolation.
   - **GitHub:** https://github.com/storybookjs/storybook

2. **qwik:** Instantly load web applications with no effort.
   - **GitHub:** https://github.com/QwikDev/qwik

3. **Rollup:** A JavaScript module bundler that compiles small pieces of code into something larger and more complex, like a library or application. Vite uses native ESM in development but still relies on Rollup for production bundling and optimization.
   - **GitHub:** https://github.com/rollup/rollup

4. **Vite:** Modern frontend build tool.
   - **GitHub:** https://github.com/vitejs/vite

5. **rolldown:** A fast JavaScript bundler written in Rust.
   - **GitHub:** https://github.com/rolldown/rolldown

6. **Angular:** An open-source TypeScript-based web application framework led by the Angular team at Google and the community.
   - **GitHub:** https://github.com/angular/angular

7. **Nx:** An intelligent, scalable build system, especially suited for monorepo projects.
   - **GitHub:** https://github.com/nrwl/nx

**Third row**

1. **pnpm:** A fast, disk-space-efficient package manager similar to npm or Yarn, but with a different dependency management strategy.
   - **GitHub:** https://github.com/pnpm/pnpm

2. **VitePress:** A static site generator built on Vite, created by the Vue.js team, particularly suited for documentation sites.
   - **GitHub:** https://github.com/vuejs/vitepress

3. **unocss:** An instant, on-demand atomic CSS engine.
   - **GitHub:** https://github.com/unocss/unocss

4. **Vitest:** A blazing-fast unit test framework powered by Vite.
   - **GitHub:** https://github.com/vitest-dev/vitest

5. **volar:** A framework for building programming language tools.
   - **GitHub:** https://github.com/volarjs/volar.js

6. **tauri:** Build lightweight, secure, and high-performance cross-platform desktop applications using Rust.
   - **GitHub:** https://github.com/tauri-apps/tauri

7. **redwood:** A full-stack JavaScript/TypeScript web application framework designed to help developers build modern web apps in a more integrated and seamless way.
   - **GitHub:** https://github.com/redwoodjs/redwood

**Fourth row**

8. Couldn't find this one — anyone know what it is?
9. **Laravel:** A popular PHP web application framework. Though primarily used for the backend, it can integrate with Vite to handle frontend assets.
   - **GitHub:** https://github.com/laravel/laravel

10. **Vite Ruby:** Vite integration for Ruby.
    - **GitHub:** https://github.com/ElMassimo/vite_ruby

11. **Remix:** A full-stack web framework focused on web standards and modern web UX, building better websites.
    - **GitHub:** https://github.com/remix-run/remix

12. **Analog (formerly Peaks):** A full-stack meta-framework for Angular, powered by Vite and Nitro.
    - **GitHub:** https://github.com/analogjs/analog

13. **Marko (formerly Million):** A declarative, HTML-based language that makes building web apps fun.
    - **GitHub:** https://github.com/marko-js/marko

14. **playwright:** A web testing and automation library.
    - **GitHub:** https://github.com/microsoft/playwright

Vite's terrifying dominance!

## Companies Using Vite

![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/20250316174057.png)

## Vite's Disadvantages

Relies on multiple third-party libraries with overlapping responsibilities.

- esbuild: Pre-bundling, TS/JSX transpilation, minification (Go)
- Rollup: Plugin ecosystem, production builds, chunking/output optimization (TS)
- SWC: React HMR, transpilation, minification (Rust)

Each handles a piece, but they have their own shortcomings, and their functionality overlaps.

**Unbundled ESM** has performance bottlenecks when dealing with a large number of requests.

What is Unbundled ESM?
Unbundled ESM (unpackaged ECMAScript modules) is a development and deployment approach that uses native ES modules directly without merging them into a single file (i.e., without bundling).

## Rolldown

Problems it aims to solve:

- Compatible with Rollup's plugin API and ecosystem.
- Use Rust to improve production build performance.
- Add higher-level features.
- Full bundle mode to address Vite's unbundled ESM performance bottleneck.

Here's the JS toolchain ecosystem, organized by Evan You:
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/20250316175737.png)

Headaches when building large frontend projects:
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/20250316175914.png)

## Rust for JS

> Evan You's company website: https://voidzero.dev/

Goal: Build a complete, high-performance JS toolchain.

Why Rust?
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/20250316180507.png)

OXC delivers extreme performance across the board.

What's being worked on now:
- Vite integration (currently not passing Astro tests).
- Vite full bundle mode, HMR, and incremental bundling builds.

Rolldown stats:
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/20250316181219.png)

![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/20250316181245.png)

Couldn't catch that:
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/20250316181327.png)

## Vite Next

Looking forward to it.

![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/20250316181409.png)

What they plan to deliver:
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/20250316181658.png)

## Resources

1. All slides from the conference: https://github.com/d2forum/19th
2. Video: https://www.bilibili.com/video/BV1WERGYDEix
