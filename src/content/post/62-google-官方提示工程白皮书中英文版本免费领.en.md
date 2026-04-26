---
title: "Google Official Prompt Engineering White Paper: Free Chinese & English Versions"
publishDate: "2025-04-14T15:33:16Z"
updatedDate: "2025-04-14T15:33:16Z"
tags: ["AI","AI 提示词"]
description: "Hello everyone, I'm luckySnail. At the end of this article, I'll share how to get the resource link for the Google Prompt Engineering Whitepaper. But first, let's take a look at it!\n\nImagine a large language model (LLM) as a super smart \"Aladdin's magic lamp\" that can answer questions, write articles, write code—almost anything. But how do you make this \"lamp\" accurately understand your wishes and give you the exact answer you want? The answer lies in prompt..."
---

Hello everyone, I'm luckySnail. At the end of the article, I'll share how to get the resource link for Google's prompt engineering whitepaper. But first, let's take a look at it!

Imagine a large language model (LLM) as a super-intelligent "Aladdin's lamp" that can answer questions, write articles, write code — basically anything. But how do you make this "lamp" understand exactly what you want and give you the best answer? The answer is — **Prompt Engineering**!

Recently, Google published an official prompt engineering whitepaper, like an "instruction manual for the lamp," systematically explaining how to communicate better with LLMs. Don't worry — "engineering" sounds complicated, but the whitepaper tells us: "Anyone can write prompts!" This article will guide you through this "manual" in the simplest and most fun way.

## What is Prompt Engineering? Why call it "Engineering"?

Simply put, **prompt engineering is the process of designing high-quality prompts that guide LLMs to produce accurate and useful outputs**.

It's not just about asking a casual question. You need to consider which model to use, how to phrase things, how much context to provide, etc. It's like cooking — same ingredients, different seasonings and heat levels, the flavor can be worlds apart.

It's called "engineering" because it's a systematic process that requires **design, optimization, evaluation, and debugging** — you need to keep trying and improving to find the best "recipe."

## More Than Just Asking: The "Magic Knobs" of LLMs

Beyond writing good prompts, we also need to understand some of the "magic knobs" of LLMs, also known as output configurations, that control how the LLM "speaks":

- **Output Length (Max Tokens)**: Want it to be talkative or concise? You can limit how many "words" (tokens) it can say. But note: limiting length doesn't automatically make it concise — you still need to specify "be concise" in the prompt.
    
- **Temperature**: Want the answer to be more "stable" or more "creative"? Lower temperature makes answers more deterministic and accurate; higher temperature makes them more varied and imaginative. At temperature 0, it's most "rigid" — it always picks the most likely word.
    
- **Top-K & Top-P**: These parameters determine how many "candidates" the LLM considers when predicting the next word. Top-K selects the K most probable words; Top-P selects words whose cumulative probability exceeds P. How to choose the best K or P? The answer: try it out!
    

Note that these "knobs" interact with each other — understanding their interplay helps you better control the output.

## Core Prompting Techniques: The "Arsenal" to Make LLMs Understand You

The whitepaper introduces many practical prompting techniques, like different "martial arts moves." Let's look at them one by one:

1. **Zero-shot**: The most straightforward approach — no examples, just directly describe the task for the LLM to do. ("Summarize this text for me.")
    
2. **One-shot & Few-shot**: Show the LLM one, two, or even a few "samples" for it to learn from. This is particularly effective and helps the output format match your requirements. ("Example: Input 'apple', Output 'fruit'. Now input 'potato', output?")
    
3. **Setting "Persona" and "Context" (System, Role, Context)**:
    
    - **System Prompt**: Set the overall "tone" for the LLM. ("You are a rigorous scientific editor.")
        
    - **Role Prompt**: Ask the LLM to play a specific role. ("You are Shakespeare now. Write me a poem.")
        
    - **Context Prompt**: Provide specific background information. ("Context: We're discussing weekend plans. Option A is hiking, Option B is watching a movie. Please analyze the pros and cons.")
        
4. **Step-back**: For complex problems, first guide the LLM to think about a broader, more general question, then return to the specific problem. This makes its "thinking broader."
    
5. **Chain of Thought (CoT)**: Ask the LLM to "think step by step" and write out the reasoning process. This significantly improves accuracy on complex problems. ("Please explain why the sky is blue, step by step.")
    
6. **Self-consistency**: Have the LLM think about the same problem with multiple different "paths" (reasoning trajectories), then pick the most frequent answer — improving reliability.
    
7. **Tree of Thoughts (ToT)**: An upgrade of CoT — the LLM simultaneously explores multiple different reasoning "paths." Suitable for complex tasks that require deep exploration.
    
8. **Reasoning & Acting (ReAct)**: Let the LLM not only "think" but also "do" — for example, by combining with a search engine to look up the latest information, or calling a calculator for calculations.
    

## LLMs Can Be "Coders" Too: Code Prompting Techniques

The whitepaper also dedicates a section to making Gemini (Google's LLM) help with code:

- **Write code**: Tell it what language you want and what functionality you need.
    
- **Explain code**: Throw unclear code at it and ask it to explain.
    
- **Translate code**: For example, convert Python code to Java.
    
- **Debug and review code**: Provide error messages and code, ask it to find bugs and suggest improvements.
    

## Let AI Write Your Prompts: Automatic Prompt Engineering (APE)

Tired of writing prompts? There's an even more advanced trick: let the LLM generate and optimize its own prompts! That's Automatic Prompt Engineering — letting AI help AI become better.

## The "Secret Recipe" to Becoming a Prompt Expert: Best Practices

The whitepaper offers many practical tips to help you become a prompt expert:

- **Give examples! Give examples! Give examples!** (Say it three times) Few-shot prompting is extremely effective.
    
- **Keep it simple and clear**: The clearer the instruction, the better.
    
- **Be explicit about what you want**: Specify the format, length, and content of the output.
    
- **Use positive statements**: Tell it "what to do" rather than "what not to do."
    
- **Control output length**: Limit it using configuration or explicit instructions in the prompt.
    
- **Use variables to make prompts flexible**: Makes them reusable.
    
- **Experiment boldly**: Try different phrasings, formats, and styles.
    
- **Document your attempts**: Keep track of which prompts work and which don't — keep learning.
    
- **Share with others**: Exchange experiences and inspire each other.
    
- **Stay updated on model changes**: Models evolve — your prompts should keep up.
    

## Future Trends: Multimodal Prompting

The whitepaper also touches on the future of combining text, images, sound, and other modalities to give instructions to LLMs, though it doesn't go deep into this area yet.

## Summary

Google's prompt engineering whitepaper is like a modern-day "dancing with AI" guide. It tells us that mastering the craft of prompt engineering is key to unlocking the full potential of LLMs. Whether you're a developer, writer, student, or anyone looking to leverage AI, understanding and practicing these principles and techniques will make your "Aladdin's lamp" more obedient and powerful. If you want to learn more about prompt engineering, I highly recommend reading the full whitepaper. Links below:

Chinese translation online: https://baoyu.io/blog/google-prompt-engineering-whitepaper  
English online access and download: https://drive.google.com/file/d/1AbaBYbEa_EbPelsT40-vj64L-2IwUJHy/view?pli=1

Below is an outline I generated with notebooklm — I suggest using it alongside the whitepaper for quick learning:
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/20250414230001.png)
