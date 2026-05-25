/*
Sitemap Configuration
Extracted from astro.config.mjs to keep that file clean.

Phase 9: siteConfig now comes from virtual:site-config (build-time constant).
Util imports updated to @mtools/core sibling paths.

Import with:  import { makeSitemapConfig } from '@mtools/core/config/sitemap';
              sitemap(sitemapConfig)

Sitemap strategy:
  URL pattern                    | priority | changefreq | lastmod
  ──────────────────────────────────────────────────────────────────
  /                              |   1.0    |  weekly    | omitted  (static shell)
  /tools/[slug]                  |   0.9    |  weekly    | from frontmatter
  /tools  (index)                |   0.8    |  weekly    | omitted  (dynamic list, no real mod date)
  /categories                    |   0.8    |  weekly    | omitted  (dynamic list)
  /categories/[cat]              |   0.8    |  weekly    | omitted  (dynamic list)
  /blog  (index)                 |   0.8    |  weekly    | omitted  (dynamic list)
  /blog/[slug]                   |   0.7    |  weekly    | from frontmatter
  /blog/category/[cat]           |   0.5    |  monthly   | omitted  (≥3 posts required)
  /authors/[slug]                |   0.6    |  monthly   | omitted  (stable profile page)
  /about /contact /support etc.  | 0.5–0.6  |  monthly   | omitted  (static copy)
  /privacy /terms /disclaimer    |   0.3    |  yearly    | omitted  (legal — never fake dates)
  ──────────────────────────────────────────────────────────────────
  /blog/tag/[tag]   EXCLUDED — thin-content duplicate trap
  /blog/page/[n]    EXCLUDED — Google says don't put pagination in sitemap
  /404 /500         EXCLUDED — error pages must not be indexed
  canonical set     EXCLUDED — syndicated/duplicate content (any non-empty value,
                               including a self-canonical to our own domain)
  noindex: true     EXCLUDED — page explicitly opted out of indexing

lastmod policy (Google's own guidance):
  "Only include lastmod when you can guarantee it reflects the date the
   *content* changed — not just a rebuild timestamp."  Hub / index pages
  have no meaningful content date, so we omit lastmod entirely rather than
  lying with a build timestamp. Individual content pages (/tools/[slug] and
  /blog/[slug]) carry a real date sourced from git history or frontmatter
  via the content-dates integration.

References:
  https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
*/

import fs from 'node:fs';
import path from 'node:path';
import { ChangeFreqEnum } from '@astrojs/sitemap';
import type { SiteConfig } from './types.ts';
import { formatW3CDate } from '../utils/w3c-date';
import { getStaticOgImage } from '../utils/og';

// ── Content-dates manifest loader ────────────────────────────────────────────
//
// Reads src/generated/content-dates.json (produced by the content-dates
// integration) once per build. Falls back to an empty object when the file
// doesn't exist yet (first run before the integration has written it).

type ContentDatesEntry = { publishedAt?: string; updatedAt?: string };
type ContentDatesMap   = Record<string, ContentDatesEntry>;

function loadContentDates(siteRoot: string): ContentDatesMap {
  const jsonPath = path.join(siteRoot, 'src', 'generated', 'content-dates.json');
  if (!fs.existsSync(jsonPath)) return {};
  try {
    const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    // Strip the _meta sentinel key — real entries are collection/slug pairs
    const { _meta, ...entries } = raw as Record<string, unknown>;
    return entries as ContentDatesMap;
  } catch {
    return {};
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Blog category archives are only included in the sitemap when they have at
 * least this many published posts.  Empty / near-empty archives are thin
 * content and waste crawl budget.
 *
 * Note: tool categories use /categories/[slug] (not /tools/category/[slug]).
 * Every tool category that exists in frontmatter already has ≥1 tool — Astro
 * will not generate a route for an empty category — so no count guard is
 * needed on the tools side.
 */
const MIN_POSTS_FOR_CATEGORY = 3;

// ── Frontmatter cache ─────────────────────────────────────────────────────────
//
// Per-build, module-level cache: absolute mdPath → ParsedFrontmatter.
//
// Each Astro build is a fresh Node process. The Map starts empty, grows as
// files are accessed, and is discarded when the process exits — no stale-data
// risk and no memory leak (entries are tiny plain objects bounded by the number
// of content files, which is always small).
//
// This is strictly better than the previous approach:
//   Before: readFrontmatterDate() called fs.readFileSync on every invocation.
//           One content page → 2 reads in serialize() alone, plus additional
//           reads inside countPostsInBlogCategory() for category pages.
//   After:  Each file is parsed from disk exactly ONCE per build. Every
//           subsequent access — whether from filter() or category counting — is an
//           O(1) Map lookup with zero I/O.

interface ParsedFrontmatter {
  /**
   * Raw canonical string from frontmatter, if present.
   * Any non-empty value means this page is syndicated or duplicate content.
   * Excluded from the sitemap regardless of whether it points to our own
   * domain or an external one — a canonical anywhere means this URL is not
   * the authoritative source.
   */
  canonical?: string;
  /** true when noindex: true is explicitly set in frontmatter */
  noindex: boolean;
  /** true when isDraft: true is explicitly set in frontmatter */
  isDraft: boolean;
  /**
   * Display-name category (e.g. "Guides") — used only for blog category
   * counting. Undefined for tool entries (not needed there).
   */
  category?: string;
}

const _frontmatterCache = new Map<string, ParsedFrontmatter>();

/**
 * Parse all sitemap-relevant frontmatter fields from a single markdown file.
 *
 * Uses a proper frontmatter-block extractor (content between the first ---
 * pair) to avoid false positives from lines in the markdown body — e.g. a
 * fenced code block that contains "canonical: something" would otherwise
 * match a naive full-file regex.
 */
function parseFrontmatterFromDisk(mdPath: string): ParsedFrontmatter {
  const empty: ParsedFrontmatter = { noindex: false, isDraft: false };
  if (!fs.existsSync(mdPath)) return empty;
  try {
    const raw = fs.readFileSync(mdPath, 'utf8');
    // Extract only the YAML block between the opening and closing ---
    const fmBlock = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    return {
      // Use `|| undefined` so an empty string after trimming still means "not set"
      canonical: fmBlock.match(/^canonical:\s*([^\r\n]+)/m)?.[1]?.replace(/['"]/g, '').trim() || undefined,
      noindex:   /^noindex:\s*true/m.test(fmBlock),
      isDraft:   /^isDraft:\s*true/m.test(fmBlock),
      category:  fmBlock.match(/^category:\s*['"]?([^'"\r\n]+)['"]?/m)?.[1]?.trim(),
    };
  } catch {
    return empty;
  }
}

/** Returns cached frontmatter for mdPath, parsing from disk on first access. */
function getFrontmatter(mdPath: string): ParsedFrontmatter {
  const cached = _frontmatterCache.get(mdPath);
  if (cached) return cached;
  const fm = parseFrontmatterFromDisk(mdPath);
  _frontmatterCache.set(mdPath, fm);
  return fm;
}

// ── Blog category count cache ──────────────────────────────────────────────────
//
// Lazy map: categorySlug → published + indexable post count.
// Built in one single pass over the blog directory on first access.
// Reuses _frontmatterCache entries — blog files are never read twice.

let _blogCategoryCountCache: Map<string, number> | null = null;

/**
 * Returns the count of published, indexable posts in a blog category.
 *
 * The categorySlug argument is the kebab-cased version of the display name
 * stored in frontmatter (e.g. "Guides" → "guides", "Personal Finance" →
 * "personal-finance").
 *
 * On first call, scans all blog content files in one pass and populates both
 * the category count cache and the shared _frontmatterCache as a side effect.
 * All subsequent calls — including filter() calls for individual blog posts —
 * are O(1) cache hits with zero I/O.
 */
function getBlogCategoryCount(categorySlug: string): number {
  if (!_blogCategoryCountCache) {
    _blogCategoryCountCache = new Map();
    const blogDir = path.resolve(process.cwd(), 'src/content/blog');
    if (!fs.existsSync(blogDir)) return 0;

    for (const slug of fs.readdirSync(blogDir)) {
      const mdPath = path.join(blogDir, slug, 'index.md');
      const fm = getFrontmatter(mdPath);  // also populates _frontmatterCache
      if (fm.isDraft || fm.noindex || !fm.category) continue;
      const catSlug = fm.category.toLowerCase().replace(/\s+/g, '-');
      _blogCategoryCountCache.set(catSlug, (_blogCategoryCountCache.get(catSlug) ?? 0) + 1);
    }
  }
  return _blogCategoryCountCache.get(categorySlug) ?? 0;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Resolves the best available lastmod date from content-dates.json.
 *
 * Lookup key: "collection/slug" (e.g. "tools/sip-calculator").
 * Priority: updatedAt → publishedAt → undefined.
 *
 * Returns undefined when no dates are available so the caller can delete
 * item.lastmod rather than writing a fake timestamp.
 */
function resolveLastmod(
  collection: 'tools' | 'blog',
  slug: string,
  contentDates: ContentDatesMap,
): string | undefined {
  const entry = contentDates[`${collection}/${slug}`];
  if (!entry) return undefined;
  const raw = entry.updatedAt ?? entry.publishedAt;
  if (!raw) return undefined;
  return formatW3CDate(raw);
}

// ── URL classification helpers ─────────────────────────────────────────────────
// These are returned as closures from makeSitemapConfig() so they capture
// the siteConfig passed in — no global state, no virtual:site-config dependency.

function makeClassifiers(siteUrl: string) {
  const isHomepage    = (url: string) => url === siteUrl || url === `${siteUrl}/`;
  /** /tools/[slug] — an individual tool detail page (has real frontmatter dates) */
  const isToolPage    = (url: string) => /\/tools\/[^/]+\/?$/.test(url);
  /** /tools  — the static tools index / listing page */
  const isToolsIndex  = (url: string) => url === new URL('/tools', siteUrl).href;
  const isBlogIndex   = (url: string) => url === new URL('/blog', siteUrl).href;
  // Declare archive/pagination classifiers BEFORE isBlogPost which references them
  const isBlogCategoryArchive = (url: string) => url.includes('/blog/category/');
  const isBlogTagArchive      = (url: string) => url.includes('/blog/tag/');
  const isBlogPagination      = (url: string) => url.includes('/blog/page/');
  /** /blog/[slug] — an individual blog post (has real frontmatter dates) */
  const isBlogPost    = (url: string) => /\/blog\/[^/]+\/?$/.test(url) && !isBlogCategoryArchive(url) && !isBlogTagArchive(url);
  const isCategoryIndex       = (url: string) => url === new URL('/categories', siteUrl).href;
  const isCategoryPage        = (url: string) => /\/categories\/[^/]+\/?$/.test(url);
  const isAuthorPage          = (url: string) => /\/authors\/[^/]+\/?$/.test(url);
  const isLegalPage           = (url: string) => /\/(privacy|terms|disclaimer|dmca|gdpr|cookie)/.test(url);
  const isErrorPage           = (url: string) => /\/(404|500)\/?$/.test(url);
  return { isHomepage, isToolPage, isToolsIndex, isBlogIndex, isBlogPost,
           isBlogCategoryArchive, isBlogTagArchive, isBlogPagination,
           isCategoryIndex, isCategoryPage, isAuthorPage, isLegalPage, isErrorPage };
}

// ═══════════════════════════════════════════════════════════════════════════════
// makeSitemapConfig — factory that returns the sitemap config object.
//
// Receives siteConfig as a plain value (not via virtual:site-config) so it can
// be called safely from astro-config.ts during Astro's config loading phase —
// before Vite's plugin system is initialised.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Lazy content-dates loader ─────────────────────────────────────────────────
//
// IMPORTANT: loadContentDates() MUST NOT be called at makeSitemapConfig() time.
// makeSitemapConfig() is evaluated when astro.config.ts is first loaded —
// BEFORE the contentDates() integration's astro:config:setup hook has run
// and written content-dates.json. Calling it eagerly would always read stale
// or missing data.
//
// Instead, we use a module-level lazy singleton: the JSON is read on the first
// serialize() call, which happens at actual build time, after all integration
// hooks have completed.

let _contentDatesCache: ContentDatesMap | null = null;

function getContentDatesLazy(): ContentDatesMap {
  if (_contentDatesCache === null) {
    _contentDatesCache = loadContentDates(process.cwd());
  }
  return _contentDatesCache;
}

export function makeSitemapConfig(siteConfig: SiteConfig) {
  const c = makeClassifiers(siteConfig.url);

  // ── Priority table ──────────────────────────────────────────────────────────
  function getPriority(url: string): number {
    if (c.isHomepage(url))            return 1.0;
    if (c.isToolPage(url))            return 0.9;
    if (c.isCategoryIndex(url))       return 0.8;
    if (c.isCategoryPage(url))        return 0.8;
    if (c.isBlogIndex(url))           return 0.8;
    if (c.isBlogPost(url))            return 0.7;
    if (c.isAuthorPage(url))          return 0.6;
    if (/\/(support|contact|mobile-app)/.test(url)) return 0.6;
    if (c.isBlogCategoryArchive(url)) return 0.5;
    if (c.isLegalPage(url))           return 0.3;
    return 0.5; // /about and any future pages
  }

  // ── Changefreq table ────────────────────────────────────────────────────────
  function getChangefreq(url: string): ChangeFreqEnum {
    if (c.isLegalPage(url)) return ChangeFreqEnum.YEARLY;
    if (c.isAuthorPage(url) || c.isBlogCategoryArchive(url)) return ChangeFreqEnum.MONTHLY;
    if (/\/(support|contact|mobile-app|about)/.test(url)) return ChangeFreqEnum.MONTHLY;
    return ChangeFreqEnum.WEEKLY;
  }

  // ── OG image injection ──────────────────────────────────────────────────────
  function injectOgImage(
    item: Record<string, unknown>,
    collection: 'tools' | 'blog',
    slug: string,
  ): void {
    const ogUrl = getStaticOgImage(collection, slug);
    if (ogUrl) {
      // @ts-ignore — @astrojs/sitemap supports img[] via the sitemap package extension
      item.img = [{
        url: new URL(ogUrl.split('?')[0]!, siteConfig.url).href,
        title: `${slug.replace(/-/g, ' ')} - ${siteConfig.name}`,
      }];
    }
  }

  // ── Content page serializer ─────────────────────────────────────────────────
  /**
   * Unified serializer for both /tools/[slug] and /blog/[slug] entries.
   *
   * Reads lastmod from contentDates (content-dates.json) keyed by
   * "collection/slug". Deletes lastmod when no date is available rather
   * than writing a fake timestamp.
   */
  function serializeContentPage(
    item: Record<string, unknown> & { url: string },
    collection: 'tools' | 'blog',
    slug: string,
  ): Record<string, unknown> & { url: string } {
    const lastmod = resolveLastmod(collection, slug, getContentDatesLazy());
    if (lastmod) {
      item.lastmod = lastmod;
    } else {
      delete item.lastmod;
    }
    injectOgImage(item, collection, slug);
    return item;
  }

  return {
    // ── Filter ────────────────────────────────────────────────────────────────
    filter(page: string): boolean {
      if (!siteConfig.features.blog?.enabled && page.includes('/blog')) return false;
      if (c.isErrorPage(page))      return false;
      if (c.isBlogTagArchive(page)) return false;
      if (c.isBlogPagination(page)) return false;

      // Blog category archive — only include when ≥ MIN_POSTS_FOR_CATEGORY
      // published, indexable posts exist. Tools don't need this guard (see
      // constant comment above).
      if (c.isBlogCategoryArchive(page)) {
        const catSlug = page.match(/\/blog\/category\/([^/]+)\/?$/)?.[1];
        if (catSlug && getBlogCategoryCount(catSlug) < MIN_POSTS_FOR_CATEGORY) return false;
      }

      // Individual content pages — exclude pages that have opted out of
      // indexing or that declare a canonical URL (meaning this page is not
      // the authoritative source of its content).
      const blogSlug = c.isBlogPost(page) ? page.match(/\/blog\/([^/]+)\/?$/)?.[1] : undefined;
      const toolSlug = c.isToolPage(page) && !c.isToolsIndex(page)
        ? page.match(/\/tools\/([^/]+)\/?$/)?.[1]
        : undefined;
      const contentSlug = blogSlug ?? toolSlug;
      if (contentSlug) {
        const collection = blogSlug ? 'blog' : 'tools';
        const mdPath = path.resolve(process.cwd(), `src/content/${collection}/${contentSlug}/index.md`);
        const fm = getFrontmatter(mdPath);
        if (fm.canonical) return false;  // syndicated — not our original content
        if (fm.noindex)   return false;
      }

      return true;
    },

    // ── Serialize ─────────────────────────────────────────────────────────────
    serialize(item: Record<string, unknown> & { url: string }) {
      const { url } = item;

      item.priority   = getPriority(url);
      item.changefreq = getChangefreq(url);

      // /tools/[slug] — real lastmod from content-dates integration
      const toolMatch = url.match(/\/tools\/([^/]+)\/?$/);
      if (toolMatch && !c.isToolsIndex(url)) {
        return serializeContentPage(item, 'tools', toolMatch[1]!);
      }

      // /blog/[slug] — real lastmod from content-dates integration
      if (c.isBlogPost(url)) {
        const blogMatch = url.match(/\/blog\/([^/]+)\/?$/);
        if (blogMatch) {
          return serializeContentPage(item, 'blog', blogMatch[1]!);
        }
      }

      // Everything else — no lastmod (don't fake build timestamps)
      delete item.lastmod;
      return item;
    },
  };
}
