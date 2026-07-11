/**
 * Site-specific content enum data for Online QR Code Scanner.
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
  'QR Scanner',
  'QR Generator',
  'Barcode Tools',
  'Utilities',
] as const;

export type ToolCategory = typeof TOOL_CATEGORIES[number];

export const TOOL_TAGS = [
  'qr-scanner',
  'qr-generator',
  'barcode-scanner',
  'barcode-generator',
  'wifi-qr',
  'vcard-qr',
  'url-qr',
  'email-qr',
  'sms-qr',
  'bitcoin-qr',
  'whatsapp-qr',
  'phone-qr',
  'text-qr',
  'gps-qr',
  'location-qr',
  'scanner',
  'generator',
  'reader',
  'utility',
] as const;

export type ToolTag = typeof TOOL_TAGS[number];

// ── Blog ──────────────────────────────────────────────────────────────────────

export const BLOG_CATEGORIES = [
  'Guides',
  'Tutorials',
  'Tips',
] as const;

export type BlogCategory = typeof BLOG_CATEGORIES[number];

export const BLOG_TAGS = [
  'qr-codes',
  'barcodes',
  'scanning',
  'wifi',
] as const;

export type BlogTag = typeof BLOG_TAGS[number];
