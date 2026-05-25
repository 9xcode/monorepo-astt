# Static OG Image Generation Architecture
## Overview
The Open Graph (OG) image generation architecture has been fully refactored from a dynamic per-request model (`src/pages/og/[route].ts`) into a highly optimized, manifest-backed static generator running as an Astro integration at build time.

## Key Changes and Improvements

1. **Build-Time Generation via Astro Integration:**
   - Moved away from dynamic API-based generation to an Astro integration hooked at the `astro:build:start` lifecycle phase.
   - Ensures zero-overhead during runtime and significantly faster subsequent builds using an intelligent hashing and validation manifest (`.og-manifest.json`).

2. **Template Architecture:**
   - Instead of defining the DOM exactly inside an endpoint, OG generation now leverages dedicated, decoupled pure string templates located in `src/og/templates/` (e.g., `tools.ts` and `blog.ts`).
   - Satori is used to parse the HTML string output into a scaled SVG and rendered using `@resvg/resvg-js`.
   - The bug with `satori-html` has been mitigated by streamlining the templates and keeping styles raw.

3. **Manifest and Caching Pipeline:**
   - Implemented an `og-cache` integration that hashes frontmatter content (and the specified template version). 
   - Before generation, it compares the hash against the `.og-manifest.json` cache. Unchanged files are skipped, reducing unnecessary build tasks and saving massive compute time over scaled content collections. 

4. **Sitemap Integration:**
   - Clean, absolute URLs pointing to the public static OG images are dynamically injected into the local Astro XML sitemap hook within the `astro.config.mjs`.
   - Utilizes `src/utils/og.ts` to smartly lookup the generated image relative path based on the caching manifest and appends `?v=[hash]` to force scraper refreshes. 

5. **Concurrency and Scaling:**
   - The workload is processed concurrently using `runInPool()` allowing fast static processing using multiple workers.
   - Properly filters out drafts (`isDraft`) and seamlessly parses MDX.

## Structure

```text
├── astro.config.mjs                   (Registers the og-cache integration)
├── integrations/
│   └── og-cache/
│       ├── index.ts                   (Main integration lifecycle hook execution)
│       ├── generator.ts               (Satori / Resvg logic)
│       ├── collections.ts             (Adapters unifying Markdown/MDX frontmatter format)
│       ├── manifest.ts                (File cache & integrity hashing)
│       └── pool.ts                    (Concurrency logic wrapper)
├── src/
│   ├── og/
│   │   └── templates/
│   │       ├── tools.ts               (Outputs UI string for tool pages)
│   │       └── blog.ts                (Outputs UI string for blog pages)
│   └── utils/
│       └── og.ts                      (Helper to grab manifest image URLs)
└── .og-manifest.json                  (State of the image hashes)
```

## How to use
To introduce a new collection into the static generator, you configure it statically in `astro.config.mjs` underneath the `ogCache` array. Supply it with an `adapter` from `collections.ts` and point it to the relevant string `templateFn`.
