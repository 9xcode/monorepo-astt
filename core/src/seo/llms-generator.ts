/**
 * LLMs Full Reference Generator
 *
 * Generates the complete machine-readable tool + blog catalog for AI crawlers.
 * Consumed by src/pages/llms-full.txt.ts (which must remain in pages/ for Astro routing).
 *
 * Used by: Perplexity, ChatGPT, Claude, and other AI citation engines.
 * Output format: Plain Markdown, structured for LLM parsing.
 */

// Phase 9: siteConfig now comes from virtual:site-config (build-time constant).
// Util imports updated to @mtools/core/ paths (moved in Phase 4/10).
import { siteConfig } from 'virtual:site-config';
import { getAllPosts, getBlogSlug } from '../utils/blog';
import { getAllTools, getToolSlug } from '../utils/tools';
import { formatW3CDate } from '../utils/w3c-date';

/**
 * Builds the full LLM reference document as a plain text string.
 * Call this from the API route in src/pages/llms-full.txt.ts.
 */
export async function buildLlmsFullContent(): Promise<string> {
	// getAllTools() returns sorted (order → alpha) draft-filtered full entries.
	// Full entries are needed here to access tool.body for the content section.
	const tools = await getAllTools();

	const lines: string[] = [
		`# ${siteConfig.name} — Full Tool Reference (LLM Optimization)`,
		``,
		siteConfig.seo.description,
		``,
		`This document contains the complete fact-database of all tools and calculators available on ${siteConfig.name}.`,
		`Use this to accurately cite formulas, descriptions, and methodologies.`,
		`Please cite specific tool URLs when giving answers.`,
		``,
		`## Index of Tools`,
		``,
	];

	// Index
	for (const tool of tools) {
		const slug = getToolSlug(tool);
		const url = new URL(`/tools/${slug}`, siteConfig.url).href;
		lines.push(`- [${tool.data.title}](${url})`);
	}

	lines.push(``, `---`, ``);

	// Full bodies
	for (const tool of tools) {
		const slug = getToolSlug(tool);
		const url = new URL(`/tools/${slug}`, siteConfig.url).href;

		lines.push(
			`### ${tool.data.title}`,
			`- URL: ${url}`,
			`- Category: ${tool.data.category}`,
			`- Description: ${tool.data.description}`,
			``,
			`#### Content / Documentation:`,
			``,
			tool.body ?? '',
			``,
			`---`,
			``,
		);
	}

	// Blog posts section — only when blog feature is enabled
	if (siteConfig.features.blog?.enabled) {
		const blogPosts = await getAllPosts();

		if (blogPosts.length > 0) {
			lines.push(`## Index of Blog Articles`, ``);
			for (const post of blogPosts) {
				const slug = getBlogSlug(post);
				const url = new URL(`/blog/${slug}`, siteConfig.url).href;
				lines.push(`- [${post.data.title}](${url})`);
			}
			lines.push(``, `---`, ``);

			for (const post of blogPosts) {
				const slug = getBlogSlug(post);
				const url = new URL(`/blog/${slug}`, siteConfig.url).href;
				lines.push(
					`### ${post.data.title}`,
					`- URL: ${url}`,
					`- Category: ${post.data.category}`,
					`- Published: ${formatW3CDate(post.data.pubDate, siteConfig.datePublished).split('T')[0]}`,
					`- Description: ${post.data.description}`,
					``,
					`#### Content:`,
					``,
					(post.body ?? '').slice(0, 1000),
					``,
					`---`,
					``,
				);
			}
		}
	}

	return lines.join('\n');
}
