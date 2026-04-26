---
title: "Frontend Programmer's Notes on Learning Docker (-)"
publishDate: "2024-05-12T00:00:00.000Z"
tags: ["docker","笔记"]
description: "Introduces the basics and practical applications of Docker from a frontend developer's perspective. The article explains Docker's concepts, advantages, and key components, and walks through the entire process of installing, configuring, building images, running containers, and publishing to Docker Hub using a Next.js project as an example. The author also provides explanations of commonly used Docker commands, offering a practical guide for frontend developers to quickly get started with Docker. The content is comprehensive and easy to understand, making it suitable for frontend developers who want to learn Docker."
---

Hi, I'm A-Xing. Our company recently used Docker for project deployment, but I didn't know Docker yet. So I patched that knowledge gap and wrote some notes to record my learning—because the best way to learn is to teach! Since I'm a frontend developer, I'll be sharing my Docker learning from a frontend perspective.

## What is Docker?

Official explanation: "Accelerate how you build, share, and run applications. Docker helps developers build, share, run, and verify applications anywhere — without tedious environment configuration or management."
In plain English: It speeds up **building, sharing, and running applications**. Docker helps developers **build, share, run, and verify applications anywhere, without tedious environment configuration or management**.

## Why Docker?

Knowing what Docker is still might not answer what it's for. Let me give an example: Developer Zhang built a web app locally and it worked perfectly. Now Zhang wants to deploy it to a remote server so everyone can see it. Zhang would need to **create an environment on the remote server identical to the local one** — database, web server, etc. Even if those environments match, the software might not run because the server's operating system differs from the local one. To simulate the exact local development environment, one might think of using virtual machines, but VMs simulate hardware and run an entire operating system, which has several drawbacks:

- Bloated size
- High memory usage
- Degraded application performance

That's where Docker comes in. Docker is very similar to a virtual machine, but much lighter. It doesn't simulate low‑level hardware; it provides a completely isolated runtime environment for each application. Inside that environment you can configure different tools and software, and different environments don't interfere with each other. This environment is called a **container** in Docker.

## Four Important Concepts in Docker

1. **Dockerfile**: Like an automation script, it's mainly used to create images. Think of it as installing an OS and software in a VM — the Dockerfile automates the installation so you don't need to do it manually.
2. **Image**: A Docker image is a special filesystem that, besides providing the programs, libraries, resources, and configuration files needed at container runtime, also contains some runtime‑ready configuration parameters (e.g., anonymous volumes, environment variables, users). The image contains no dynamic data, and its content never changes after building. You can think of it as a snapshot of a VM.
3. **Container**: From an image, we can create many different containers. Think of a container as a running VM that runs your application. Each container runs independently and they don't affect each other.
4. **Repository**: After building an image locally, you can push it to a remote repository. Repositories can be public or private. The largest public repository is Docker's official [Docker Hub](https://hub.docker.com/). This is very similar to Git — the largest public Git repository is GitHub.

The relationship between an **image** and a **container** is like that between a class and an instance in object‑oriented programming: **the image is a static definition, and the container is the runtime entity of the image. Containers can be created, started, stopped, deleted, paused, etc.**

## Practice

The following demonstrations are all based on Windows 11.

### Installing Docker Desktop

If you're on Windows or Mac, you can download an app called **Docker Desktop** from the [official site](https://www.docker.com/products/docker-desktop/). On Windows 10 or later, you can use WSL2 (Windows Subsystem for Linux) to run Docker. Just follow the [documentation](https://docs.docker.com/desktop/install/windows-install/) step by step.

> Note: To run Windows containers, you need Windows 10 or Windows 11 Pro or Enterprise. Windows Home or Education only allows you to run Linux containers.

Check your system:
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715266006417-3ebf9e6e-4495-4f63-9143-9aa5d2edfdf3.png)
Windows 11 Pro environment installation success screen:
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715265917277-dc44c005-1b19-4af5-ad3a-a69a1aae5381.png)
After installation, verify from the command line:
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715266676848-4012a9dc-5426-444d-a90e-23ff5daa0e22.png)
If it doesn't work, you might need to configure this:
![](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715266891678-8099a21e-b0d8-43c5-9ac8-a26298c238fe.webp)
Pulling images from Docker Hub inside China can sometimes fail, so you can configure a mirror accelerator. Useful mirrors can be found at: [gist.github.com/y0ngb1n/7e8…](https://gist.github.com/y0ngb1n/7e8f16af3242c7815e7ca2f0833d3ea6). You can:
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715268881302-03335cab-264d-4986-ad98-7956fcd63241.png)
Here's the config:

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

### Getting Familiar with Docker Desktop

If after opening it looks like this, refer to [this](https://blog.csdn.net/weixin_43576565/article/details/134044435) to fix it:
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715269586757-54db611b-88b3-414a-8f07-4faf593fe59a.png)

Search & pull images (may need VPN/proxy):
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715269122739-fb78cc04-feff-4ea8-bfec-526ea5994884.png)

### Docker Deploying a Next.js Project

If you use VSCode, you can install the Docker extension. It provides code hints for Dockerfile and docker-compose.yml files, and through the Docker Explorer view you can intuitively manage Docker resources such as containers, images, volumes, networks, and registries. You can directly perform Docker operations like starting/stopping containers, viewing logs, and much more.
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715270412016-717d3746-67e0-4c15-966c-44572d606dd8.png)

Here, I use VSCode as my editor. I create a Next.js project with `npx create-next-app@latest`, then modify the code as follows:
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715271118824-3ad168e9-a6c3-441e-a506-ce283f98bbf3.png)

Now add a Dockerfile to this project:

1. Create a `.dockerignore` in the root directory. It works like `.gitignore`, excluding unnecessary files and directories to reduce image size and improve build efficiency. Write:

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

2. Create a `Dockerfile` in the root directory and write the following (recommended to use VSCode with Docker extension):

```bash
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install --registry=https://registry.npmmirror.com && npm run build
CMD npm start
EXPOSE 3000
```

A Dockerfile is a **text file used to custom‑build images. Each line is an instruction.** See the [documentation](https://docs.docker.com/engine/reference/builder/#dockerfile-reference) for all instructions and their meanings. A quick explanation of the above:

- `FROM` specifies the base image. When you custom‑build an image, you start from a base image and customize on top of it. `FROM` is **mandatory** and **must be the first instruction**. Here we used `node:18-alpine` following Next.js' official [Docker example](https://github.com/vercel/next.js/tree/canary/examples/with-docker).
- `WORKDIR` sets the **working directory for all subsequent Docker commands**. If the directory doesn't exist, WORKDIR creates it.
- `COPY` copies files into Docker. **The first dot is the local path, the second dot is the target path** (container‑relative or absolute). Here it means: copy all files from the current directory into `/app`.
- `RUN` executes shell commands. You can run any shell command. Here we install project dependencies.
- `CMD` sets the default command for the container. **There can be multiple RUN instructions, executed during image build.** **There can only be one CMD, executed after the container starts.** As mentioned earlier, a container is a process. When starting a container, you need to specify the program and arguments to run. CMD defines the default main process.
- `EXPOSE` declares which port the container listens on at runtime. **It's just a declaration** — it doesn't actually open that port inside the container, but it helps users understand which port to map.

Go to the project root directory and run `docker image build -t next-docker-learn-demo:0.0.1 .` to build the image. You'll see:
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715348264267-58e561be-a536-401b-b0b6-e6400573d99d.png)

Explanation of the build parameters:
- `-t` gives the image a name; you can optionally add a **tag after a colon**. If omitted, the default tag is `latest`. **Don't forget the trailing dot `.`** — it tells Docker the build context is the current directory and that the Dockerfile is there.

The first build may be slower, but subsequent builds are much faster because Docker caches each layer. After building, you can view it in the Docker client:
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715348348531-841eb019-3e44-4fc2-9c15-8f39cbd14686.png)

You can also run `docker images` locally to list images:
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715348398686-0cf72db3-a708-4b7c-957e-7428435a28aa.png)

Now that we have an image, we use `docker run` to create and start a new container instance. From the terminal:

```bash
docker run -p 4000:3000 next-docker-learn-demo:0.0.1
```

- `-p` maps ports: `<host port>:<container port>`. Here, container port 3000 is mapped to host port 4000.
- `next-docker-learn-demo:0.0.1` specifies the Docker image (name:tag).

You can also run it from the Docker client. Fill in the parameters:
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715351997214-6601e81d-e9cc-4657-b106-e1c1b7b03c62.png)

Visit [http://localhost:4000/](http://localhost:4000/) locally:
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715352124331-b3d953cd-7896-44fb-8f7e-c9c9615fc9f1.png)

Check the Docker client:
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715352300114-bad9f7ec-fb78-4728-88a0-14cd97b32f01.png)

You can also use `docker ps` in the terminal:
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715354945312-3a5546f8-ca35-4c2f-98e6-41b6dc3cf413.png)

Use the following commands to start, stop, delete containers, etc.:

```bash
# List containers
docker container ls
# Stop a container
docker container stop container-id
# Start a container
docker container start container-id
# Restart a container
docker container restart container-id
# Delete a container
docker container rm container-id
```

Now we can publish the image to Docker Hub (like pushing code to GitHub). First, register an account at [https://hub.docker.com/](https://hub.docker.com/). You can also sign in directly from the Docker client:  
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715354324888-ed49b5b4-3871-4c25-bdad-0b70cd553975.png)

In the terminal, run `docker login` to confirm you're logged in:
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715354350699-1bd2443a-d77d-4bc9-aae8-d7cec451ea71.png)

Now publish `next-docker-learn-demo` to Docker Hub. First, tag the local image with your repository name:

```bash
# Format:
# docker image tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]
# snailrun160 is my Docker Hub username
docker image tag next-docker-learn-demo:0.0.1 snailrun160/next-docker-learn-demo:0.0.1
```

Then push it to Docker Hub:

```bash
# Format:
# docker image push [OPTIONS] NAME[:TAG]
docker image push snailrun160/next-docker-learn-demo:0.0.1
```

After publishing, you can see it under the Hub tab in Docker Desktop:
![image.png](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/blog/1715355841312-0342cecd-0d29-4dab-91a2-19a254f89f81.png)

Once it's on Docker Hub, others can pull your image directly:

```bash
docker image pull snailrun160/next-docker-learn-demo:0.0.1
```

Then run it:

```bash
docker run -p 4000:3000 snailrun160/next-docker-learn-demo:0.0.1
```

That covers the most basic usage of Docker. Pretty simple, right? But this is just the tip of the iceberg. I plan to write three posts about my Docker learning journey — after that I'll have enough for my needs!

## Recap

Let's summarize what we learned:

- What is Docker? What problems does it solve?
- How to install Docker on your computer?
- Getting to know Docker Desktop and the VSCode Docker extension
- How to use Docker for a simple Next.js frontend project deployment

In the next chapter, I'll introduce Docker Compose and manage multiple containers (with Nginx, Redis, MySQL) using Docker Compose.

## References:

1. Official site: [https://www.docker.com/](https://www.docker.com/)
2. Docker 10‑minute quick start: [https://www.bilibili.com/video/BV1s54y1n7Ev](https://www.bilibili.com/video/BV1s54y1n7Ev/?share_source=copy_web&vd_source=baff1d303cd044521f2216d96406a3a4)
3. Docker from Beginner to Practice: [https://yeasy.gitbook.io/docker_practice](https://yeasy.gitbook.io/docker_practice)
