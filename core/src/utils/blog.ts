/**
 * Blog Utilities — shared logic for all blog pages.
 *
 * Centralises collection queries, sorting, filtering, and related-post logic
 * so page files stay thin and declarative.
 *
 * Common utilities (getReadTime, filterTocHeadings) live in content.ts.
 * Slug normalisation lives in slug.ts.
 *
 * Phase 10: moved to @mtools/core/utils/blog.
 * siteConfig now comes from virtual:site-config (build-time constant).
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { formatW3CDate } from './w3c-date';
// Phase 10: replaced `import { siteConfig } from '../config'`
import { siteConfig } from 'virtual:site-config';
import { resolveSlug } from './slug';
import { cyrb128, mulberry32, seededShuffle } from './prng';

export type BlogPost = CollectionEntry<'blog'>;

/**
 * Lightweight shape for grids, search indexes, and any consumer that does NOT
 * need the markdown body. Mirrors the ToolSummary pattern from tools.ts.
 *
 * Note: BlogPostCard uses post.body (for getReadTime), so it still takes a
 * full BlogPost. Use BlogPostSummary for search, sitemaps, and similar.
 */
export type BlogPostSummary = {
  slug: string;
  data: {
    title: string;
    description: string;
    pubDate?: Date | string;
    category: string;
    tags: readonly string[];
    coverImage?: string;
    coverImageAlt?: string;
    /** Author slug (id) — undefined when no author is set (falls back to defaultAuthorSlug at render time) */
    authorSlug?: string;
    featured?: boolean;
  };
};

/**
 * Resolves a blog post's pubDate to a sortable timestamp.
 * Mirrors the tools approach: uses formatW3CDate so optional pubDate
 * and string/Date inputs both resolve consistently.
 */
function resolvePubDate(post: BlogPost): number {
  const resolved = formatW3CDate(post.data.pubDate, siteConfig.datePublished);
  return new Date(resolved).valueOf();
}

/**
 * All published posts, sorted newest-first.
 * In production, isDraft posts are excluded. In dev, all posts are returned.
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }: BlogPost) => {
    if (import.meta.env.PROD && data.isDraft) return false;
    return true;
  });
  return posts.sort(
    (a: BlogPost, b: BlogPost) => resolvePubDate(b) - resolvePubDate(a)
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
 * All unique category values across published posts.
 * Mirrors the pattern used by the tools category page — page calls this in
 * getStaticPaths() to derive routes, then calls getPostsByCategory() in body.
 */
export async function getAllPostCategories(): Promise<string[]> {
  const posts = await getAllPosts();
  return [...new Set(posts.map((p) => p.data.category))];
}

/**
 * All unique tag values across published posts.
 * Mirrors the pattern used by the tools tag page — page calls this in
 * getStaticPaths() to derive routes, then calls getPostsByTag() in body.
 */
export async function getAllPostTags(): Promise<string[]> {
  const posts = await getAllPosts();
  return [...new Set(posts.flatMap((p) => [...p.data.tags]))];
}

/**
 * Related posts: same category first (seeded-shuffled), then tag overlap,
 * then any remaining posts as a Tier-3 fallback.
 *
 * Priority (all pools seeded-shuffled for stable-but-varied results per slug):
 *   Tier 1: Posts in the same category (seeded-shuffled)
 *   Tier 2: Posts sharing tags but in a different category (sorted by overlap
 *           count descending — higher relevance first)
 *   Tier 3: Any remaining posts — ensures a user always has something to read
 *
 * The seed is derived from the current post's slug via cyrb128 + mulberry32,
 * so results are deterministic per URL (same order on every visit to that post).
 * Mirrors the seeded PRNG approach used in getRelatedTools() in tools.ts.
 */
export function getRelatedPosts(
  current: BlogPost,
  all: BlogPost[],
  count = 3
): BlogPost[] {
  const currentId = resolveSlug(current.id);
  const seed = cyrb128(currentId);
  const rng  = mulberry32(seed);
  const others = all.filter(p => resolveSlug(p.id) !== currentId);

  // Tier 1: same category, seeded-shuffled
  const sameCat = others.filter(p => p.data.category === current.data.category);
  let result = seededShuffle(sameCat, rng).slice(0, count);

  // Tier 2: tag overlap, different category — sort by overlap score (more = better)
  if (result.length < count) {
    const byTagOverlap = others
      .filter(
        p =>
          p.data.category !== current.data.category &&
          !result.find(r => resolveSlug(r.id) === resolveSlug(p.id)),
      )
      .map(p => ({
        post: p,
        overlap: p.data.tags.filter((t: string) => current.data.tags.includes(t)).length,
      }))
      .filter(x => x.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap)
      .map(x => x.post);
    result = [...result, ...byTagOverlap.slice(0, count - result.length)];
  }

  // Tier 3: any remaining posts — ensures the section is never empty
  if (result.length < count) {
    const remaining = others.filter(
      p => !result.find(r => resolveSlug(r.id) === resolveSlug(p.id)),
    );
    result = [...result, ...seededShuffle(remaining, rng).slice(0, count - result.length)];
  }

  return result;
}

/**
 * Normalise a blog post entry id to a clean URL slug.
 * Delegates to the shared resolveSlug utility in slug.ts.
 */
export function getBlogSlug(post: BlogPost): string {
  return resolveSlug(post.id);
}

/**
 * All published posts mapped to the lightweight BlogPostSummary shape.
 * Use this for search indexes, sitemaps, or any consumer that does NOT
 * need the markdown body — mirrors getAllToolSummaries() in tools.ts.
 */
export async function getAllPostSummaries(): Promise<BlogPostSummary[]> {
  const posts = await getAllPosts();
  return posts.map((p) => ({
    slug: getBlogSlug(p),
    data: {
      title:         p.data.title,
      description:   p.data.description,
      pubDate:       p.data.pubDate,
      category:      p.data.category,
      tags:          p.data.tags,
      coverImage:    p.data.coverImage,
      coverImageAlt: p.data.coverImageAlt,
      // Unwrap the reference object to just the id (slug) string for downstream simplicity.
      // Resolving to a full AuthorEntry is deferred to render time via resolveAuthor().
      authorSlug:    p.data.author?.id,
      featured:      p.data.featured,
    },
  }));
}
