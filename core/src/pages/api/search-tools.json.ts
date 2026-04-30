import type { APIRoute } from 'astro';
import { siteConfig } from 'virtual:site-config';
import { getAllToolSummaries } from '@mtools/core/utils/tools';
// Phase 10: SearchItem type moved to core; re-exported here for backwards compat.
export type { SearchItem } from '@mtools/core/utils/search';

import type { SearchItem } from '@mtools/core/utils/search';

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
