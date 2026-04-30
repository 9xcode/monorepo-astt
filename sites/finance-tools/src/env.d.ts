/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { SiteConfig } from '@mtools/core/config/types';

declare namespace App {
  interface Locals {
    /** Injected by core-pages middleware (config-injector.ts) */
    siteConfig: SiteConfig;
  }
}
