---
title: "前端程序员学习 Docker 的笔记 （-）"
publishDate: "2024-05-12T00:00:00.000Z"
tags: ["docker","笔记"]
description: "从前端开发者的角度介绍 Docker 的基础知识和实践应用。文章解释 Docker 的概念、优势及主要组件,并通过部署 Next.js 项目的实例,详细演示 Docker 的安装、配置、镜像构建、容器运行以及发布到 Docker Hub 的全过程。作者还提供了常用 Docker 命令的说明,为前端开发者快速上手 Docker 提供了实用指南。文章内容全面且易懂,适合想要学习 Docker 的前端开发人员阅读"
---

大家好，我是阿星。最近公司使用 Docker 进行了项目部署，但是我还不会 Docker。于是就补了一下技术漏洞，顺便写一个笔记，记录学习，因为最好的学习就是输出嘛！因为本人是前端开发，所以接下来都是从前端视角分享 Docker 的 学习

## 什么是 Docker？

官方解释：“Accelerate how you build, share, and run applications. Docker helps developers build, share, run, and verify applications anywhere — without tedious environment configuration or management.”
翻译过来就是：加快您**构建、共享和运行应用程序**的速度。Docker 帮助开发人员**在任何地方构建、共享、运行和验证应用程序，无需繁琐的环境配置或管理**。

## 为什么需要 Docker？

知道了什么是 Docker，可能还是不知道 Docker 是干什么的。这里举个例子：开发者小张在本地开发了一个 web 应用，并且调试也没有任何问题，这时候小张把应用部署到远程服务器，让所有人都能看到。那小张就需要**在远程服务器创建一个和本地一样的环境**，例如：数据库，Web服务器。即使这些环境一样，软件也不一定能运行，因为服务器的操作系统和本地不一样。为了模拟完全相同的本地开发环境，可能会想着使用虚拟机，但是虚拟机需要模拟硬件运行整个操作系统，而且还有以下缺点：

- 体积臃肿
- 内存占用高
- 程序的性能也会受到影响

于是就产生了 Docker，Docker与虚拟机非常类似，但却轻量很多，它不会去模拟底层的硬件，只会为每一个应用提供完全隔离的运行环境，我们可以在环境中配置不同的工具软件，并且不同环境之间相互不影响，这个环境就是 Docker 中的 container 容器。

## Docker 中四个重要概念

1. Docker file：就像是一个自动化脚本，它主要被用来创建镜像，可以理解为我们在虚拟机安装操作系统和软件，通过 Docker file 这个自动化脚本完成了安装过程，不需要再手动操作
2. 镜像（Image）：Docker 镜像是一个特殊的文件系统，除了提供容器运行时所需的程序、库、资源、配置等文件外，还包含了一些为运行时准备的一些配置参数（如匿名卷、环境变量、用户等）。镜像不包含任何动态数据，其内容在构建之后也不会被改变。可以把它理解成一个虚拟机的快照
3. 容器（Container）：通过镜像，我们可以创建许多不同的 container 容器，这里的容器可以理解为一台台运行起来的虚拟机，里面运行着应用程序，每个容器是独立运行的，它们相互之间不影响
4. 仓库（Repository）：在本地制作好镜像后，我们可以将镜像推送到远程仓库（Repository）。仓库分为公开仓库和私有仓库，最大的公开仓库是 Docker 的官方仓库 [Docker Hub](https://link.juejin.cn/?target=https%3A%2F%2Fhub.docker.com%2F)。这一点跟 Git 就很相似了，最大的 Git 公开仓库是 GitHub。

而镜像（Image）和容器（Container）的关系，就像是面向对象程序设计中的类和实例一样，**镜像是静态的定义，容器是镜像运行时的实体。容器可以被创建、启动、停止、删除、暂停等。**

## 实践

下面演示都是基于 windows 11 环境

### 安装 Docker Desktop

如果你使用的是Windows和Mac，可以在官网 [下载](https://www.docker.com/products/docker-desktop/) 一个叫做 Docker Desktop 的应用，并且在Windows 10以上，可以使用 WSL2：也就是 Windows 下的 Linux 子系统来运行 Docker，我们按照 [文档](https://docs.docker.com/desktop/install/windows-install/) 一步一步操作就好

> 注意：要运行 Windows 容器，您需要 Windows 10 或 Windows 11 专业版或企业版。 Windows 家庭版或教育版仅允许您运行 Linux 容器。

查看系统：
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715266006417-3ebf9e6e-4495-4f63-9143-9aa5d2edfdf3.png)
windows 11专业版环境安装成功页面：
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715265917277-dc44c005-1b19-4af5-ad3a-a69a1aae5381.png)
安装完成了，我们使用命令行检测一下是否真的安装好了：
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715266676848-4012a9dc-5426-444d-a90e-23ff5daa0e22.png)
如果不可用，那要设置下这个：
![](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715266891678-8099a21e-b0d8-43c5-9ac8-a26298c238fe.webp)
国内从 Docker Hub 拉取镜像有时会拉取不到，可以配置镜像加速器。可用的加速器可以参考：[gist.github.com/y0ngb1n/7e8…](https://link.juejin.cn/?target=https%3A%2F%2Fgist.github.com%2Fy0ngb1n%2F7e8f16af3242c7815e7ca2f0833d3ea6)。我们可以：
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715268881302-03335cab-264d-4986-ad98-7956fcd63241.png)
代码奉上：

```javascript
{
  // ...
  "max-concurrent-downloads": 2,
    "max-download-attempts": 10,
    "registry-mirrors": [
    "https://dockerproxy.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://docker.nju.edu.cn"
  ]
  // ...
}
```

### 简单熟悉 Docker Desktop

如果打开后，这样，请参考：[https://blog.csdn.net/weixin_43576565/article/details/134044435](https://blog.csdn.net/weixin_43576565/article/details/134044435) 解决：
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715269586757-54db611b-88b3-414a-8f07-4faf593fe59a.png)

搜索 & 拉取镜像（需要🪜）
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715269122739-fb78cc04-feff-4ea8-bfec-526ea5994884.png)

### Docker 部署 Next.js 项目

如果大家使用 VSCode 编辑器，可以安装 docker 插件，它能为 Dockerfile和 docker-compose.yml 文件提供了代码提示；通过Docker Explorer视图，可以直观地管理Docker资源，如容器、镜像、卷、网络和容器注册表。直接进行各种Docker操作，如启动和停止容器、查看日志等等 还有很多其他能力
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715270412016-717d3746-67e0-4c15-966c-44572d606dd8.png)
这里，我使用 VSCode 作为编辑器，使用 `npx create-next-app@latest`创建一个 Next.js 项目，然后修改一下代码，如下：
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715271118824-3ad168e9-a6c3-441e-a506-ce283f98bbf3.png)
现在我们为此项目添加 Dockerfile：

1. 根目录新建 .dockerignore，作用类似于 .gitignore，排除不必要的文件和目录，这样在构建 Docker 镜像时，就可以减小镜像大小并提高构建效率。我们写入：

```bash
Dockerfile
.dockerignore
node_modules
npm-debug.log
README.md
.next
docker
.git
```

2. 根目录新建 Dockerfile，写入，推荐使用安装了 Docker 的 VSCode 编写：

```bash
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install --registry=https://registry.npmmirror.com && npm run build
CMD npm start
EXPOSE 3000
```

Dockerfile 是用于**定制镜像文件的文本文件。其内的每一行都是一句指令。**完整的指令和其含义可查 [文档](https://docs.docker.com/engine/reference/builder/#dockerfile-reference)。简单解释一下上面这段代码：

- `FROM` 用于指定基础镜像。所谓定制镜像，那一定是以一个镜像为基础，在其上进行定制。而 `FROM` 就是指定 基础镜像，因此一个 Dockerfile 中** FROM 是必备的指令**，**并且必须是第一条指令**。这里我们选择 node:18-alpine 是参考了 Next.js 的官方 [ Docker 示例代码](https://github.com/vercel/next.js/tree/canary/examples/with-docker)。
- `WORKDIR` 用于指定**之后所有 Docker 命令的工作路径**。如该目录不存在，WORKDIR 会帮你建立目录。
- `COPY` 用于将文件拷贝到 Docker。**第一个点表示本地路径，第二个点表示目标路径**。目标路径可以是容器内的绝对路径，也可以是相对于工作目录的相对路径，这里意思是：将当前目录的所有文件拷贝到 /app下。
- RUN 用于执行命令行命令，我们可以执行任意 shell 命令。这里我们安装了项目依赖。
- CMD 用于指定**容器**启动命令。**RUN 可以有多个，在镜像构建阶段执行**。**CMD 只能有一个，在容器启动后执行**。前面说到，容器就是进程。既然是进程，那么在启动容器的时候，需要指定所运行的程序及参数。CMD 指令就是用于指定默认的容器主进程的启动命令的。
- EXPOSE 用于声明容器运行时提供服务的端口。不过**这只是一个声明**，在容器运行时并不会因为这个声明应用就会开启这个端口的服务。但可以帮助镜像使用者理解这个镜像服务的守护端口，以方便配置映射。

进入项目根目录，运行命令`docker image build -t next-docker-learn-demo:0.0.1 .`，构建镜像文件，我们可以看到：
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715348264267-58e561be-a536-401b-b0b6-e6400573d99d.png)
解释一下这个构建参数：
-t 参数用来指定镜像文件的名字，后面还可以用**冒号指定标签**。如果不指定，默认的标签就是 latest。**最后面还有一个 . 不能省略，**它告诉 Docker 应该在当前目录下寻找这个 Dockerfile 和 指定上下文路径。
第一次构建会慢一点，但是后面会快很多，因为 Docker会缓存之前的每一个操作，也就是 Docker中的分层。 构建完后，可以在 Docker 客户端中查看：
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715348348531-841eb019-3e44-4fc2-9c15-8f39cbd14686.png)
也可以在本地执行 docker images 查看镜像列表：
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715348398686-0cf72db3-a708-4b7c-957e-7428435a28aa.png)
有了镜像，我们使用docker run 创建并启动一个新的容器实例，可以在终端运行：

```bash
docker run -p 4000:3000 next-docker-learn-demo:0.0.1
```

-p 用于指定端口映射，这里的意思是将容器的 3000 端口映射到主机的 4000 端口，格式：`[宿主机端口]:[容器端口]`, `next-docker-learn-demo:0.0.1`指定了要使用的 Docker 镜像

- next-docker-learn-demo 是 Docker 镜像的名称。
- 0.0.1 是镜像的版本标签，用于指定具体的版本

也可以使用 Docker 客户端 运行，我们需要填写一些参数：
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715351997214-6601e81d-e9cc-4657-b106-e1c1b7b03c62.png)
我们本地访问：[http://localhost:4000/](http://localhost:4000/)，可以看到：
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715352124331-b3d953cd-7896-44fb-8f7e-c9c9615fc9f1.png)
查看 Docker 客户端：
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715352300114-bad9f7ec-fb78-4728-88a0-14cd97b32f01.png)
也可以通过 docker ps 在终端查看：
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715354945312-3a5546f8-ca35-4c2f-98e6-41b6dc3cf413.png)
我们可以使用以下命令对启动的容器进行启动、停止、删除等操作：

```bash
# 容器列表
docker container ls
# 停止容器
docker container stop container-id
# 启动容器
docker container start container-id
# 重启容器
docker container restart container-id
# 删除容器
docker container rm container-id

```

下面我们可以将镜像发布到 Docker Hub（就像把代码发布到 github）。首先需要去[https://hub.docker.com/](https://hub.docker.com/) 注册一个账户，也可以直接在 Docker 客户端进行登录：![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715354324888-ed49b5b4-3871-4c25-bdad-0b70cd553975.png)
我们可以在终端执行 docker login 确认我们登录成功：
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715354350699-1bd2443a-d77d-4bc9-aae8-d7cec451ea71.png)
现在我们在终端把我们的 `next-docker-learn-demo` 发布到 Docker hub，
需要先使用 `dcoker image tag` 标记本地镜像，将其归入某一仓库：

```bash
# 格式如下：
# docker image tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]
# 其中 snailrun160 是我的 Docker Hub 账户名
docker image tag next-docker-learn-demo:0.0.1 snailrun160/next-docker-learn-demo:0.0.1

```

然后`推送其到 Docker Hub：

```bash
# 格式如下：
# docker image push [OPTIONS] NAME[:TAG]
docker image push snailrun160/next-docker-learn-demo:0.0.1
```

发布完毕后，在 Docker 客户端的 Images 下的 Hub 可看到：![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715355841312-0342cecd-0d29-4dab-91a2-19a254f89f81.png)
推送到 Docker Hub 后，其他人就可以直接拉取我的镜像文件：

```bash
docker image pull snailrun160/next-docker-learn-demo:0.0.1
```

然后运行 docker run ：创建容器

```bash
docker run -p 4000:3000 next-docker-learn-demo:0.0.1
```

到这里，最基本的 Docker 使用就结束了，是不是还是很简单的，但是这才是 Docker 的冰山一角，我打算写三篇文章记录 Docker 学习，学完后应该就够我用了！

## 回顾

我们来总结一下，我们学到的知识，

- 我们知道了什么是 Docker？它解决了什么问题？
- 我们如何在电脑安装 Docker 环境？
- 了解 Docker Desktop 和 VSCode Docker
- 如何使用 Docker 进行简单的 Next.js 纯前端项目部署

下一章，我会介绍 Docker Compose ，把一个带 Nginx，Redis，MySQL的项目，使用 Docker Compose 来对多个容器进行管理，

## 参考：

1. 官方网站：[https://www.docker.com/](https://www.docker.com/)
2. Docker 10分钟快速入门： [https://www.bilibili.com/video/BV1s54y1n7Ev](https://www.bilibili.com/video/BV1s54y1n7Ev/?share_source=copy_web&vd_source=baff1d303cd044521f2216d96406a3a4)
3. Docker 入门到实践：[https://yeasy.gitbook.io/docker_practice](https://yeasy.gitbook.io/docker_practice)
