import { defineMiddleware } from 'astro:middleware';
import { siteConfig } from 'virtual:site-config';

/**
 * config-injector — Injects siteConfig into every request's Astro.locals.
 *
 * This is the mechanism that replaces prop-drilling of siteConfig through
 * the component tree. After this middleware runs, every .astro component
 * in the request lifecycle can access:
 *
 *   const { siteConfig } = Astro.locals;
 *
 * The `siteConfig` read from `virtual:site-config` is a build-time constant —
 * it was serialized by the Vite plugin inside createAstroConfig() and is
 * identical across every worker process in the same build.
 *
 * Order: 'pre' — runs before any page or layout, so locals are always populated.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.siteConfig = siteConfig;
  return next();
});
