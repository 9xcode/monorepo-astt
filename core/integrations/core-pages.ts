import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import { getGeneratedDir } from './widget-map/index.ts';

// Resolve core package root from this file's location.
// This file: core/integrations/core-pages.ts → one level up = core/
const coreDir = fileURLToPath(new URL('..', import.meta.url));
const pagesDir = `${coreDir}/src/pages`;

/**
 * All routes provided by @mtools/core.
 *
 * Each entry maps a URL pattern to an absolute entrypoint path.
 * The patterns use Astro's [param] syntax for dynamic segments.
 * Injected routes have lower priority than any file the site adds
 * to its own src/pages/ — so sites can always override individual pages.
 */
const CORE_ROUTES = [
  // ── Static pages ──────────────────────────────────────────────────────────
  { pattern: '/',               entrypoint: `${pagesDir}/index.astro`        },
  { pattern: '/about',          entrypoint: `${pagesDir}/about.astro`         },
  { pattern: '/contact',        entrypoint: `${pagesDir}/contact.astro`       },
  { pattern: '/privacy',              entrypoint: `${pagesDir}/privacy.astro`             },
  { pattern: '/terms',                entrypoint: `${pagesDir}/terms.astro`               },
  { pattern: '/disclaimer',          entrypoint: `${pagesDir}/disclaimer.astro`           },
  { pattern: '/affiliate-disclosure', entrypoint: `${pagesDir}/affiliate-disclosure.astro` },
  { pattern: '/dmca',                entrypoint: `${pagesDir}/dmca.astro`                },
  { pattern: '/support',             entrypoint: `${pagesDir}/support.astro`             },
  { pattern: '/get-app',        entrypoint: `${pagesDir}/get-app.astro`      },
  { pattern: '/404',            entrypoint: `${pagesDir}/404.astro`           },
  { pattern: '/500',            entrypoint: `${pagesDir}/500.astro`           },
  { pattern: '/llms-full.txt',  entrypoint: `${pagesDir}/llms-full.txt.ts`   },

  // ── Tools ─────────────────────────────────────────────────────────────────
  { pattern: '/tools',          entrypoint: `${pagesDir}/tools/index.astro`   },
  { pattern: '/tools/[tool]',   entrypoint: `${pagesDir}/tools/[tool].astro`  },

  // ── Categories ────────────────────────────────────────────────────────────
  { pattern: '/categories',              entrypoint: `${pagesDir}/categories/index.astro`        },
  { pattern: '/categories/[category]',   entrypoint: `${pagesDir}/categories/[category].astro`   },

  // ── Blog ──────────────────────────────────────────────────────────────────
  { pattern: '/blog',                    entrypoint: `${pagesDir}/blog/index.astro`               },
  { pattern: '/blog/[post]',             entrypoint: `${pagesDir}/blog/[post].astro`              },
  { pattern: '/blog/page/[page]',        entrypoint: `${pagesDir}/blog/page/[page].astro`         },
  { pattern: '/blog/category/[category]',entrypoint: `${pagesDir}/blog/category/[category].astro`},
  { pattern: '/blog/tag/[tag]',          entrypoint: `${pagesDir}/blog/tag/[tag].astro`           },

  // ── Authors ───────────────────────────────────────────────────────────────
  { pattern: '/authors/[author]',        entrypoint: `${pagesDir}/authors/[author].astro`         },

  // ── API endpoints ─────────────────────────────────────────────────────────
  { pattern: '/api/search-tools.json',   entrypoint: `${pagesDir}/api/search-tools.json.ts`      },
  { pattern: '/api/search-blog.json',    entrypoint: `${pagesDir}/api/search-blog.json.ts`       },
] as const;

/**
 * core-pages — Astro integration that wires @mtools/core into every site.
 *
 * Provides:
 *   1. Vite alias: @widget-renderer → <site-root>/src/generated/WidgetRenderer.astro
 *      This makes the auto-generated widget router resolvable from core/src/pages/tools/[tool].astro
 *      regardless of where the core package is located in the monorepo.
 *
 *   2. Route injection: all shared pages from core/src/pages/ are registered as
 *      Astro routes. Site-level pages/[slug].astro always override these if the
 *      pattern matches — so individual pages can be customised per site.
 *
 *   Note: siteConfig is accessed via `import { siteConfig } from 'virtual:site-config'`
 *   everywhere — no middleware required.
 *
 * Usage (automatic via createAstroConfig — sites don't need to add this manually):
 *
 *   import { corePages } from '@mtools/core/integrations/core-pages';
 *   export default defineConfig({ integrations: [corePages()] });
 */
export function corePages(): AstroIntegration {
  return {
    name: '@mtools/core-pages',
    hooks: {
      'astro:config:setup': ({ injectRoute, updateConfig, config, logger }) => {

        // ── 1. @widget-renderer alias ────────────────────────────────────────
        // core/src/pages/tools/[tool].astro imports from '@widget-renderer'.
        // This alias points to the SITE's generated WidgetRenderer — never core's.
        // Path is derived from getGeneratedDir() — shared with widgetMap() integration
        // so both always agree on where src/generated/WidgetRenderer.astro lives.
        // config.root is the site root URL (e.g. file:///path/to/sites/finance-tools/).
        const widgetRendererPath = getGeneratedDir(config.root) + '/WidgetRenderer.astro';
        const headScriptsPath = fileURLToPath(
          new URL('src/components/integrations/HeadScripts.astro', config.root)
        );
        const bodyScriptsPath = fileURLToPath(
          new URL('src/components/integrations/BodyScripts.astro', config.root)
        );
        updateConfig({
          vite: {
            resolve: {
              alias: {
                '@widget-renderer': widgetRendererPath,
                '@head-scripts':    headScriptsPath,
                '@body-scripts':    bodyScriptsPath,
              },
            },
          },
        });
        logger.debug(`@mtools/core-pages: @widget-renderer → ${widgetRendererPath}`);
        logger.debug(`@mtools/core-pages: @head-scripts → ${headScriptsPath}`);
        logger.debug(`@mtools/core-pages: @body-scripts → ${bodyScriptsPath}`);

        // ── 2. Inject shared routes ──────────────────────────────────────────
        // Lower priority than site-level pages — sites can override any route
        // by adding their own file at the same pattern in src/pages/.
        for (const route of CORE_ROUTES) {
          injectRoute(route);
        }
        logger.debug(`@mtools/core-pages: injected ${CORE_ROUTES.length} core routes`);
      },
    },
  };
}
