// ────────────────────────────────────────────────────────────────────────────
// Online QR Code Scanner Site Configuration
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
  name: "Online QR Code Scanner",
  domain: "onlineqrcodescanner.com",
  url: "https://onlineqrcodescanner.com",
  version: "1.0.1",
  localStoragePrefix: "oqcs_",

  // ─── Brand & Voice ─────────────────────────────────────────────────────
  brand: {
    shortName: "Online QR Code Scanner",
    tagline: "Free, Fast, and 100% Private QR Code Scanner & Generator.",
  },

  // ─── Localization ───────────────────────────────────────────────────────
  localization: {
    currencySymbol: "$",
    currencyCode: "USD",
  },

  // ─── Legal ──────────────────────────────────────────────────────────────
  companyName: "Online QR Code Scanner",
  legal: {
    lastUpdated: "June 08, 2026",
    toolDisclaimers: [
      {
        category: "QR Scanner",
        description: "All QR Code scanning processes are executed client-side inside your browser. No image data, scanned content, or camera feed is transmitted to our servers. While we strive to ensure the accuracy and security of scanned links and data, please verify target URLs before visiting them.",
      },
      {
        category: "QR Generator",
        description: "All QR Code generation is performed entirely within your browser. No input data, Wi-Fi credentials, contact details, or any other content is transmitted to our servers.",
      },
    ],
  },

  // ─── Contact ────────────────────────────────────────────────────────────
  contact: {
    email: "contactwithtag@gmail.com",
    location: "San Francisco, CA",
  },

  // ─── API Keys ───────────────────────────────────────────────────────────
  apiKeys: {
    web3Forms: import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY,
    web3FormsEndpoint: "https://api.web3forms.com/submit",
  },

  // ─── SEO ────────────────────────────────────────────────────────────────
  seo: {
    description: "Scan QR codes and barcodes directly from your browser or camera. Create custom QR codes for Wi-Fi, vCards, URLs, and more. Free, fast, and secure.",
    language: "en",
    defaultKeywords: ["qr code scanner", "online qr code scanner", "scan qr code", "scan qr code online", "qr code generator", "free qr scanner", "barcode scanner", "wifi qr code", "scan barcode online", "online qr code generator", "online qr code reader", "create qr code"],

    defaultAuthorSlug: "abhishek",
    twitterHandle: "@Abhishek_Patni",

    softwareApplication: {
      operatingSystem: "Windows, macOS, Linux, iOS, Android",
      isAccessibleForFree: true,
      browserRequirements: "Requires JavaScript and Camera access (for scanning)",
    },

    organization: {
      knowsAbout: ["QR Codes", "Barcodes", "Computer Vision", "Web Development", "Privacy Tools"],
    },

    categoryMappings: {
      "QR Scanner": { appCategory: "UtilitiesApplication", additionalType: "SoftwareApplication" },
      "QR Generator": { appCategory: "UtilitiesApplication", additionalType: "SoftwareApplication" },
      "Barcode Tools": { appCategory: "UtilitiesApplication", additionalType: "SoftwareApplication" },
      "Utilities": { appCategory: "UtilitiesApplication", additionalType: "SoftwareApplication" },
    },

    titleSeparator: "-",
    titleDescriptors: {
      "QR Scanner": "Free Online QR Code Scanner",
      "QR Generator": "Free Online QR Code Generator",
      "Barcode Tools": "Free Online Barcode Tool",
      "Utilities": "Free Online QR Code Utility",
      "_default": "Free Online QR Code Tool",
    },
  },

  // ─── UI / Layout ────────────────────────────────────────────────────────
  ui: {
    navigation: {
      header: [
        { label: "Home", href: "/" },
        {
          label: "Categories", href: "/categories",
          children: [
            { label: "QR Scanner", href: "/categories/qr-scanner" },
            { label: "QR Generator", href: "/categories/qr-generator" },
          ],
        },
        // { label: "Blog", href: "/blog" },
        { label: "Support", href: "/support" },
      ],
      footer: [
        { label: "About Us", href: "/about" },
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Disclaimer", href: "/disclaimer" },
        { label: "DMCA", href: "/dmca" },
        { label: "Contact", href: "/contact" },
        { label: "Support", href: "/support" },
      ],
      mobile: [
        { label: "Home", href: "/" },
        {
          label: "Categories", href: "/categories",
          children: [
            { label: "QR Scanner", href: "/categories/qr-scanner" },
            { label: "QR Generator", href: "/categories/qr-generator" },
          ],
        },
        // { label: "Blog", href: "/blog" },
      ],
    },

    sidebar: {
      showAllToolsList: true,
      showGetAppCard: false,
      showSupportCard: true,
      showExploreToolsCard: true,
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
      name: "emerald",
    },

    getApp: {
      sections: {
        showFeatures: true,
        showTools: true,
        showHowItWorks: true,
        showTestimonials: true,
        showFaq: true,
      },
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
        toolSlug: "qr-code-scanner",
      },
      featuredSection: {
        enabled: false,
        maxTools: 3,
      },
      toolsDiscovery: {
        initialDisplayCount: 20,
      },
      bottomCta: {
        enabled: false,
        showGetApp: false,
        showFeatureRequest: false,
        showSupportCard: false,
      },
    },

    toolPage: {
      defaultFullWidth: true,
      toc: {
        enabled: true,
        title: "On this page",
        minHeadings: 3,
        maxDepth: 3,
      },
      showRelatedTools: true,
      showAuthorCard: true,
    },

    favouriteTools: {
      enabled: false,
      storageKey: "favourites",
      showInMobileMenu: true,
      maxDisplayHomepage: 6,
      maxDisplayMobileMenu: 6,
    },

    recentTools: {
      enabled: false,
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
      showGetApp: false,
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
      label2: "Buy me a Coffee",
    },

    blog: {
      enabled: false,
      postsPerPage: 12,
      showRelatedPosts: true,
      showAuthorCard: true,
    },

    getApp: {
      enabled: false,
      appStoreUrl: "https://apps.apple.com/app/id",
      playStoreUrl: "https://play.google.com/store/apps/details?id=app.onlineqrcodescanner",
    },
  },
  // ─── Content ──────────────────────────────────────────────────────────────────
  content: {

    pages: {

      home: {
        title: "Online QR Code Scanner – Free Online QR Scanner & Generator",
      },

      tools: {
        title: "All Free QR Code Tools – Online QR Code Scanner & Generator",
        description: "Browse our full collection of free, private, and lightning-fast QR code scanner and generator tools.",
        heroBadge: "Complete Tools Directory",
        heroTitle: "All Free QR & Barcode Tools",
      },

      blog: {
        title: "QR Code Guides and Tutorials – Online QR Code Scanner Blog",
        description: "Guides, tips, and tutorials for using QR codes, barcodes, and online tools.",
      },

      categories: {
        title: "All Tool Categories – QR & Barcode Utilities",
        description: "Explore our complete collection of free, private, and fast tools organized by category to find the perfect QR code scanner, generator, or reader.",
        heroBadge: "All Utilities Directory",
        heroTitle: "Browse by Category",
      },

      categoryPage: {
        titleTemplate: "Free {category} Online",
        descriptionTemplate: "Explore our collection of fast and free {category}. No tracking, just pure privacy-first utility.",
        heroBadge: "Collection Directory",
      },

      getApp: {
        title: "Download QR Scanner App – Free iOS & Android App",
        description: "Get the QR Code Scanner app for iOS and Android. Offline access, zero tracking, and fast scanning on your device.",
      },

    },

    components: {

      hero: {
        headline: "Free, Fast, and 100% Private",
        headline2: "Online ",
        headlineAccent: "QR Code Scanner",
        subtitle: "Scan and generate QR codes directly in your browser. No data ever leaves your device.",
      },

      bottomCta: {
        getApp: {
          title: "Mobile App",
          description: "Fast, offline scanning natively on iOS & Android.",
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
        sectionTitle: "Discover QR Tools",
        sectionSubtitle: "Find the perfect QR scanner, generator, or utility",
      },

      toolPage: {
        aboutSectionTitle: "About this Tool",
      },

      getAppCard: {
        description: "Scan QR codes offline with zero tracking. Get the premium experience on your phone.",
      },

      sidebar: {
        exploreToolsDescription: "Try our free online QR scanners, generators, and barcode readers.",
      },

      search: {
        placeholder: "Search tools, guides, articles...",
      },

      getApp: {
        hero: {
          userCount: "10,000+",
          ratingText: "4.9/5 on App Stores",
        },
        tools: {
          subtitle: "Access over 10+ specialized QR and barcode tools directly from your pocket.",
          items: [
            { label: "Camera QR Scanner" },
            { label: "Image QR Reader" },
            { label: "URL QR Generator" },
            { label: "Wi-Fi QR Generator" },
            { label: "vCard QR Generator" },
            { label: "Barcode Reader" },
            { label: "Barcode Generator" },
            { label: "And More" },
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
            quote: "Finally, a perfectly designed toolset that respects my privacy. I uninstalled 4 different scanner apps after finding this one. It has literally everything I need.",
            initials: "SM",
            name: "Sarah M.",
            platform: "Play Store Review",
            rating: 5,
          },
          {
            quote: "Extremely fast and snappy. The UI is gorgeous and the dark mode is perfect. Highly recommended!",
            initials: "RJ",
            name: "Rahul J.",
            platform: "Play Store Review",
            rating: 5,
          },
        ],
      },
    },

  },
};
