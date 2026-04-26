---
title: "Frontend Developer Learning Redis"
publishDate: "2024-05-26T00:00:00.000Z"
tags: ["redis","笔记"]
description: "A Redis beginner's guide tailored for frontend developers. It covers the basic concepts, advantages, and common use cases of Redis, along with quick installation and usage via Docker. The article walks through fundamental operations, including commonly used commands for strings and lists. It also introduces GUI tools for Redis and how to use Redis in Node.js. Finally, it explains what \"atomic operations\" mean in Redis and why they matter. A practical guide for frontend developers looking to get started with Redis quickly."
---

Since I used Redis while learning Docker but didn't know it, I quickly brushed up on Redis — just enough for basic usage, without going too deep. This post will make use of the previous article "Docker Getting Started (Part 1)". If you haven't read it, check it out: [https://mp.weixin.qq.com/s/hF1oWZyD4NbCtJwgz3Uzlw](https://mp.weixin.qq.com/s/hF1oWZyD4NbCtJwgz3Uzlw). Now let's dive into Redis basics:

## What is Redis?

According to the official site: "Redis is an in-memory database that persists on disk. The data model is key-value, but many different kind of values are supported: Strings, Lists, Sets, Sorted Sets, Hashes, Streams, HyperLogLogs, Bitmaps."

In short, Redis is an in-memory database that also supports persistence to disk. Its data model is key-value, and it supports many types of values:

- Strings
- Lists
- Sets
- Sorted Sets
- Hashes
- Streams
- HyperLogLogs
- Bitmaps

For more on data types, check out: [https://redis.io/docs/latest/develop/data-types/](https://redis.io/docs/latest/develop/data-types/)

Redis has the following advantages:
Fast speed, simple operations, rich data types, good scalability, high availability.

## What problems does Redis solve?

Redis was created to address the shortcomings of traditional databases in areas like high concurrency, low latency, support for complex data structures, and high availability, among other reasons. See this reference answer: [https://tongyi.aliyun.com/qianwen/share?shareId=7f37a514-ce95-4825-bcc4-7f233a40bb16](https://tongyi.aliyun.com/qianwen/share?shareId=7f37a514-ce95-4825-bcc4-7f233a40bb16)

## Frontend Developers and Redis

Learning Redis can significantly improve your application's performance and user experience. Common use cases include:

- **Caching data**: Redis can cache frequently accessed data, such as website pages, user session data (SESSION).
- **Message queues**: Redis can be used as a message queue to decouple different systems or services.
- **Real-time communication**: Redis can power real-time leaderboards, like website popularity rankings, game leaderboards, etc.
- **Other scenarios**: Rate limiting, counters, and many more.

## Quickly install and use Redis with Docker

If you're not familiar with Docker yet, check out: [https://www.yuque.com/asgas/web_system/th4kazgysrzuktxn](https://www.yuque.com/asgas/web_system/th4kazgysrzuktxn)  
You can search for and install Redis inside Docker Desktop ([https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)):

![Redis in Docker Desktop](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image.png)

Click Run on the installed Redis image and do a simple configuration:

> Specify a volume — mount any directory from your host to the `/data` directory inside the container, so the container's data is persisted on your host.

![Volume config](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(1).png>)

After it runs successfully, you'll see:

![Container running](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(2).png>)

You can browse all container files under the "Files" tab:

![Container files](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(3).png>)

Let's verify the volume is working:

![Volume test 1](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(4).png>)
![Volume test 2](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(5).png>)

### Try Redis out

Use Redis commands in the Redis CLI to insert data. Refer to the docs: [https://redis.io/docs/latest/develop/data-types/strings/](https://redis.io/docs/latest/develop/data-types/strings/)

![Redis CLI](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(6).png>)

A quick look at the most commonly used commands:

1. `SET`: Store a string value. Example: `SET mykey "Hello, Redis!"`
2. `SETNX`: Store a string value only if the key doesn't exist. Useful for implementing locks. Example: `SETNX mykey "Hello, Redis!"`
3. `GET`: Retrieve a string value. Example: `GET mykey` → Result: `"Hello, Redis!"`
4. `MGET`: Retrieve multiple string values in one operation. Example: `MGET mykey mykey2`
5. `INCRBY`: Atomically increment (or decrement if negative) a counter stored at a given key.
6. `INCR`: Used for incrementing; suitable for likes, page view counts. Example: `INCR mycounter`
7. `KEYS`: Query keys with a pattern. Common use: `KEYS *` to list all keys. Example: `KEYS *`
8. `DEL`: Delete one or more keys. Example: `DEL mykey`
9. `EXISTS`: Check if the specified key(s) exist. Accepts multiple keys and returns the count of found keys. Note: if you pass the same key multiple times, it will be counted multiple times.

We input: `EXISTS a cc b a`

![EXISTS command input](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(18).png>)

![EXISTS result](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(7).png>)

You can see that the same key is counted +1.

**Notes:**
1. Keywords are case-insensitive.
2. Many operations implicitly create keys if they don't exist — e.g., `INCR`, `SET`, and later `LPUSH`, `RPUSH`, etc.

### Using a Redis GUI tool

You can download the Redis GUI tool: [https://redis.com/redis-enterprise/redis-insight/#insight-form](https://redis.com/redis-enterprise/redis-insight/#insight-form)

After installing and running it, you'll see:

![Redis Insight](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(8).png>)

Click on the only connection. You'll see the data we created earlier in the Redis container:

![Data view](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(9).png>)

### Working with Lists

Let's look at basic operations on arrays (docs: [https://redis.io/docs/latest/develop/data-types/lists/](https://redis.io/docs/latest/develop/data-types/lists/)). We'll use the Redis GUI:

![List operations](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(10).png>)

Run:

```bash
# Use lpush (left push)
lpush arr 001
lpush arr 002
lpush arr 003
# Use rpush (right push)
rpush arr 004
rpush arr 005
rpush arr 006
```

Result:

![List result](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(11).png>)

Switch to the "Browser" tab and see what we created:

![Browser view](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(12).png>)

Remember: `LPUSH` adds elements from the left, so the last pushed element becomes the first. `RPUSH` adds from the right, so the first pushed element stays first.

Similarly, `LPOP` and `RPOP` remove from the left and right respectively.

![LPOP and RPOP](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(13).png>)

We see `LPOP` removed the first element, `RPOP` removed the last. Use `LRANGE arr 0 -1` to view all remaining data. Here `-1` means "to the end", i.e., all elements.

![LRANGE](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(14).png>)

Run `LLEN arr` to get the list length:

![LLEN](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(15).png>)

Run `LMOVE arr arr1 LEFT RIGHT` to move one element from the left of `arr` to the right of `arr1`:

![LMOVE](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(16).png>)

Run `LTRIM arr1 1 -1` to remove the first element:

![LTRIM](<https://blog-1304565468.cos.ap-shanghai.myqcloud.com/typora/image%20(17).png>)

Isn't it simple? Just follow the docs and run the commands!

At this point, you should see a `dump.rdb` file in the volume directory we mounted earlier.

## Usage in Node.js

Two popular libraries are commonly used:

1. [redis](https://www.npmjs.com/package/redis) — the official Node.js client.
2. [ioredis](https://www.npmjs.com/package/ioredis) — a robust, full-featured Redis client.

What's the difference?

If you need:
- Redis Cluster or Sentinel mode.
- Advanced features like pipelines, transactions, stream processing.
- Automatic reconnection in unstable network environments.
- TypeScript support with strong typing.
- Manage multiple Redis instances or clusters.

Then use `ioredis`. If your project is simple and only needs basic Redis features, use `redis`.

Here's a simple example using `ioredis`:

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

This is a simple CRUD example using `ioredis` as a database:

- `getAllNotes` — fetches all notes; if empty, inserts three predefined notes.
- `addNote` — adds a note.
- `updateNote` — updates a note.
- `getNote` — retrieves a note.
- `delNote` — deletes a note.

Super simple, right? 😄 Thanks for reading to the end — you're awesome! 👍

Now here's a little knowledge drop: **Atomicity**.

## What does "atomic" mean in Redis?

In Redis, "atomic" means an operation is indivisible during execution. When multiple clients access concurrently, the operation is treated as a single, uninterrupted process. No other client can insert or interfere during that operation, ensuring data consistency and integrity.

For example, the `LMOVE` command atomically moves an element from a source list to a target list. Redis ensures:

1. **Remove element**: Remove one element from the specified side (left or right) of the source list.
2. **Insert element**: Insert that element into the specified side of the target list.

These two steps are executed as an indivisible whole. If multiple clients try to operate simultaneously, Redis processes them sequentially, avoiding data inconsistency and race conditions.

### Example

Suppose two clients operate on lists at the same time:

1. **Client 1**:

```bash
LMOVE mylist1 mylist2 LEFT RIGHT
```

2. **Client 2**:

```bash
LMOVE mylist1 mylist2 RIGHT LEFT
```

Even if the clients send commands almost simultaneously, Redis will execute them in one of these orders (not interleaved):
- First Client 1's `LMOVE`, then Client 2's `LMOVE`, **or**
- First Client 2's `LMOVE`, then Client 1's `LMOVE`.

### Why atomicity matters

Atomicity is crucial for data consistency, especially in concurrent environments. For example, in a task queue:

1. **Atomic operation**: Ensures that moving a task from Queue A to Queue B happens completely or not at all. No partial move where a task is removed from Queue A but fails to be added to Queue B.
2. **Data consistency**: Prevents data inconsistency caused by multiple clients operating simultaneously.

In short, `LMOVE`'s atomicity guarantees the integrity and consistency of data operations, even under high concurrency.

That's all for now!

Add me on WeChat: **RELEASE 500** to learn frontend together! Get free access to many paid resources I bought for learning frontend.
