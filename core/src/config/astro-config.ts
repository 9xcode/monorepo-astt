import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
type AstroUserConfig = Parameters<typeof defineConfig>[0];
import type { SiteConfig } from './types.ts';

// Direct ESM imports — Vite/Astro handles TypeScript natively.
// No require() needed; .ts extensions are resolved by Vite's transformer.
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import { makeSitemapConfig } from './sitemap.ts';
import { ogCache } from '../../integrations/og-cache/index.ts';
import { toolsTemplate } from '../og/templates/tools.ts';
import { blogTemplate } from '../og/templates/blog.ts';
import { corePages } from '../../integrations/core-pages.ts';
import { widgetMap } from '../../integrations/widget-map/index.ts';
import { contentDates } from '../../integrations/content-dates/index.ts';

/**
 * createAstroConfig — Astro config factory for @mtools sites.
 *
 * Each site's astro.config.mjs is a one-liner:
 *
 *   import { createAstroConfig } from '@mtools/core/config/astro-config';
 *   import { siteConfig } from './src/config.ts';
 *   export default createAstroConfig(siteConfig);
 *
 * What this factory provides:
 *   1. virtual:site-config Vite plugin — makes siteConfig available to ALL
 *      components (Astro + Svelte) without prop drilling
 *   2. @widget-renderer alias → site's src/generated/WidgetRenderer.astro
 *   3. $lib alias → core/src/lib (shadcn-svelte primitives, utils, icons)
 *   4. @active-theme alias → correct theme CSS file for this site
 *   5. noExternal list for Svelte SSR compatibility
 *   6. All integrations: corePages, ogCache, svelte, sitemap
 *   7. Standard build options, prefetch, markdown (KaTeX), HTML compression
 *
 * @param siteConfig  The site's fully-resolved config object
 * @param overrides   Optional partial AstroUserConfig to deep-merge (advanced use)
 */
export function createAstroConfig(
  siteConfig: SiteConfig,
  overrides: Partial<AstroUserConfig> = {}
): ReturnType<typeof defineConfig> {
  // Resolve core package root from this file's location.
  // This file: core/src/config/astro-config.ts
  // ../.. → core/src/config → core/src → core
  const coreRoot = fileURLToPath(new URL('../..', import.meta.url));

  // ── virtual:site-config Vite plugin ────────────────────────────────────────
  // Serialises siteConfig at build time into a virtual module.
  // Any file can then: import { siteConfig } from 'virtual:site-config'
  const virtualSiteConfigPlugin = {
    name: 'mtools-site-config',
    resolveId(id: string) {
      if (id === 'virtual:site-config') return '\0virtual:site-config';
    },
    load(id: string) {
      if (id === '\0virtual:site-config') {
        return `export const siteConfig = ${JSON.stringify(siteConfig)};`;
      }
    },
  };

  return defineConfig({
    site: siteConfig.url,
    compressHTML: true,
    trailingSlash: 'never',

    prefetch: {
      prefetchAll: false,
      defaultStrategy: 'viewport',
    },

    markdown: {
      remarkPlugins: [
        [remarkMath, { singleDollarTextMath: false }],
      ],
      rehypePlugins: [
        [rehypeKatex, {
          strict: false,
          throwOnError: false,
          errorColor: '#cc0000',
          output: 'htmlAndMathml',
        }],
      ],
    },

    build: {
      format: 'directory',
      inlineStylesheets: 'auto',
    },

    integrations: [
      // widgetMap MUST be first: it generates src/generated/*.astro before
      // corePages() sets the @widget-renderer alias and before Vite starts.
      widgetMap(),
      // contentDates generates src/generated/content-dates.json and sets the
      // @content-dates Vite alias — must run before corePages and Vite start.
      contentDates(),
      // corePages must be third — it registers middleware + injectRoute + @widget-renderer alias
      corePages(),
      // og image generation
      ogCache({
        templateVersion: 'v1.0.0',
        forceRegenerate: false,
        locales: [],
        defaultLocale: 'en',
        concurrency: 8,
        siteConfig,
        outputDir: './public/images/og',
        collections: [
          { name: 'tools', template: toolsTemplate },
          { name: 'blog',  template: blogTemplate  },
        ],
      }),

      svelte(),

      sitemap(makeSitemapConfig(siteConfig)),
      // Site-specific integrations passed via overrides
      ...(overrides.integrations ?? []),
    ],

    redirects: {
      // This applies to ALL sites
      '/category': '/categories',
      ...(overrides.redirects ?? {}),
    },

    vite: {
      plugins: [
        tailwindcss(),
        virtualSiteConfigPlugin,
      ],
      resolve: {
        alias: {
          // @mtools/core/* → core/src/* (Vite handles .ts transform)
          // e.g. @mtools/core/config/factory → <coreRoot>/src/config/factory.ts
          // IMPORTANT: must point to src/, not the package root, because the
          // package exports map (package.json "exports") points to .ts files and
          // Node's native ESM loader can't process those — Vite must intercept first.
          '@mtools/core': fileURLToPath(new URL('src', `file://${coreRoot}/`)),
          // $lib → core's shadcn-svelte primitives, icons, and utils
          '$lib': fileURLToPath(new URL('src/lib', `file://${coreRoot}/`)),
          // @active-theme → the site's active Tailwind theme CSS file
          '@active-theme': fileURLToPath(
            new URL(`src/styles/themes/${siteConfig.ui.theme.name}.css`, `file://${coreRoot}/`)
          ),
          // NOTE: @widget-renderer, @head-scripts, @body-scripts are set by
          // the corePages() integration, pointing to site's src/generated/ and
          // src/components/integrations/ files.
        },
        // Keep resolve.noExternal for standard package-level bundling
        noExternal: ['@lucide/svelte', 'bits-ui', 'svelte-toolbelt', 'runed', '@mtools/core'],
      },
      ssr: {
        // Packages that ship raw .svelte files internally (e.g. @lucide/svelte ships
        // dist/icons/*.svelte that import ../Icon.svelte via relative path).
        // String-based noExternal only matches top-level imports; this regex also
        // catches internal relative imports so Node's ESM loader never sees .svelte files.
        noExternal: [/@lucide\/svelte/, /bits-ui/, /svelte-toolbelt/, /runed/],
      },
      build: {
        minify: 'esbuild',
        rollupOptions: {
          output: {
            manualChunks(id: string) {
              if (id.includes('node_modules/svelte')) return 'svelte-runtime';
              if (id.includes('node_modules/bits-ui') || id.includes('node_modules/@melt-ui')) return 'vendor-ui';
            },
          },
        },
      },
      ...((overrides as any).vite ?? {}),
    },

    ...overrides,
  });
}
