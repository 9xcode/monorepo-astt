/**
 * Site-specific content enum data — REPLACE ALL VALUES before launching.
 *
 * This file is a plain TypeScript module — no Astro imports — so it can be
 * safely imported from both content.config.ts (Astro content layer) and
 * config.ts (astro.config.mjs boot chain) without triggering the
 * "Cannot find module 'astro:content'" error at config load time.
 *
 * Rule: only add primitive arrays and derived types here. No imports from
 * 'astro:content', 'astro/zod', or any Astro virtual module.
 */

// ── Tools ─────────────────────────────────────────────────────────────────────

export const TOOL_CATEGORIES = [
  'General',        // Replace with real tool categories for your site
] as const;

export type ToolCategory = typeof TOOL_CATEGORIES[number];

export const TOOL_TAGS = [
  'utility', 'text',        // Replace with real tags for your site
] as const;

export type ToolTag = typeof TOOL_TAGS[number];

// ── Blog ──────────────────────────────────────────────────────────────────────

export const BLOG_CATEGORIES = [
  'Guides',
  'Tutorials',
  'Tips',
  'News',
] as const;

export type BlogCategory = typeof BLOG_CATEGORIES[number];

export const BLOG_TAGS = [
  'beginners',
  'advanced',
  'productivity',
] as const;

export type BlogTag = typeof BLOG_TAGS[number];
