/**
 * Author Utilities — central module for all author-related data access.
 *
 * Mirrors the architecture of blog.ts and tools.ts:
 * - Collection queries isolated here
 * - Typed exports used across pages and layouts
 * - toPersonSchemaInput() is the ONLY place where author data maps to Schema.org
 *
 * Key design decisions:
 * - resolveAuthor() accepts the raw CollectionEntry reference object from post.data.author
 *   so callers never touch getEntry() directly
 * - getAuthorUrl() is the single source of truth for author URL construction
 * - toPersonSchemaInput() keeps SEO builders generic — they never import siteConfig
 *   or know about content collections
 *
 * Phase 10: moved to @mtools/core/utils/authors.
 * siteConfig now comes from virtual:site-config (build-time constant).
 * PersonSchemaInput import updated to ../seo/types (Phase 9 moved it there).
 */
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { siteConfig } from 'virtual:site-config';
import { formatW3CDate } from './w3c-date';
import type { PersonSchemaInput } from '../seo/types';

/** Full author entry type — use this everywhere you pass author data to components */
export type AuthorEntry = CollectionEntry<'authors'>;

/**
 * All author entries.
 * Authors are never drafts — no filtering needed.
 * Results are sorted alphabetically by name for consistent ordering.
 */
export async function getAllAuthors(): Promise<AuthorEntry[]> {
  const authors = await getCollection('authors');
  return authors.sort((a: AuthorEntry, b: AuthorEntry) => a.data.name.localeCompare(b.data.name));
}

/**
 * Single author by slug.
 * Returns undefined if no matching author file exists — callers must handle this.
 * Use resolveAuthor() when you need a guaranteed fallback.
 */
export async function getAuthorBySlug(slug: string): Promise<AuthorEntry | undefined> {
  return getEntry('authors', slug);
}

/**
 * Resolve a content entry's author reference to a full AuthorEntry.
 *
 * Accepts the raw reference object from post.data.author or entry.data.author —
 * callers pass it directly, no unwrapping needed.
 *
 * Falls back to siteConfig.seo.defaultAuthorSlug when:
 * - The entry has no author field set (undefined)
 * - The referenced author file doesn't exist
 *
 * When an explicit slug is provided but no matching file is found, a warning is
 * emitted so the problem is visible at build time rather than silently showing
 * the wrong author.
 *
 * @throws Never — always returns a valid AuthorEntry.
 *         If the fallback slug is also missing, throws with a clear message.
 */
export async function resolveAuthor(
  authorRef?: { collection: string; id: string } | undefined
): Promise<AuthorEntry> {
  // Try the explicit author reference first
  if (authorRef) {
    const author = await getEntry('authors', authorRef.id);
    if (author) return author;

    // The slug was set but no matching file exists — warn loudly so this is
    // never silently wrong. We still fall back to the default author so the
    // build doesn't fail, but this must be fixed.
    console.warn(
      `[authors.ts] Author "${authorRef.id}" not found in src/content/authors/. ` +
      `Falling back to default author "${siteConfig.seo.defaultAuthorSlug}". ` +
      `Create src/content/authors/${authorRef.id}/ to fix this, or correct the slug in frontmatter.`
    );
  }

  // Fall back to the site-wide default author
  const defaultSlug = siteConfig.seo.defaultAuthorSlug;
  const defaultAuthor = await getEntry('authors', defaultSlug);

  if (!defaultAuthor) {
    throw new Error(
      `[authors.ts] Default author "${defaultSlug}" not found in src/content/authors/. ` +
      `Create src/content/authors/${defaultSlug}.md to fix this.`
    );
  }

  return defaultAuthor;
}

/**
 * Resolve all authors for a content entry — primary author + any co-authors.
 *
 * Returns an array always containing at least one author (the primary, which
 * falls back to defaultAuthorSlug if not set). Co-authors are appended in the
 * order they are listed in frontmatter.
 *
 * Guarantees:
 * - No duplicate authors — if the same slug appears as both primary and
 *   co-author (or twice in coAuthors), the duplicate is dropped.
 * - Missing co-author slugs emit a warning and are skipped, not silently dropped.
 */
export async function resolveAuthors(
  authorRef?: { collection: string; id: string } | undefined,
  coAuthorRefs?: { collection: string; id: string }[]
): Promise<AuthorEntry[]> {
  const primary = await resolveAuthor(authorRef);

  if (!coAuthorRefs || coAuthorRefs.length === 0) {
    return [primary];
  }

  // Resolve all co-authors in parallel
  const resolved = await Promise.all(
    coAuthorRefs.map((ref) => getEntry('authors', ref.id).then((entry: AuthorEntry | undefined) => ({ ref, entry })))
  );

  const validCoAuthors: AuthorEntry[] = [];
  for (const { ref, entry } of resolved) {
    if (!entry) {
      // Warn loudly — a missing co-author is a content error, not a silent no-op
      console.warn(
        `[authors.ts] Co-author "${ref.id}" not found in src/content/authors/. ` +
        `This credit will be omitted. Create src/content/authors/${ref.id}/ or correct the slug in frontmatter.`
      );
      continue;
    }
    // Deduplicate — skip if this slug is already in the result set
    const alreadyIncluded =
      entry.id === primary.id ||
      validCoAuthors.some((a) => a.id === entry.id);
    if (alreadyIncluded) {
      console.warn(
        `[authors.ts] Duplicate author "${entry.id}" in coAuthors — ` +
        `this slug already appears as primary or earlier co-author and will be skipped.`
      );
      continue;
    }
    validCoAuthors.push(entry);
  }

  return [primary, ...validCoAuthors];
}

/**
 * All content attributed to a specific author — both blog posts and tools.
 * Used on the /authors/[slug] profile page to build the post grid and tool grid.
 *
 * Filtering: only returns published content (respects isDraft in production).
 */
export async function getContentByAuthor(slug: string): Promise<{
  blogPosts: CollectionEntry<'blog'>[];
  tools: CollectionEntry<'tools'>[];
}> {
  const [allPosts, allTools] = await Promise.all([
    getCollection('blog', ({ data }: CollectionEntry<'blog'>) => {
      if (import.meta.env.PROD && data.isDraft) return false;
      return true;
    }),
    getCollection('tools', ({ data }: CollectionEntry<'tools'>) => {
      if (import.meta.env.PROD && data.isDraft) return false;
      return true;
    }),
  ]);

  // Match by author reference id (the slug) OR fall back to the entry being
  // attributed to the default author when no author field is set
  const defaultSlug = siteConfig.seo.defaultAuthorSlug;
  const isDefaultAuthor = slug === defaultSlug;

  const blogPosts = allPosts
    .filter((post: CollectionEntry<'blog'>) => {
      if (post.data.author) {
        if (post.data.author.id === slug) return true;
      } else if (isDefaultAuthor) {
        // Posts with no primary author are attributed to the default author
        return true;
      }
      // Also include posts where this author is listed as a co-author
      return post.data.coAuthors?.some((ref: { id: string }) => ref.id === slug) ?? false;
    })
    .sort((a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>) => {
      const dateA = a.data.publishedAt ? new Date(formatW3CDate(a.data.publishedAt)).valueOf() : 0;
      const dateB = b.data.publishedAt ? new Date(formatW3CDate(b.data.publishedAt)).valueOf() : 0;
      return dateB - dateA; // newest first; undated posts sort last
    });

  const tools = allTools
    .filter((tool: CollectionEntry<'tools'>) => {
      if (tool.data.author) {
        if (tool.data.author.id === slug) return true;
      } else if (isDefaultAuthor) {
        return true;
      }
      return tool.data.coAuthors?.some((ref: { id: string }) => ref.id === slug) ?? false;
    })
    .sort((a: CollectionEntry<'tools'>, b: CollectionEntry<'tools'>) => (a.data.order ?? 999) - (b.data.order ?? 999));

  return { blogPosts, tools };
}

/**
 * Build the absolute author profile URL from a slug.
 * Single source of truth — no hardcoded /authors/ prefix scattered across templates.
 *
 * @example getAuthorUrl('abhishek') → '/authors/abhishek'
 */
export function getAuthorUrl(slug: string): string {
  return `/authors/${slug}`;
}

/**
 * Map an AuthorEntry to the PersonSchemaInput shape expected by SEO schema builders.
 *
 * This is the ONLY place where author data maps to Schema.org Person shape.
 * Keeps SEO schema builders generic — they never import siteConfig or know about collections.
 *
 * The author profile URL is always derived from the slug — never stored in frontmatter.
 * The avatar URL comes from Astro's image() pipeline (processed, content-hashed URL).
 */
export function toPersonSchemaInput(
  author: AuthorEntry,
  siteUrl: string
): PersonSchemaInput {
  const authorUrl = new URL(getAuthorUrl(author.id), siteUrl).href;

  // Astro's image() validator produces an ImageMetadata object with a .src property
  // that is the optimised/hashed URL. At build time this is the processed path.
  // We use it as-is for Schema.org — Google handles content-hashed URLs fine.
  const avatarSrc = typeof author.data.avatar === 'object' && 'src' in author.data.avatar
    ? author.data.avatar.src
    : String(author.data.avatar);
  const avatarUrl = avatarSrc.startsWith('http')
    ? avatarSrc
    : new URL(avatarSrc, siteUrl).href;

  const { socials } = author.data;
  const sameAs = [
    socials.twitter,
    socials.linkedin,
    socials.github,
    socials.facebook,
  ].filter(Boolean) as string[];

  return {
    name:         author.data.name,
    jobTitle:     author.data.role,         // role maps to Schema.org jobTitle (D3)
    description:  author.data.shortBio,
    knowsAbout:   author.data.knowsAbout,
    url:          authorUrl,
    imageUrl:     avatarUrl,
    sameAs,
  };
}
