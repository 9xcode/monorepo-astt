import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';

// Schema factories from @mtools/core — Astro-specific helpers are passed
// as parameters to keep astro:content out of the core package.
import {
  makeToolSchema,
  makeBlogSchema,
  makeAuthorsSchema,
} from '@mtools/core/content-schemas';

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
} from '@mtools/core/content-schemas';

// ── Collections ──────────────────────────────────────────────────────────────

const toolsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tools' }),
  schema: makeToolSchema(reference),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: makeBlogSchema(reference),
});

// Authors uses the factory form because image() is only available inside
// the schema factory callback context (Astro requirement).
const authorsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/authors' }),
  schema: ({ image }) => makeAuthorsSchema(image),
});

export const collections = {
  tools: toolsCollection,
  blog: blogCollection,
  authors: authorsCollection,
};
