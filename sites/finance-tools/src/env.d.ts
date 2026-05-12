/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module 'virtual:site-config' {
  export const siteConfig: import('@mtools/core/config/types').SiteConfig;
}
