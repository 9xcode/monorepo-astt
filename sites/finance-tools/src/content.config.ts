import { defineCollection, reference } from 'astro:content';
import { z } from 'astro:schema';
import { glob } from 'astro/loaders';

// Use relative paths — content.config.ts is processed by Astro's content layer
// before Vite aliases (@mtools/core) are registered, so alias imports fail here.
// z and reference are passed as params to avoid a Zod v3/v4 version mismatch:
// Astro v6 uses Zod v4; passing z from astro:content ensures one Zod instance.
import {
  makeToolSchema,
  makeBlogSchema,
  makeAuthorsSchema,
} from '../../../core/src/content-schemas/index.ts';

// Re-export all constants and types so site-level code that imports from
// './content.config.ts' (e.g. BLOG_CATEGORIES, TOOL_TAGS) continues to work.
export {
  TOOL_TAGS,
  TOOL_CATEGORIES,
  type ToolTag,
  type ToolCategory,
  BLOG_CATEGORIES,
  BLOG_TAGS,
  type BlogCategory,
  type BlogTag,
} from '../../../core/src/content-schemas/index.ts';

// ── Collections ──────────────────────────────────────────────────────────────

const toolsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tools' }),
  schema: makeToolSchema(z, reference),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: makeBlogSchema(z, reference),
});

// Authors uses the factory form because image() is only available inside
// the schema factory callback context (Astro requirement).
const authorsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/authors' }),
  schema: ({ image }) => makeAuthorsSchema(z, image),
});

export const collections = {
  tools: toolsCollection,
  blog: blogCollection,
  authors: authorsCollection,
};
