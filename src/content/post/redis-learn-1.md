---
title: "前端程序员学习 Redis"
publishDate: "2024-05-26T00:00:00.000Z"
tags: ["redis","笔记"]
description: "一篇 Redis 入门教程,适合前端开发者阅读。文章介绍了 Redis 的基本概念、优点和常见使用场景,并通过 Docker 快速安装和使用 Redis。文章详细讲解了 Redis 的基本操作,包括字符串和列表类型的常用命令。此外,还介绍了 Redis GUI 工具的使用,以及如何在 Node.js 中使用 Redis。最后,文章解释了 Redis 中\"原子方式\"的概念及其重要性。对想要快速入门 Redis 的前端开发者来说,这是一篇实用的指南"
---

由于在学习 Docker 的过程中，使用到了 Redis ，但是不会，就快速补课一下 Redis，以能会基础使用就够了，不求甚解。由于这篇会使用到 上一篇文章 Docker 入门 （一），没看的可以看看：[https://mp.weixin.qq.com/s/hF1oWZyD4NbCtJwgz3Uzlw](https://mp.weixin.qq.com/s/hF1oWZyD4NbCtJwgz3Uzlw)，下面开始 Redis 入门：

## 什么是 Redis ？

官方说："Redis is an in-memory database that persists on disk. The data model is key-value, but many different kind of values are supported: Strings, Lists, Sets, Sorted Sets, Hashes, Streams, HyperLogLogs, Bitmaps."

翻译一下：Redis 是一个**内存数据库**，同时支持持久化到磁盘。其数据模型是**键值对**，但支持多种类型的值：

- 字符串（Strings）
- 列表（Lists）
- 集合（Sets）
- 有序集合（Sorted Sets）
- 哈希（Hashes）
- 流（Streams）
- HyperLogLogs ：
- 位图（Bitmaps）

关于数据类型，更多参考文章：[https://redis.io/docs/latest/develop/data-types/](https://redis.io/docs/latest/develop/data-types/)。

Redis 有以下优点：
速度快， 操作简单 ， 数据类型丰富 ，可扩展性好， 高可用性

## Redis 解决了什么问题？

Redis 的出现解决了传统数据库在高并发、低延迟、复杂数据结构支持和高可用性等方面的不足，当然还有其它原因，参考回答：[https://tongyi.aliyun.com/qianwen/share?shareId=7f37a514-ce95-4825-bcc4-7f233a40bb16](https://tongyi.aliyun.com/qianwen/share?shareId=7f37a514-ce95-4825-bcc4-7f233a40bb16)

## 前端程序员 和 Redis

学习 Redis 可以显著提升应用的性能和用户体验。常见使用场景如下：

- 缓存数据：Redis 可以用来缓存一些经常访问的数据，例如网站页面、用户会话数据（SESSION)
- 消息队列：Redis 可以用来实现消息队列，用于解耦不同的系统或服务。
- 实时通信：Redis 可以用来实现实时排行榜，例如网站热度排行榜、游戏排行榜等。
- 其他：Redis 还可以用于其他很多场景，例如限流、计数器等。

## 使用 Docker 快速安装和使用 Redis

如果你还不了解 Docker，可以看一下：[https://www.yuque.com/asgas/web_system/th4kazgysrzuktxn](https://www.yuque.com/asgas/web_system/th4kazgysrzuktxn)
我们可以在 Docker Desktop（[https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)） 搜索 Redis 并安装
![](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image.png)
我们点击安装的 Redis Run，我们进行简单的配置：

> 指定一下数据卷，把本机的任意一个目录挂载到容器内的 /data 目录，这样容器的数据就会保存在本机

![](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(1).png>)
成功运行后，你可以看到：
![](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(2).png>)
我们可以在 files 里可以看到所有的容器内的文件：
![](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(3).png>)
我们测试一下 Volumes 是否生效：
![](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(4).png>)
![](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(5).png>)

### 体验 Redis

在Redis 上使用 Redis 的命令插入数据，命令可参考文档：[https://redis.io/docs/latest/develop/data-types/strings/](https://redis.io/docs/latest/develop/data-types/strings/)
![](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(6).png>)
简单了解最常使用的命令

1. SET：存储一个字符串值，示例： ` SET mykey "Hello, Redis!"`
2. SETNX：仅在键不存在时才存储一个字符串值。对于实现锁非常有用。示例：`SETNX mykey "Hello, Redis!"`
3. GET：检查一个字符串值，示例：`GET mykey`结果："Hello, Redis!"
4. MGET：在一次操作中检索多个字符串值，示例：`MGET mykey mykey2`
5. INCRBY：原子性地递增（传递负数时递减）存储在给定键处的计数器。
6. incr 是用于递增的，适合点赞，阅读量计算。示例：`incr mycounter `
7. keys ：查询 key 使用的，后加一个模式串来过滤，常用的是 '_' 来查询所有 key。示例：`keys "_"`
8. DEL：删除一个或多个键。示例：`del mykey`
9. EXISTS：查看指定 key 是否存在，支持传入多个 key，返回查到的 key 的数量。注意：如果多次传入相同的 key 是会被多次计算的

我们输入 `exists a cc b a`

![](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(18).png>)

![](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(7).png>)
这里可以看到相同 key 是被计算 + 1 的
**注意：**

1. 关键字大小写都行，
2. 我们发现很多操作都默认有创建的命令，例如：incr；set 还有接下来的 lpush；rpush 等等

### Redis GUI 工具使用

我们可以下载 Redis GUI 工具：[https://redis.com/redis-enterprise/redis-insight/#insight-form](https://redis.com/redis-enterprise/redis-insight/#insight-form)
安装好，运行，我们可以看到：

![](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(8).png>)点击唯一的一个链接。我们可看到我们刚刚在 Redis 容器中创建的数据
![](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(9).png>)

### list 的操作

下面我们来看看最常用的数组的基本操作（文档地址：[https://redis.io/docs/latest/develop/data-types/lists/](https://redis.io/docs/latest/develop/data-types/lists/)），我们在 redis gui 中操作
![](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(10).png>)
执行

```bash
# lpush（left push） 使用
lpush arr 001
lpush arr 002
lpush arr 003
# rpush (right push)使用
rpush arr 004
rpush arr 005
rpush arr 006
```

可以看到：
![](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(11).png>)
回到 brower，看看我们创建了什么？
![](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(12).png>)
这里记住 lpush 是后面的先加入，rpush 是前面的先加入
同理，LPOP 和 RPOP 自然是从左边和从右边删除数据。
![](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(13).png>)
我们可以看到 lpop 删除了第一个数据，rpop删除了最后一个数据，我们使用`lrange arr 0 -1`查看一下现在的数据。这里 -1 代表着到最后，也就是查询全部数据的意思
![](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(14).png>)
执行 `LLEN arr`查看 list 的长度
![](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(15).png>)
执行`LMOVE arr arr1 LEFT RIGHT`移动 arr 左边一个元素到 arr1
![](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(16).png>)
执行 `LTRIM arr1 1 -1` 删除第一个元素：
![](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(17).png>)
是不是很简答 ，就是按照文档，使用指令就好了！

我们这时候可以看看我们之前存储 volumes 的目录应该多了一个 `dump.rdb` 文件。

## 在 node 中，如何使用

网上流行的有两个库

1. redis：[https://www.npmjs.com/package/redis](https://www.npmjs.com/package/redis)
2. ioredis：[https://www.npmjs.com/package/ioredis](https://www.npmjs.com/package/ioredis)

关于他俩的区别？
如果你需要

- 需要使用 Redis 集群或哨兵模式。
- 需要高级功能，如管道、事务、流处理等。
- 需要在连接不稳定的环境下自动重连。
- 项目使用 TypeScript，需要强类型支持。
- 需要管理多个 Redis 实例或集群。

那就使用 ioredis ，如果你的项目需求简单，只需基本的 Redis 功能。那就使用 redis。我们看一个 使用ioredis的简单示例代码：

```javascript
import Redis from 'ioredis';

const redis = new Redis();

const initialData = {
	1702459181837:
		'{"title":"sunt aut","content":"quia et suscipit suscipit recusandae","updateTime":"2023-12-13T09:19:48.837Z"}',
	1702459182837:
		'{"title":"qui est","content":"est rerum tempore vitae sequi sint","updateTime":"2023-12-13T09:19:48.837Z"}',
	1702459188837:
		'{"title":"ea molestias","content":"et iusto sed quo iure","updateTime":"2023-12-13T09:19:48.837Z"}'
};

export async function getAllNotes() {
	const data = await redis.hgetall('notes');
	if (Object.keys(data).length == 0) {
		await redis.hset('notes', initialData);
	}
	return await redis.hgetall('notes');
}

export async function addNote(data) {
	const uuid = Date.now().toString();
	await redis.hset('notes', [uuid], data);
	return uuid;
}

export async function updateNote(uuid, data) {
	await redis.hset('notes', [uuid], data);
}

export async function getNote(uuid) {
	console.log(`get note ${uuid}`);
	return JSON.parse(await redis.hget('notes', uuid));
}

export async function delNote(uuid) {
	return redis.hdel('notes', uuid);
}

export async function addUser(username, password) {
	await redis.hset('users', [username], password);
	return {
		name: username,
		username
	};
}

export async function getUser(username, password) {
	const passwordFromDB = await redis.hget('users', username);
	if (!passwordFromDB) return 0;
	if (passwordFromDB !== password) return 1;
	return {
		name: username,
		username
	};
}

export default redis;
```

这是一个简答的使用 ioredis 作为数据库的，增删改查的代码
获取所有笔记的 getAllNotes，这里我们做了一个特殊处理，如果为空，就插入 3 条事先定义的笔记数据
添加笔记的 addNote
更新笔记的 updateNote
获取笔记的 updateNote
删除笔记的 delNote
是不是超级简答，哈哈！感谢您读到这，你真棒👍🏻
下面科普一个小知识：原子方式

## 什么是“原子方式”？

在 Redis 中，“原子方式”是指操作在执行过程中不可分割，并且在多个客户端并发访问的情况下，这个操作会被视为一个单一的、不间断的过程。这意味着在执行这个操作时，不会有其他客户端插入或干扰，从而保证数据的一致性和完整性。
对于 `LMOVE` 命令，原子性意味着该命令将一个元素从源列表移动到目标列表的操作会完整地执行，不会在中间被其他操作打断。具体来说，Redis 会确保：

1. **取出元素**: 从源列表（例如 `mylist1`）的指定位置（左或右）取出一个元素。
2. **插入元素**: 将取出的元素插入到目标列表（例如 `mylist2`）的指定位置（左或右）。

这两个步骤会作为一个不可分割的整体执行。如果有多个客户端尝试同时进行操作，Redis 将按顺序逐个执行这些操作，而不会交错进行，从而避免数据的不一致和竞态条件。

### 示例

假设有两个客户端同时操作列表：

1.  **客户端1**:

```bash
LMOVE mylist1 mylist2 LEFT RIGHT
```

2.  **客户端2**:

```bash
LMOVE mylist1 mylist2 RIGHT LEFT
```

即使这两个客户端几乎同时发出命令，Redis 也会确保以下执行顺序中的一个，而不是交替的方式：

- 先执行客户端1的 `LMOVE` 命令，然后再执行客户端2的 `LMOVE` 命令，或者
- 先执行客户端2的 `LMOVE` 命令，然后再执行客户端1的 `LMOVE` 命令

### 原子性操作的意义

原子性对于确保数据一致性至关重要，特别是在并发环境下。例如，在任务队列的场景中，移动任务时保证任务不会丢失或重复处理：

1. **原子操作**: 确保任务从队列A移动到队列B时，任务要么完全移动，要么完全不移动。不会出现任务在队列A中被移除但未能成功加入队列B的情况。
2. **数据一致性**: 防止多个客户端同时操作导致的数据不一致问题。

总之，`LMOVE` 命令的原子性确保了数据操作的完整性和一致性，即使在高并发环境下也是如此。
结束啦~
加我微信：RELEASE 500 一起学习前端吧！免费领取超多我自己学习前端付费购买的资料
