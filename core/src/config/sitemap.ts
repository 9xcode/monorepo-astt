/*
Sitemap Configuration
Extracted from astro.config.mjs to keep that file clean.

Phase 9: siteConfig now comes from virtual:site-config (build-time constant).
Util imports updated to @mtools/core sibling paths.

Import with:  import { sitemapConfig } from '@mtools/core/config/sitemap';
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

lastmod policy (Google's own guidance):
  "Only include lastmod when you can guarantee it reflects the date the
   *content* changed — not just a rebuild timestamp."  Hub / index pages
  have no meaningful content date, so we omit lastmod entirely rather than
  lying with a build timestamp. Individual content pages (/tools/[slug] and
  /blog/[slug]) carry a real date sourced from frontmatter.

References:
  https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
*/

import fs from 'node:fs';
import path from 'node:path';
import { ChangeFreqEnum } from '@astrojs/sitemap';
import type { SiteConfig } from './types.ts';
import { formatW3CDate } from '../utils/w3c-date';
import { getStaticOgImage } from '../utils/og';

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Blog category archives are only included in the sitemap when they have at
 * least this many published posts.  Empty / near-empty archives are thin
 * content and waste crawl budget.
 */
const MIN_POSTS_FOR_CATEGORY = 3;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Count published (non-draft) posts that belong to a blog category by scanning
 * the content directory at build time.  Avoids importing the full Astro
 * Content Collections API (which isn't available in astro.config.mjs context).
 */
function countPostsInBlogCategory(categorySlug: string): number {
  const blogDir = path.resolve(process.cwd(), 'src/content/blog');
  if (!fs.existsSync(blogDir)) return 0;

  let count = 0;
  for (const slug of fs.readdirSync(blogDir)) {
    const mdPath = path.join(blogDir, slug, 'index.md');
    if (!fs.existsSync(mdPath)) continue;
    const content = fs.readFileSync(mdPath, 'utf8');

    // Skip drafts
    if (/^isDraft:\s*true/m.test(content)) continue;
    // Skip noindex
    if (/^noindex:\s*true/m.test(content)) continue;

    // Match category field — stored as the display name (e.g. "Guides")
    // The URL slug is kebab-cased (e.g. "guides") so we normalise both sides.
    const catMatch = content.match(/^category:\s*['"']?([^'"'\r\n]+)['"']?/m);
    if (catMatch) {
      const postCategorySlug = catMatch[1]!.trim().toLowerCase().replace(/\s+/g, '-');
      if (postCategorySlug === categorySlug) count++;
    }
  }
  return count;
}

/**
 * Read a frontmatter date field from a markdown file and return a W3C-formatted
 * date string.  Falls back to the global buildTime if the field is missing.
 */
function readFrontmatterDate(
  mdPath: string,
  field: 'lastModified' | 'pubDate',
  buildTime: string,
): string {
  try {
    if (!fs.existsSync(mdPath)) return buildTime;
    const content = fs.readFileSync(mdPath, 'utf8');
    const match = content.match(new RegExp(`^${field}:\\s*([^\\r\\n]+)`, 'm'));
    if (match?.[1]) {
      return formatW3CDate(match[1].replace(/['"]/g, '').trim(), buildTime);
    }
  } catch {
    // Silently fall through
  }
  return buildTime;
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
  /** /blog/[slug] — an individual blog post (has real frontmatter dates) */
  const isBlogPost    = (url: string) => /\/blog\/[^/]+\/?$/.test(url) && !isBlogCategoryArchive(url) && !isBlogTagArchive(url);
  const isBlogCategoryArchive = (url: string) => url.includes('/blog/category/');
  const isBlogTagArchive      = (url: string) => url.includes('/blog/tag/');
  const isBlogPagination      = (url: string) => url.includes('/blog/page/');
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

  return {
    // ── Filter ────────────────────────────────────────────────────────────────
    filter(page: string): boolean {
      if (!siteConfig.features.blog?.enabled && page.includes('/blog')) return false;
      if (c.isErrorPage(page))          return false;
      if (c.isBlogTagArchive(page))     return false;
      if (c.isBlogPagination(page))     return false;
      if (c.isBlogCategoryArchive(page)) {
        const catMatch = page.match(/\/blog\/category\/([^/]+)\/?$/);
        if (catMatch) {
          const postCount = countPostsInBlogCategory(catMatch[1]!);
          if (postCount < MIN_POSTS_FOR_CATEGORY) return false;
        }
      }
      return true;
    },

    // ── Serialize ─────────────────────────────────────────────────────────────
    serialize(item: Record<string, unknown> & { url: string }) {
      const { url } = item;
      const buildTime = process.env['BUILD_TIME'] || siteConfig.buildTime;

      item.priority   = getPriority(url);
      item.changefreq = getChangefreq(url);

      // /tools/[slug] — real lastmod from frontmatter
      const toolMatch = url.match(/\/tools\/([^/]+)\/?$/);
      if (toolMatch && !c.isToolsIndex(url)) {
        const slug = toolMatch[1]!;
        const mdPath = path.resolve(process.cwd(), `src/content/tools/${slug}/index.md`);
        item.lastmod = readFrontmatterDate(mdPath, 'lastModified', buildTime)
          || readFrontmatterDate(mdPath, 'pubDate', buildTime)
          || buildTime;
        injectOgImage(item, 'tools', slug);
        return item;
      }

      // /blog/[slug] — real lastmod from frontmatter
      if (c.isBlogPost(url)) {
        const blogMatch = url.match(/\/blog\/([^/]+)\/?$/);
        if (blogMatch) {
          const slug = blogMatch[1]!;
          const mdPath = path.resolve(process.cwd(), `src/content/blog/${slug}/index.md`);
          item.lastmod = readFrontmatterDate(mdPath, 'lastModified', buildTime)
            || readFrontmatterDate(mdPath, 'pubDate', buildTime)
            || buildTime;
          injectOgImage(item, 'blog', slug);
          return item;
        }
      }

      // Everything else — no lastmod (don't fake build timestamps)
      delete item.lastmod;
      return item;
    },
  };
}
