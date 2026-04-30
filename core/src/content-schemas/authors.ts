import { z } from 'zod';

/**
 * Authors content schema factory.
 *
 * The authors schema uses Astro's `image()` helper to validate avatar paths
 * and enable build-time image optimization. Because `image()` comes from
 * Astro's defineCollection schema factory context (not importable standalone),
 * we accept it as a parameter here — same pattern as makeToolSchema/makeBlogSchema.
 *
 * Usage in sites/finance-tools/src/content.config.ts:
 *
 *   import { defineCollection } from 'astro:content';
 *   import { glob } from 'astro/loaders';
 *   import { makeAuthorsSchema } from '@mtools/core/content-schemas/authors';
 *
 *   const authorsCollection = defineCollection({
 *     loader: glob({ pattern: '**\/*.md', base: './src/content/authors' }),
 *     schema: (ctx) => makeAuthorsSchema(ctx.image),
 *   });
 *
 * Note: Unlike tools/blog which pass `schema: makeToolSchema(reference)` directly,
 * authors must use the factory form `schema: (ctx) => makeAuthorsSchema(ctx.image)`
 * because `image()` is only available inside the factory callback context.
 */
export function makeAuthorsSchema(image: () => z.ZodTypeAny) {
  return z.object({
    name: z.string(),
    role: z.string(),
    shortBio: z.string(),
    knowsAbout: z.array(z.string()).default([]),
    avatar: image(),
    avatarAlt: z.string().optional(),
    socials: z.object({
      github: z.string().default(''),
      twitter: z.string().default(''),
      linkedin: z.string().default(''),
      facebook: z.string().default(''),
    }).default({ github: '', twitter: '', linkedin: '', facebook: '' }),
  });
}
