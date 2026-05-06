import type { SiteConfig } from './types.ts';

/**
 * Sensible defaults for all optional/overridable fields.
 * A site's createSiteConfig() call deep-merges its overrides on top of these.
 *
 * Note: Fields that MUST be unique per site (name, domain, url, datePublished,
 * localStoragePrefix, apiKeys, navigation) have no defaults here — they are
 * required in every site's config.
 */
export const configDefaults = {
  version: '1.0.0',

  brand: {
    shortName: '',
    tagline: '',
  },

  localization: {
    currencySymbol: '$',
    currencyCode: 'USD',
  },

  defaultTimezone: 'UTC',

  contact: {
    email: '',
    location: '',
  },

  seo: {
    description: '',
    defaultAuthorSlug: '',
    language: 'en',
    defaultKeywords: ['tools', 'utilities', 'free tools'],
    twitterHandle: undefined,
    softwareApplication: {
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      isAccessibleForFree: true,
      browserRequirements: 'Requires JavaScript',
    },
    organization: {
      knowsAbout: [],
    },
    categoryMappings: {},
    titleSeparator: '-',
    titleDescriptors: {
      _default: 'Free Online Tool',
    },
  },

  ui: {
    navigation: {
      header: [],
      footer: [],
      mobile: [],
    },
    sidebar: {
      showAllToolsList: true,
      showMobileAppCard: false,
      showSupportCard: true,
    },
    floatingActions: {
      enabled: true,
      showSearch: true,
      showBackToTop: true,
      showShare: true,
      showToc: true,
    },
    theme: {
      defaultMode: 'system' as const,
      name: 'slate',
    },
  },

  features: {
    search: {
      enabled: true,
      defaultTab: 'tools' as const,
      showTabs: { all: true, tools: true, blog: true },
    },
    homepage: {
      toolWidgetSection: { enabled: false, toolSlug: '' },
      featuredSection: { enabled: true, maxTools: 3 },
      toolsDiscovery: { initialDisplayCount: 20 },
    },
    toolPage: {
      toc: {
        enabled: true,
        title: 'On this page',
        minHeadings: 3,
        maxDepth: 3,
      },
    },
    favouriteTools: {
      enabled: true,
      storageKey: 'favourites',
      showInMobileMenu: true,
      maxDisplayHomepage: 6,
      maxDisplayMobileMenu: 6,
    },
    recentTools: {
      enabled: true,
      maxItems: 6,
      storageKey: 'recents',
      showInMobileMenu: true,
      maxDisplayHomepage: 0,
      maxDisplayMobileMenu: 6,
    },
    toolActionTray: {
      enabled: true,
      showFavourite: true,
      showShare: true,
      showSupport: true,
      showFeedback: true,
      showGetApp: true,
      getAppHref: '/mobile-app',
    },
    ads: {
      enabled: false,
      autoAds: false,
      publisherId: '',
      slots: {},
    },
    support: {
      url: '',
      label: 'Support Us',
    },
    blog: {
      enabled: true,
      postsPerPage: 12,
    },
  },
} satisfies Partial<SiteConfig>;
