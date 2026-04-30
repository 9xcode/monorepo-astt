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
  // Resolve core package root — used to build alias paths
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

  // ── Lazy-import integrations ────────────────────────────────────────────────
  // These are imported lazily so this file can be safely imported in non-Astro
  // contexts (e.g. plain Node scripts) without side-effects.
  // In Phase 6 the core-pages integration will be imported here too.
  // For now (Phase 5) we keep the import list identical to the current astro.config.mjs.

  // Freeze the build time ONCE at the very start of the Astro build process.
  // This env var is inherited by all Astro worker processes, so every page's
  // siteConfig.buildTime evaluates to this exact same frozen millisecond.
  if (!process.env['BUILD_TIME']) {
    process.env['BUILD_TIME'] = new Date().toISOString().split('.')[0] + '+00:00';
    process.env['PUBLIC_BUILD_TIME'] = process.env['BUILD_TIME'];
  }

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

    // Integrations are imported in the factory to avoid side-effects at module load.
    // Sites can pass additional integrations via overrides.integrations.
    // NOTE: ogCache + sitemap + core-pages will be wired here in Phase 6/12.
    // For now this factory is used as a config bridge only.
    integrations: [
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
