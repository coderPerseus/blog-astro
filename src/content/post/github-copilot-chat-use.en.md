---
title: "GitHub Copilot Chat Experience"
publishDate: "2023-05-27T00:00:00.000Z"
tags: ["github copilot","AI","提效"]
description: "How to purchase and use GitHub Copilot Chat"
---

> Recently, I've seen many big shots sharing about GitHub Copilot Chat, claiming it can double productivity. Skeptical and in the mood to debunk it, I decided to give it a try myself. The result? Really impressive. Below is my experience using GitHub Copilot Chat.

First, let’s understand what GitHub Copilot Chat is. GitHub Copilot is an AI-powered code completion tool jointly developed by OpenAI and GitHub. It uses machine learning models to predict and generate code, helping developers write code faster. GitHub Copilot Chat is an extension of GitHub Copilot that brings the AI programming assistant into a conversational interface, helping answer coding questions, provide code examples, and even review and fix code. Both tools are effective assistants for developers, improving coding efficiency and code quality. So, here’s what we need to do 👇🏻👇🏻

1. You must have purchased GitHub Copilot, because Chat is built on top of it. You can buy it from Taobao like I did – it’s quite cheap (costs about the price of a milk tea). I believe this is definitely the most cost-effective investment you’ll make in 2023.
2. After purchasing, log in to your VS Code using the account you bought the service with, then download the GitHub Copilot plugin from the extension marketplace to experience its capabilities (my code output = ChatGPT + GitHub Copilot).

![image-20230527153837751](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/0e2321fa391947f08eca30fb454ad0f2~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

3. Apply to join the waitlist: [github.com/github-copi…](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fgithub-copilot%2Fchat_waitlist_signup%2Fjoin 'https://github.com/github-copilot/chat_waitlist_signup/join') After joining, if you revisit the URL you’ll see 👇🏻. Also, keep an eye on the email you provided; you’ll be notified when approved (very fast, at most two working days).

![image-20230527154016617](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/11d6150b33d54e68a5557850ed598472~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

4. Download VS Code Insiders, because that’s the only place you can experience it (this cost me a lot of time): [code.visualstudio.com/insiders/](https://link.juejin.cn/?target=https%3A%2F%2Fcode.visualstudio.com%2Finsiders%2F 'https://code.visualstudio.com/insiders/')

![image-20230527154108314](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/d0d0d5b57921408eb29cf35066e8d044~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

5. In the VS Code Insiders we just downloaded, install the extension GitHub Copilot Nightly: [marketplace.visualstudio.com/items?itemN…](https://link.juejin.cn/?target=https%3A%2F%2Fmarketplace.visualstudio.com%2Fitems%3FitemName%3DGitHub.copilot-nightly 'https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-nightly') You’ll see 👇🏻

![image-20230527154215438](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/6a704acc906e4edab6e59cc20a53aaa1~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

If you don’t see it, don’t panic. First check if your editor is logged into GitHub, and see if there’s a popup in the bottom right asking you to sign in for GitHub Copilot Chat. If both are done, restart and the long-awaited chat page should appear.

### Experience the Power of AI

First, let’s see how the official description positions it: "I'm your copilot. I'm here to help you get things done faster. I can identify problems, explain and even improve code. You can ask general questions, but where I really shine is helping you write code. For example:

- Generate unit tests for my code
- Explain selected code
- Suggest and fix errors in my code

If you want to learn more about my abilities and limitations, check the copilot docs: [docs.github.com/en/early-ac…](https://link.juejin.cn/?target=https%3A%2F%2Fdocs.github.com%2Fen%2Fearly-access%2Fcopilot%2Fgithub-copilot-chat-transparency-note%25E3%2580%2582%25E6%259C%2580%25E5%2590%258E%25E5%25AE%2583%25E8%25BF%2598%25E9%25B8%25A1%25E8%25B4%25BC%25E7%259A%2584%25E8%25BF%259B%25E8%25A1%258C%25E4%25BA%2586%25E7%2594%25A9%25E9%2594%2585%25EF%25BC%258C%25E6%2588%2591%25E6%2598%25AF%25E7%2594%25B1%25E4%25BA%25BA%25E5%25B7%25A5%25E6%2599%25BA%25E8%2583%25BD%25E9%25A9%25B1%25E5%258A%25A8%25E7%259A%2584%25EF%25BC%258C%25E6%2589%2580%25E4%25BB%25A5%25E6%2584%258F%25E5%25A4%2596%25E5%2592%258C%25E9%2594%2599%25E8%25AF%25AF%25E6%2598%25AF%25E5%258F%25AF%25E8%2583%25BD%25E7%259A%2584%25E3%2580%2582%25E4%25B8%258D%25E8%25BF%2587%25E4%25B9%259F%25E7%25BB%2599%25E6%2588%2591%25E4%25BB%25AC%25E7%25A8%258B%25E5%25BA%258F%25E5%2591%2598%25E4%25B8%2580%25E7%2582%25B9%25E9%259D%25A2%25E5%25AD%2590%25EF%25BC%258C%25E8%25A6%2581%25E6%2598%25AF%25E4%25B8%258D%25E5%2587%25BA%25E9%2594%2599%25EF%25BC%258C%25E9%2582%25A3%25E7%25A8%258B%25E5%25BA%258F%25E5%2591%2598%25E4%25B8%258D%25E6%2598%25AF%25E8%25A6%2581%25E6%25B6%2588%25E5%25A4%25B1%25E4%25BA%2586%25E6%2598%25AF%25E5%2590%25A7%25EF%25BC%258C%25E6%2588%2591%25E4%25BB%25AC%25E4%25B8%2580%25E4%25B8%25AA%25E4%25B8%2580%25E4%25B8%25AA%25E5%258A%259F%25E8%2583%25BD%25E6%259D%25A5%25E4%25BD%2593%25E9%25AA%258C 'https://docs.github.com/en/early-access/copilot/github-copilot-chat-transparency-note%E3%80%82%E6%9C%80%E5%90%8E%E5%AE%83%E8%BF%98%E9%B8%A1%E8%B4%BC%E7%9A%84%E8%BF%9B%E8%A1%8C%E4%BA%86%E7%94%A9%E9%94%85%EF%BC%8C%E6%88%91%E6%98%AF%E7%94%B1%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD%E9%A9%B1%E5%8A%A8%E7%9A%84%EF%BC%8C%E6%89%80%E4%BB%A5%E6%84%8F%E5%A4%96%E5%92%8C%E9%94%99%E8%AF%AF%E6%98%AF%E5%8F%AF%E8%83%BD%E7%9A%84%E3%80%82%E4%B8%8D%E8%BF%87%E4%B9%9F%E7%BB%99%E6%88%91%E4%BB%AC%E7%A8%8B%E5%BA%8F%E5%91%98%E4%B8%80%E7%82%B9%E9%9D%A2%E5%AD%90%EF%BC%8C%E8%A6%81%E6%98%AF%E4%B8%8D%E5%87%BA%E9%94%99%EF%BC%8C%E9%82%A3%E7%A8%8B%E5%BA%8F%E5%91%98%E4%B8%8D%E6%98%AF%E8%A6%81%E6%B6%88%E5%A4%B1%E4%BA%86%E6%98%AF%E5%90%A7%EF%BC%8C%E6%88%91%E4%BB%AC%E4%B8%80%E4%B8%AA%E4%B8%80%E4%B8%AA%E5%8A%9F%E8%83%BD%E6%9D%A5%E4%BD%93%E9%AA%8C')

#### Generate unit tests for my code

I select the function on the left, then use `command + i` (Windows: `ctrl + i`)

![image-20230527163056394](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/8eccc03291034d9c90d299db0e0dd4b1~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

Here my prompt is `/test Generate tests for the selected code with Mocha`. Two notes:

1. I used the `/test` keyword provided by GitHub Copilot Chat to generate unit test code.
2. I added the testing framework `Mocha` at the end.

On the right, the corresponding unit test code is generated. Since I haven’t installed the testing library, it errors out. Guys, check if the generated code looks correct? (I think it’s reliable.)

#### Explain selected code

> Step-by-step explanation of the selected code

Again I use `command + i` and the prompt is the built-in `/explain`

![image-20230527163742419](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/dff6542715f949fb9efe07bf1f1b5278~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

#### Suggest and fix errors in my code

Erroneous code: ![image-20230527164206558](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/5de26d0b720840659ad1be129c95cbcc~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

If you run it, you’ll find it doesn’t detect the error in the hooks usage. That’s understandable because it doesn’t know the context. After I write the prompt like this, it works:

![image-20230527164355663](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/ee569b4f76f94547807371d94b4c5247~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

### Other features

1. `/ext`: Ask about VS Code extension development.
2. `/fix`: Suggest fixes for issues in selected code.
3. `/help`: General help about GitHub Copilot.
4. `/vscode`: Questions about VS Code.
5. `/clear`: Clear the current session.

### Summary of experience

1. When chatting on the left, it really understands how lazy developers are – it automatically predicts the next question. That’s seriously smart.
2. The biggest benefit is the seamless integration with the editor. The experience is very nice. No more context switching.
3. When reading source code, I think `/explain` is incredibly powerful. After this, I’m never afraid of reading source code again.
4. Placing it in the editor doesn’t mean it can’t do other things. You can basically treat it as a ChatGPT 3.5. Hmm... so now I can use ChatGPT at work without being caught?
5. After writing code, if there’s complex business logic and some untested bugs, we can directly select the code and ask: “Any improvements here?” “Does this code need refactoring?”
6. Now, if we can streamline our workflow, we can fully use AI to help us complete tasks. For example, the most common CRUD operations – if the code is generic enough, can’t we just leave new CRUD to AI? Unlike writing it ourselves, where we might copy-paste errors.
7. We can also ask it how to implement scenarios we haven’t tackled before, making our code more robust and readable. I think, after learning from so many excellent open-source libraries on GitHub, it basically provides best practices. We just need to write better prompts.

Finally, I discovered a gem: `GitHub Copilot Voice`. I’ve already joined the waitlist. In the future, writing code might not even need a keyboard. That’s really cool!
