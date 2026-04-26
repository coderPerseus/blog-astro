---
title: "What is the Unix philosophy?"
publishDate: "2024-08-10T11:47:24Z"
updatedDate: "2024-08-10T11:48:02Z"
tags: ["Unix 哲学","名词解释"]
description: "While reading the article: https://www.ruanyifeng.com/blog/2017/08/koa.html , I came across the Unix philosophy, so I made a note to study it. Here is the AI's response:\n\nThe Unix philosophy is a set of guiding principles for software design and development that originated from the creation and evolution of the Unix operating system. This philosophy emphasizes simplicity, modularity, and composability. Here is"
---

> While reading an article: https://www.ruanyifeng.com/blog/2017/08/koa.html, I learned about the Unix philosophy and decided to document it. Below is a response from AI:

The Unix philosophy is a set of software design and development principles that originated from the creation and evolution of the Unix operating system. It emphasizes simplicity, modularity, and composability. Here are the core tenets of the Unix philosophy:

1. Do one thing and do it well: Each program should focus on a single specific task and excel at it. This focus makes programs easier to understand, maintain, and improve.

2. Collaboration between programs: Programs should be designed with the ability to work together with other programs. This approach encourages the creation of small, specialized tools that can be easily combined.

3. Text streams as a universal interface: Use text streams as the primary way to exchange data between programs. Text is a universal, human-readable format that can be processed and manipulated by a variety of tools.

4. Modular design: Encourage breaking down complex systems into smaller, more manageable parts. This makes the system easier to understand, maintain, and extend.

5. Compose rather than extend: When new functionality is needed, prefer creating new modules and composing them with existing ones, rather than making existing programs complex by adding new features.

6. Simplicity: Keep programs and interfaces simple. This not only makes programs easier to understand and use, but also reduces the likelihood of errors.

7. Portability: Write programs that can run in different environments, rather than relying on specific system features.

8. Transparency: Program behavior should be predictable, and its operations should be visible and understandable.

9. Flexibility: Design programs that can adapt to unforeseen uses. This flexibility allows programs to be reused in a variety of different scenarios.

10. Dataflow processing: Design programs that can process data streams, as this is a universal interface.

The practice of the Unix philosophy is not limited to Unix systems; it has influenced many modern software development practices, including microservices architecture, functional programming, and the DevOps culture. This philosophy encourages developers to create simple, modular, composable software that can flexibly meet various challenges and needs.
