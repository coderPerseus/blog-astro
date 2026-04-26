---
title: "The Past and Present of LLM RAG (Retrieval-Augmented Generation)"
publishDate: "2024-10-08T14:53:54Z"
updatedDate: "2024-10-08T14:58:10Z"
tags: ["AI","LLM","RAG"]
description: "What is LLM RAG?\nLLM: Large Language Model\n\nRAG: Retrieval Augmented Generation\n\nLarge Language Model Retrieval Augmented Generation technology is a technique that optimizes the output of large language models by combining external knowledge bases. The core idea of this technology is to retrieve relevant information from external databases."
---

## What is LLM RAG?

LLM: Large Language Model

RAG: Retrieval-Augmented Generation

Retrieval-Augmented Generation for large language models is a technique that **optimizes** the **output** of large language models by incorporating external knowledge bases. The core idea is to retrieve relevant information from an external database and feed it into the generation module along with the user's query, producing responses that are more accurate, relevant, and up-to-date.

## Background

RAG was actually introduced back in 2020. A Facebook paper, *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*, first proposed the concept. The problem this paper aimed to solve is simple: how to make language models generate using external knowledge. Normally, the knowledge of a pretrained model is stored in its parameters, which means the model doesn't know about anything outside its training data (e.g., search data, domain-specific knowledge). The old approach was to **fine-tune** the pretrained model whenever new knowledge came along. But that had two problems:

1. You'd have to **fine-tune** every time there was new knowledge.
2. Training models is very expensive.

So RAG came along. It leverages the ability of pretrained models to learn and understand new knowledge by injecting that new knowledge into the prompt, producing more reliable responses. Let's wrap up by looking at the current issues with LLMs.

![](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/1728353558736-1dcf2a98-dd73-4b9e-9b4c-188337a369b6.png)

Source: [https://github.com/datawhalechina/llm-universe/blob/main/docs/C1/2.%E6%A3%80%E7%B4%A2%E5%A2%9E%E5%BC%BA%E7%94%9F%E6%88%90%20RAG%20%E7%AE%80%E4%BB%8B.md](https://github.com/datawhalechina/llm-universe/blob/main/docs/C1/2.%E6%A3%80%E7%B4%A2%E5%A2%9E%E5%BC%BA%E7%94%9F%E6%88%90%20RAG%20%E7%AE%80%E4%BB%8B.md)

## RAG System Components and How It Works

A minimal RAG system consists of just three parts:

1. A language model
2. A collection of external knowledge the model needs (stored as vectors)
3. The external knowledge required for the current scenario

![](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/1728353764729-bb5d2fff-01ef-42c3-912c-6dd5caf7970c.jpeg)

The diagram above shows the components of an RAG system; here's a quick explanation:

1. **Input query**: The left side shows three different types of input queries:
    - QA task: e.g., "Define 'middle ear'"
    - Fact verification: e.g., "Barack Obama was born in Hawaii"
    - Jeopardy (reverse QA) question generation: e.g., "Divine Comedy", AI generates a corresponding question
2. **Query Encoder**: Encodes the input query into a vector representation q(x).
3. **Retriever pη**: A non-parametric model that uses Maximum Inner Product Search (MIPS) to find documents relevant to the query from the document index.
4. **Document index d(z)**: Stores pre-encoded document vectors (z1, z2, z3, z4, etc.).
5. **Generator pθ**: A parametric model that generates the final answer based on retrieved documents.
6. **Marginalize**: Marginalizes over the seq2seq predictions from different documents to produce the final output.
7. **Output**: Generates different outputs depending on the task type:
    - QA: generates an answer, e.g., "The middle ear includes the tympanic cavity and three ossicles"
    - Fact verification: generates a label, e.g., "Supports"
    - Question generation: generates a question, e.g., "This 14th-century work is divided into three parts: 'Inferno', 'Purgatorio', and 'Paradiso'"
8. **End-to-end backpropagation**: The entire process is trained end-to-end via q and pθ to optimize performance.
9. **Method overview**: This approach combines a pretrained retriever (query encoder + document index) with a pretrained seq2seq model (generator) and fine-tunes them end-to-end. For a query x, MIPS is used to find the top-K relevant documents zi. When making the final prediction y, z is treated as a latent variable and the seq2seq predictions over different documents are marginalized.

The advantage of this approach is that it can handle multiple NLP (Natural Language Processing) tasks and improve performance by combining retrieval and generation. With end-to-end training, the system learns to better coordinate retrieval and generation, leading to more accurate results.

The workflow of an RAG system is shown below:

![](https://github.com/datawhalechina/llm-universe/raw/main/figures/C1-2-RAG.png)

Let's take a quick, high-level look at the full process of building an RAG chat bot:

1. **Load data**

In real projects, data sources can come in many formats, e.g., PDFs, code, existing databases, cloud databases, etc. We need to load all this data, typically using a vector database.

2. **Chunk data**

Models have a limited context window, so we need to split the data into chunks. But because data sources vary and natural language has its own characteristics, choosing a chunking function and setting its parameters is actually very tricky. Ideally, we want each document chunk to be semantically coherent and independent of the others.

3. **Embed**

This is the process of converting text into vectors, then using similarity matching to retrieve the data we want. It also solves the problem of content being too large.

4. **Retrieve data**

Convert the query into a vector, then search against the vectors in the vector database to retrieve the desired results.

You can also use a traditional relational database + Elasticsearch for data retrieval.

5. **Augment the prompt**

Actually, everything above is done to augment the prompt. We combine the retrieved information with the user's question to create an augmented prompt, which is then submitted to the LLM.

6. **Generate**

Pass the augmented prompt to the generator model to produce the answer.

## Summary

There are two intuitive ways to understand what RAG does:

1. RAG gives the LLM an external boost.
2. The LLM acts as a thinking brain, while RAG provides the relevant knowledge. RAG retrieves a set of knowledge, and the LLM then thinks, organizes, and generates the result.

## References

1. How devv builds an efficient RAG system: [https://x.com/forrestzh_/status/1731478506465636749](https://x.com/forrestzh_/status/1731478506465636749?s=20)
2. RAG Introduction: [https://github.com/datawhalechina/llm-universe/blob/main/docs/C1/2.%E6%A3%80%E7%B4%A2%E5%A2%9E%E5%BC%BA%E7%94%9F%E6%88%90%20RAG%20%E7%AE%80%E4%BB%8B.md](https://github.com/datawhalechina/llm-universe/blob/main/docs/C1/2.%E6%A3%80%E7%B4%A2%E5%A2%9E%E5%BC%BA%E7%94%9F%E6%88%90%20RAG%20%E7%AE%80%E4%BB%8B.md)
