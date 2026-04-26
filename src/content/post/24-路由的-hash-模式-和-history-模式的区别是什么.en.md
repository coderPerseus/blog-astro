---
title: "What is the difference between hash mode and history mode in routing?"
publishDate: "2024-11-05T03:44:11Z"
updatedDate: "2024-11-05T03:44:12Z"
tags: ["AI"]
description: "Let me explain in detail the difference between hash mode and history mode in routing:\n\n1. URL format difference:\n   - Hash mode: Uses the # symbol, for example: www.example.com//home 2\n   - History mode: More like traditional URLs, for example: www.example.com/home 2\n\n2. Working principle difference:"
---

Let me explain the differences between hash mode and history mode in routing in detail:

1. URL Format Differences:
- Hash mode: Uses the `#` symbol, e.g.: `www.example.com/#/home` [2](https://router.vuejs.org/guide/essentials/history-mode)
- History mode: More like a traditional URL, e.g.: `www.example.com/home` [2](https://router.vuejs.org/guide/essentials/history-mode)

2. Working Principle Differences:
- Hash mode:
  - Uses the hash (`#`) portion of the URL to simulate a full URL
  - The hash part is not sent to the server
  - Based on the browser's `hashchange` event [2](https://router.vuejs.org/guide/essentials/history-mode)

- History mode:
  - Based on the HTML5 History API
  - Uses `pushState` and `replaceState` methods to manage history
  - URLs are cleaner and more like traditional server-side routing [2](https://router.vuejs.org/guide/essentials/history-mode)

3. Server Configuration Requirements:
- Hash mode:
  - No special server configuration needed
  - Because the hash part is not sent to the server
  - Less SEO-friendly [2](https://router.vuejs.org/guide/essentials/history-mode)

- History mode:
  - Requires server configuration support
  - Needs to be configured so all routes return `index.html`
  - Otherwise, you'll get 404 errors [2](https://router.vuejs.org/guide/essentials/history-mode)

4. Server Configuration Examples (History mode):

Apache configuration:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

Nginx configuration:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

5. How to Choose:

- Choose Hash mode if:
  - You don't want to configure the server
  - The project doesn't need clean URLs
  - SEO requirements are low

- Choose History mode if:
  - You need better-looking URLs
  - The project needs better SEO
  - You have control over the server configuration

6. Compatibility Considerations:
- Hash mode: Better compatibility, supports more browsers
- History mode: Requires HTML5 History API support; all modern browsers support it

7. Migration Advice:
If migrating from Hash mode to History mode:
1. Make sure the server is properly configured
2. Update the router configuration
3. Test that all routes work correctly
4. Check that direct URL access works [2](https://router.vuejs.org/guide/essentials/history-mode)

In real-world development, if you're using a modern frontend framework (like Next.js, Umi, etc.), they usually default to History mode and handle the server configuration automatically, letting developers focus on business logic.

---
Source: Claude 3.5 Sonnet
