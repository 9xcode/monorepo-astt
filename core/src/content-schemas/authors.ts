/**
 * Authors content schema factory.
 *
 * Accepts `z` and `image` as parameters to avoid:
 *   1. Importing `astro:content` (not available in a standalone package)
 *   2. Zod version mismatch — Astro v6 uses Zod v4; passing z from the
 *      caller ensures only one Zod instance is used for validation.
 *   3. `image()` is only available inside Astro's defineCollection schema
 *      factory callback — it must be passed in, not imported.
 *
 * Usage in sites/<site>/src/content.config.ts:
 *
 *   import { z } from 'astro:content';
 *   import { makeAuthorsSchema } from '../../../core/src/content-schemas/authors.ts';
 *
 *   const authorsCollection = defineCollection({
 *     loader: glob({ pattern: '**\/*.md', base: './src/content/authors' }),
 *     schema: ({ image }) => makeAuthorsSchema(z, image),
 *   });
 */
export function makeAuthorsSchema(
  z: any,
  image: () => any,
) {
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
