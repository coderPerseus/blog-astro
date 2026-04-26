---
title: "Pitfalls When Using turndown"
publishDate: "2024-12-15T15:56:59Z"
updatedDate: "2024-12-15T15:56:59Z"
tags: ["踩坑记录","前端开发"]
description: "Recently in development, I encountered a requirement to customize the paste logic of bytemd, that is:\n\nIn a React project, I used the bytemd editor (https://github.com/pd4d10/bytemd). I hadn't worked on a similar requirement before, so my initial implementation idea was:\n\n1) Find where bytemd handles paste logic\n\n2) Prevent"
---

Recently, while developing, I encountered a requirement to customize the paste logic for bytemd. Essentially:

I was using the bytemd editor in a React project (https://github.com/pd4d10/bytemd), and I had never done anything like this before. My initial approach was:

1. Find where bytemd handles the paste logic.
2. Prevent the default paste behavior.
3. Retrieve the pasted content.
4. Return the desired content.

## Finding the Entry Point for Custom Paste Logic in bytemd

By reading the source code, I learned that a plugin is essentially a function that extends the functionality of the Bytemd editor and viewer, returning a specific object type: `BytemdPlugin`. It contains five properties:

- `remark`: Custom Markdown parsing
- `rehype`: HTML parsing
- `actions`: Register operations, which define the icons above the editor
- `editorEffect`: Editor side effects
- `viewerEffect`: Viewer side effects

What we need is `editorEffect`. It accepts a function that provides `ctx`, the editor context. Here we can call `ctx.editor.on('paste', fn(cm, e) { e.preventDefault(); })` to disable the default paste behavior. Once we write this and register the plugin with the editor, pasting stops working. Now that we've located where paste logic is handled, let's implement custom paste behavior.

## Custom Paste Logic

First, we need to retrieve the content the user pasted. That's straightforward:

```ts
 editor.on('paste', async (cm: any, e: ClipboardEvent) => {
   const clipboardData = e.clipboardData;
   const text = clipboardData.getData('text/plain'); // text content
   const html = clipboardData.getData('text/html'); // raw HTML content
 }
```

Now we need to parse the HTML content, convert it to Markdown, and return it.

After some research, I found the handy `turndown` library: an HTML to Markdown converter written in JavaScript. So we'll use `turndown` to convert HTML to Markdown. Let's jump straight to the code:

```ts
// ...
const TurndownService = require('turndown')
const turndownService = new TurndownService()
const mdText = turndownService.turndown(html)
// ...
```

But writing it this way reveals many issues:

1. Code blocks aren't detected and don't have syntax highlighting.
2. Inline code blocks aren't rendered.
3. Extra escaped backslashes appear in code.
4. Programming languages aren't recognized.
5. Tables and strikethrough don't work either.

...and so on. So we need additional configuration to correctly convert HTML to Markdown.

After repeated testing, here's the final code I ended up with:

```ts
import turndownService from 'turndown';
import { gfm, strikethrough, tables } from 'turndown-plugin-gfm';

/**
 * Configure and return a turndown instance
 */
export function configureTurndown() {
  const turndownServiceObj = new turndownService({
    codeBlockStyle: 'fenced',
  });

  turndownServiceObj.use(gfm);
  turndownServiceObj.use([tables, strikethrough]);

  // Add custom rules
  addCustomRules(turndownServiceObj);

  return turndownServiceObj;
}

/**
 * Add custom rules to turndown
 */
function addCustomRules(turndownServiceObj: turndownService) {
  // Strikethrough
  turndownServiceObj.addRule('strikethrough', {
    filter: ['del', 's', 'strike'] as string[],
    replacement: (content) => `~~${content}~~`,
  });

  // Code blocks
  turndownServiceObj.addRule('pre', {
    filter: ['pre'],
    replacement: (content, node: any) => {
      const code = node.querySelector('code');
      let language = '';

      if (node.getAttribute('lang')) {
        language = node.getAttribute('lang');
      } else if (code?.className) {
        const langMatch = code.className.match(/language-(\S+)/);
        language = langMatch?.[1] || '';
      } else if (node.className) {
        const mdFencesMatch = node.className.match(/md-fences|language-(\S+)/);
        language = mdFencesMatch?.[1] || '';
      }

      let codeContent = code ? code.textContent.trim() : content.trim();
      codeContent = codeContent.replace(/\\([^\\])/g, '$1');
      language = language.toLowerCase().replace(/[^a-z0-9+#]+/g, '');

      return `\`\`\`${language}\n${codeContent}\n\`\`\`\n`;
    },
  });

  // Inline code
  turndownServiceObj.addRule('inlineCode', {
    filter: (node) => node.nodeName === 'CODE' && node.parentNode?.nodeName !== 'PRE',
    replacement: (content) => `\`${content}\``,
  });

  // Tables
  turndownServiceObj.addRule('table', {
    filter: 'table',
    replacement: function (content, node) {
      const table = node as HTMLTableElement;
      const rows = Array.from(table.rows);

      const headers = Array.from(rows[0]?.cells || [])
        .map((cell) => cell.textContent?.trim() || '')
        .join(' | ');

      const separator = Array.from(rows[0]?.cells || [])
        .map(() => '---')
        .join(' | ');

      const data = rows
        .slice(1)
        .map((row) =>
          Array.from(row.cells)
            .map((cell) => cell.textContent?.trim() || '')
            .join(' | '),
        )
        .join('\n');

      return `\n| ${headers} |\n| ${separator} |\n${data ? `| ${data} |` : ''}\n\n`;
    },
  });
}

/**
 * Handle pasted content
 */
export async function handlePastedContent(html: string, text: string) {
  const turndownServiceObj = configureTurndown();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const images: HTMLImageElement[] = Array.from(doc.getElementsByTagName('img'));

  // Convert to markdown text
  const mdContent = turndownServiceObj.turndown(html);

  // If there are no images, return the processed text directly
  if (images.length === 0) {
    return mdContent || text;
  }

  // Handle image uploads
  return await processImages(images, mdContent);
}

/**
 * Handle image uploads
 * @param images Array of image elements
 * @param mdContent markdown text
 * @returns markdown text after processing image uploads
 */
async function processImages(images: HTMLImageElement[], mdContent: string) {
  // Custom image upload logic: replace original URLs with uploaded image URLs to produce new content processedText
  return processedText;
}

```

Now the result is as expected! AI helped me a lot throughout this process—identifying the issues, analyzing them, and finding the solution—all with its assistance.
