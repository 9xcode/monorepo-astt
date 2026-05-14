# Content Configuration Documentation

This document explicitly defines the schema properties, validation rules, and taxonomies defined in `src/content.config.ts` and `src/content-enums.ts` for Astro Content Collections. By keeping documentation here, our configuration files remain clean and terse.

Whenever you update or modify taxonomies, logic, or fields in `content.config.ts` or `content-enums.ts`, **please ensure you apply those changes to this documentation doc as well**.

---

## 1. Tool Taxonomy & Configuration

### Valid (`TOOL_CATEGORIES`) and (`TOOL_TAGS`)
The site-specific category & tag registry (`src/content-enums.ts`) is the ONLY place to define valid categories & tags for your site. Adding new categories or tags to tools requires updating the `TOOL_CATEGORIES` and `TOOL_TAGS` arrays in that file. If a content file uses an unlisted category or tag, `astro check` will fail at build time.

### Tools Collection Schema Properties

- **`title`** (string): The main tool title.
- **`seoTitle`** (string, optional): Alternate title strictly for search engines (`og:title`, meta title, `<title>`), It replaces the standard H1 title in search results. It supports dynamic placeholders: [month], [year], [month_year] which auto-update on build. Falls back smoothly to the standard `title` field.
  -  Example: `seoTitle: "Best Dummy Example [month_year]"`
- **`description`** (string): Primary description.
- **`shortDescription`** (string, optional): Shorter description explicitly meant for cards or directory summaries.
- **`category`** (enum): Must match one item in `TOOL_CATEGORIES`.
- **`tags`** (array of `TOOL_TAGS`, optional): Searchable topic tags that must strictly come from the valid enum. Helps in `search` and `related-tools` widget generation.
- **`author`** (reference(`authors`), optional): An optional reference to an author slug in `src/content/authors`. If omitted, the system falls back to `siteConfig.seo.defaultAuthorSlug`.
- **`coAuthors`** (array of reference(`authors`), default: `[]`): Optional list of additional co-author slugs. Resolved alongside the primary author. Co-author profiles appear on their respective `/authors/[slug]` page. Bylines render as "Alice & Bob" or "Alice, Bob & Carol".
- **`icon`** (string, optional): A text identifier mapping to the tool icon.
- **`pubDate`** (string or date, optional): Override the `datePublished` value in the Article JSON-LD schema. Format: ISO 8601 string, e.g. `2026-01-15T08:00:00+05:30` and also accept only date, date+time without timezone. If omitted, falls back to siteConfig.datePublished (the global site launch date).
- **`lastModified`** (string or date, optional): An explicit override for the `dateModified` date in the Article JSON-LD schema. By default, dateModified = the exact build time (auto-updated on every `npm run build` or CI/CD scheduled rebuild). Set this if you want to lock the date to a specific past content update. (Good for white hat seo)
- **`isDraft`** (boolean, optional, default: `false`): Mark a tool item as draft. Can be built and previewed locally via `npm run dev`. In production, the tool is completely excluded from builds, lists, and isolated page routing. Set to `false` when preparing to go live.
- **`canonical`** (string, optional): An override for the canonical URL in `<head>`. A relative path is recommended (e.g. `/tools/sip-calculator`) — `siteConfig.url` is prepended automatically so you never need to hardcode the domain.
- **`widgetSlug`** (string, optional): Allows reusing another tool's widget. The tool's page will render the widget corresponding to the specified slug. Very useful for SEO aliases where two pages share identical logic but target different search terms (e.g., `widgetSlug: "sip-calculator"` vs `"systematic-investment-plan-calculator"`).
- **`fullWidth`** (boolean, optional, default: `false`): Controls the tool's structural layout mode (mobile remains unaffected). If true, the layout splits into two horizontal sections: Zone 1 (Full width) places the breadcrumb, H1, description, and widget across the entire viewport, while Zone 2 (Standard grid) resumes a 3-column layout below the tool for article text, author, and sidebar. This mode is explicitly reserved for tools requiring wide input areas like code formatters or diff-checkers.
- **`hasMath`** (boolean, optional, default: `false`): Controls whether the KaTeX CSS stylesheet is conditionally loaded for rendering math formulas. Set this to true on pages that use the `$$` or `$` LaTeX expression (formula) syntax.
- **`toc`** (boolean, optional): Table of contents override. Set `true` to force rendering, `false` to disable it, and omit to inherit the site’s global defaults.
- **`order`** (number, optional): Sort order integer for grids. Lower numbers appear first. Unordered tools (omitted) will appear after ordered tools, typically in an alphabetical fallback.
- **`featured`** (boolean, optional): Shown specifically in the Featured section on the homepage when `siteConfig.features.homepage.featuredSection.enabled` is `true`.
- **`loadPriority`** (enum, optional, default: `'load'`): Controls which Astro `client:*` hydration directive is assigned to this tool's widget:
  - `'load'`: Interactive immediately on page load.
  - `'idle'`: For heavy tools loaded mostly below the fold — delays JS execution until the browser's main thread is free.
  - `'visible'`: Loads only when scrolled into view if the widget is located deeply.
  - `'only'`: Skips SSR logic completely, avoiding hydration-mismatch issues for things relying on localStorage, window, or document variables (tools using localStorage/window/document).

---

## 2. Blog Taxonomy & Configuration

### Valid (`BLOG_CATEGORIES`) and (`BLOG_TAGS`)
The site-specific category & tag registry (`src/content-enums.ts`) is the ONLY place to define valid categories & tags for your site.

### Blog Collection Schema Properties

- **`title`** (string): The post heading.
- **`seoTitle`** (string, optional): Alternate title strictly for search engines (`og:title`, meta title, `<title>`). Replaces the standard `title` in search result tabs. Falls back to `title` if omitted.
  - Example: `seoTitle: "Best Budgeting Guide for Beginners [month_year]"`
- **`description`** (string): Post tagline or summary snippet.
- **`pubDate`** (string or date, optional): Override the `datePublished` value in Article JSON-LD. Accepts ISO 8601 strings, date-only strings, or Date objects — same flexible parsing as tools. Falls back to `siteConfig.datePublished` if omitted.
- **`lastModified`** (string or date, optional): Optional stamp for the latest content update. Same parsing as `pubDate`. Falls back to build time.
- **`category`** (enum): Specifically matches `BLOG_CATEGORIES`.
- **`tags`** (array of `BLOG_TAGS`, default: `[]`): Assigned post tags list. Drives related-posts logic and `/blog/tag/[tag]` pages — same search/taxonomy role as tool tags.
- **`author`** (reference(`authors`), optional): An optional reference to an author slug in `src/content/authors`. If omitted, the system falls back to `siteConfig.seo.defaultAuthorSlug`.
- **`coAuthors`** (array of reference(`authors`), default: `[]`): Optional list of additional co-author slugs. Bylines automatically render as "Alice & Bob" or "Alice, Bob & Carol". Co-authored posts appear on each author's profile page.
- **`coverImage`** (string, optional): A relative path from `/public` (e.g. `/images/blog/my-post.jpg`). Rendered in BlogHero and OG metadata.
- **`coverImageAlt`** (string, optional): Accessibility alt text for the cover image.
- **`canonical`** (string, optional): Override for the canonical URL in `<head>`. Use a relative path (e.g. `/blog/my-post`) — `siteConfig.url` is prepended automatically.
- **`featured`** (boolean, default: `false`): Identifies front-page promotional posts.
- **`isDraft`** (boolean, optional, default: `false`): Mark a post as draft. Visible in `npm run dev` but completely excluded from production builds, lists, and page routing. Replaces the old `draft` field for naming consistency with tools.
- **`noindex`** (boolean, default: `false`): Prevents SEO crawler indexing by emitting a `noindex` meta tag.
- **`hasMath`** (boolean, optional, default: `false`): Conditionally loads the KaTeX CSS stylesheet when true. Set on posts that use `$$` LaTeX formula syntax.
- **`toc`** (boolean, optional): Table of contents override. `true` forces rendering, `false` disables it, omit to inherit the site global default.
- **`order`** (number, optional): Sort order integer. Reserved for future blog index ordering features — same semantics as the tools `order` field.

---

## 3. Authors Configuration

### Authors Collection Schema Properties

The authors collection uses the Astro factory schema method `({ image }) => z.object(...)` to validate physical image files directly via Astro's image processing pipeline.

- **`name`** (string): Display name of the author.
- **`role`** (string): Role or job title (maps to Schema.org `jobTitle`).
- **`shortBio`** (string): A short, one-sentence biography used in the Author Card and hover popups.
- **`knowsAbout`** (array of strings, default: `[]`): Expertise tags rendered as badges and passed to Schema.org `knowsAbout`.
- **`avatar`** (image()): A relative path to the author's avatar image. We recommend **Colocation Strategy** (placing the image in the same folder as the author's markdown file, e.g., `./avatar.png`), but it also supports **Centralized Assets Strategy** ( placing images in `src/assets/images/authors/avatar.png`). All images are optimized automatically by Astro during build.
- **`avatarAlt`** (string, optional): Alt text for the avatar image. Defaults gracefully to the author's name and role if omitted.
- **`socials`** (object, optional): Links to social profiles. Contains `github`, `twitter`, `linkedin`, and `facebook`. Leave as empty string `""` to hide the icon. Defaults to all empty strings.
