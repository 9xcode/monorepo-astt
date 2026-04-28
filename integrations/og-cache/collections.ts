import type { OGData } from './generator.ts';

export function toolsAdapter(slug: string, frontmatter: any, locale: string | null, siteConfig: any): OGData {
  return {
    title: frontmatter.title || 'Unknown Tool',
    description: frontmatter.description || '',
    category: frontmatter.category || 'Utilities',
    collection: 'tools',
    slug,
    url: new URL(`/tools/${slug}`, siteConfig.url).href,
    locale,
    siteName: siteConfig.brand?.shortName || siteConfig.name,
    domain: siteConfig.domain,
    tagline: siteConfig.brand?.tagline || '',
  };
}

export function blogAdapter(slug: string, frontmatter: any, locale: string | null, siteConfig: any): OGData {
  return {
    title: frontmatter.title || 'Blog Post',
    description: frontmatter.description || '',
    category: frontmatter.category || 'Blog',
    collection: 'blog',
    slug,
    url: new URL(`/blog/${slug}`, siteConfig.url).href,
    locale,
    siteName: siteConfig.brand?.shortName || siteConfig.name,
    domain: siteConfig.domain,
    tagline: siteConfig.brand?.tagline || '',
  };
}
