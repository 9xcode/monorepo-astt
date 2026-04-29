# Implementation: Done ✅

## System Overview

A **custom Astro integration** that runs as a pre-build hook, reads all content collections, computes hashes, compares against a persistent manifest, and only generates images that are genuinely new or changed. Images live in `public/og/` which Nginx serves as static files cached by Cloudflare. The system is collection-agnostic, i18n-ready, and version-aware.

---

## File Structure

```
project/
├── integrations/
│   └── og-cache/
│       ├── index.ts          ← Astro integration entry point
│       ├── generator.ts      ← Pure image generation logic (satori + resvg)
│       ├── manifest.ts       ← Read/write/diff manifest logic
│       ├── pool.ts           ← Concurrency pool utility
│       └── collections.ts    ← Collection adapters (tools, blog, etc.)
├── public/
│   └── og/
│       ├── .manifest.json    ← Tracked in git
│       ├── en/
│       │   ├── tools/
│       │   └── blog/
│       ├── de/
│       └── fr/
├── src/
│   └── og/
│       └── templates/
│           ├── tools.ts      ← Template for tools collection
│           └── blog.ts       ← Template for blog collection
└── astro.config.mjs
```

---

## The Configuration Object (in `astro.config.mjs`)

The integration accepts a single config object with these fields:

- **`outputDir`** — where to write PNGs, must be inside `public/`. Default: `./public/og`
- **`templateVersion`** — a string like `'v1'`. Bump this when you redesign templates. This is the master switch for full regeneration without manual deletion.
- **`forceRegenerate`** — boolean, defaults to `false`. Set to `true` in CI for a full clean rebuild (e.g. on major releases).
- **`concurrency`** — how many images to generate in parallel. Default: `8`. On a VPS with decent RAM you can push to `12–16`.
- **`locales`** — array of locale strings. Empty array means no i18n, single locale no subfolders. When populated like `['en', 'de', 'fr']`, images go into locale subfolders.
- **`defaultLocale`** — when i18n is active, this locale also writes to the root path as fallback for crawlers that don't know about locale paths.
- **`collections`** — array of collection names to process. E.g. `['tools', 'blog']`. Each collection can optionally point to its own template file, so tools and blog can look completely different.

---

## The Manifest

The manifest is a JSON file at `public/og/.manifest.json` and is **committed to git**. It is the memory of the system across builds and CI runs.

Each entry in the manifest stores:
- The content hash (MD5 of title + description + any other frontmatter fields that affect the image)
- The `templateVersion` that was used to generate it
- The locale it was generated for

On every build the integration does a three-way check per image: does the file physically exist, does a manifest entry exist, and do both the content hash AND templateVersion match. All three must be true to skip. If any one fails, the image regenerates and the manifest updates.

This means:
- **New post** → file missing → generates
- **Post title edited** → hash mismatch → regenerates only that image
- **Template redesign** → `templateVersion` bumped → all regenerate automatically
- **No changes** → all skipped → near-zero build time overhead

---

## Collection Adapter Pattern

Each collection (tools, blog, and any future ones) has an adapter that maps its frontmatter schema to a common `OGData` interface. The interface has: `title`, `description`, `collection`, `category`, `url`, `locale`. The generator only knows about `OGData` — it doesn't care whether it came from tools or blog. Adding a new collection in the future means writing one small adapter and adding the collection name to the config array. Nothing else changes.

---

## Template System

Each collection points to a template file. A template is a pure function: takes `OGData`, returns an HTML/JSX structure for Satori. Tools and blog can have completely different visual designs, font sizes, layout, colours. They share the same generator pipeline underneath. When you want to change only the blog template design, bump only the blog template's version — tools images are untouched.

---

## Parallel Generation

Images are processed using a concurrency pool, not `Promise.all` (which would launch everything at once and crash RAM). The pool keeps exactly `N` tasks running simultaneously. At concurrency 8 with ~1s per image: 400 images = ~50 seconds first build. Every subsequent build with no content changes = under 1 second (just manifest read + diff).

---

## i18n Design

When `locales` is populated the system generates one image per entry per locale. Path structure: `/og/{locale}/{collection}/{slug}.png`. The i18n title and description come from your i18n translation layer — the integration accepts a `translate(key, locale)` hook function in config so you wire up your own i18n system without the integration knowing anything about it. When you add i18n later you just populate `locales` and provide the hook — existing non-locale images stay untouched, new locale images generate on the next build.

---

## Cloudflare + Nginx

Since images are static PNGs in `public/og/`, Nginx serves them directly as files. You set `Cache-Control: public, max-age=31536000, immutable` on the `/og/` path in Nginx. Cloudflare respects `immutable` and caches the files at the edge globally. The URL never changes for the same content — if content changes, the image regenerates with the same URL but Cloudflare cache is busted by the Cloudflare Cache Purge API, which you call at the end of your deploy script for only the changed slugs (the manifest tells you exactly which ones changed).

This means: **every visitor, everywhere, gets a cached PNG from Cloudflare's edge — zero VPS compute, sub-millisecond response, even on first hit after deploy.**

---

## Using OG Images in Blog Post Body

This is a genuinely good idea but with one important nuance. The 1200×630 OG image has a very wide aspect ratio (1.91:1) — using it as a traditional hero banner at the top of a post is awkward visually in a reading layout. However, there are two excellent uses:

**1. "Share this post" card at the bottom of every blog post.** Render the OG image as a visual preview inside a share prompt component. The reader sees exactly what others will see when they share it on social media. This is a strong UX pattern — it reinforces sharing and shows off your brand. Popular dev blogs (Josh Comeau, Lee Robinson) do this.

**2. Post listing/index pages.** On your blog index page, each post card can show its OG image as the thumbnail. Because you already know the path (`/og/{locale}/blog/{slug}.png`) at build time, no extra computation is needed — it's just a static path you construct from the slug.

What you should NOT do is use it as the full-width hero at the top of the article body — the aspect ratio breaks the reading experience on mobile. For that, a separate portrait/square thumbnail field in frontmatter is the right approach.

---

## Git Strategy

- **Commit** `public/og/.manifest.json` — this is the build's memory
- **Do not commit** the PNG files themselves — they regenerate in CI from the manifest diff
- Add `public/og/**/*.png` to `.gitignore` but explicitly un-ignore the manifest with `!public/og/.manifest.json`
- In your CI pipeline, after build, copy the new manifest back as a build artifact if you want zero-regen on the next CI run (optional optimisation for large sites)

---

## Scalability Ceiling

With this architecture at 400 posts × 3 locales = 1200 images: first-ever build ~2.5 minutes. Every subsequent build with 5 new posts = 15 images = ~2 seconds. At 1000 posts × 3 locales = 3000 images: first build ~6 minutes, then same ~2s per new batch. This is the absolute ceiling of static pre-generation and it's perfectly acceptable.