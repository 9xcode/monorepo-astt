// ────────────────────────────────────────────────────────────────────────────
// Finance-Tools Site Configuration
//
// All type-only exports re-exported from core — no duplicate type definitions.
// Documentation: see @mtools/core/config/types for the full SiteConfig shape.
// ────────────────────────────────────────────────────────────────────────────

// Re-export all types so site-level code that imports from './config'
// (e.g. Astro pages, layouts) continues to work without changes.
import type {
  SiteConfig,
  SiteContent,
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
  SiteContent,
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

  legal: {
    lastUpdated: "June 2025",
    toolDisclaimers: [
      {
        category: "Finance & Investment Tools",
        description: "Results from financial calculators (EMI, SIP, compound interest, loan repayment, etc.) are computed using standard mathematical formulas and are provided for general estimation purposes only. They do not account for individual tax liability, institution-specific charges, variable rate fluctuations, or regulatory changes. Always verify outputs with a qualified financial adviser or your financial institution before making any investment, loan, or financial planning decision.",
      },
    ],
  },

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
        { label: "Download App", href: "/get-app" },
      ],
      footer: [
        { label: "About Us",            href: "/about" },
        { label: "Privacy",             href: "/privacy" },
        { label: "Terms",               href: "/terms" },
        { label: "Disclaimer",          href: "/disclaimer" },
        { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
        { label: "DMCA",                href: "/dmca" },
        { label: "Contact",             href: "/contact" },
        { label: "Support",             href: "/support" },
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
      showGetAppCard: false,
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
//       name: "slate",
       name: "neutral",
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
        enabled: true,
        toolSlug: "sip-calculator",
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
      getAppHref: "/get-app",
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
      label2: "Buy me a Coffie",
    },

    blog: {
      enabled: true,
      postsPerPage: 12,
    },

    getApp: {
      enabled: true,
      appStoreUrl: "https://apps.apple.com/app/id",        // TODO: replace with real App Store link
      playStoreUrl: "https://play.google.com/store/apps/details?id=app.multitools", // TODO: replace with real Play Store link
    },
  },
  // ─── Content ──────────────────────────────────────────────────────────────────
  content: {

    pages: {

      home: {
        title: "MultiTools – Free Online Tools and Calculators",
      },

      tools: {
        title: "All Free Online Tools and Calculators – MultiTools",
        description: "Browse our full collection of free, privacy-focused, and lightning-fast online tools.",
        heroBadge: "Complete Tools Directory",
        heroTitle: "All Free Online Tools",
      },

      blog: {
        title: "Free Tool Guides and Tutorials – MultiTools Blog",
        description: "Guides, tips, and tutorials for using our free online tools and calculators.",
      },

      categories: {
        title: "All Tool Categories – Free Calculators & Converters",
        description: "Explore our complete collection of free, private, and fast tools organized by category to find the perfect calculator or utility for your needs.",
        heroBadge: "All Utilities Directory",
        heroTitle: "Browse by Category",
      },

      categoryPage: {
        titleTemplate: "Free {category} Tools Online",
        descriptionTemplate: "Explore our collection of fast and free {category} tools. No tracking, just pure privacy-first utility.",
        heroBadge: "Collection Directory",
      },

      getApp: {
        title: "Download MultiTools App – Free iOS & Android App",
        description: "Get the MultiTools app for iOS and Android. Offline access, zero tracking, and all our tools directly on your device.",
      },

    },

    components: {

      hero: {
        headline: "Faster than AI,",
        headline2: "Safer ",
        headlineAccent: "than Cloud",
        subtitle: "Lightning-fast, free tools to edit, format, calculate, convert, and more",
      },

      bottomCta: {
        getApp: {
          title: "Mobile App",
          description: "Fast, offline calculations natively on iOS & Android.",
          buttonLabel: "Download Free",
        },
        featureRequest: {
          title: "Missing a Tool?",
          description: "Tell us what to build next. We monitor community feedback.",
          buttonLabel: "Request Feature",
        },
        supportUs: {
          title: "Support Us",
          description: "Tools are built for free. Help fuel the developer with caffeine!",
        },
      },

      toolsGrid: {
        sectionTitle: "Discover Tools",
        sectionSubtitle: "Find the perfect tool for your needs",
      },

      toolPage: {
        aboutSectionTitle: "About this Tool",
      },

      getAppCard: {
        description: "Calculate offline with zero tracking. Get the premium experience on your phone.",
      },

      sidebar: {
        exploreToolsDescription: "Try our free financial calculators and converters.",
      },

      search: {
        placeholder: "Search tools, calculators, articles...",
      },

      getApp: {
        hero: {
          userCount: "10,000+",
          ratingText: "4.9/5 on App Stores",
        },
        tools: {
          subtitle: "Access over 50+ financial, mathematical, and everyday tools directly from your pocket.",
          items: [
            { label: "SIP Calculator" },
            { label: "EMI Calculator" },
            { label: "GST & Tax Tools" },
            { label: "Health & BMI" },
            { label: "Age Calculator" },
            { label: "Percentage Tools" },
            { label: "Discount Tools" },
            { label: "And 40+ More" },
          ],
        },
        testimonials: [
          {
            quote: "This app is an absolute lifesaver. I use it daily and the fact that it works offline is amazing. Zero ads, pure functionality, exactly what I needed.",
            initials: "AJ",
            name: "Amit J.",
            platform: "App Store Review",
            rating: 5,
          },
          {
            quote: "Finally, a perfectly designed toolset that respects my privacy. I uninstalled 4 different calculator apps after finding this one. It has literally everything I need.",
            initials: "SM",
            name: "Sarah M.",
            platform: "Play Store Review",
            rating: 5,
          },
          {
            quote: "Extremely fast and snappy. The UI is gorgeous and the dark mode is perfect. Would give it 5 stars if they added a dedicated scientific calculator, but it's great!",
            initials: "RJ",
            name: "Rahul J.",
            platform: "Play Store Review",
            rating: 4,
          },
        ],
      },
    },

  },
};
