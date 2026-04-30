import { z } from 'zod';

/**
 * Blog content schema factory.
 *
 * Accepts `reference` as a parameter (from `astro:content`) to avoid
 * importing that Astro-specific module from within the core package.
 *
 * Usage in sites/finance-tools/src/content.config.ts:
 *
 *   import { reference } from 'astro:content';
 *   import { makeBlogSchema, BLOG_CATEGORIES, BLOG_TAGS } from '@mtools/core/content-schemas/blog';
 *
 *   const blogCollection = defineCollection({
 *     loader: glob({ pattern: '**\/*.md', base: './src/content/blog' }),
 *     schema: makeBlogSchema(reference),
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
 * @param reference  The `reference` function from `astro:content`.
 *                   Pass it directly: `makeBlogSchema(reference)`
 * @returns A Zod object schema suitable for use in defineCollection({ schema: ... })
 */
export function makeBlogSchema(reference: (collection: string) => z.ZodTypeAny) {
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
