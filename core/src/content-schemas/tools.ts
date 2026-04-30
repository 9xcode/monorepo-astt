import { z } from 'zod';

/**
 * Tool content schema factory.
 *
 * Why a factory? Because `reference('authors')` comes from `astro:content` —
 * a module that only exists inside an Astro project, not in a standalone package.
 * By accepting `reference` as a parameter, this schema can live in @mtools/core
 * without an `astro:content` import, while the CALLING site's content.config.ts
 * passes in its own `reference` function.
 *
 * Usage in sites/finance-tools/src/content.config.ts:
 *
 *   import { reference } from 'astro:content';
 *   import { makeToolSchema, TOOL_CATEGORIES, TOOL_TAGS } from '@mtools/core/content-schemas/tools';
 *
 *   const toolsCollection = defineCollection({
 *     loader: glob({ pattern: '**\/*.md', base: './src/content/tools' }),
 *     schema: makeToolSchema(reference),
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
 * @param reference  The `reference` function from `astro:content`.
 *                   Pass it directly: `makeToolSchema(reference)`
 * @returns A Zod object schema suitable for use in defineCollection({ schema: ... })
 */
export function makeToolSchema(reference: (collection: string) => z.ZodTypeAny) {
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
