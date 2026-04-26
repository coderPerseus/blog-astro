---
title: "The Best Entry Point for Building AI Agents - Vercel"
publishDate: "2025-11-19T13:16:49Z"
updatedDate: "2025-11-19T13:16:49Z"
tags: ["AI","Agent"]
description: "This is an experience-sharing article about building AI Agents internally at Vercel. Below is the Chinese translation of the article, striving to retain the technical depth of the original while being accessible to Chinese readers.\n\nTranslator: Gemini 3 Pro\n\nTitle: Lessons Learned from Building Agents at Vercel\n\nAuthor: Malte Ubl (CTO), E"
---

This is an article sharing experiences about building AI agents internally at Vercel. Below is the English translation of the article, striving to preserve the technical depth of the original while conforming to the reading habits of English readers.

Translator: Gemini 3 Pro

---

### Title: **Lessons Learned from Building Agents at Vercel**

Authors: Malte Ubl (CTO), Eric Dodds (Content Engineer)

Published: November 6, 2025

AI agents have shown enormous potential in boosting enterprise productivity and output quality. Many companies are already leveraging them to optimize customer support, code review, and sales operations.

When building custom internal agents, the real challenge isn't whether AI can create value—it's **identifying the problems it can actually solve right now, at a cost that makes business sense.**

At Vercel, we're going through the same AI transformation as our customers. We use our own products to build agents that help us move faster and spend more time on meaningful work.

After months of experimentation, we've distilled what we learned into a repeatable methodology for discovering and investing in AI projects with the highest potential for significant business impact.

#### **Finding the Agent Sweet Spot**

Over time, AI will touch virtually every workflow, handling tasks as complex as our own "Code Review" and "Incident Investigation" agents. Because coding agents like these are surprisingly capable, our intuition about agent capabilities tends to skew toward overoptimism.

However, most companies don't have the engineering capacity to "productize" that level of internal use case, and current models still face limitations in reliability and precision in other domains. So we need to choose problems that are **a good fit for the capabilities of today's frontier models.**

The lesson we want to share is: **For this generation of agentic AI, the areas with the highest success rate are tasks that require "low cognitive load" but involve "high repetition" for humans.**

> **Sweet Spot = Low Cognitive Load + High Repetition Human Work**

![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/20251119211059.png)

These tasks are too dynamic for traditional automation, yet predictable enough for AI to handle reliably. They are abundant in business processes like **data entry, research, qualification, and triage.** In these areas, automation not only saves time but also maintains consistent quality.

These are the "low-hanging fruit" we should pick today, while models continue to mature toward reliably automating more complex tasks in the future.

#### **Our Methodology for Finding the Right Projects**

This may sound simple, but we literally asked our teams which tasks fit that sweet spot: the brainless, high-frequency operations.

Humans naturally dislike boring, repetitive work. So you can often uncover great ideas by asking questions like: **"What part of your job do you hate the most?"** or **"What tasks do you wish you never had to do again?"**

Most of the use cases we found were relatively simple to automate, yet delivered high-quality, measurable productivity gains. Here are two concrete examples:

#### **Example 1: Lead Processing Agent**

We used to have a team of 10 people dedicated to triaging sales leads coming in through the website. When we asked the top performer on that team what they wished they never had to do again, they told us that manually searching for information to make an initial qualification judgment was mind-numbing.

We shadowed that employee, learned their workflow, and built an agent to automate this initial screening process. **Now, one person handles the workload of 10, while the other 9 focus on higher-value, more complex sales work.**

**Agent workflow:**

1. **Deep Research:** Conduct comprehensive background research on the prospect and their company.
    
2. **Qualification:** Classify leads using `generateObject`.
    
3. **Email Drafting:** Automatically generate personalized follow-up emails.
    
4. **Human Review:** Send all information to Slack for human approval.
    
5. **Approval & Send:** Catch the approval action in Slack (webhook event) and send the email.
    

#### **Example 2: Anti-Abuse Agent**

Our security team has to manage a constant stream of abuse reports, ranging from phishing sites and spam to copyright infringements. Every case needs to be taken seriously because a false positive could mean taking down legitimate content, while a miss could leave harmful content online.

Before automation, human reviewers had to manually investigate each report, running a formulaic process to make an initial judgment.

We built an "Abuse Platform Agent" that automatically extracts potentially infringing or high-risk URLs, runs visual analysis, understands page intent, and returns a recommended action for human verification.

**Even in its first iteration, this workflow reduced ticket closure time by 59%**, freeing the team to focus on edge cases that required more complex human reasoning.

**Agent workflow:**

1. **URL Ingestion:** Retrieve new reports from the abuse report queue.
    
2. **Analysis:** Run visual/text analysis to detect phishing or copyright content.
    
3. **Recommendation:** Summarize findings and propose a course of action.
    
4. **Human Review:** Send the recommendation to a security engineer for final decision.
    
5. **Resolution:** Record the decision and close the ticket.
    

#### **Get Started with Our Agent Templates**

Everyone should start asking their teams the questions above, but you can also jump right in by using our agent templates.

We've open-sourced a collection of agent examples designed as building blocks for custom agents:

- **Lead Processing Agent:** Let AI handle the tedious research and initial screening, then validate via a human-in-the-loop.
    
- **Data Analyst Agent:** Turn natural language questions into SQL queries and leverage multi-step reasoning for data analysis.
    
- **Flight Booking App:** A conversational flight booking assistant with built-in retry, resume, and fault tolerance.
    
- **Story Time Slackbot:** An interactive, AI-powered Slack bot that co-creates children's stories with your organization.
    

If your team needs more direct support in finding and building high-ROI AI projects, we offer a practice program where our front-line engineering team guides you through use case discovery and agent implementation.
