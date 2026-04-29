# Blog System — Complete Implementation Plan (V4 Final)

> Comprehensive phase-wise plan. Every file path, import, and API call verified against the actual Astro 6 codebase as of 2026-04-13.

---

## Decision Log

| # | Decision | Alternatives Considered | Rationale |
|---|----------|------------------------|-----------|
| 1 | **Breadcrumb → Generic `items[]` array** | Separate BlogBreadcrumb, inline nav | Single component for all page types; ToolLayout update is trivial |
| 2 | **AuthorCard → Move as-is, zero props** | Add override props | YAGNI — single-author site; future multi-author system is a separate project |
| 3 | **Blog taxonomy in `content.config.ts`** | Put in `config.ts` | Consistency with `TOOL_CATEGORIES` / `TOOL_TAGS` which live there already |
| 4 | **Blog dates use `z.coerce.date()`** | `z.union([z.string(), z.date()])` | Auto-coerces strings to Date objects; cleaner than tool schema pattern |
| 5 | **Pagination: `/blog` + `/blog/page/N`** | Astro `paginate()` with `[...page]` | Clean root URL `/blog`; overflow pages at `/blog/page/2` |
| 6 | **Only `@astrojs/rss` as new dep** | Skip RSS | Industry standard, tiny package, meaningful SEO signal |
| 7 | **Blog draft field named `draft`** | `isDraft` (tool convention) | Blog-specific naming; keeps schemas independent |

---

## Bugs Fixed from V3 Plan

| Bug | V3 Plan Had | Correct Value |
|-----|-------------|---------------|
| BaseLayout slot name | `slot="head-schemas"` | `slot="head"` — BaseLayout only exposes `slot="head"` |
| Taxonomy location | `config.ts` | `content.config.ts` — alongside TOOL_CATEGORIES/TOOL_TAGS |
| AuthorCard props | `{ name, avatarSrc, bio }` | Zero props — reads from siteConfig internally |
| BlogHero Breadcrumb | `import { Breadcrumb }` with `items` array | Current Breadcrumb takes `{ category, toolTitle }` — must refactor first |
| `entry.id` suffix | Raw `post.id` as slug | Must strip `/index` suffix: `post.id.replace(/\/index$/, '')` |
| BlogLayout OG image | Hardcoded path string | Must use `getStaticOgImage('blog', slug)` with manifest hash |
| BlogPostCard readTime | `getReadTime(post.body ?? '')` | `post.body` can be undefined with glob loader — fallback correctly |

---

## Complete File Change Map

```
NEW FILES (17):
  src/content/blog/                        ← blog posts directory
    getting-started-with-budgeting/
      index.md                             ← sample post

  src/utils/blog.ts                        ← shared blog utilities

  src/components/blog/
    sections/
      BlogHero.astro                       ← post header (H1, dates, cover image)
      RelatedPosts.astro                   ← related articles grid
    ui/
      BlogPostCard.astro                   ← reusable card (index + related)
    sidebar/
      BlogSidebar.astro                    ← blog sidebar (Explore Tools CTA + SupportCard)

  src/layouts/BlogLayout.astro             ← blog post layout

  src/pages/blog/
    index.astro                            ← paginated index (page 1)
    [post].astro                           ← single post route
    page/
      [page].astro                         ← paginated overflow (page 2+)
    category/
      [category].astro                     ← category archive
    tag/
      [tag].astro                          ← tag archive
    rss.xml.ts                             ← RSS feed

MODIFIED FILES (12):
  src/content.config.ts                    ← add BLOG_CATEGORIES, BLOG_TAGS, blogCollection
  src/config.ts                            ← add BlogConfig interface + feature flags
  src/components/common/ui/Breadcrumb.astro ← refactor to generic items[] API
  src/layouts/ToolLayout.astro             ← update Breadcrumb call, AuthorCard import, add categoryToSlug import
  src/components/common/sections/AuthorCard.astro ← MOVED from tool/sections/
  src/components/common/seo/llms-generator.ts ← include blog posts
  src/pages/api/search.json.ts             ← extend with blog data + type discriminator
  src/components/common/dialogs/SearchDialog.svelte ← update Tool type with type + href
  src/components/common/dialogs/SearchDialogContent.svelte ← add tab UI + href navigation
  src/components/common/sections/MobileMenu.svelte ← conditional Blog link
  src/og/templates/blog.ts                 ← flesh out stub template
  astro.config.mjs                         ← extend sitemap serializer for blog paths

DELETED FILES (1):
  src/components/tool/sections/AuthorCard.astro ← moved to common/sections/
```

---

## Phase 1: Install RSS Dependency

**Goal:** Add the only new dependency before touching any code.

```bash
npm install @astrojs/rss
```

**Verification:** `package.json` shows `@astrojs/rss` in dependencies.

---

## Phase 2: Blog Taxonomy & Collection Schema

**Goal:** Define `BLOG_CATEGORIES`, `BLOG_TAGS`, and the `blogCollection` in `content.config.ts`.

### [MODIFY] [content.config.ts](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/content.config.ts)

Add after the existing `TOOL_CATEGORIES` block (around line 24):

```ts
// ── Blog Taxonomy ────────────────────────────────────────────────────────
// Separate from tool taxonomy — blog categories are article-oriented,
// tool categories are software-oriented. No semantic confusion.

export const BLOG_CATEGORIES = [
  'Guides',
  'Tutorials',
  'Finance Tips',
  'News',
  'Case Studies',
  'Product Updates',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const BLOG_TAGS = [
  'budgeting',
  'investing',
  'savings',
  'mortgage',
  'tax',
  'retirement',
  'credit',
  'insurance',
  'beginners',
  'advanced',
] as const;

export type BlogTag = (typeof BLOG_TAGS)[number];
```

Add the blog collection definition after `toolsCollection` (before `export const collections`):

```ts
const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // z.coerce.date() auto-converts "2024-06-15" strings to Date objects
    pubDate: z.coerce.date(),
    lastModified: z.coerce.date().optional(),
    category: z.enum(BLOG_CATEGORIES),
    tags: z.array(z.enum(BLOG_TAGS)).default([]),
    author: z.string().default('Editorial Team'),
    // Relative path from /public, e.g. /images/blog/my-post.jpg
    // Used for BlogHero cover image and OG image fallback
    coverImage: z.string().optional(),
    coverImageAlt: z.string().optional(),
    // Mark as featured for homepage highlighting (future use)
    featured: z.boolean().default(false),
    // Draft posts: visible in dev, excluded from production builds
    draft: z.boolean().default(false),
    // Emergency SEO escape hatch — excludes from indexing
    noindex: z.boolean().default(false),
  }),
});
```

Update the collections export:

```ts
export const collections = {
  'tools': toolsCollection,
  'blog': blogCollection,
};
```

**Verification:** Run `npx astro check` — should pass with no blog content yet (empty collection is valid).

---

## Phase 3: Site Config — Blog Feature Flags

**Goal:** Add blog configuration to `siteConfig.features` with full TypeScript interfaces.

### [MODIFY] [config.ts](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/config.ts)

Add `BlogConfig` interface (after `TocConfig`, around line 124):

```ts
/** Blog feature configuration */
export interface BlogConfig {
  /** Master switch — when false, no blog pages are generated */
  enabled: boolean;
  /** Posts per page on the blog index */
  postsPerPage: number;
  /** Show Blog link in header/footer navigation */
  showInNavigation: boolean;
  /** Show Blog tab in the search dialog */
  showInSearch: boolean;
  /** RSS feed title */
  rssTitle: string;
  /** RSS feed description */
  rssDescription: string;
}
```

Add `blog: BlogConfig` to the `FeaturesConfig` interface (after `support`):

```ts
/** Blog — article publishing system */
blog: BlogConfig;
```

Add the blog config values to the `siteConfig` features object:

```ts
// Blog system
blog: {
  enabled: true,
  postsPerPage: 12,
  showInNavigation: true,
  showInSearch: true,
  rssTitle: 'MultiTools Blog — Finance Tips & Guides',
  rssDescription: 'Articles, guides, and tips on personal finance, investing, and money management.',
},
```

**Verification:** `tsc --noEmit` passes — no type errors.

---

## Phase 4: Blog Utilities

**Goal:** Create `src/utils/blog.ts` — all shared blog logic centralised so pages stay thin.

### [NEW] [blog.ts](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/utils/blog.ts)

```ts
/**
 * Blog Utilities — shared logic for all blog pages.
 *
 * Centralises collection queries, sorting, filtering, read time,
 * and related posts so page files stay thin and declarative.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

/**
 * All published posts, sorted newest-first.
 * In production, drafts are excluded. In dev, all posts are returned.
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => {
    if (import.meta.env.PROD && data.draft) return false;
    return true;
  });
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
}

/** Posts filtered by category slug (e.g. "guides" → matches "Guides") */
export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const all = await getAllPosts();
  return all.filter((p) => p.data.category === category);
}

/** Posts filtered by tag (e.g. "budgeting") */
export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const all = await getAllPosts();
  return all.filter((p) => p.data.tags.includes(tag as any));
}

/**
 * Read time in minutes, calculated from raw markdown body.
 * Returns 1 minimum to avoid "0 min read".
 */
export function getReadTime(body: string | undefined): number {
  if (!body) return 1;
  const wordsPerMinute = 230;
  const wordCount = body.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Related posts: same category first, then tag overlap, then random fill.
 * Mirrors the seeded PRNG approach used in ToolLayout for RelatedTools.
 */
export function getRelatedPosts(
  current: BlogPost,
  all: BlogPost[],
  count = 3
): BlogPost[] {
  const currentId = current.id.replace(/\/index$/, '');
  const others = all.filter((p) => p.id.replace(/\/index$/, '') !== currentId);

  // Priority 1: same category
  const sameCategory = others.filter(
    (p) => p.data.category === current.data.category
  );

  // Priority 2: tag overlap (different category)
  const byTagOverlap = others
    .filter((p) => p.data.category !== current.data.category)
    .map((p) => ({
      post: p,
      overlap: p.data.tags.filter((t) => current.data.tags.includes(t)).length,
    }))
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .map((x) => x.post);

  return [...sameCategory, ...byTagOverlap].slice(0, count);
}

/** Normalise a blog post entry id to a clean URL slug */
export function getBlogSlug(post: BlogPost): string {
  return post.id.replace(/\/index$/, '');
}
```

**Verification:** TypeScript compiles — no runtime test yet.

---

## Phase 5: Breadcrumb Refactor (Generic `items[]` API)

**Goal:** Refactor `Breadcrumb.astro` to accept a generic `items` array, then update ToolLayout.

### [MODIFY] [Breadcrumb.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/components/common/ui/Breadcrumb.astro)

Replace the entire file with:

```astro
---
/**
 * Breadcrumb — Generic breadcrumb navigation for all page types.
 * Accepts a flat array of crumb items. The last item is rendered
 * as the current page (no link, aria-current="page").
 *
 * Usage:
 *   <Breadcrumb items={[
 *     { label: "Home", href: "/" },
 *     { label: "Blog", href: "/blog" },
 *     { label: "My Post Title" },
 *   ]} />
 */
import { House } from '@lucide/svelte';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

const { items } = Astro.props;
const lastIndex = items.length - 1;
---

<nav aria-label="Breadcrumb" class="text-xs text-muted-foreground">
  <ol class="flex items-center gap-1.5 flex-wrap">
    {items.map((item, i) => (
      <>
        {i === 0 && item.href === '/' ? (
          <li>
            <a href="/" class="hover:text-foreground transition-colors flex items-center" aria-label="Home">
              <House class="size-3.5" />
            </a>
          </li>
        ) : i === lastIndex ? (
          <li class="text-foreground font-medium truncate max-w-[200px]" aria-current="page">
            {item.label}
          </li>
        ) : (
          <li>
            <a href={item.href} class="hover:text-foreground transition-colors">{item.label}</a>
          </li>
        )}
        {i < lastIndex && (
          <li class="text-border" aria-hidden="true">/</li>
        )}
      </>
    ))}
  </ol>
</nav>
```

### [MODIFY] [ToolLayout.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/layouts/ToolLayout.astro)

Update all Breadcrumb usages (appears twice — line ~235 and ~291) from:

```astro
<Breadcrumb category={category} toolTitle={toolTitle} />
```

To:

```astro
<Breadcrumb items={[
  { label: "Home", href: "/" },
  { label: "Categories", href: "/categories" },
  { label: category, href: `/categories/${categoryToSlug(category)}` },
  { label: toolTitle },
]} />
```

> [!IMPORTANT]
> `categoryToSlug` is NOT currently imported in ToolLayout — it's used in `ToolPageSchemas.astro` (a different file). You MUST add this import to ToolLayout:
>
> ```ts
> import { categoryToSlug } from "../utils/slug";
> ```

**Verification:** Run dev server, navigate to any tool page — breadcrumbs should render identically to before.

---

## Phase 6: Move AuthorCard to `common/sections/`

**Goal:** Move `AuthorCard.astro` from `tool/sections/` to `common/sections/` and update imports.

### [MOVE] `src/components/tool/sections/AuthorCard.astro` → [AuthorCard.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/components/common/sections/AuthorCard.astro)

The file content stays identical — zero changes to the component itself.

### [MODIFY] [ToolLayout.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/layouts/ToolLayout.astro)

Update the import (line ~16):

```diff
-import AuthorCard from "../components/tool/sections/AuthorCard.astro";
+import AuthorCard from "../components/common/sections/AuthorCard.astro";
```

### [DELETE] `src/components/tool/sections/AuthorCard.astro`

After confirming the moved file works.

**Verification:** Tool pages still render AuthorCard correctly with avatar, socials, expertise tags.

---

## Phase 7: Blog UI Components

**Goal:** Create the four blog-specific Astro components.

### [NEW] [BlogHero.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/components/blog/sections/BlogHero.astro)

```astro
---
/**
 * BlogHero — Post header with title, metadata, and optional cover image.
 * Renders the H1, author byline, dates, read time, category badge, and
 * an optional cover image with eager loading to prevent CLS.
 */
import { formatW3CDate } from '../../../utils/w3c-date';
import Breadcrumb from '../../common/ui/Breadcrumb.astro';

interface Props {
  title: string;
  pubDate: Date;
  lastModified?: Date;
  author: string;
  coverImage?: string;
  coverImageAlt?: string;
  readTime: number;
  category: string;
  categorySlug: string;
}

const { title, pubDate, lastModified, author, coverImage, coverImageAlt, readTime, category, categorySlug } = Astro.props;
---

<header class="mb-8">
  <Breadcrumb items={[
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: category, href: `/blog/category/${categorySlug}` },
    { label: title },
  ]} />

  <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mt-4 mb-3">{title}</h1>

  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-6">
    <span>By {author}</span>
    <span aria-hidden="true">·</span>
    <time datetime={formatW3CDate(pubDate)}>
      {pubDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </time>
    {lastModified && (
      <>
        <span aria-hidden="true">·</span>
        <span>
          Updated <time datetime={formatW3CDate(lastModified)}>
            {lastModified.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
        </span>
      </>
    )}
    <span aria-hidden="true">·</span>
    <span>{readTime} min read</span>
  </div>

  {coverImage && (
    <img
      src={coverImage}
      alt={coverImageAlt ?? title}
      loading="eager"
      decoding="async"
      width="1200"
      height="630"
      class="w-full rounded-xl aspect-video object-cover"
    />
  )}
</header>
```

### [NEW] [BlogPostCard.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/components/blog/ui/BlogPostCard.astro)

```astro
---
/**
 * BlogPostCard — Reusable card for blog index grids and RelatedPosts.
 * Renders cover image, category badge, title, description, date, and read time.
 */
import type { BlogPost } from '../../../utils/blog';
import { getReadTime, getBlogSlug } from '../../../utils/blog';

interface Props {
  post: BlogPost;
  /** When true, card spans 2 columns (for the first/featured post) */
  featured?: boolean;
}

const { post, featured = false } = Astro.props;
const { title, description, pubDate, coverImage, category } = post.data;
const readTime = getReadTime(post.body);
const slug = getBlogSlug(post);
const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
---

<article class:list={['group border rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-card', featured && 'sm:col-span-2']}>
  {coverImage && (
    <a href={`/blog/${slug}`} tabindex="-1" aria-hidden="true">
      <img
        src={coverImage}
        alt={title}
        loading="lazy"
        decoding="async"
        width="600"
        height="315"
        class="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </a>
  )}

  <div class="p-5">
    <a
      href={`/blog/category/${categorySlug}`}
      class="text-xs font-semibold uppercase tracking-wide text-primary mb-2 inline-block hover:underline"
    >
      {category}
    </a>

    <h2 class="text-lg font-bold mb-2 leading-snug">
      <a href={`/blog/${slug}`} class="hover:underline">{title}</a>
    </h2>

    <p class="text-sm text-muted-foreground line-clamp-2 mb-4">{description}</p>

    <div class="flex items-center justify-between text-xs text-muted-foreground">
      <time datetime={pubDate.toISOString()}>
        {pubDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
      </time>
      <span>{readTime} min read</span>
    </div>
  </div>
</article>
```

### [NEW] [RelatedPosts.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/components/blog/sections/RelatedPosts.astro)

```astro
---
/**
 * RelatedPosts — Grid of related blog articles.
 * Displayed below the article content, not in sidebar.
 * Uses category-first, tag-overlap-second matching.
 */
import { getRelatedPosts, getAllPosts } from '../../../utils/blog';
import BlogPostCard from '../ui/BlogPostCard.astro';
import type { BlogPost } from '../../../utils/blog';

interface Props {
  currentPost: BlogPost;
}

const { currentPost } = Astro.props;
const allPosts = await getAllPosts();
const related = getRelatedPosts(currentPost, allPosts, 3);
---

{related.length > 0 && (
  <section class="mt-16 pt-12 border-t border-border/40">
    <h2 class="text-2xl font-bold mb-6">Related Articles</h2>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {related.map((post) => <BlogPostCard post={post} />)}
    </div>
  </section>
)}
```

### [NEW] [BlogSidebar.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/components/blog/sidebar/BlogSidebar.astro)

> [!IMPORTANT]
> `AllToolsList.astro` requires `tools: Tool[]` and `currentPath: string` props (it renders the full tool list with active highlighting). Blog pages don't have tool context, so BlogSidebar uses a lightweight "Explore Tools" CTA instead.

```astro
---
/**
 * BlogSidebar — Sidebar for blog post pages.
 * Lightweight: no tool-list (AllToolsList needs props we don't have).
 * Instead, shows a cross-promotion CTA linking to /categories.
 */
import SupportCard from '../../engagement/SupportCard.astro';
import { siteConfig } from '../../../config';

const showSupportCard = siteConfig.ui.sidebar.showSupportCard !== false;
---

<aside class="space-y-6 mt-8 lg:mt-0">
  <div class="sticky top-24 space-y-8">
    <!-- Cross-promotion: Explore Tools -->
    <div class="rounded-xl border border-border/60 p-5 bg-card shadow-sm">
      <h3 class="font-semibold text-lg mb-2 tracking-tight">Explore Tools</h3>
      <p class="text-sm text-muted-foreground mb-4">Try our free financial calculators and converters.</p>
      <a href="/categories" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors w-full justify-center">
        Browse All Tools
      </a>
    </div>
    {showSupportCard && <SupportCard />}
  </div>
</aside>
```

**Verification:** No runtime test yet — components are pure Astro, will be tested when BlogLayout is wired.

---

## Phase 8: BlogLayout

**Goal:** Create the main blog post layout that composes all components.

### [NEW] [BlogLayout.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/layouts/BlogLayout.astro)

```astro
---
/**
 * BlogLayout — Layout wrapper for individual blog post pages.
 *
 * Composes: BaseLayout, Header, Footer, BlogHero, BlogSidebar,
 * RelatedPosts, BlogPageSchemas, RichArticleProse.
 *
 * Architecture mirrors ToolLayout but is simpler:
 * - No widget zone
 * - No action tray
 * - Article + sidebar 2-col grid
 * - RelatedPosts below content (not in sidebar)
 */
import BaseLayout from './BaseLayout.astro';
import Header from '../components/common/sections/Header.astro';
import Footer from '../components/common/sections/Footer.astro';
import BlogHero from '../components/blog/sections/BlogHero.astro';
import BlogSidebar from '../components/blog/sidebar/BlogSidebar.astro';
import RelatedPosts from '../components/blog/sections/RelatedPosts.astro';
import BlogPageSchemas from '../components/common/seo/BlogPageSchemas.astro';
// TableOfContents lives under tool/sections/ but is generic enough to reuse.
// Future refactor: move to common/sections/ when a second consumer exists.
import TableOfContents from '../components/tool/sections/TableOfContents.astro';
import RichArticleProse from '../components/common/typography/RichArticleProse.astro';
import { siteConfig } from '../config';
import { formatW3CDate } from '../utils/w3c-date';
import { getStaticOgImage } from '../utils/og';
import type { BlogPost } from '../utils/blog';
import { getBlogSlug } from '../utils/blog';
import type { MarkdownHeading } from 'astro';

interface Props {
  post: BlogPost;
  headings: MarkdownHeading[];
  readTime: number;
}

const { post, headings, readTime } = Astro.props;
const { title, description, pubDate, lastModified, coverImage, coverImageAlt, author, noindex, category } = post.data;
const slug = getBlogSlug(post);
const categorySlug = category.toLowerCase().replace(/\s+/g, '-');

// Canonical URL — always absolute, pinned to production domain
const seoUrl = new URL(`/blog/${slug}`, siteConfig.url).href;

// OG Image — from manifest (with cache-busting hash) or fallback
const ogImagePath = getStaticOgImage('blog', slug);
const fullOgImageUrl = ogImagePath
  ? new URL(ogImagePath, siteConfig.url).href
  : new URL('/images/og-image.png', siteConfig.url).href;

// Pre-resolve dates to W3C format for schemas
const w3cPubDate = formatW3CDate(pubDate, siteConfig.datePublished);
const w3cModDate = formatW3CDate(lastModified);

// TOC: reuses the tool TOC config — same threshold/depth logic applies to all content.
const tocConfig = siteConfig.features.toolPage.toc;
const maxDepth = tocConfig?.maxDepth || 3;
const filteredHeadings = headings.filter(h => h.depth <= maxDepth);
const tocHeadings = filteredHeadings.length >= (tocConfig?.minHeadings || 3) ? filteredHeadings : [];
---

<BaseLayout
  title={`${title} | ${siteConfig.name} Blog`}
  description={description}
  canonicalURL={seoUrl}
  image={ogImagePath}
  type="article"
>
  <Fragment slot="head">
    <!--
      BlogPageSchemas.astro ALREADY EXISTS at src/components/common/seo/BlogPageSchemas.astro
      Verified Props interface (line 40-49):
        postTitle, description, seoUrl, ogImageUrl, pubDate (string), modDate (string),
        faqSchema? (any), tocHeadings? (Heading[])
      The component internally builds:
        1. Article JSON-LD (with author from siteConfig)
        2. BreadcrumbList JSON-LD (3-level: Home → Blog → Post)
        3. Optional FAQPage JSON-LD
    -->
    <BlogPageSchemas
      postTitle={title}
      description={description}
      seoUrl={seoUrl}
      ogImageUrl={fullOgImageUrl}
      pubDate={w3cPubDate}
      modDate={w3cModDate}
      tocHeadings={tocHeadings}
    />
    {noindex && <meta name="robots" content="noindex, nofollow" />}
  </Fragment>

  <Header />
  <main class="flex-1 container mx-auto px-4 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] lg:gap-12">
      <div class="space-y-6">
        <article>
          <BlogHero
            {title}
            {pubDate}
            {lastModified}
            {author}
            {coverImage}
            {coverImageAlt}
            {readTime}
            {category}
            {categorySlug}
          />

          {tocHeadings.length > 0 && (
            <TableOfContents headings={tocHeadings} />
          )}

          <RichArticleProse>
            <slot />
          </RichArticleProse>
        </article>

        <RelatedPosts currentPost={post} />
      </div>

      <BlogSidebar />
    </div>
  </main>
  <Footer />
</BaseLayout>
```

**Verification:** No runtime test yet — needs a page route to drive it.

---

## Phase 9: Blog Page Routes

**Goal:** Create the single post route and blog index page.

### [NEW] [post].astro — Single Blog Post

File: `src/pages/blog/[post].astro`

```astro
---
import { getCollection, render } from 'astro:content';
import BlogLayout from '../../layouts/BlogLayout.astro';
import { getReadTime, getBlogSlug } from '../../utils/blog';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) =>
    import.meta.env.PROD ? !data.draft : true
  );

  return posts.map((post) => ({
    params: { post: getBlogSlug(post) },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content, headings } = await render(post);
const readTime = getReadTime(post.body);
---

<BlogLayout post={post} headings={headings} readTime={readTime}>
  <Content />
</BlogLayout>
```

### [NEW] index.astro — Blog Index (Page 1)

File: `src/pages/blog/index.astro`

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Header from '../../components/common/sections/Header.astro';
import Footer from '../../components/common/sections/Footer.astro';
import BlogPostCard from '../../components/blog/ui/BlogPostCard.astro';
import { getAllPosts } from '../../utils/blog';
import { siteConfig } from '../../config';

const allPosts = await getAllPosts();
const { postsPerPage } = siteConfig.features.blog;
const posts = allPosts.slice(0, postsPerPage);
const totalPages = Math.ceil(allPosts.length / postsPerPage);
const hasNextPage = totalPages > 1;
const seoUrl = new URL('/blog', siteConfig.url).href;
---

<BaseLayout
  title={`Blog — Financial Tips & Guides | ${siteConfig.name}`}
  description={siteConfig.features.blog.rssDescription}
  canonicalURL={seoUrl}
>
  <Header />
  <main class="flex-1">
    <div class="container mx-auto px-4 py-12">
      <h1 class="text-4xl font-bold mb-4">Blog</h1>
      <p class="text-muted-foreground mb-10 text-lg max-w-2xl">
        Financial guides, tips, and tutorials from our editorial team.
      </p>

      {posts.length === 0 ? (
        <p class="text-muted-foreground py-16 text-center">No posts yet. Check back soon!</p>
      ) : (
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <BlogPostCard post={post} featured={i === 0} />
          ))}
        </div>
      )}

      {hasNextPage && (
        <div class="flex justify-center mt-12">
          <a href="/blog/page/2" class="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium">
            Older Posts →
          </a>
        </div>
      )}
    </div>
  </main>
  <Footer />
</BaseLayout>
```

**Verification:** Create sample post (Phase 14), then `npm run dev` → visit `/blog` and `/blog/[slug]`.

---

## Phase 10: Pagination (Page 2+)

**Goal:** Create overflow pagination pages at `/blog/page/2`, `/blog/page/3`, etc.

### [NEW] [page].astro — Paginated Overflow

File: `src/pages/blog/page/[page].astro`

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Header from '../../../components/common/sections/Header.astro';
import Footer from '../../../components/common/sections/Footer.astro';
import BlogPostCard from '../../../components/blog/ui/BlogPostCard.astro';
import { getAllPosts } from '../../../utils/blog';
import { siteConfig } from '../../../config';

export async function getStaticPaths() {
  const allPosts = await getAllPosts();
  const { postsPerPage } = siteConfig.features.blog;
  const totalPages = Math.ceil(allPosts.length / postsPerPage);

  // Page 1 is handled by /blog/index.astro — start from page 2
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    params: { page: String(i + 2) },
    props: {
      posts: allPosts.slice((i + 1) * postsPerPage, (i + 2) * postsPerPage),
      currentPage: i + 2,
      totalPages,
    },
  }));
}

const { posts, currentPage, totalPages } = Astro.props;
const seoUrl = new URL(`/blog/page/${currentPage}`, siteConfig.url).href;
---

<BaseLayout
  title={`Blog — Page ${currentPage} | ${siteConfig.name}`}
  description={`Page ${currentPage} of the blog archive.`}
  canonicalURL={seoUrl}
>
  <Header />
  <main class="flex-1">
    <div class="container mx-auto px-4 py-12">
      <h1 class="text-3xl font-bold mb-8">Blog — Page {currentPage}</h1>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogPostCard post={post} />
        ))}
      </div>

      <nav class="flex items-center justify-center gap-4 mt-12" aria-label="Pagination">
        {currentPage > 1 && (
          <a
            href={currentPage === 2 ? '/blog' : `/blog/page/${currentPage - 1}`}
            class="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium"
          >
            ← Newer Posts
          </a>
        )}
        <span class="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        {currentPage < totalPages && (
          <a
            href={`/blog/page/${currentPage + 1}`}
            class="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium"
          >
            Older Posts →
          </a>
        )}
      </nav>
    </div>
  </main>
  <Footer />
</BaseLayout>
```

**Verification:** Only generates pages when post count exceeds `postsPerPage`.

---

## Phase 11: Category & Tag Archive Pages

**Goal:** Create SEO content cluster pages for categories and tags.

### [NEW] [category].astro

File: `src/pages/blog/category/[category].astro`

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Header from '../../../components/common/sections/Header.astro';
import Footer from '../../../components/common/sections/Footer.astro';
import BlogPostCard from '../../../components/blog/ui/BlogPostCard.astro';
import { getAllPosts } from '../../../utils/blog';
import { BLOG_CATEGORIES } from '../../../content.config';
import { siteConfig } from '../../../config';

export async function getStaticPaths() {
  const allPosts = await getAllPosts();
  return BLOG_CATEGORIES.map((category) => ({
    params: { category: category.toLowerCase().replace(/\s+/g, '-') },
    props: {
      category,
      posts: allPosts.filter((p) => p.data.category === category),
    },
  }));
}

const { category, posts } = Astro.props;
const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
const seoUrl = new URL(`/blog/category/${categorySlug}`, siteConfig.url).href;
---

<BaseLayout
  title={`${category} — Blog | ${siteConfig.name}`}
  description={`Browse all ${category.toLowerCase()} articles on ${siteConfig.name}.`}
  canonicalURL={seoUrl}
>
  <Header />
  <main class="flex-1">
    <div class="container mx-auto px-4 py-12">
      <h1 class="text-3xl font-bold mb-2">{category}</h1>
      <p class="text-muted-foreground mb-8">
        {posts.length} {posts.length === 1 ? 'article' : 'articles'} in this category
      </p>

      {posts.length === 0 ? (
        <p class="text-muted-foreground py-16 text-center">No articles in this category yet.</p>
      ) : (
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => <BlogPostCard post={post} />)}
        </div>
      )}
    </div>
  </main>
  <Footer />
</BaseLayout>
```

### [NEW] [tag].astro

File: `src/pages/blog/tag/[tag].astro`

Same pattern as category archive, but iterates over `BLOG_TAGS` and filters by tag:

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Header from '../../../components/common/sections/Header.astro';
import Footer from '../../../components/common/sections/Footer.astro';
import BlogPostCard from '../../../components/blog/ui/BlogPostCard.astro';
import { getAllPosts } from '../../../utils/blog';
import { BLOG_TAGS } from '../../../content.config';
import { siteConfig } from '../../../config';

export async function getStaticPaths() {
  const allPosts = await getAllPosts();
  return BLOG_TAGS.map((tag) => ({
    params: { tag },
    props: {
      tag,
      posts: allPosts.filter((p) => p.data.tags.includes(tag)),
    },
  }));
}

const { tag, posts } = Astro.props;
const seoUrl = new URL(`/blog/tag/${tag}`, siteConfig.url).href;
---

<BaseLayout
  title={`#${tag} — Blog | ${siteConfig.name}`}
  description={`Articles tagged "${tag}" on ${siteConfig.name}.`}
  canonicalURL={seoUrl}
>
  <Header />
  <main class="flex-1">
    <div class="container mx-auto px-4 py-12">
      <h1 class="text-3xl font-bold mb-2">Tag: #{tag}</h1>
      <p class="text-muted-foreground mb-8">
        {posts.length} {posts.length === 1 ? 'article' : 'articles'} with this tag
      </p>

      {posts.length === 0 ? (
        <p class="text-muted-foreground py-16 text-center">No articles with this tag yet.</p>
      ) : (
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => <BlogPostCard post={post} />)}
        </div>
      )}
    </div>
  </main>
  <Footer />
</BaseLayout>
```

**Verification:** Visit `/blog/category/guides` and `/blog/tag/budgeting` in dev.

---

## Phase 12: RSS Feed

**Goal:** Create `/blog/rss.xml` and add autodiscovery `<link>` in BaseLayout.

### [NEW] rss.xml.ts

File: `src/pages/blog/rss.xml.ts`

```ts
import rss from '@astrojs/rss';
import { getAllPosts, getBlogSlug } from '../../utils/blog';
import { siteConfig } from '../../config';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getAllPosts();

  return rss({
    title: siteConfig.features.blog.rssTitle,
    description: siteConfig.features.blog.rssDescription,
    site: context.site!.toString(),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${getBlogSlug(post)}`,
      categories: [post.data.category, ...post.data.tags],
    })),
    customData: `<language>en-us</language>`,
  });
}
```

### [MODIFY] [BaseLayout.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/layouts/BaseLayout.astro)

Add RSS autodiscovery inside `<head>` (after the existing `<slot name="head" />`), conditionally:

```astro
{siteConfig.features.blog?.enabled && (
  <link rel="alternate" type="application/rss+xml" title={siteConfig.features.blog.rssTitle} href="/blog/rss.xml" />
)}
```

**Verification:** Visit `/blog/rss.xml` — should return valid XML.

---

## Phase 13: Blog OG Template

**Goal:** Replace the stub in `src/og/templates/blog.ts` with a full-featured template matching the tools template's quality.

### [MODIFY] [blog.ts](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/og/templates/blog.ts)

Replace with a complete Satori-compatible HTML template that:
- Uses the same dark theme as `toolsTemplate`
- Shows category badge, title, description
- Has a "Blog" label instead of the mock UI panel
- Includes brand footer bar
- Uses the same favicon embedding pattern

The template follows the exact same `OGData` interface and return type as `toolsTemplate`.

**Verification:** Run `npm run build` — blog OG images should generate to `public/images/og/blog/`.

---

## Phase 14: Sample Blog Post

**Goal:** Create a sample post so all phases can be tested end-to-end.

### [NEW] Sample Post

File: `src/content/blog/getting-started-with-budgeting/index.md`

```md
---
title: "How to Start Budgeting in 2024: A Complete Beginner's Guide"
description: "Learn the fundamentals of personal budgeting with our step-by-step guide. Start tracking your income and expenses today."
pubDate: 2024-06-15
lastModified: 2024-08-01
category: Guides
tags: [budgeting, savings, beginners]
author: "Editorial Team"
coverImage: /images/blog/budgeting-guide.jpg
coverImageAlt: "Woman reviewing budget on laptop"
featured: true
draft: false
---

## Why Budgeting Matters

Budgeting is the foundation of personal finance...

## The 50/30/20 Rule

A simple framework to allocate your income...

## Setting Up Your First Budget

### Step 1: Track Your Income

...content here...

### Step 2: List Your Expenses

...content here...

## Frequently Asked Questions

### How often should I review my budget?

Review your budget at least monthly...

### What percentage of income should I save?

Financial experts recommend saving at least 20%...
```

**Verification:** `npm run dev` → visit `/blog` (should show the card) and `/blog/getting-started-with-budgeting` (should render full post).

---

## Phase 15: Sitemap Extension

**Goal:** Extend the sitemap serializer in `astro.config.mjs` to handle `/blog/` paths with correct `lastmod`, OG images, and priority.

### [MODIFY] [astro.config.mjs](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/astro.config.mjs)

**Changes to the `serialize` function:**

1. **Add blog changefreq and priority** to the existing chain (before the fallback):

```js
// In the changefreq chain, add after /tools:
: item.url.includes('/blog') ? ChangeFreqEnum.WEEKLY

// In the priority chain, add after /tools:
: item.url.includes('/blog/') && !item.url.includes('/blog/page/') ? 0.7
: item.url.includes('/blog/page/') ? 0.3
: item.url.includes('/blog/category/') ? 0.5
: item.url.includes('/blog/tag/') ? 0.4
```

2. **Add `blogMatch` block** after the existing `toolMatch` block (around line 123, before the `else if` for legal pages):

```js
const blogMatch = item.url.match(/\/blog\/([^\/]+)\/?$/);
if (blogMatch && !item.url.includes('/category/') && !item.url.includes('/tag/') && !item.url.includes('/page/')) {
  const slug = blogMatch[1];
  try {
    const mdPath = path.resolve(process.cwd(), `src/content/blog/${slug}/index.md`);
    if (fs.existsSync(mdPath)) {
      const content = fs.readFileSync(mdPath, 'utf8');
      const lastModMatch = content.match(/^lastModified:\s*([^\r\n]+)/m);
      if (lastModMatch && lastModMatch[1]) {
        const rawDate = lastModMatch[1].replace(/['"]/g, '').trim();
        item.lastmod = formatW3CDate(rawDate, buildTime);
      } else {
        const pubDateMatch = content.match(/^pubDate:\s*([^\r\n]+)/m);
        if (pubDateMatch) {
          item.lastmod = formatW3CDate(pubDateMatch[1].replace(/['"]/g, '').trim(), buildTime);
        } else {
          item.lastmod = buildTime;
        }
      }
    }
  } catch (e) {
    item.lastmod = buildTime;
  }

  // Inject OG image from manifest
  const ogUrl = getStaticOgImage('blog', slug);
  if (ogUrl) {
    // @ts-ignore
    item.img = [{
      url: new URL(ogUrl.split('?')[0], siteConfig.url).href,
      title: `${slug.replace(/-/g, ' ')} preview graphic`,
    }];
  }
}
```

3. **Add sitemap filter** for blog feature flag:

```js
sitemap({
  filter: (page) => {
    if (!siteConfig.features.blog.enabled && page.includes('/blog')) return false;
    return true;
  },
  serialize(item) { /* ...existing + blog extension... */ }
})
```

**Verification:** Run `npm run build`, inspect `dist/sitemap-0.xml` for `/blog/` entries with correct `lastmod` and `<image:image>` tags.

---

## Phase 16: Navigation Links

**Goal:** Conditionally add Blog link to header, footer, and mobile menu when enabled.

> [!IMPORTANT]
> **Architecture finding:** All three navigation components (Header, Footer, MobileMenu) read from `siteConfig.ui.navigation` arrays. MobileMenu reads `siteConfig.ui.navigation.mobileCategories` — a separate array. The cleanest approach is to modify each component individually with a conditional Blog link, NOT to pollute the config arrays.

### [MODIFY] [Header.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/components/common/sections/Header.astro)

In the desktop nav (line ~27), add **after** the existing `.map()` loop (before closing `</nav>`):

```astro
{siteConfig.features.blog?.showInNavigation && (
  <a href="/blog" class="transition-colors hover:text-primary text-foreground/70">Blog</a>
)}
```

### [MODIFY] [Footer.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/components/common/sections/Footer.astro)

In the footer links div (line ~10), add **after** the existing `.map()` loop:

```astro
{siteConfig.features.blog?.showInNavigation && (
  <a href="/blog" class="hover:text-foreground transition-colors">Blog</a>
)}
```

### [MODIFY] [MobileMenu.svelte](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/components/common/sections/MobileMenu.svelte)

> [!NOTE]
> MobileMenu reads `siteConfig.ui.navigation.mobileCategories` for its category list and doesn't use the `header` array at all. Add a Blog link in the Categories `<nav>` section (line ~115), conditionally:

```svelte
{#if siteConfig.features.blog?.showInNavigation}
  <a href="/blog" onclick={() => open = false}
    class="flex items-center gap-3 rounded-xl px-3 py-3 text-muted-foreground transition-all duration-300 hover:bg-muted/80 hover:text-foreground active:scale-95">
    Blog
  </a>
{/if}
```

**Verification:** Toggle `blog.showInNavigation` between `true`/`false` — link appears/disappears in header, footer, and mobile menu.

---

## Phase 17: Search Integration

**Goal:** Add Blog results to the search dialog with a tab switcher.

> [!IMPORTANT]
> **Architecture finding:** The search system has two layers:
> 1. **`SearchDialog.svelte`** (parent) — Fetches data from `/api/search.json`, holds state, lazy-loads Content
> 2. **`SearchDialogContent.svelte`** (child) — Pure presentation, receives `tools` and `fetchState` as props
>
> Blog data MUST be added at the parent level (SearchDialog.svelte), not the child.
> The cleanest approach: extend the existing `/api/search.json` endpoint to include blog data, then add tab filtering in the UI.

### [MODIFY] [search.json.ts](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/pages/api/search.json.ts)

Extend to include blog posts when blog is enabled. Add a `type` field to disambiguate:

```ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { siteConfig } from '../../config';

export const GET: APIRoute = async () => {
  const raw = await getCollection('tools');
  const tools = raw
    .filter(t => !(import.meta.env.PROD && t.data.isDraft))
    .map(t => ({
      type: 'tool' as const,
      slug: t.id.replace(/\/index$/, ''),
      href: `/tools/${t.id.replace(/\/index$/, '')}`,
      data: {
        title: t.data.title,
        description: t.data.shortDescription || t.data.description,
        icon: t.data.icon,
        category: t.data.category,
        tags: t.data.tags,
      },
    }));

  let blogItems: typeof tools = [];
  if (siteConfig.features.blog?.enabled && siteConfig.features.blog?.showInSearch) {
    const rawBlog = await getCollection('blog', ({ data }) =>
      import.meta.env.PROD ? !data.draft : true
    );
    blogItems = rawBlog.map(p => ({
      type: 'blog' as const,
      slug: p.id.replace(/\/index$/, ''),
      href: `/blog/${p.id.replace(/\/index$/, '')}`,
      data: {
        title: p.data.title,
        description: p.data.description,
        icon: undefined,
        category: p.data.category,
        tags: p.data.tags as unknown as readonly string[],
      },
    }));
  }

  return new Response(JSON.stringify([...tools, ...blogItems]), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
```

### [MODIFY] [SearchDialog.svelte](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/components/common/dialogs/SearchDialog.svelte)

Update the `Tool` type to include `type` and `href`:

```ts
type Tool = {
  type: 'tool' | 'blog';
  slug: string;
  href: string;
  data: { ... };
};
```

Pass the full array to SearchDialogContent as before — no structural changes needed.

### [MODIFY] [SearchDialogContent.svelte](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/components/common/dialogs/SearchDialogContent.svelte)

Key changes:
1. Update `Tool` type to include `type: 'tool' | 'blog'` and `href: string`
2. Add `activeTab` state: `$state<'all' | 'tools' | 'blog'>('all')`
3. Add tab bar UI between `<Command.Input>` and `<Command.List>` — three pills: All / Tools / Blog
4. Filter `tools` array by `activeTab` before grouping: `tools.filter(t => activeTab === 'all' || t.type === activeTab)`
5. Change the `onSelect` handler to use `tool.href` instead of hardcoded `/tools/${tool.slug}`:

```svelte
onSelect={() => {
  open = false;
  window.location.href = tool.href;
}}
```

**Verification:** Open search (`Cmd+K`), see tab pills. "All" shows everything. "Blog" shows only blog results. No additional network requests — data comes from the same `/api/search.json` endpoint.

---

## Phase 18: LLMs Content Index

**Goal:** Include blog posts in the LLM-readable content index.

### [MODIFY] [llms-generator.ts](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/components/common/seo/llms-generator.ts)

Add after the tools section (around line 71):

```ts
import { getAllPosts, getBlogSlug } from '../../../utils/blog';
import { siteConfig } from '../../../config';

// In buildLlmsFullContent(), after the tools loop:
if (siteConfig.features.blog?.enabled) {
  const blogPosts = await getAllPosts();

  lines.push(`## Index of Blog Articles`, ``);
  for (const post of blogPosts) {
    const slug = getBlogSlug(post);
    const url = new URL(`/blog/${slug}`, siteConfig.url).href;
    lines.push(`- [${post.data.title}](${url})`);
  }
  lines.push(``, `---`, ``);

  for (const post of blogPosts) {
    const slug = getBlogSlug(post);
    const url = new URL(`/blog/${slug}`, siteConfig.url).href;
    lines.push(
      `### ${post.data.title}`,
      `- URL: ${url}`,
      `- Category: ${post.data.category}`,
      `- Published: ${post.data.pubDate.toISOString().split('T')[0]}`,
      `- Description: ${post.data.description}`,
      ``,
      `#### Content:`,
      ``,
      (post.body ?? '').slice(0, 1000),
      ``,
      `---`,
      ``,
    );
  }
}
```

**Verification:** Visit `/llms-full.txt` — blog posts appear after tools.

---

## Verification Checklist

### Build-time
- [ ] `npm run build` completes without type errors
- [ ] `astro check` passes on `content.config.ts` blog schema
- [ ] `svelte-check` passes on SearchDialogContent.svelte changes
- [ ] `sitemap-0.xml` contains `/blog/` entries with correct `lastmod` and `<image:image>`
- [ ] `/blog/rss.xml` returns valid XML with all published posts
- [ ] OG images generated at `public/images/og/blog/`

### Runtime
- [ ] `/blog` renders and paginates correctly at `postsPerPage` threshold
- [ ] `/blog/[post]` renders content, TOC appears when 3+ headings exist
- [ ] `/blog/category/guides` correctly filters posts
- [ ] `/blog/tag/savings` correctly filters posts
- [ ] `/blog/page/2` exists only if post count exceeds `postsPerPage`
- [ ] Search palette Blog tab fires only one network request on first open
- [ ] `draft: true` posts excluded from production builds but visible in dev
- [ ] Blog tool pages render identically (breadcrumbs, AuthorCard intact)

### SEO
- [ ] `<head>` of `/blog/[post]` contains `og:image`, `article:published_time`, Article JSON-LD
- [ ] `<link rel="alternate" type="application/rss+xml">` present in every page `<head>`
- [ ] Blog navigation link hidden when `blog.showInNavigation` is false
- [ ] Blog pages excluded from sitemap when `blog.enabled` is false
- [ ] `/llms-full.txt` includes blog articles when blog is enabled
