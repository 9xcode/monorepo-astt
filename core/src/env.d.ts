/// <reference types="astro/client" />

// Type declaration for the virtual:site-config Vite module.
// The actual implementation is registered by the Vite plugin inside createAstroConfig().
// This declaration makes TypeScript happy in both core and every site package.
declare module 'virtual:site-config' {
  import type { SiteConfig } from './config/types.ts';
  export const siteConfig: SiteConfig;
}
