---
title: "Rebuilding My Personal Blog with DeepSeek and Pi"
publishDate: "2026-04-30T05:21:51Z"
updatedDate: "2026-04-30T05:21:51Z"
tags: ["AI"]
description: "DeepSeek + Pi Rebuilds My Personal Blog\n\nHi everyone, I'm luckySnail. The long-awaited DeepSeek has finally been released. After checking the benchmark scores, I decided to test it out for real — though only for programming tasks. I planned to use it to rebuild my personal blog. Here are the results. What do you think?\n\nSource code for the new blog: https://github.com"
---

## DeepSeek + Pi Redesigns My Personal Blog

Hi everyone, I'm luckySnail. You know how the long-awaited DeepSeek was finally released? After checking the benchmark scores, I decided to put it to the test in real-world use—specifically on programming capability. I wanted to use it to redesign my personal blog. Here's the result—what do you think?
![CleanShot 2026-04-29 at 12.02.29](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/CleanShot%202026-04-29%20at%2012.02.29.png)
Source code of the new blog: https://github.com/coderPerseus/blog-astro. Here's what the old homepage looked like:
![502bd626a90287ddb4ca9afbb23a5a65](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/502bd626a90287ddb4ca9afbb23a5a65.png)

I don't know about you, but I prefer the new UI—clean, minimal, content-first, showing as much information as possible to visitors. Because when I read other people's blogs, I'm mostly focused on the content itself. Many blogs have unnecessary elements and animations that just get in the way of reading.

Of course, this gorgeous (if I do say so myself) blog isn't solely DeepSeek's achievement. I started from an open-source template and modified it heavily. Throughout the process, I used DeepSeek, Claude, and Codex to collaborate on this blog. Right around the time I was developing, GPT-Image-2 was released, and I leveraged its powerful reasoning ability and aesthetic sense too.

This article will walk you through the entire process of building this blog, holding nothing back. If you're also looking to set up a personal blog, or if you happen to be developing with AI, this post is worth your time. Here are the sections—feel free to jump to whichever interests you:
1. Why picking a good template saves you half the work
2. A single prompt that tests an LLM's abilities across multiple dimensions
3. DeepSeek's real-world performance in Claude Code and Pi
4. Doubao Input Method + Codex: fast iteration, turning your intent into code quickly
5. This one task only ChatGPT 5.5 Pro could handle
6. Fully automated deployment with GitHub CI
7. Summary: taste, aesthetics, judgment, effort, and attention

Before we start, a bit of background. I used AI tools including DeepSeek to redesign my old blog system, which was built with Next.js and used GitHub issues as the article storage service. Deployment involved GitHub CI and Gitee hooks—the whole pipeline was a hassle. Every time I published a new article, I had to first post it on GitHub issues, then go to Gitee to sync the latest code from GitHub and trigger hooks to sync with the server (Baota). Too many manual steps. Clearly, this was way too outdated for the AI era. So I decided to redesign. It wasn't until I saw an Astro template and the output from DeepSeek that I finally committed to the change.

## Choose a Good Starter Template

A good template has become even more important in today's AI era, because AI's instruction-following ability is very strong—it's especially good at following established rules and replicating examples. So choosing a mature starter template that avoids many pitfalls can greatly improve the AI's accuracy and help it generate the code you want.

The template I'm using this time is: https://github.com/chrismwilliams/astro-theme-cactus . But I didn't discover it directly. I first came across this blog: https://stevedylan.dev/ , which is very simple and clean—this is exactly the kind of blog I wanted, where visitors can quickly get to know the author and see the blog content. Later I found that it was built on astro-theme-cactus .

This template currently has 1.6k stars, comes with detailed usage instructions, and has a very well-organized code structure. It's clearly an AI-friendly project.

## A Prompt That Tests Multiple Capabilities of Large Models

With the template in hand, the next step was to quickly prototype the new blog based on my current project combined with the new template. This is a tedious and tiring task, so naturally I'd hand it over to AI. After sorting out the requirements, I came up with the following prompt:

```bash
Now I want to refactor my blog. The URL is: https://luckysnail.cn/ and the corresponding GitHub repo is: https://github.com/coderPerseus/blog . I want to rebuild it using Astro, based on https://github.com/chrismwilliams/astro-theme-cactus . Requirements:
1. Optimize the UI and page design based on the current clean UI of astro-theme-cactus, making it look more beautiful and incorporating Chinese elements, while keeping it simple.
2. Use a suitable light purple as the theme color.
3. Sync the current blog's data. Currently, the data is stored in GitHub issues. I want to continue using the issues in this repository as the data source.
4. It should be AI-friendly. The blog should support AI automatic translation to English, and have a simple AI-generated summary at the beginning.
5. Support both Chinese and English, and support light and dark themes (with transition animations when switching).
```

This prompt can test many capabilities of the model and its corresponding Agent:

- Whether it can break down vague requirements into concrete, executable plans
- Understanding of the codebase
- Architecture design capability
- Ability to fulfill requirements under constraints
- UI/product aesthetics

## Testing DeepSeek in Claude Code and Pi

I decided to connect DeepSeek to Claude Code and Pi Agent to see the final results. Since Pi doesn't officially support DeepSeek yet, I made a small tweak to support the latest DeepSeek-V4-Pro-Max. Here are the results they delivered after I gave them the prompt. First up, Claude Code:

![Image](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/HGqT2FAbIAAszTt.jpeg)

Pi results:

![Image](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/HGqTpbSa8AEManW.jpeg)

With the same prompt, I found that DeepSeek works better and also uses fewer tokens when running inside a more general-purpose agent framework. These two long tasks cost me 13 yuan—still pretty expensive.

![Image](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/HGqSsBwa0AAc_BQ.jpeg)

But it seems DeepSeek has lowered its prices again since then. If you get a chance, give this price-slasher model a try. It feels similar to Kimi K2.5 in terms of quality.

## Doubao Input Method + Codex for Rapid Iteration

After setting up the first version, it was a constant cycle of tweaks until I was satisfied. A few interesting points came up during this process:

1) **Voice input**: If you haven't tried using a voice input method with a Coding Agent yet, I highly recommend you give it a shot. It dramatically boosts your efficiency and experience — the feeling of turning ideas in your head into working code is incredibly satisfying.

2) **The best Coding Agent GUI right now**: Codex is without a doubt the best Coding Agent available. It lets you handle multiple tasks in parallel, uses a built-in worktree in the left sidebar to isolate development environments and avoid conflicts, and comes packed with a ton of plugins. With the recent addition of Browser use and Computer use support, it genuinely feels like magic. If you're new to AI-assisted programming, this is perfect for you. Even someone like me who uses TUI tools daily can't escape the Codex desktop app now. I'll admit that terminal interfaces are just an intermediate form for Coding Agents — GUIs are what humans truly need.

3) **Your design expert — GPT-Image-2**: The newly released Image 2 by GPT is incredibly useful. It can generate posters with correct text, infographics, landing page mockups, website logos, branding materials, and more. Just give it your requirements or a screenshot of your current site, and it will autonomously understand your needs, reason about the image you want, and produce truly stunning results.

4) **Your best frontend guru is still Claude**: While ChatGPT is excellent at logical reasoning, problem diagnosis, and fixing issues, it falls short of Claude when it comes to frontend aesthetics. So for any tricky UI changes or interaction refinements, I always turn to Claude.

Below is a snippet of my conversations within Codex — it took many rounds of back-and-forth to polish the final version.

![image-20260430130030582](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260430130030582.png)

## Testing SVG Capabilities Across Multiple Models

During development, I asked GPT Image 2 to generate an image of my username in an artistic font. The result was great, as shown below:

![image-20260425184113072](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260425184113072.png)

But when I tried to use it, embedding a static image felt awkward. I wondered if I could recreate the image using SVG. So I gave the image and the same prompt to the latest Claude Opus 4.7, Gemini, and GPT-5.5 Pro. In the end, only GPT-5.5 Pro succeeded; the others failed. Here is the SVG generated by ChatGPT Pro. For production use, I had Claude make a few optimizations: removing the border and adding dark mode support.

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="1535" height="1024" viewBox="0 0 1535 1024" role="img" aria-label="LuckySnail logo">
  <defs>
    <linearGradient id="ink" x1="297" y1="337" x2="1318" y2="672" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#090909"/>
      <stop offset="0.45" stop-color="#101010"/>
      <stop offset="0.72" stop-color="#666666"/>
      <stop offset="1" stop-color="#191919"/>
    </linearGradient>
  </defs>
```

```svg
<path
  d="M 875 624.05 L 861 624.67 L 843 621.74 L 828 616.74 L 815 608.61 L 804.32 598 L 798.33 587 L 795.2 574 L 795.08 565 L 797.63 554 L 802.2 544 L 809.42 535 L 817 528.39 L 835 519.55 L 856 517.31 L 868 519.56 L 875 522.23 L 889.67 533 L 894.66 540 L 898.71 550 L 897.77 566 L 892.73 576 L 888 580.66 L 880 585.59 L 872 587.6 L 864 587.75 L 853 584.8 L 844.3 577 L 841.23 571 L 841.23 562 L 844.22 555 L 849 550.22 L 853 548.39 L 861 548.48 L 866 551.29 L 868.71 555 L 868.6 560 L 867 561.49 L 862.05 559 L 858.41 560 L 855 564.58 L 854.88 569 L 857 573.51 L 861.17 577 L 870.11 578 L 878.91 574 L 885 565.21 L 886.18 557 L 885 548.18 L 882 542.05 L 878 537.36 L 872.96 533 L 866.77 530 L 852.45 528 L 842.22 530 L 835.76 533 L 827 539.96 L 821 548.96 L 817.66 564 L 817.78 575 L 820 583.01 L 824 591.81 L 831.96 601 L 843.98 609 L 852.4 612 L 866.41 614 L 879.54 613 L 895 608.04 L 903.06 603 L 912 594.83 L 921 581.16 L 924 571.46 L 925.02 556 L 923 545 L 915 529.97 L 905.06 520 L 895.12 513 L 856 493.66 L 842 484.73 L 829.35 471 L 825.19 463 L 823.26 456 L 822.26 445 L 824.41 433 L 828.63 423 L 835.37 413 L 846 403.49 L 856 397.3 L 867 393.23 L 881.03 390 L 882.16 376 L 881 355.86 L 875.29 351 L 874.18 344 L 877 338.77 L 884 335.91 L 890 338.15 L 892.66 341 L 893.74 345 L 892.68 350 L 888.8 354 L 890.38 390 L 909 393.07 L 920.35 370 L 925.28 363 L 924.12 357 L 925.21 352 L 930 348.29 L 934 347.6 L 938 348.41 L 942.49 353 L 943.38 358 L 941.55 363 L 936 366.69 L 931.81 367 L 930 368.94 L 923 380.52 L 916.92 396 L 930 403.22 L 938.49 411 L 941.82 416 L 942.63 426 L 938.72 448 L 936 450.78 L 933.26 449 L 933.03 442 L 930.01 429 L 926 421.01 L 920.4 414 L 913.18 408 L 905.26 404 L 891.03 401 L 873.56 403 L 865.99 406 L 858.03 412 L 850 424.94 L 848.62 434 L 848.95 443 L 854 454.08 L 862.86 463 L 877.39 472 L 915 491.26 L 933.54 506 L 941.52 516 L 948.68 531 L 950.67 542 L 950.73 557 L 947.54 572 L 940.61 586 L 934.74 594 L 923 605.73 L 911 613.56 L 902 617.79 L 887 622.63 L 875 624.05 Z M 399 588.27 L 389 588.64 L 379 585.66 L 374 582.62 L 367.27 574 L 365 560.9 L 357.58 571 L 346 580.73 L 337 585.53 L 324 588.56 L 315 587.77 L 307 584.71 L 299.48 577 L 296.17 567 L 297.37 544 L 303.27 520 L 343 389.33 L 342 383.49 L 333 381.8 L 332.47 379 L 374 368.04 L 376.43 370 L 346 464.65 L 322 546.22 L 320.35 562 L 321 567.46 L 324.48 574 L 327.73 576 L 333 576.51 L 342.05 575 L 348.18 571 L 356 563.19 L 364 551.37 L 367 544.8 L 380.3 492 L 380.34 486 L 374 484.78 L 372.57 483 L 374 481.15 L 404 473.45 L 408.71 474 L 388.87 556 L 390 568 L 392.94 573 L 398.63 576 L 407 576.28 L 414.85 575 L 424.95 569 L 433.01 561 L 441 548.67 L 445 538.08 L 456 495.7 L 459.04 483 L 459.56 475 L 461 474.12 L 484 474.14 L 485.73 476 L 461.87 568 L 461.97 576 L 463.57 578 L 467.13 579 L 474 576.63 L 475.76 579 L 469 584.5 L 461 587.8 L 451 587.8 L 445 585.67 L 440.34 581 L 438.27 575 L 439 561.91 L 431 571.93 L 420 580.71 L 410 585.78 L 399 588.27 Z M 676 589.26 L 667 588.71 L 661 586.68 L 651.55 579 L 648.29 574 L 645.43 566 L 638 534 L 636 530.95 L 631 529.74 L 626 531.99 L 622 536.9 L 612.99 571 L 611.98 576 L 612.98 580 L 619 582.73 L 618 585.65 L 579 585.84 L 577.27 584 L 579 582.01 L 585.08 580 L 588 575.61 L 614.15 473 L 630 417.72 L 630.04 414 L 628.38 412 L 622 411.79 L 620.36 409 L 623 407.23 L 657 398.04 L 659.5 399 L 659.57 401 L 625.58 524 L 640 514.04 L 675 485.47 L 676.18 484 L 676.15 480 L 670.1 477 L 671 474.27 L 702 474.14 L 703.78 475 L 703 477.75 L 697.22 480 L 684.83 488 L 642.99 520 L 652 522.16 L 660.8 531 L 664.57 541 L 670 564.79 L 675 575.2 L 679.29 579 L 683 580.32 L 688.89 580 L 694 577.82 L 695.37 579 L 694.89 581 L 689 585.67 L 676 589.26 Z M 1284 585.29 L 1245 585.91 L 1243.28 584 L 1245 582.06 L 1250.82 580 L 1254 575.78 L 1288 434.81 L 1289.08 429 L 1288 425.34 L 1281 424.34 L 1279.84 422 L 1281 420.6 L 1291 417.33 L 1317 411.05 L 1318.66 413 L 1278 573.77 L 1278.81 580 L 1284 582.15 L 1284 585.29 Z M 1242 458.15 L 1236 457.72 L 1231.08 454 L 1228.36 449 L 1228.16 443 L 1230.27 438 L 1234 434.35 L 1243 431.28 L 1250 433.29 L 1253.76 437 L 1255.66 441 L 1255.93 446 L 1254.51 451 L 1251 454.8 L 1246 457.62 L 1242 458.15 Z M 535 588.27 L 524 588.71 L 511 585.69 L 502 580.82 L 494.33 573 L 489.53 563 L 487.35 552 L 487.41 543 L 491.28 525 L 495.44 515 L 506.37 499 L 520 486.3 L 529 480.3 L 543 474.38 L 554 472.18 L 563 472.26 L 576 475.19 L 586 481.42 L 589.79 487 L 588.7 497 L 581 508.55 L 577.38 507 L 576 493.83 L 571 484.77 L 564.24 480 L 554.15 479 L 543.76 482 L 534 489.49 L 525 500 L 517 516.15 L 513 533.03 L 512.88 553 L 517.99 566 L 523.86 572 L 533.2 576 L 546.67 576 L 555.65 573 L 564 568.03 L 575 557.33 L 577 557.36 L 578.66 559 L 578.49 561 L 571.62 570 L 560 579.73 L 548 585.49 L 535 588.27 Z M 1057 588.12 L 1049 587.46 L 1043 584.68 L 1039.31 580 L 1037.44 574 L 1038.38 561 L 1050 514.23 L 1051.21 498 L 1050 492.01 L 1046.11 487 L 1042.12 485 L 1036 484.35 L 1025.18 486 L 1018.97 489 L 1010 496.96 L 1002 508.69 L 985.91 571 L 986 579.72 L 991 582.02 L 991.55 585 L 977 585.92 L 953 585.91 L 951.23 585 L 952 582.44 L 959 579.42 L 962.03 574 L 981 494.24 L 981.09 487 L 975 485.24 L 974.06 484 L 975 481.7 L 1007 473.2 L 1008.75 475 L 1005 494.19 L 1012 486.31 L 1023 478.22 L 1029 475.27 L 1040 472.37 L 1049 472.2 L 1058 474.18 L 1063 476.46 L 1070.31 483 L 1074.65 492 L 1075.64 504 L 1062 564.78 L 1060.88 574 L 1063 578.09 L 1067.25 579 L 1073 577.01 L 1075.6 579 L 1065 586.63 L 1057 588.12 Z M 1115 588.32 L 1106 588.64 L 1097 586.6 L 1091 583.65 L 1085.3 578 L 1082.49 571 L 1082.23 562 L 1086.31 550 L 1097 538.44 L 1107 532.19 L 1124 525.34 L 1148.08 519 L 1156.15 515 L 1162.03 509 L 1164.08 502 L 1164.21 493 L 1162 485.87 L 1156.55 481 L 1149 478.94 L 1138.53 480 L 1131.05 483 L 1124.68 488 L 1119 494.63 L 1112.58 506 L 1109 507.91 L 1106.65 506 L 1106.04 502 L 1108.36 490 L 1112 485.35 L 1119 480.23 L 1137 473.43 L 1157 472.33 L 1169 474.46 L 1174 476.56 L 1183.7 485 L 1186.75 492 L 1187.63 500 L 1172 573.51 L 1174.28 578 L 1178 578.51 L 1183 577.17 L 1184.64 580 L 1179 584.52 L 1172 587.47 L 1162 587.86 L 1157 586.71 L 1150.37 581 L 1148.41 576 L 1148 569.73 L 1139 578.58 L 1131 583.77 L 1124 586.62 L 1115 588.32 Z M 1230 585.76 L 1191 585.92 L 1189.38 584 L 1191 582.16 L 1197.47 580 L 1200 576.05 L 1221 491.54 L 1220 486.53 L 1214 485.12 L 1213.09 483 L 1222 479.42 L 1246 473.57 L 1247.97 476 L 1246.7 483 L 1225 571.57 L 1224.97 579 L 1230.41 582 L 1230 585.76 Z M 438 672.6 L 433 669.78 L 428.24 665 L 423.29 654 L 424.31 644 L 428.23 635 L 438 624.58 L 449 617.19 L 468 609.31 L 483 606.34 L 510 605.43 L 539 610.27 L 571 620.32 L 600.86 632 L 620.28 638 L 634.74 641 L 655 642.07 L 668.52 641 L 681.47 638 L 694.04 633 L 708.13 624 L 717.57 616 L 730.03 603 L 742.3 586 L 739.25 586 L 740 587.8 L 739 586.38 L 732 586.68 L 726 584.68 L 718.23 578 L 712.35 568 L 709.42 553 L 708.41 539 L 711.25 510 L 716.17 482 L 714.27 479 L 710.65 478 L 710.28 475 L 712 474.05 L 741 474.08 L 742.52 475 L 734.99 514 L 732.96 546 L 736 566 L 739.98 573 L 745 576.01 L 749.04 575 L 758.13 561 L 772 533.43 L 782.12 508 L 788 489.44 L 788.26 483 L 787.02 480 L 782 478.61 L 780.26 476 L 783 474.11 L 809 474.07 L 810.71 475 L 810 477.71 L 802.1 481 L 800 483.94 L 786.65 520 L 773.67 549 L 758.66 576 L 743.44 599 L 729.84 616 L 714 631.75 L 691 647.58 L 674 654.57 L 661 657.78 L 641 658.86 L 627 657.67 L 611 654.71 L 596 649.75 L 544.58 629 L 524.58 623 L 501.5 619 L 480.69 619 L 460.44 624 L 450.86 629 L 444 634.8 L 438 643.92 L 436 650.44 L 436 661.47 L 439.66 670 L 438 672.6 Z M 1129.2 576 L 1139.37 570 L 1150 557.18 L 1160 520.21 L 1146 526.69 L 1127.18 533 L 1119.02 538 L 1110.94 547 L 1106.9 558 L 1106.93 566 L 1109 570.91 L 1115.97 576 L 1129.2 576 Z"
  fill="url(#ink)"
  fill-rule="evenodd"
/>
```

Oh, and here's what other models produce:

Claude Opus 4.7

![image-20260430130205704](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260430130205704.png)

Gemini:

![image-20260430130457118](https://pub-0d530dc48245462d8f3734870a46cd58.r2.dev/image-20260430130457118.png)

## Fully Automated Deployment via GitHub CI

The old version of the blog required bridging GitHub and Baota via Gitee, but after asking AI, I found that I could directly connect to our server through GitHub CI using public and private keys.

In addition to connecting to Baota to update the blog, I also implemented automatic translation of articles into English through CI, writing an auto-translation script based on DeepSeek as the translation engine. Test results show the translations are pretty good, and most importantly, very cheap.

On top of that, I also developed a skill based on the gh CLI that automatically updates GitHub issues with the article. So when my article is written, I just need to invoke this skill, and the AI will automatically convert the article into GitHub issues. Then, GitHub CI, listening for issue updates, will automatically trigger the deployment CI to translate and deploy.

This way, I only need to focus on writing the articles, and leave all the publishing to AI and CI.

## Summary: Taste, Aesthetic, Judgment, Willpower, and Attention

Although it's just a simple blog, the process—from choosing a template to repeatedly polishing it and finally deploying it fully automatically via CI/CD—taught me a lot about product development. The initial template selection came from blogs I frequently read, and the typography was inspired by [Tw93's blog](https://tw93.fun/) and [Fastify author's blog](https://nodeland.dev/). Then I used GPT-Image-2 to refine the UI and design, and eventually iterated on the writing and publishing workflow to let AI and automation handle as much of the repetitive work as possible. Many blogs go stale simply because publishing a single post is too cumbersome. That's why I redesigned this blog: to make publishing effortless and channel more time and focus into the writing itself.

Let me conclude with a quote from Steve Jobs to share with you:

> Ultimately it comes down to taste. It comes down to trying to expose yourself to the best things that humans have done...

In short, it's all about taste. It's about striving to expose yourself to the very best that humanity has produced.

Oh, and by the way, the May Day holiday starts tomorrow—so a happy holiday to everyone who made it this far! 🎉
