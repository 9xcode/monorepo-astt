# Scalable Blog System — Developer Documentation

## Overview
The Scalable Blog System is a high-performance, feature-flagged article publishing engine built for Astro 6. It integrates deeply with the existing MultiTools architecture, leveraging Astro's content collections, Zod validation, generic components, and Svelte-powered interactivity.

## Architecture

### 1. Folder Structure
- **Content:** `src/content/blog/` stores the Markdown (`.md`) files.
- **Components:** `src/components/blog/` houses blog-specific UI elements (`BlogHero`, `BlogPostCard`, `BlogSidebar`, `RelatedPosts`).
- **Layouts:** `src/layouts/BlogLayout.astro` orchestrates the presentation. It mirrors the `ToolLayout` architecture but simplifies the grid to suit editorial content.
- **Routes (`src/pages/blog/`):** 
  - `index.astro` (Blog listing Page 1)
  - `page/[page].astro` (Pagination)
  - `[post].astro` (Single Post view)
  - `category/[category].astro` & `tag/[tag].astro` (Taxonomy Archives)
  - `rss.xml.ts` (RSS Feed)

### 2. Feature Flags & Configuration
The entire blog is controlled via `siteConfig.features.blog` in `src/config.ts`.
```typescript
blog: {
  enabled: true,         // Master toggle: prevents sitemap injection & LLMs indexing
  postsPerPage: 12,      // Limits items per pagination chunk
  showInNavigation: true,// Toggles Header, Footer, and MobileMenu links
  showInSearch: true,    // Injects blog entries into the unified search JSON
  rssTitle: '...',
  rssDescription: '...',
}
```

### 3. Data & Taxonomy
Posts use strict Zod validation defined in `src/content.config.ts`. Categories and Tags are centrally predefined to avoid taxonomy sprawl.
```yaml
---
title: "How to Start Budgeting in 2024"
description: "Learn the fundamentals of personal budgeting..."
pubDate: 2024-06-15
lastModified: 2024-08-01        # Optional update timestamp
category: Guides                # Strictly typed against BLOG_CATEGORIES
tags: [budgeting, savings]      # Strictly typed against BLOG_TAGS
author: "Editorial Team"
coverImage: "/images/blog/cover.jpg" # Optional heroic imagery
featured: true                  # Renders 2-cols wide on index layouts
draft: false                    # Automatically stripped in production builds
noindex: false                  # SEO escape hatch (adds noindex/nofollow)
---
```

### 4. Search Integration (`/api/search.json.ts`)
The `search.json` API was extended to provide a unified `SearchItem` discriminated union (`type: 'tool' | 'blog'`). This powers the `SearchDialogContent.svelte` component:
- Detects the presence of blog content securely.
- Automatically spawns tab filters ("All" / "Tools" / "Blog") only if blogs exist.
- Employs independent distinct SVG icons per type.
- Safely manages `href` click routing.

### 5. SEO & Discoverability
- **Sitemap Extensibility:** `astro.config.mjs` maps blog priorities, extracts frontmatter `lastModified` intelligently, and hydrates `<image:image>` entries from the Manifest OG engine.
- **Static Open Graph (OG) Generation:** Utilizes a bespoke `.png` template (`src/og/templates/blog.ts`) styled with emerald/teal branding to distinguish articles from indigo-themed tools in social shares.
- **JSON-LD Schema (`BlogPageSchemas.astro`):** Assembles rich `ArticleSchema`, `BreadcrumbList`, and `FAQPage` snippets.
- **RSS Autodiscovery:** Injecting `<link rel="alternate" type="application/rss+xml">` headers inside `BaseLayout`.
- **LLM Optimization:** Automatically appends blog documentation (`src/components/common/seo/llms-generator.ts`) to train models on platform content.

### 6. Shared Utilities (`src/utils/blog.ts`)
- `getAllPosts()`: Hydrates posts, orders chronologically, and safely strips `draft` entries during optimal production builds.
- `getRelatedPosts()`: Algorithmically identifies 3 closely relevant posts prioritizing exact Category matching first, followed by Tag overlap volume.
- `getReadTime()`: Accurately estimates article consumption time base on a continuous variable (230 Words per Minute).

### 7. Unified Elements
To support seamless scaling:
- **`Breadcrumb.astro`**: Upgraded to accept a fully polymorphic `items[]` structure.
- **`AuthorCard.astro`**: Shifted out of `tool/sections` into the `common/` sphere, proving highly re-usable for both tools and articles.
