import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * Note: We have extensive documentation for this configuration file.
 * See: abhii-docs/content-config-documentation.md
 * 
 * Please update the documentation if you add or modify properties here.
 */

export const TOOL_TAGS = [
	'investment', 'compound-interest', 'savings', 'retirement',
	'loan', 'mortgage', 'tax', 'currency', 'budget', 'planning',
	'text', 'conversion', 'utility',
] as const;

export type ToolTag = typeof TOOL_TAGS[number];

export const TOOL_CATEGORIES = [
	'Finance/Tax',
	'Calculators',
	'Text Tools',
	'Converters',
	'Dummy',
] as const;

export type ToolCategory = typeof TOOL_CATEGORIES[number];

const toolsCollection = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/tools" }),
	schema: z.object({
		title: z.string(),
		seoTitle: z.string().optional(),
		description: z.string(),
		shortDescription: z.string().optional(),
		category: z.enum(TOOL_CATEGORIES),
		tags: z.array(z.enum(TOOL_TAGS)).optional(),
		author: reference('authors').optional(),
		coAuthors: z.array(reference('authors')).default([]),
		icon: z.string().optional(),
		pubDate: z.union([z.string(), z.date()]).optional(),
		lastModified: z.union([z.string(), z.date()]).optional(),
		isDraft: z.boolean().default(false),
		canonical: z.string().optional(),
		widgetSlug: z.string().optional(),
		fullWidth: z.boolean().default(false),
		hasMath: z.boolean().default(false),
		toc: z.boolean().optional(),
		order: z.number().optional(),
		featured: z.boolean().optional(),
		loadPriority: z.enum(['load', 'idle', 'visible', 'only']).default('load'),
	}),
});


// Blog section
export const BLOG_CATEGORIES = [
	'Guides',
	'Tutorials',
	'Tips',
	'News',
	'Case Studies',
	'Product Updates',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

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

export type BlogTag = (typeof BLOG_TAGS)[number];

const blogCollection = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
	schema: z.object({
		title: z.string(),
		seoTitle: z.string().optional(),
		description: z.string(),
		pubDate: z.union([z.string(), z.date()]).optional(),
		lastModified: z.union([z.string(), z.date()]).optional(),
		category: z.enum(BLOG_CATEGORIES),
		tags: z.array(z.enum(BLOG_TAGS)).default([]),
		author: reference('authors').optional(),
		coAuthors: z.array(reference('authors')).default([]),
		coverImage: z.string().optional(),
		coverImageAlt: z.string().optional(),
		canonical: z.string().optional(),
		featured: z.boolean().default(false),
		isDraft: z.boolean().default(false),
		noindex: z.boolean().default(false),
		hasMath: z.boolean().default(false),
		toc: z.boolean().optional(),
		order: z.number().optional(),
	}),
});

// Authors collection
// Uses the factory form schema: ({ image }) => ... to access Astro's image() validator.
// The image() helper validates the path resolves to a real file in src/ and enables
// Astro's <Image> component to optimise it (resize, WebP, content-hash) at build time.
// This is different from tools/blog which use schema: z.object(...) directly — the
// factory form is required whenever any field uses the image() validator.
const authorsCollection = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/authors' }),
	schema: ({ image }) => z.object({
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
	}),
});

export const collections = {
	'tools': toolsCollection,
	'blog': blogCollection,
	'authors': authorsCollection,
};
