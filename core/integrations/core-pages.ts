import type { AstroIntegration } from 'astro';

/**
 * core-pages — Astro integration that wires @mtools/core into every site.
 *
 * Currently provides:
 *   1. Middleware injection: config-injector runs pre-request so Astro.locals.siteConfig
 *      is always populated.
 *
 * Future phases will extend this integration to also inject shared routes:
 *   Phase 7+: injectRoute() for every page in core/src/pages/
 *
 * Usage in a site's astro.config.mjs:
 *
 *   import { corePages } from '@mtools/core/integrations/core-pages';
 *
 *   export default defineConfig({
 *     integrations: [corePages(), ...otherIntegrations],
 *   });
 *
 * Note: `createAstroConfig()` already calls corePages() automatically — sites
 * using that factory do NOT need to add it manually.
 */
export function corePages(): AstroIntegration {
  return {
    name: '@mtools/core-pages',
    hooks: {
      'astro:config:setup': ({ addMiddleware, logger }) => {
        // Wire the config-injector middleware at the highest priority ('pre')
        // so siteConfig is available in Astro.locals for every page, layout,
        // and component that runs during a request.
        addMiddleware({
          entrypoint: '@mtools/core/middleware/config-injector',
          order: 'pre',
        });

        logger.debug('@mtools/core-pages: config-injector middleware registered');
      },
    },
  };
}
