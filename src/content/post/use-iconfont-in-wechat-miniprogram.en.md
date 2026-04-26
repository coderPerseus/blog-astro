---
title: "How to add icons in WeChat Mini Programs"
publishDate: "2022-03-06T00:00:00.000Z"
tags: ["微信小程序","iconfont"]
description: "How to find the icon you want on iconfont and then import it into a mini program for use."
---

#### Background:

I've been working on my big project recently! I'm using WeChat Cloud Development. Since I'd never built a mini program before, I thought I'd start by practicing with an existing project. While following a video tutorial, I noticed that all the examples used images. I wondered if I could use `iconfont` instead — it takes up less memory.

#### Implementation:

I tried several methods, but none of them worked the way I wanted — or flat out didn't work. I finally got it working after finding one article.

1. Go to the `iconfont` website: https://www.iconfont.cn/. Add the icons you want to your cart, then add the cart icons to a project.

2. Open the target project where the `iconfont` is stored, download its code to your local machine — you'll get a zip file.

3. Extract the zip file and rename it. I named the folder `iconfont`.

4. Open `cmd` and navigate to the `iconfont` directory. Then we need to convert this iconfont into code that WeChat mini program can recognize — i.e., generate an `iconfont.wxss` file we want. Do this in the terminal:  
   `npm install -g iconfont-tools` then press `Enter`  
   `iconfont-tools` then press `Enter`  
   A prompt will appear asking for input, just like when initializing a Vue/React project.

5. Open the `iconfont-wx` folder, and you'll see the generated target file `iconfont-wxIcon.wxss`.

6. Now we can paste this target file into the corresponding location in our mini program project.

7. In the mini program project's `app.wxss` file, import our `iconfont`.

8. Use it:

   > <view class="t-icon t-icon-bangzhu"></view>

   #### Note:

   You can open the `iconfot-wxIcon.wxss` file to take a look. You'll notice that `t-icon` here is equivalent to `iconfont`. And when using a specific icon, we write `t-icon-bangzhu` — i.e., adding a `t-` prefix to the official name.
