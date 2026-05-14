import type { z as ZodNS } from 'astro/zod';

/**
 * Blog content schema factory.
 *
 * Accepts `z` and `reference` as parameters to avoid:
 *   1. Importing `astro:content` (not available in a standalone package)
 *   2. Zod version mismatch — Astro v6 uses Zod v4; passing z from the
 *      caller ensures only one Zod instance is used for validation.
 *
 * Why do categories and tags come in as parameters?
 *   These are site-specific values. A finance site has finance tags; a dev
 *   tools site has entirely different ones. Keeping them out of core means
 *   adding a new site never requires touching the shared package.
 *
 * Usage in sites/<site>/src/content.config.ts:
 *
 *   import { z, reference } from 'astro:content';
 *   import { makeBlogSchema } from '../../../core/src/content-schemas/blog.ts';
 *
 *   const BLOG_CATEGORIES = ['Guides', 'Tutorials'] as const;
 *   const BLOG_TAGS = ['budgeting', 'investing'] as const;
 *
 *   const blogCollection = defineCollection({
 *     loader: glob({ pattern: '**\/*.md', base: './src/content/blog' }),
 *     schema: makeBlogSchema(z, reference, BLOG_CATEGORIES, BLOG_TAGS),
 *   });
 */

type Z = typeof ZodNS;
type ReferenceFn = (collection: string) => ZodNS.ZodTypeAny;

/**
 * Creates the Zod schema for the blog collection.
 *
 * @param z           Astro's re-exported Zod instance (from `astro:content`)
 * @param reference   The `reference` function from `astro:content`
 * @param categories  Site-specific category enum values (non-empty readonly array)
 * @param tags        Site-specific tag enum values (non-empty readonly array)
 */
export function makeBlogSchema(
  z: Z,
  reference: ReferenceFn,
  categories: readonly [string, ...string[]],
  tags: readonly [string, ...string[]],
) {
  return z.object({
    title: z.string(),
    seoTitle: z.string().optional(),
    description: z.string(),
    pubDate: z.union([z.string(), z.date()]).optional(),
    lastModified: z.union([z.string(), z.date()]).optional(),
    category: z.enum(categories as [string, ...string[]]),
    tags: z.array(z.enum(tags as [string, ...string[]])).default([]),
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
