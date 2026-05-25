import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
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

// Site-specific enum data lives in content-enums.ts — a plain TS file with no
// Astro imports. This lets config.ts (loaded by astro.config.mjs at boot) import
// the same arrays without triggering "Cannot find module 'astro:content'".
export {
  TOOL_CATEGORIES,
  TOOL_TAGS,
  BLOG_CATEGORIES,
  BLOG_TAGS,
  type ToolCategory,
  type ToolTag,
  type BlogCategory,
  type BlogTag,
} from './content-enums.ts';

import {
  TOOL_CATEGORIES,
  TOOL_TAGS,
  BLOG_CATEGORIES,
  BLOG_TAGS,
} from './content-enums.ts';

// ── Collections ──────────────────────────────────────────────────────────────

const toolsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tools' }),
  schema: makeToolSchema(z, reference, TOOL_CATEGORIES, TOOL_TAGS),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: makeBlogSchema(z, reference, BLOG_CATEGORIES, BLOG_TAGS),
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
