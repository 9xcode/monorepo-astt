# Third-Party Integrations Guide

## Overview
This document explains the strategy for cleanly injecting third-party tracking, analytics, and verification tools (like Google Analytics, Google Tag Manager, Meta Pixel, and site ownership verification strings) into the MultiTools project.

## The Strategy: Decentralized Script Injection
Instead of muddying the primary `src/layouts/BaseLayout.astro` file with dozens of `<script>` tags, we use a decentralized component approach. 

We have created two dedicated `.astro` components specifically reserved for third-party scripts:
1.  `src/components/integrations/HeadScripts.astro`
2.  `src/components/integrations/BodyScripts.astro`

These components are automatically imported and rendered in the `<head>` and `<body>` of every single page on the site via `BaseLayout.astro`.

---

## How to Add Integrations

### 1. Injections for the `<head>`
Most modern analytics platforms require their code to be placed as high up in the `<head>` as possible. 

**Examples of what goes here:**
*   Google Analytics (`gtag.js`)
*   Google Site Verification Meta Tag
*   Google Tag Manager (The primary `<script>` part)
*   Meta/Facebook Pixel
*   Cookie Consent / CMP Banner Scripts (e.g., Cookiebot, OneTrust)

**How to add them:**
Open `src/components/integrations/HeadScripts.astro` and paste your raw HTML/Script code below the dashes.

```html
---
// This file is reserved for <head> script injections.
---

<!-- Paste your Google Analytics Snippet here -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>

<!-- Paste Site Verification here -->
<meta name="google-site-verification" content="your-long-verification-string" />
```

### 2. Injections for the `<body>`
Some tracking systems (most notably Google Tag Manager) require a secondary snippet of code to be placed instantly after the opening `<body>` tag. This is usually a `<noscript>` tag that acts as a fallback for users who have JavaScript disabled.

**Examples of what goes here:**
*   Google Tag Manager (The `<noscript>` iframe part)
*   Custom raw HTML overlays (like certain live chat bots that don't auto-inject)

**How to add them:**
Open `src/components/integrations/BodyScripts.astro` and paste the raw HTML there.

```html
---
// This file is reserved for <body> script injections.
---

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
```

---

## Important Rules & Maintenance
1.  **Do not use Markdown:** These files are parsed directly into the HTML tree. Do not write markdown text in them, only use standard HTML comments (`<!-- comment -->`).
2.  **Use `is:inline` for complex scripts:** If you add a custom script tag and Astro complains or tries to bundle it incorrectly, add the `is:inline` attribute to the `<script>` tag. (e.g., `<script is:inline src="...">`).
3.  **Performance:** Be careful not to add too many third-party trackers, as it will destroy the "Blazing Fast" performance of Astro and lower your Core Web Vitals score. Only add what is absolutely necessary (like GA4).
