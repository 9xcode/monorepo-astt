/**
 * @mtools/core — Content Schemas barrel
 *
 * Re-exports all schema factories and associated constants/types.
 * Import from this barrel for convenience, or import directly from
 * the specific schema file for tree-shaking.
 */

export {
  makeToolSchema,
  TOOL_TAGS,
  TOOL_CATEGORIES,
  type ToolTag,
  type ToolCategory,
} from './tools.ts';

export {
  makeBlogSchema,
  BLOG_CATEGORIES,
  BLOG_TAGS,
  type BlogCategory,
  type BlogTag,
} from './blog.ts';

export {
  makeAuthorsSchema,
} from './authors.ts';
