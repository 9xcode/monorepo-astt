// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import { siteConfig } from './src/config.ts';
import { sitemapConfig } from './src/config/sitemap.ts';

import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import { ogCache } from './integrations/og-cache/index.ts';
import { toolsTemplate } from './src/og/templates/tools.ts';
import { blogTemplate } from './src/og/templates/blog.ts';
import { corePages } from './core/integrations/core-pages.ts';

// Freeze the build time ONCE at the very start of the Astro build process.
// This env var is inherited by all Astro worker processes, so every page’s
// siteConfig.buildTime evaluates to this exact same frozen millisecond.
process.env.BUILD_TIME = new Date().toISOString().split('.')[0] + '+00:00';
// Export to client for hydration
process.env.PUBLIC_BUILD_TIME = process.env.BUILD_TIME;

// https://astro.build/config
export default defineConfig({
  site: siteConfig.url, // Required for sitemap and canonical URLs
  compressHTML: true, // Explicitly enable HTML minification
  trailingSlash: 'never', // Keep URLs as /tools/budget-planner (not /tools/budget-planner/)
  
  prefetch: {
    prefetchAll: false,        // Only prefetch links with data-astro-prefetch attribute or viewport-intersecting ones ("false" Prevents spamming downloads on pages with lots of links)
    defaultStrategy: 'viewport', // Preloads pages as links enter viewport — faster perceived nav, zero PageSpeed cost
  },

  // Math Formula Support
  markdown: {
    remarkPlugins: [[remarkMath, { 
      singleDollarTextMath: false  // Disable single $ parsing so currency (e.g., $100) doesn't break.
    }]],
    rehypePlugins: [[rehypeKatex, { 
      strict: false,               // allows \(...\) inline notation
      throwOnError: false,         // shows error in page instead of crashing build
      errorColor: '#cc0000',       // visible red for any formula errors during dev
      output: 'htmlAndMathml',     // best accessibility, works in all browsers
    }]],
  },

  build: {
    format: 'directory', // Generates /tools/budget-planner/index.html — no .html in URLs
    inlineStylesheets: 'auto', 
  },
  integrations: [
    // Phase 6: core-pages wires the config-injector middleware (Astro.locals.siteConfig)
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
        { name: 'blog', template: blogTemplate }
      ]
    }),
    svelte(),
    sitemap(sitemapConfig),

  ],
  redirects: {
    // '/tools': '/categories',
    '/category': '/categories'
  },

  vite: {
    plugins: [
      tailwindcss(),
      // Phase 6: virtual:site-config — makes siteConfig available to all components
      // without prop drilling. Consumed by middleware/config-injector.ts and any
      // component that imports from 'virtual:site-config' directly.
      {
        name: 'mtools-site-config',
        resolveId(id) {
          if (id === 'virtual:site-config') return '\0virtual:site-config';
        },
        load(id) {
          if (id === '\0virtual:site-config') {
            return `export const siteConfig = ${JSON.stringify(siteConfig)};`;
          }
        },
      },
    ],
    // Astro 6 uses Vite 7's Environment API. During the prerender phase, Node.js
    // tries to load @lucide/svelte, bits-ui, svelte-toolbelt, and runed directly
    // — but these contain raw .svelte / .svelte.js files that Node can't parse.
    // resolve.noExternal tells the Astro environment plugin to bundle them via Vite
    // instead of deferring to Node's native ESM loader.
    resolve: {
      alias: {
        // Phase 4 bridge: @mtools/core resolves to ./core until pnpm workspace links it
        '@mtools/core': fileURLToPath(new URL('./core', import.meta.url)),
        // Phase 4: $lib now points to core/src/lib (moved from src/lib)
        '$lib': fileURLToPath(new URL('./core/src/lib', import.meta.url)),
        '@active-theme': new URL(`./src/styles/themes/${siteConfig.ui.theme.name}.css`, import.meta.url).pathname
      },
      noExternal: ['@lucide/svelte', 'bits-ui', 'svelte-toolbelt', 'runed', '@mtools/core']
    },
    build: {
      minify: 'esbuild', // Explicitly enable JS minification using esbuild
      // cssMinify: 'esbuild', // Explicitly enable CSS minification
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Svelte 5 runtime — shared by every tool widget.
            // Without this, each tool page bundles its own copy (~18KB gzipped).
            // With this, it's downloaded once and cached across all tool pages.
            if (id.includes('node_modules/svelte')) return 'svelte-runtime';

            // bits-ui / melt-ui (shadcn-svelte deps) — shared UI primitives
            if (id.includes('node_modules/bits-ui') || id.includes('node_modules/@melt-ui')) return 'vendor-ui';
          }
        }
      }
    }
  }
});
