/**
 * Tool content schema factory.
 *
 * Why a factory? Two Astro-specific things can't live in a standalone package:
 *   1. `reference('authors')` — from `astro:content`
 *   2. `z`  — must be Astro's own Zod v4 instance (not core's bundled Zod v3)
 *
 * Both are accepted as parameters so this file stays importable from core
 * without pulling in astro:content or causing a Zod version mismatch.
 *
 * Usage in sites/<site>/src/content.config.ts:
 *
 *   import { z } from 'astro:content';
 *   import { reference } from 'astro:content';
 *   import { makeToolSchema } from '../../../core/src/content-schemas/tools.ts';
 *
 *   const toolsCollection = defineCollection({
 *     loader: glob({ pattern: '**\/*.md', base: './src/content/tools' }),
 *     schema: makeToolSchema(z, reference),
 *   });
 */

export const TOOL_TAGS = [
  'investment', 'compound-interest', 'savings', 'retirement',
  'loan', 'mortgage', 'tax', 'currency', 'budget', 'planning',
  'text', 'conversion', 'utility',
] as const;

export type ToolTag = typeof TOOL_TAGS[number];

export const TOOL_CATEGORIES = [
  'Finance/Tax',
  'Calculators',
  'Text Tools',
  'Converters',
  'Dummy',
] as const;

export type ToolCategory = typeof TOOL_CATEGORIES[number];

/**
 * Creates the Zod schema for the tools collection.
 *
 * @param z          Astro's re-exported Zod instance (from `astro:content`)
 * @param reference  The `reference` function from `astro:content`
 */
export function makeToolSchema(
  z: any,
  reference: (collection: string) => any,
) {
  return z.object({
    title: z.string(),
    seoTitle: z.string().optional(),
    description: z.string(),
    shortDescription: z.string().optional(),
    category: z.enum(TOOL_CATEGORIES),
    tags: z.array(z.enum(TOOL_TAGS)).optional(),
    author: reference('authors').optional(),
    coAuthors: z.array(reference('authors')).default([]),
    icon: z.string().optional(),
    pubDate: z.union([z.string(), z.date()]).optional(),
    lastModified: z.union([z.string(), z.date()]).optional(),
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
