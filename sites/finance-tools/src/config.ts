// ────────────────────────────────────────────────────────────────────────────
// Finance-Tools Site Configuration
//
// Uses createSiteConfig() from @mtools/core/config/factory to resolve
// build-time values (buildTime, copyrightYear) automatically.
//
// All type-only exports re-exported from core — no duplicate type definitions.
// Documentation: see @mtools/core/config/types for the full SiteConfig shape.
// ────────────────────────────────────────────────────────────────────────────
// Package path — resolved by the @mtools/core alias in astro-config.ts.
import { getBuildTime, getCopyrightYear } from '@mtools/core/utils/build-time';

// Re-export all types so site-level code that imports from './config'
// (e.g. Astro pages, layouts) continues to work without changes.
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
  name: "MultiTools",
  domain: "multitools.app",
  url: "https://multitools.app",
  // url: "http://localhost:4321",
  version: "1.0.0",
  localStoragePrefix: "mt_",

  // ─── Brand & Voice ─────────────────────────────────────────────────────
  brand: {
    shortName: "MultiTools",
    tagline: "Faster than AI, Safer than Cloud.",
  },

  // ─── Localization ───────────────────────────────────────────────────────
  localization: {
    currencySymbol: "₹",
    currencyCode: "INR",
  },

  // ─── Legal ──────────────────────────────────────────────────────────────
  companyName: "MultiTools",
  // copyrightYear resolved automatically to match the frozen build environment
  copyrightYear: getCopyrightYear(),

  // ─── Temporal ───────────────────────────────────────────────────────────
  defaultTimezone: "UTC",
  datePublished: "2026-03-08T12:00:00Z",
  // buildTime resolved automatically to freeze the timestamp across the build
  buildTime: getBuildTime(),

  // ─── Contact ────────────────────────────────────────────────────────────
  contact: {
    email: "support@multitools.app",
    location: "San Francisco, CA",
  },

  // ─── API Keys ───────────────────────────────────────────────────────────
  apiKeys: {
    web3Forms: import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY,
    web3FormsEndpoint: "https://api.web3forms.com/submit",
  },

  // ─── SEO ────────────────────────────────────────────────────────────────
  seo: {
    description: "Discover a premium collection of privacy-focused, lightning-fast, free tools to edit, format, calculate, convert, and much more.",
    language: "en",
    defaultKeywords: ["tools", "calculators", "utilities", "free tools", "privacy-focused"],

    defaultAuthorSlug: "abhishek",
    twitterHandle: "@Abhishek_Patni",

    softwareApplication: {
      operatingSystem: "Windows, macOS, Linux, iOS, Android",
      isAccessibleForFree: true,
      browserRequirements: "Requires JavaScript",
    },

    organization: {
      knowsAbout: ["Data Conversion", "Software Applications", "Personal Finance", "Web Development", "Productivity Tools"],
    },

    categoryMappings: {
      "Finance/Tax": { appCategory: "FinanceApplication", additionalType: "FinancialProduct" },
      "Calculators": { appCategory: "UtilitiesApplication", additionalType: "SoftwareApplication" },
      "Text Tools":  { appCategory: "DeveloperApplication", additionalType: "SoftwareApplication" },
      "Converters":  { appCategory: "UtilitiesApplication", additionalType: "DataConverter" },
      "Dummy":       { appCategory: "UtilitiesApplication" },
    },

    titleSeparator: "-",
    titleDescriptors: {
      "Finance/Tax":  "Free Tax & Finance Calculator",
      "Calculators":  "Free Online Calculator",
      "Converters":   "Free Online Converter",
      "Text Tools":   "Free Online Text Tool",
      "_default":     "Free Online Tool",
    },
  },

  // ─── UI / Layout ────────────────────────────────────────────────────────
  ui: {
    navigation: {
      header: [
        { label: "Home",         href: "/" },
        {
          label: "Categories",   href: "/categories",
          children: [
            { label: "Calculators",   href: "/categories/calculators" },
            { label: "Converters",    href: "/categories/converters" },
            { label: "Finance / Tax", href: "/categories/finance-tax" },
            { label: "Text Tools",   href: "/categories/text-tools" },
          ],
        },
        { label: "Blog",         href: "/blog" },
        { label: "Support",      href: "/support" },
        { label: "Download App", href: "/mobile-app" },
      ],
      footer: [
        { label: "About Us",   href: "/about" },
        { label: "Privacy",    href: "/privacy" },
        { label: "Terms",      href: "/terms" },
        { label: "Disclaimer", href: "/disclaimer" },
        { label: "Contact",    href: "/contact" },
        { label: "Support",    href: "/support" },
      ],
      mobile: [
        { label: "Home",       href: "/" },
        {
          label: "Categories", href: "/categories",
          children: [
            { label: "Calculators",   href: "/categories/calculators" },
            { label: "Converters",    href: "/categories/converters" },
            { label: "Finance / Tax", href: "/categories/finance-tax" },
            { label: "Text Tools",   href: "/categories/text-tools" },
          ],
        },
        { label: "Blog",       href: "/blog" },
      ],
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
      defaultMode: "system",
      name: "slate",
    },
  },

  // ─── Features ────────────────────────────────────────────────────────────
  features: {
    search: {
      enabled: true,
      defaultTab: 'tools',
      showTabs: {
        all: true,
        tools: true,
        blog: true,
      },
    },

    homepage: {
      toolWidgetSection: {
        enabled: false,
        toolSlug: "loan-amortization-calculator",
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
      showSupport: true,
      showFeedback: true,
      showGetApp: true,
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
      url: "/support",
      label: "Support Us",
    },

    blog: {
      enabled: true,
      postsPerPage: 12,
    },
  },
};
