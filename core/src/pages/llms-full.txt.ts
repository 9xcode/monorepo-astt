/**
 * API Route: /llms-full.txt
 *
 * Serves the full machine-readable tool catalog for AI crawlers.
 * This file must remain in src/pages/ for Astro URL routing — all generation
 * logic lives in src/components/common/seo/llms-generator.ts.
 */
import type { APIRoute } from 'astro';
import { buildLlmsFullContent } from '../components/common/seo/llms-generator';

export const GET: APIRoute = async () => {
	const content = await buildLlmsFullContent();
	return new Response(content, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
