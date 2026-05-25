# Author System — Scalable Multi-Author Architecture (Revised)

Migrate author data out of `siteConfig` and into a first-class Astro Content Collection.
Both blog posts AND tool pages get an optional `author` field. Dedicated `/authors/[slug]`
profile pages. All author components co-located in `src/components/authors/`.

---

## Decision Log

| # | Decision | Alternatives Considered | Rationale |
|---|---|---|---|
| D1 | Use `glob()` loader for authors collection | `type: 'content'` (Astro 4 legacy) | Project already uses `glob()` for both `tools` and `blog`. Consistent with existing codebase and Astro 6 standard. |
| D2 | Use `image()` helper for avatar | Plain string path to `public/` | `image()` enables Astro's build-time optimization (resize, format, hashing). Processed URL works fine for Schema.org — hash only changes when image content changes. Avoids maintaining two copies. |
| D3 | Field name `role` (not `jobTitle`) | `jobTitle` (Schema.org name) | `role` is more inclusive — covers "Guest Contributor", "Community Author", not just job titles. Maps to `jobTitle` in Schema.org Person output — a trivial 1:1 mapping. |
| D4 | Field name `avatar` + `avatarAlt` (not `image`) | `image`, object `{src, alt}` | `avatar` is semantically specific to a person's photo. Two separate fields matches the existing `coverImage`/`coverImageAlt` pattern in the blog schema. |
| D5 | No `url` field in author schema | `url: z.string()` in frontmatter | Author URL is always `/authors/${slug}` — derived automatically at render time. Hardcoding it creates a maintenance risk if routes change. |
| D6 | `author: reference('authors').optional()` (single) | `z.array(reference('authors'))` always-array | Single author covers 99% of cases with clean `author: abhishek` frontmatter syntax. Multi-author (co-authors) is a trivial one-line schema addition when actually needed. See **Future Extensions** section. |
| D7 | Author components co-located in `src/components/authors/` | Scattered across `common/sections/`, `blog/`, etc. | All author-related rendering in one folder. `AuthorCard` moves from `common/sections/` — it's the only consumer of author data, and co-location makes it discoverable. Import paths update accordingly. |
| D8 | `defaultAuthorSlug` in config — fallback only | Keep full `AuthorConfig` in config | Content Collection is the source of truth. Config only stores the slug string for fallback resolution. Zero author data duplicated across files. |
| D9 | `knowsAbout` kept in author schema | Drop it | It maps directly to `Schema.org Person.knowsAbout` — a valid property for establishing topical authority. Also rendered as expertise tags in AuthorCard. |
| D10 | Astro-processed image URL for Schema.org | Static `public/` URL for stable paths | `image()` produces content-hashed URLs. Hash only changes when the actual image changes. Google handles URL changes gracefully via re-crawl. Maintaining a second copy in `public/` creates sync risk. |

---

## User Review Required

> [!IMPORTANT]
> **Blog frontmatter migration** — 5 existing blog posts use different author strings:
> - `"Editorial Team"`, `"MultiTools Editorial"`, `"MultiTools Team"` → These look like placeholder names. Plan: **remove** the `author` field from these posts (falls back to `defaultAuthorSlug`).
> - `"Abhishek"` → Becomes `author: abhishek` (matching the author file).
> - `"Sarah Chen"`, `"Alex Rivers"` → **Decision needed**: Are these real authors who need profiles? Or placeholder data to be replaced with the default? If real, I'll create `.md` files for them. If not, I'll remove the `author` field.

> [!IMPORTANT]
> **Tool frontmatter** — No migration needed. Tools currently have no `author` field. The new optional field means all existing tools just use the default author automatically. You only add `author: some-slug` to a tool when you want a specific author.

> [!WARNING]
> **`role` vs `jobTitle`** — I recommend `role` because it's more flexible (covers "Guest Contributor", not just job titles). It maps to Schema.org `jobTitle` in the Person JSON-LD. If you strongly prefer `jobTitle` as the frontmatter field name, let me know.

---

## Proposed Changes

---

### Phase 1 — Author Content Collection & Data Files

> **Migration constraint**: This phase MUST fully complete before Phase 2.
> `reference('authors')` validates at build time — if no matching author file exists, the build crashes.

#### [NEW] `src/content/authors/abhishek.md`

Author profile. Frontmatter = structured data. Markdown body = long-form bio (rendered on profile page).

```yaml
---
name: "Abhishek"
role: "Financial Technology Analyst"
shortBio: "Lead financial analyst building tools for smarter money decisions."
knowsAbout: ["Personal Finance", "Taxation", "Investment Strategies", "Software Development"]
avatar: "../../assets/images/authors/abhishek.webp"
avatarAlt: "Abhishek — Financial Technology Analyst"
socials:
  github: ""
  twitter: "https://x.com/Abhishek_Patni"
  linkedin: "https://www.linkedin.com/in/abhishekpatnifinance/"
  facebook: "https://www.facebook.com/abhishek.patni.587/"
---

Full long-form bio in Markdown. Rendered as the body of the /authors/abhishek profile page.
Supports headings, lists, links — anything valid Markdown.
```

**No `url` field** — derived automatically as `/authors/${slug}` at render time.

#### [NEW] `src/assets/images/authors/abhishek.webp`

Author avatar. Lives in `assets/` so Astro's `image()` pipeline optimises it (resize, WebP, content-hash). Copy the existing `public/images/author-avatar.webp` here.

#### [MODIFY] `src/content.config.ts`

Add the `authorsCollection` **before** changing any reference fields:

```ts
import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const authorsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/authors' }),
  // Factory form — ({ image }) gives access to Astro's image() validator
  schema: ({ image }) => z.object({
    name: z.string(),
    role: z.string(),
    shortBio: z.string(),
    knowsAbout: z.array(z.string()).default([]),
    avatar: image(),
    avatarAlt: z.string().optional(),
    socials: z.object({
      github: z.string().default(''),
      twitter: z.string().default(''),
      linkedin: z.string().default(''),
      facebook: z.string().default(''),
    }).default({}),
  }),
});

export const collections = {
  tools: toolsCollection,
  blog: blogCollection,
  authors: authorsCollection,  // ← new
};
```

> [!NOTE]
> **`image()` helper**: The schema uses the factory form `schema: ({ image }) => z.object(...)` to access Astro's `image()` validator. This is different from the existing `tools` and `blog` collections that use `schema: z.object(...)` directly. The `image()` helper validates the path resolves to a real image in `src/` and enables Astro's `<Image>` component to optimise it at build time.

---

### Phase 2 — Schema Migration (Blog + Tools)

> **Depends on**: Phase 1 fully complete (all author `.md` files exist).

#### [MODIFY] `src/content.config.ts` — Blog schema

Change `author` from `z.string().default('Editorial Team')` to:

```ts
author: reference('authors').optional(),
```

- Optional — if omitted, the resolve function in `utils/authors.ts` substitutes `defaultAuthorSlug`.
- No more `'Editorial Team'` default string — that concept is removed.

#### [MODIFY] `src/content.config.ts` — Tools schema

Add `author` field (currently the tool schema has no author field at all):

```ts
author: reference('authors').optional(),
```

All existing tool `.md` files need zero changes — the field is optional, and missing = default.

#### [MODIFY] All 5 blog post frontmatter files

Update `author:` values from plain strings to valid author slugs:

| File | Current | New |
|---|---|---|
| `getting-started-with-budgeting` | `author: "Editorial Team"` | *(remove field — uses default)* |
| `retirement-savings-guide` | `author: "MultiTools Editorial"` | *(remove field — uses default)* |
| `top-10-finance-tips-2024` | `author: "MultiTools Team"` | *(remove field — uses default)* |
| `future-of-ai-finance` | `author: "Sarah Chen"` | **User decision needed** |
| `tax-calculator-tutorial` | `author: "Alex Rivers"` | **User decision needed** |

---

### Phase 3 — Config Cleanup

#### [MODIFY] `src/config.ts`

**Remove:**
- `AuthorConfig` interface (lines 32–45)
- `seo.author: AuthorConfig` from `SeoConfig` interface (line 56)
- `author: { ... }` data block from `siteConfig.seo` object (lines 318–331)

**Add:**
```ts
// In SeoConfig interface:
/** Fallback author slug — used when a blog post or tool has no author set */
defaultAuthorSlug: string;

// In siteConfig.seo object:
defaultAuthorSlug: "abhishek",
```

This is a **fallback only** — not a "default SEO author". Content Collection is the source of truth.

---

### Phase 4 — Author Utilities

#### [NEW] `src/utils/authors.ts`

Central utility module. Mirrors the patterns of `blog.ts` and `tools.ts`.

```ts
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { siteConfig } from '../config';
import type { BlogPost } from './blog';

export type AuthorEntry = CollectionEntry<'authors'>;

/** All author entries (no filtering needed — authors are never drafts). */
export async function getAllAuthors(): Promise<AuthorEntry[]> { ... }

/** Single author by slug. Returns undefined if not found. */
export async function getAuthorBySlug(slug: string): Promise<AuthorEntry | undefined> { ... }

/**
 * Resolve a content entry's author reference to a full AuthorEntry.
 * If the entry has no author set, falls back to siteConfig.seo.defaultAuthorSlug.
 */
export async function resolveAuthor(
  authorRef?: { collection: string; id: string }
): Promise<AuthorEntry> { ... }

/**
 * All content by a specific author — both blog posts and tools.
 * Used on the /authors/[slug] profile page.
 */
export async function getContentByAuthor(slug: string): Promise<{
  blogPosts: CollectionEntry<'blog'>[];
  tools: CollectionEntry<'tools'>[];
}> { ... }

/**
 * Build the absolute author profile URL from a slug.
 * Single source of truth — no hardcoded /authors/ prefix scattered across templates.
 */
export function getAuthorUrl(slug: string): string {
  return `/authors/${slug}`;
}

/**
 * Build the PersonSchemaInput object for SEO builders from an AuthorEntry.
 * This is the ONLY place where author data maps to Schema.org Person shape.
 * Keeps SEO schema builders generic — they never import siteConfig or know about collections.
 */
export function toPersonSchemaInput(
  author: AuthorEntry,
  siteUrl: string
): PersonSchemaInput { ... }
```

Key design decisions:
- `resolveAuthor` accepts the raw reference object — callers pass `post.data.author` directly.
- `toPersonSchemaInput` centralises the Author→Person mapping. Schema builders remain generic.
- `getContentByAuthor` returns both blog posts AND tools — the profile page shows everything.
- `getAuthorUrl` is the single source of truth for author URL construction.

---

### Phase 5 — Author Components

All author components live in `src/components/authors/` — co-located.

#### [MOVE + MODIFY] `src/components/authors/AuthorCard.astro`
*(moved from `src/components/common/sections/AuthorCard.astro`)*

Currently: hard-wired to `siteConfig.seo.author.*`, no props, no reusability.

After: purely prop-driven, reusable anywhere.

```ts
import type { AuthorEntry } from '../../utils/authors';
import { getAuthorUrl } from '../../utils/authors';
import { Image } from 'astro:assets';

interface Props {
  author: AuthorEntry;
  /** Link the card header to the full author profile page (default: true) */
  linkToProfile?: boolean;
}
```

- Uses `<Image src={author.data.avatar} />` for optimised rendering.
- Renders: avatar, name, role, company, social links, short bio, expertise tags.
- When `linkToProfile` is true (default), name links to `/authors/${slug}`.
- **No siteConfig import** — purely presentational.

#### [NEW] `src/components/authors/AuthorAvatar.astro`

Tiny reusable avatar primitive.

```ts
import { Image } from 'astro:assets';
import type { AuthorEntry } from '../../utils/authors';

interface Props {
  author: AuthorEntry;
  size?: 'sm' | 'md' | 'lg';  // 32px | 48px | 80px
  class?: string;
}
```

Uses `<Image>` for Astro-optimised output. Just the circular avatar image — nothing else.

#### [NEW] `src/components/authors/AuthorByline.astro`

Inline byline for blog/tool headers.

```ts
import type { AuthorEntry } from '../../utils/authors';
import { getAuthorUrl } from '../../utils/authors';
import AuthorAvatar from './AuthorAvatar.astro';

interface Props {
  author: AuthorEntry;
  /** If true, show the small avatar next to the name */
  showAvatar?: boolean;
  /** If true, link author name to profile page */
  linkToProfile?: boolean;
}
```

Renders: optional small avatar + "By {name}" as a linked span. Clean, minimal.
Replaces the raw `<span>By {author}</span>` currently in BlogHero.

#### [NEW] `src/components/authors/AuthorPopover.astro`

Hover/click popover for future use (e.g., hovering an author name in a blog card).

```ts
import type { AuthorEntry } from '../../utils/authors';
import { getAuthorUrl } from '../../utils/authors';
import AuthorAvatar from './AuthorAvatar.astro';

interface Props {
  author: AuthorEntry;
}
```

Renders: avatar, name, role, short bio, "View profile →" link.
Positioned via CSS — no JS runtime. Uses CSS `:hover` / `:focus-within`.
**Not wired into any page yet** — built for future use, component-ready.

#### [NEW] `src/components/authors/AuthorProfileHero.astro`

Hero section for the `/authors/[slug]` profile page.

```ts
import type { AuthorEntry } from '../../utils/authors';
import { getAuthorUrl } from '../../utils/authors';
import AuthorAvatar from './AuthorAvatar.astro';

interface Props {
  author: AuthorEntry;
}
```

Renders: large avatar, name, role, social icon links, expertise tag badges.
Extracted from the page for reusability and testing.

---

### Phase 6 — SEO Schema Updates

> **Principle**: Schema builders (`article.ts`, `primitives.ts`) stay generic.
> Composition components (`BlogPageSchemas.astro`, `ToolPageSchemas.astro`) resolve
> author data and pass plain `PersonSchemaInput` to builders.

#### No changes to: `article.ts`, `primitives.ts`, `types.ts`, `index.ts`

The `buildArticleSchema` already accepts `author: PersonSchemaInput` — fully generic.
The `buildPersonSchema` already builds a Schema.org Person from `PersonSchemaInput`.
These builders don't import `siteConfig` and never will. ✅

#### [MODIFY] `src/components/common/seo/BlogPageSchemas.astro`

**Current problem:** Builds `PersonSchemaInput` inline from `siteConfig.seo.author.*` — always the same person.

**Change:**
- Add `author: AuthorEntry` to Props.
- Use `toPersonSchemaInput(author, siteConfig.url)` from `utils/authors.ts` to build the PersonSchemaInput.
- Remove all `siteConfig.seo.author.*` references.

```ts
// Before (hardcoded):
author: {
  name: siteConfig.seo.author.name,
  jobTitle: siteConfig.seo.author.jobTitle,
  // ... 10+ lines of siteConfig.seo.author.*
}

// After (clean):
import { toPersonSchemaInput } from '../../../utils/authors';
// ...
author: toPersonSchemaInput(Astro.props.author, siteConfig.url),
```

#### [MODIFY] `src/components/common/seo/ToolPageSchemas.astro`

Same pattern as BlogPageSchemas:
- Add `author: AuthorEntry` to Props.
- Replace the inline `siteConfig.seo.author.*` block with `toPersonSchemaInput(author, siteConfig.url)`.

#### [NEW] Person JSON-LD on author profile page

The `/authors/[slug]` page emits a standalone Person JSON-LD schema.
Built inline in the page file using `buildPersonSchema` from `primitives.ts` — no new schema builder needed.

---

### Phase 7 — Layouts, Pages & Routing

#### [MODIFY] `src/pages/blog/[post].astro`

- Import `resolveAuthor` from `utils/authors.ts`.
- Call `const author = await resolveAuthor(post.data.author)` after getting the post.
- Pass `author` to `BlogLayout` as a new prop.

#### [MODIFY] `src/layouts/BlogLayout.astro`

- Add `author: AuthorEntry` to Props.
- Pass `author` to:
  - `BlogHero` (replaces old `author: string` prop)
  - `BlogPageSchemas` (new `author` prop)
  - `AuthorCard` (new `author` prop) — currently not rendered in BlogLayout, but should be added after `ContentSection` for consistency with tool pages.
- Remove: `const { ... author ... } = post.data` — author is now a resolved prop, not a raw string.
- Update import path for `AuthorCard` from `common/sections/` to `authors/`.

#### [MODIFY] `src/components/blog/sections/BlogHero.astro`

- `author: string` → `author: AuthorEntry` in Props.
- Replace `<span>By {author}</span>` with `<AuthorByline author={author} showAvatar linkToProfile />`.

#### [MODIFY] `src/pages/tools/[tool].astro`

- Import `resolveAuthor` from `utils/authors.ts`.
- Call `const author = await resolveAuthor(entry.data.author)`.
- Pass `author` to `ToolLayout` as a new prop.

#### [MODIFY] `src/layouts/ToolLayout.astro`

- Add `author: AuthorEntry` to the Props type.
- Pass `author` to:
  - `ToolPageSchemas` (new `author` prop)
  - `AuthorCard` (replaces the current prop-less `<AuthorCard />`, appears 2× in fullWidth/normal modes)
- Update import path for `AuthorCard` from `common/sections/` to `authors/`.

#### [NEW] `src/pages/authors/[author].astro`

Full author profile page with `getStaticPaths`.

```ts
export async function getStaticPaths() {
  const authors = await getAllAuthors();
  return authors.map((author) => ({
    params: { author: author.id },  // slug = filename
    props: { author },
  }));
}
```

**Page structure:**
1. `AuthorProfileHero` — avatar, name, role, socials, expertise tags
2. `<Content />` — long-form bio from the `.md` body (rendered Markdown)
3. "Posts by {name}" — grid of blog post cards via `getContentByAuthor(slug).blogPosts`
4. "Tools by {name}" — grid of tool cards via `getContentByAuthor(slug).tools` (only if any tools have this author)

**SEO:**
- `<title>`: `{name} — Author at {siteConfig.name}`
- Person JSON-LD schema in `<head>`
- BreadcrumbList: Home → Authors → {name}

---

### Phase 8 — Sitemap, Blog Utils & Cleanup

#### [MODIFY] `astro.config.mjs` — Sitemap serializer

Add handling for `/authors/` routes in the `serialize` function:

```ts
// After existing blog handling, before the else fallback:
const authorMatch = item.url.match(/\/authors\/([^\/]+)\/?$/);
if (authorMatch) {
  item.priority = 0.6;
  item.changefreq = ChangeFreqEnum.MONTHLY;
  item.lastmod = buildTime;
}
```

Priority 0.6 — below blog posts (0.7) but above legal pages (0.3). Author pages are
supplementary content, not primary landing pages.

#### [MODIFY] `src/utils/blog.ts`

- `BlogPostSummary.data.author` — **remove the field entirely**. The search API (`search-blog.json.ts`) doesn't need author data. Search payloads stay lightweight.
- `getAllPostSummaries()` — stop mapping `author` into the summary.
- The full `BlogPost` type (from Astro's collection) automatically has the updated `author` reference type — no manual type work needed.

#### [DELETE] `public/images/author-avatar.webp`

After migration, the avatar lives in `src/assets/images/authors/`. The old static copy in
`public/` is no longer referenced anywhere. Remove to avoid confusion.

*(Do this last, after verifying everything works.)*

---

## Component Location Summary

```
src/components/authors/           ← NEW folder, all author UI co-located
  AuthorAvatar.astro              ← NEW: tiny avatar primitive
  AuthorByline.astro              ← NEW: "By Name" inline component
  AuthorCard.astro                ← MOVED from common/sections/ + refactored to prop-driven
  AuthorPopover.astro             ← NEW: hover popover (future use, not wired yet)
  AuthorProfileHero.astro         ← NEW: profile page hero section
```

---

## File Map Summary

| File | Action | Phase |
|---|---|---|
| `src/content/authors/abhishek.md` | **NEW** | 1 |
| `src/assets/images/authors/abhishek.webp` | **NEW** (copy from public) | 1 |
| `src/content.config.ts` | **MODIFY** (add authors collection + author ref to blog/tools) | 1, 2 |
| `src/content/blog/*/index.md` (5 files) | **MODIFY** (update/remove author frontmatter) | 2 |
| `src/config.ts` | **MODIFY** (remove AuthorConfig, add defaultAuthorSlug) | 3 |
| `src/utils/authors.ts` | **NEW** | 4 |
| `src/components/authors/AuthorAvatar.astro` | **NEW** | 5 |
| `src/components/authors/AuthorByline.astro` | **NEW** | 5 |
| `src/components/authors/AuthorCard.astro` | **MOVE + MODIFY** | 5 |
| `src/components/authors/AuthorPopover.astro` | **NEW** (future use) | 5 |
| `src/components/authors/AuthorProfileHero.astro` | **NEW** | 5 |
| `src/components/common/seo/BlogPageSchemas.astro` | **MODIFY** | 6 |
| `src/components/common/seo/ToolPageSchemas.astro` | **MODIFY** | 6 |
| `src/pages/blog/[post].astro` | **MODIFY** | 7 |
| `src/layouts/BlogLayout.astro` | **MODIFY** | 7 |
| `src/components/blog/sections/BlogHero.astro` | **MODIFY** | 7 |
| `src/pages/tools/[tool].astro` | **MODIFY** | 7 |
| `src/layouts/ToolLayout.astro` | **MODIFY** | 7 |
| `src/pages/authors/[author].astro` | **NEW** | 7 |
| `astro.config.mjs` | **MODIFY** (sitemap) | 8 |
| `src/utils/blog.ts` | **MODIFY** (remove author from summary) | 8 |
| `public/images/author-avatar.webp` | **DELETE** (after verification) | 8 |
| `src/components/common/sections/AuthorCard.astro` | **DELETE** (moved to authors/) | 5 |

**Total: 8 new · 12 modified · 2 deleted = 22 file operations**

---

## What Does NOT Change

These files are intentionally untouched:

- `src/components/common/seo/article.ts` — `buildArticleSchema` already accepts generic `PersonSchemaInput`. No changes.
- `src/components/common/seo/primitives.ts` — `buildPersonSchema` already generic. No changes.
- `src/components/common/seo/types.ts` — `PersonSchemaInput` already has the right shape. No changes.
- `src/components/common/seo/index.ts` — barrel exports unchanged.
- `src/pages/api/search-blog.json.ts` — does NOT include author data. No changes needed.
- `src/pages/api/search-tools.json.ts` — no author data. No changes needed.

---

## Future Extensions

> [!TIP]
> **Multi-author per post** — When needed, add to blog/tool schemas:
> ```ts
> coAuthors: z.array(reference('authors')).default([])
> ```
> Update `resolveAuthor` → `resolveAuthors` to return `AuthorEntry[]` combining primary + co-authors.
> Update `AuthorByline` to render multiple names. One-line schema change, two-file template update.

---

## Verification Plan

> [!CAUTION]
> User will run all commands. I will not execute `npm run build` or `npm run dev`.

### Build verification
User runs `npm run build`. Expected: zero TypeScript errors, zero broken routes, all author content resolves.

### Page checks
1. `/authors/abhishek` — renders profile page with hero, bio body, post list, tool list.
2. `/blog/getting-started-with-budgeting` — renders correct author byline (default: Abhishek), linked to `/authors/abhishek`. AuthorCard below content shows Abhishek.
3. `/tools/budget-planner` — AuthorCard still renders with default author. JSON-LD Article schema has correct `author.name`.
4. JSON-LD on blog post — `<script type="application/ld+json">` contains `"author": { "@type": "Person", "name": "Abhishek", ... }` with correct Person data.
5. JSON-LD on `/authors/abhishek` — contains a Person schema.
6. Sitemap — `/authors/abhishek` entry has priority 0.6, changefreq MONTHLY.

### Scalability test
Create `src/content/authors/priya.md` + set a blog post's `author: priya` → byline and JSON-LD reflect Priya. Zero `config.ts` changes needed.
