/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Injected by core-pages middleware (config-injector.ts) */
    siteConfig: import('@mtools/core/config/types').SiteConfig;
  }
}

declare module 'virtual:site-config' {
  export const siteConfig: import('@mtools/core/config/types').SiteConfig;
}
