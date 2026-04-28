import type { APIRoute } from 'astro';
import { siteConfig } from '../../config';
import { getAllToolSummaries } from '../../utils/tools';

export type SearchItem = {
  type: 'tool' | 'blog';
  slug: string;
  href: string;
  data: {
    title: string;
    description: string;
    icon?: string;
    category?: string;
    tags?: readonly string[];
  };
};

export const GET: APIRoute = async () => {
  if (!siteConfig.features.search.enabled || !siteConfig.features.search.showTabs.tools) {
    return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
  }

  const allTools = await getAllToolSummaries();

  const tools: SearchItem[] = allTools.map(t => ({
    type: 'tool' as const,
    slug: t.slug,
    href: `/tools/${t.slug}`,
    data: {
      title:       t.data.title,
      description: t.data.description,
      icon:        t.data.icon,
      category:    t.data.category,
      tags:        t.data.tags,
    },
  }));

  return new Response(JSON.stringify(tools), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
