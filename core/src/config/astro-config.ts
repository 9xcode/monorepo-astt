import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import type { AstroUserConfig } from 'astro/config';
import type { SiteConfig } from './types.ts';

const require = createRequire(import.meta.url);

/**
 * createAstroConfig — Astro config factory for @mtools sites.
 *
 * Encapsulates all shared Astro/Vite configuration so each site's
 * astro.config.mjs is a thin one-liner:
 *
 *   import { createAstroConfig } from '@mtools/core/config/astro-config';
 *   import { siteConfig } from './src/config.ts';
 *   export default createAstroConfig(siteConfig);
 *
 * What this factory provides:
 *   1. virtual:site-config Vite plugin — makes siteConfig available to ALL
 *      components (Astro + Svelte) without prop drilling
 *   2. $lib alias → core/src/lib (shadcn-svelte primitives, utils, icons)
 *   3. @active-theme alias → correct theme CSS file for this site
 *   4. @mtools/core alias → resolves the package itself (workspace link)
 *   5. noExternal list for Svelte SSR compatibility
 *   6. All standard integrations: svelte, tailwind, sitemap, ogCache, corePages
 *   7. Standard build options, prefetch, markdown (KaTeX), HTML compression
 *
 * @param siteConfig  The site's fully-resolved config object
 * @param overrides   Optional partial AstroUserConfig to deep-merge (advanced use)
 */
export function createAstroConfig(
  siteConfig: SiteConfig,
  overrides: Partial<AstroUserConfig> = {}
): ReturnType<typeof defineConfig> {
  // Resolve core package root — used to build alias paths.
  // import.meta.url is the URL of THIS file (core/src/config/astro-config.ts).
  // Three levels up: config/ → src/ → core/ → (core root)
  const coreRoot = fileURLToPath(new URL('../../..', import.meta.url));

  // ── Virtual module Vite plugin ──────────────────────────────────────────────
  // Registers `virtual:site-config` so any file can do:
  //   import { siteConfig } from 'virtual:site-config'
  // The config is serialized at build time — no runtime overhead.
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

  // ── Build time freeze ───────────────────────────────────────────────────────
  // Freeze the build time ONCE at the very start of the Astro build process.
  // This env var is inherited by all Astro worker processes, so every page's
  // siteConfig.buildTime evaluates to this exact same frozen millisecond.
  if (!process.env['BUILD_TIME']) {
    process.env['BUILD_TIME'] = new Date().toISOString().split('.')[0] + '+00:00';
    process.env['PUBLIC_BUILD_TIME'] = process.env['BUILD_TIME'];
  }

  // ── Lazy-load integrations ──────────────────────────────────────────────────
  // Imported lazily so this file can be safely imported in non-Astro contexts
  // (e.g. plain Node scripts) without triggering side-effects.
  // All imports are synchronous require() calls — safe at config evaluation time.

  // svelte
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const svelte = require('@astrojs/svelte').default;

  // sitemap
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sitemap = require('@astrojs/sitemap').default;
  const { sitemapConfig } = require('../config/sitemap.js');

  // og-cache integration (from core/integrations/og-cache/)
  const { ogCache } = require('../../integrations/og-cache/index.js');
  const { toolsTemplate } = require('../og/templates/tools.js');
  const { blogTemplate } = require('../og/templates/blog.js');

  // core-pages integration (wires middleware + injected routes)
  const { corePages } = require('../../integrations/core-pages.js');

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
        // @ts-expect-error — remark-math has no types bundled, safe at runtime
        [require('remark-math'), { singleDollarTextMath: false }],
      ],
      rehypePlugins: [
        // @ts-expect-error — rehype-katex has no types bundled, safe at runtime
        [require('rehype-katex'), {
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
      // Phase 13: all integrations wired into the factory.
      // core-pages must come first — it registers the middleware.
      corePages(),
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
      sitemap(sitemapConfig),
      // Site-specific integrations passed via overrides
      ...(overrides.integrations ?? []),
    ],

    redirects: {
      '/category': '/categories',
      ...(overrides.redirects ?? {}),
    },

    vite: {
      plugins: [
        // @ts-expect-error — @tailwindcss/vite is not typed as a Vite plugin
        require('@tailwindcss/vite')(),
        virtualSiteConfigPlugin,
      ],
      resolve: {
        alias: {
          // @mtools/core resolves to the package itself (workspace symlink or alias)
          '@mtools/core': coreRoot,
          // $lib → core's shadcn-svelte primitives, icons, and utils
          '$lib': fileURLToPath(new URL('src/lib', `file://${coreRoot}/`)),
          // @active-theme → the site's active Tailwind theme CSS
          '@active-theme': fileURLToPath(
            new URL(`src/styles/themes/${siteConfig.ui.theme.name}.css`, `file://${coreRoot}/`)
          ),
        },
        noExternal: ['@lucide/svelte', 'bits-ui', 'svelte-toolbelt', 'runed', '@mtools/core'],
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
