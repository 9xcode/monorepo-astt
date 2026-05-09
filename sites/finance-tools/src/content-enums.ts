/**
 * Site-specific content enum data for Finance Tools.
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
  'Finance/Tax',
  'Calculators',
  'Text Tools',
  'Converters',
  'Dummy',
] as const;

export type ToolCategory = typeof TOOL_CATEGORIES[number];

export const TOOL_TAGS = [
  'investment', 'compound-interest', 'savings', 'retirement',
  'loan', 'mortgage', 'tax', 'currency', 'budget', 'planning',
  'text', 'conversion', 'utility',
] as const;

export type ToolTag = typeof TOOL_TAGS[number];

// ── Blog ──────────────────────────────────────────────────────────────────────

export const BLOG_CATEGORIES = [
  'Guides',
  'Tutorials',
  'Tips',
  'News',
  'Case Studies',
  'Product Updates',
] as const;

export type BlogCategory = typeof BLOG_CATEGORIES[number];

export const BLOG_TAGS = [
  'budgeting',
  'investing',
  'savings',
  'mortgage',
  'tax',
  'retirement',
  'credit',
  'insurance',
  'beginners',
  'advanced',
  'productivity',
] as const;

export type BlogTag = typeof BLOG_TAGS[number];
