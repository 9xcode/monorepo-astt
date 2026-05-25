// ─────────────────────────────────────────────────────────────────────────────
// @mtools/core — Site Configuration Types
//
// These interfaces define the shape of every site's siteConfig object.
// The config object itself lives in each site's src/config.ts.
// ─────────────────────────────────────────────────────────────────────────────

/** A single navigation link entry — children are one level deep max */
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  /** Optional child links — renders as dropdown (header) or indented list (mobile) */
  children?: Omit<NavItem, 'children'>[];
}

/** All SEO-related config: meta, schemas, and author */
export interface SeoConfig {
  /** Default page description (used when a page doesn't provide its own) */
  description: string;
  /** HTML lang attribute and OG locale */
  language: string;
  /** Site-wide keyword tail appended to per-tool keywords */
  defaultKeywords: string[];
  /** Fallback author slug — used when a blog post or tool has no author set.
   *  The slug must match a file in src/content/authors/ (e.g. "abhishek" → abhishek.md).
   *  Author data (name, bio, avatar, socials) lives entirely in the Content Collection. */
  defaultAuthorSlug: string;
  /** Site-wide Twitter/X handle for twitter:site meta tag.
   *  Format: "@handle" or "handle" (the @ is added automatically if missing).
   *  Author-specific social links are stored in the Content Collection. */
  twitterHandle?: string;
  /** Schema.org SoftwareApplication fields */
  softwareApplication: {
    operatingSystem: string;
    isAccessibleForFree: boolean;
    browserRequirements: string;
  };
  /** Schema.org Organization fields */
  organization: {
    knowsAbout: string[];
  };
  /** Maps tool category slugs to appCategory / additionalType values */
  categoryMappings: Record<string, { appCategory: string; additionalType?: string }>;
  /**
   * Separator used between tool/page title and the descriptor suffix in SERP <title> tags.
   */
  titleSeparator: string;
  /**
   * Keyword-rich descriptor appended to tool page titles that have no custom seoTitle.
   * Keyed by category name (must match categoryMappings keys). Use "_default" as fallback.
   * Do NOT include the separator here — buildToolTitle() prepends it automatically.
   */
  titleDescriptors: Record<string, string>;
}

/** Header, footer, and mobile sidebar navigation */
export interface NavigationConfig {
  /** Desktop header — items with `children` render a hover dropdown */
  header: NavItem[];
  /** Footer — always flat and minimal */
  footer: NavItem[];
  /** Mobile sidebar — items with `children` render as parent link + indented children */
  mobile: NavItem[];
}

/** Sidebar layout toggles — reusable across page types */
export interface SidebarConfig {
  showAllToolsList: boolean;
  showMobileAppCard: boolean;
  showSupportCard: boolean;
}

/** Floating actions configuration */
export interface FloatingActionsConfig {
  enabled: boolean;
  showSearch: boolean;
  showBackToTop: boolean;
  showShare: boolean;
  showToc: boolean;
}

/** Theme configuration */
export interface ThemeConfig {
  /** Default color mode: 'dark' | 'light' | 'system' */
  defaultMode: 'dark' | 'light' | 'system';
  /** The active color theme stylesheet (matches filename in styles/themes/) */
  name: string;
}

/** Cross-page UI / layout primitives */
export interface UiConfig {
  navigation: NavigationConfig;
  sidebar: SidebarConfig;
  floatingActions: FloatingActionsConfig;
  theme: ThemeConfig;
}

/** Google AdSense configuration */
export interface AdsConfig {
  /** Master switch — set false to strip all ad placeholders */
  enabled: boolean;
  /** Enable AdSense Auto Ads */
  autoAds: boolean;
  publisherId: string;
  /** Per-slot overrides — false hides that individual slot */
  slots: Record<string, boolean>;
}

/** Support / monetisation CTA */
export interface SupportConfig {
  /** Set to "" to hide all support buttons site-wide */
  url: string;
  label: string;
}

/** Table-of-contents settings (tool pages) */
export interface TocConfig {
  enabled: boolean;
  title: string;
  /** Minimum number of headings before TOC is shown */
  minHeadings: number;
  maxDepth: number;
}

/** Blog feature configuration */
export interface BlogConfig {
  /** Master switch — when false, no blog pages are generated */
  enabled: boolean;
  /** Posts per page on the blog index */
  postsPerPage: number;
}

/** Search feature configuration */
export interface SearchConfig {
  enabled: boolean;
  defaultTab: 'all' | 'tools' | 'blog';
  showTabs: {
    all: boolean;
    tools: boolean;
    blog: boolean;
  };
}

/** Opt-in feature capabilities, grouped by page scope */
export interface FeaturesConfig {
  search: SearchConfig;
  homepage: {
    toolWidgetSection: {
      /** Show a specific interactive tool directly on the homepage */
      enabled: boolean;
      /** The slug of the tool to embed (e.g. 'word-counter') */
      toolSlug: string;
    };
    featuredSection: {
      /** Show the Featured Tools section */
      enabled: boolean;
      /** Max tools to display in the featured section */
      maxTools: number;
    };
    toolsDiscovery: {
      /** 0 = show all; positive = show N then "Show More" */
      initialDisplayCount: number;
    };
  };
  toolPage: {
    toc: TocConfig;
  };
  favouriteTools: {
    enabled: boolean;
    storageKey: string;
    showInMobileMenu: boolean;
    maxDisplayHomepage: number;
    maxDisplayMobileMenu: number;
  };
  recentTools: {
    enabled: boolean;
    maxItems: number;
    storageKey: string;
    showInMobileMenu: boolean;
    maxDisplayHomepage: number;
    maxDisplayMobileMenu: number;
  };
  toolActionTray: {
    enabled: boolean;
    showFavourite: boolean;
    showShare: boolean;
    showSupport: boolean;
    showFeedback: boolean;
    showGetApp: boolean;
    getAppHref: string;
  };
  /** Google AdSense — opt-in monetisation feature */
  ads: AdsConfig;
  /** Support / donations CTA — opt-in feature */
  support: SupportConfig;
  /** Blog — article publishing system */
  blog: BlogConfig;
}

/** Root site configuration shape — every site must satisfy this contract */
export interface SiteConfig {
  // ── Core Identity ──────────────────────────────────────────────────────────
  name: string;
  domain: string;
  url: string;
  version: string;
  /** Prefix for all localStorage keys — ensures uniqueness per deployment */
  localStoragePrefix: string;

  // ── Brand ──────────────────────────────────────────────────────────────────
  brand: {
    shortName: string;
    /** Brand tagline / value proposition */
    tagline: string;
  };

  // ── Localization ───────────────────────────────────────────────────────────
  localization: {
    currencySymbol: string;
    currencyCode: string;
  };

  // ── Legal ──────────────────────────────────────────────────────────────────
  companyName: string;

  // ── Temporal ───────────────────────────────────────────────────────────────
  /** Fallback timezone when a date has no explicit offset (e.g. "2026-03-15"). Use "UTC" or "+05:30". */
  defaultTimezone: string;

  // ── Contact ────────────────────────────────────────────────────────────────
  contact: {
    email: string;
    location: string;
  };

  // ── API Keys ───────────────────────────────────────────────────────────────
  apiKeys: {
    web3Forms: string;
    web3FormsEndpoint: string;
  };

  // ── SEO ────────────────────────────────────────────────────────────────────
  seo: SeoConfig;

  // ── UI / Layout ────────────────────────────────────────────────────────────
  ui: UiConfig;

  // ── Features ───────────────────────────────────────────────────────────────
  features: FeaturesConfig;
}
