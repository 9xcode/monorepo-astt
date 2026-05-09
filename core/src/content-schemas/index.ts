/**
 * @mtools/core — Content Schemas barrel
 *
 * Exports schema factory functions only. Enum data (tags, categories)
 * is site-specific and lives in each site's content.config.ts.
 *
 * Import from this barrel for convenience, or import directly from
 * the specific schema file for tree-shaking.
 */

export { makeToolSchema } from './tools.ts';
export { makeBlogSchema } from './blog.ts';
export { makeAuthorsSchema } from './authors.ts';
