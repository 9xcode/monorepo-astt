import type { APIRoute } from 'astro';
import { siteConfig } from '../../config';
// Phase 10: both type and utility now come from core
import type { SearchItem } from '@mtools/core/utils/search';
import { getAllPostSummaries } from '@mtools/core/utils/blog';


export const GET: APIRoute = async () => {
  if (!siteConfig.features.search.enabled || !siteConfig.features.search.showTabs.blog || !siteConfig.features.blog.enabled) {
    return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
  }

  // getAllPostSummaries() returns draft-filtered, newest-first lightweight post data.
  const posts = await getAllPostSummaries();

  const blogItems: SearchItem[] = posts.map(p => ({
    type: 'blog' as const,
    slug: p.slug,
    href: `/blog/${p.slug}`,
    data: {
      title:       p.data.title,
      description: p.data.description,
      icon:        undefined,
      category:    p.data.category,
      tags:        p.data.tags,
    },
  }));

  return new Response(JSON.stringify(blogItems), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
