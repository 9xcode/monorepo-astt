import type { z as ZodNS } from 'astro/zod';

/**
 * Tool content schema factory.
 *
 * Why a factory? Two Astro-specific things can't live in a standalone package:
 *   1. `reference('authors')` — from `astro:content`
 *   2. `z`  — must be Astro's own Zod instance (avoids Zod version mismatches)
 *
 * Why do categories and tags come in as parameters?
 *   These are site-specific values — different sites have different tool
 *   categories. Hardcoding them in core would couple core to one site's data.
 *   Passing them in keeps core schema-shape-only; enum data lives in each
 *   site's content.config.ts where it belongs.
 *
 * Usage in sites/<site>/src/content.config.ts:
 *
 *   import { z, reference } from 'astro:content';
 *   import { makeToolSchema } from '../../../core/src/content-schemas/tools.ts';
 *
 *   const TOOL_CATEGORIES = ['Finance/Tax', 'Calculators'] as const;
 *   const TOOL_TAGS = ['investment', 'savings'] as const;
 *
 *   const toolsCollection = defineCollection({
 *     loader: glob({ pattern: '**\/*.md', base: './src/content/tools' }),
 *     schema: makeToolSchema(z, reference, TOOL_CATEGORIES, TOOL_TAGS),
 *   });
 */

type Z = typeof ZodNS;
type ReferenceFn = (collection: string) => ZodNS.ZodTypeAny;

/**
 * Creates the Zod schema for the tools collection.
 *
 * @param z           Astro's re-exported Zod instance (from `astro:content`)
 * @param reference   The `reference` function from `astro:content`
 * @param categories  Site-specific category enum values (non-empty readonly array)
 * @param tags        Site-specific tag enum values (non-empty readonly array)
 */
export function makeToolSchema(
  z: Z,
  reference: ReferenceFn,
  categories: readonly [string, ...string[]],
  tags: readonly [string, ...string[]],
) {
  return z.object({
    title: z.string(),
    seoTitle: z.string().optional(),
    description: z.string(),
    shortDescription: z.string().optional(),
    category: z.enum(categories as [string, ...string[]]),
    tags: z.array(z.enum(tags as [string, ...string[]])).optional(),
    author: reference('authors').optional(),
    coAuthors: z.array(reference('authors')).default([]),
    icon: z.string().optional(),
    publishedAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional(),
    isDraft: z.boolean().default(false),
    canonical: z.string().optional(),
    widgetSlug: z.string().optional(),
    fullWidth: z.boolean().default(false),
    hasMath: z.boolean().default(false),
    toc: z.boolean().optional(),
    order: z.number().optional(),
    featured: z.boolean().optional(),
    loadPriority: z.enum(['load', 'idle', 'visible', 'only']).default('load'),
  });
}
