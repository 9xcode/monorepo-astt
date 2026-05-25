// ────────────────────────────────────────────────────────────────────────────
// Site Configuration Template
//
// Replace all PLACEHOLDER_ values before launching a new site.
// See docs/project/creating-new-site.md for the full setup guide.
// ────────────────────────────────────────────────────────────────────────────

// Re-export all types so site-level code imports from './config' as normal.
import type {
  SiteConfig,
  NavItem,
  SeoConfig,
  NavigationConfig,
  SidebarConfig,
  FloatingActionsConfig,
  ThemeConfig,
  UiConfig,
  AdsConfig,
  SupportConfig,
  TocConfig,
  BlogConfig,
  SearchConfig,
  FeaturesConfig,
} from '@mtools/core/config/types';

export type {
  SiteConfig,
  NavItem,
  SeoConfig,
  NavigationConfig,
  SidebarConfig,
  FloatingActionsConfig,
  ThemeConfig,
  UiConfig,
  AdsConfig,
  SupportConfig,
  TocConfig,
  BlogConfig,
  SearchConfig,
  FeaturesConfig,
};

export const siteConfig: SiteConfig = {

  // ─── Core Identity ──────────────────────────────────────────────────────
  name: "PLACEHOLDER_SITE_NAME",          // e.g. "PDF Tools"
  domain: "PLACEHOLDER_DOMAIN",           // e.g. "pdftools.app"
  url: "https://PLACEHOLDER_DOMAIN",      // e.g. "https://pdftools.app"
  version: "1.0.0",
  localStoragePrefix: "PLACEHOLDER_PREFIX_", // e.g. "pdf_" — keep short, must be unique per site

  // ─── Brand & Voice ─────────────────────────────────────────────────────
  brand: {
    shortName: "PLACEHOLDER_SITE_NAME",
    tagline: "PLACEHOLDER_TAGLINE",       // e.g. "The fastest PDF tools on the web."
  },

  // ─── Localization ───────────────────────────────────────────────────────
  localization: {
    currencySymbol: "$",
    currencyCode: "USD",
  },

  // ─── Legal ──────────────────────────────────────────────────────────────
  companyName: "PLACEHOLDER_COMPANY",

  // ─── Contact ────────────────────────────────────────────────────────────
  contact: {
    email: "support@PLACEHOLDER_DOMAIN",
    location: "PLACEHOLDER_LOCATION",
  },

  // ─── API Keys ───────────────────────────────────────────────────────────
  apiKeys: {
    web3Forms: import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY,
    web3FormsEndpoint: "https://api.web3forms.com/submit",
  },

  // ─── SEO ────────────────────────────────────────────────────────────────
  seo: {
    description: "PLACEHOLDER_SITE_DESCRIPTION",
    language: "en",
    defaultKeywords: ["tools", "free tools", "PLACEHOLDER_NICHE"],

    defaultAuthorSlug: "PLACEHOLDER_AUTHOR_SLUG", // Must match src/content/authors/<slug>.md
    twitterHandle: "@PLACEHOLDER_TWITTER",

    softwareApplication: {
      operatingSystem: "Windows, macOS, Linux, iOS, Android",
      isAccessibleForFree: true,
      browserRequirements: "Requires JavaScript",
    },

    organization: {
      knowsAbout: ["PLACEHOLDER_TOPIC_1", "PLACEHOLDER_TOPIC_2"],
    },

    // Add your tool categories here — must match the category field in tool frontmatter.
    categoryMappings: {
      "General": { appCategory: "UtilitiesApplication" },
    },

    titleSeparator: "-",
    titleDescriptors: {
      "_default": "Free Online Tool",
    },
  },

  // ─── UI / Layout ────────────────────────────────────────────────────────
  ui: {
    navigation: {
      header: [
        { label: "Home",    href: "/" },
        { label: "Tools",   href: "/tools" },
        { label: "Blog",    href: "/blog" },
        { label: "Contact", href: "/contact" },
      ],
      footer: [
        { label: "About Us",   href: "/about" },
        { label: "Privacy",    href: "/privacy" },
        { label: "Terms",      href: "/terms" },
        { label: "Disclaimer", href: "/disclaimer" },
        { label: "Contact",    href: "/contact" },
      ],
      mobile: [
        { label: "Home",  href: "/" },
        { label: "Tools", href: "/tools" },
        { label: "Blog",  href: "/blog" },
      ],
    },

    sidebar: {
      showAllToolsList: true,
      showMobileAppCard: false,
      showSupportCard: false,
    },

    floatingActions: {
      enabled: true,
      showSearch: true,
      showBackToTop: true,
      showShare: true,
      showToc: true,
    },

    theme: {
      defaultMode: "system",
      name: "slate",  // Must match a file in core/src/styles/themes/<name>.css
    },
  },

  // ─── Features ─────────────────────────────────────────────────────────
  features: {
    search: {
      enabled: true,
      defaultTab: 'tools',
      showTabs: { all: true, tools: true, blog: true },
    },

    homepage: {
      toolWidgetSection: {
        enabled: false,
        toolSlug: "",
      },
      featuredSection: {
        enabled: true,
        maxTools: 3,
      },
      toolsDiscovery: {
        initialDisplayCount: 20,
      },
    },

    toolPage: {
      toc: {
        enabled: true,
        title: "On this page",
        minHeadings: 3,
        maxDepth: 3,
      },
    },

    favouriteTools: {
      enabled: true,
      storageKey: "favourites",
      showInMobileMenu: true,
      maxDisplayHomepage: 6,
      maxDisplayMobileMenu: 6,
    },

    recentTools: {
      enabled: true,
      maxItems: 6,
      storageKey: "recents",
      showInMobileMenu: true,
      maxDisplayHomepage: 0,
      maxDisplayMobileMenu: 6,
    },

    toolActionTray: {
      enabled: true,
      showFavourite: true,
      showShare: true,
      showSupport: false,
      showFeedback: true,
      showGetApp: false,
      getAppHref: "/mobile-app",
    },

    ads: {
      enabled: false,
      autoAds: false,
      publisherId: "ca-pub-XXXXXXXXXXXXXXXX",
      slots: {
        "home-hero-bottom": false,
        "home-grid-multiplex": false,
        "home-bottom": false,
        "tool-header-top": false,
        "tool-content-top": false,
        "tool-content-middle": false,
        "tool-content-bottom": false,
        "tool-sidebar-top": false,
        "tool-sidebar-bottom": false,
      },
    },

    support: {
      url: "",        // Set to "/support" to enable; "" hides all support CTAs
      label: "Support Us",
    },

    blog: {
      enabled: true,
      postsPerPage: 12,
    },
  },
};
