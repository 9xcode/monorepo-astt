/**
 * Blog content schema factory.
 *
 * Accepts `z` and `reference` as parameters to avoid:
 *   1. Importing `astro:content` (not available in a standalone package)
 *   2. Zod version mismatch — Astro v6 uses Zod v4; passing z from the
 *      caller ensures only one Zod instance is used for validation.
 *
 * Usage in sites/<site>/src/content.config.ts:
 *
 *   import { z, reference } from 'astro:content';
 *   import { makeBlogSchema } from '../../../core/src/content-schemas/blog.ts';
 *
 *   const blogCollection = defineCollection({
 *     loader: glob({ pattern: '**\/*.md', base: './src/content/blog' }),
 *     schema: makeBlogSchema(z, reference),
 *   });
 */

export const BLOG_CATEGORIES = [
  'Guides',
  'Tutorials',
  'Tips',
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
  'productivity',
] as const;

export type BlogTag = (typeof BLOG_TAGS)[number];

/**
 * Creates the Zod schema for the blog collection.
 *
 * @param z          Astro's re-exported Zod instance (from `astro:content`)
 * @param reference  The `reference` function from `astro:content`
 */
export function makeBlogSchema(
  z: any,
  reference: (collection: string) => any,
) {
  return z.object({
    title: z.string(),
    seoTitle: z.string().optional(),
    description: z.string(),
    pubDate: z.union([z.string(), z.date()]).optional(),
    lastModified: z.union([z.string(), z.date()]).optional(),
    category: z.enum(BLOG_CATEGORIES),
    tags: z.array(z.enum(BLOG_TAGS)).default([]),
    author: reference('authors').optional(),
    coAuthors: z.array(reference('authors')).default([]),
    coverImage: z.string().optional(),
    coverImageAlt: z.string().optional(),
    canonical: z.string().optional(),
    featured: z.boolean().default(false),
    isDraft: z.boolean().default(false),
    noindex: z.boolean().default(false),
    hasMath: z.boolean().default(false),
    toc: z.boolean().optional(),
    order: z.number().optional(),
  });
}
