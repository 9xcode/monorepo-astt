# MultiTools Project Documentation

## 1. Project Objective

**MultiTools** is a modern, privacy-focused utility platform designed to provide a suite of powerful tools for daily needs without the clutter of ads or tracking. The primary goal is to offer a premium, "Apple-like" user experience with a clean, minimalist interface.

### Key Features:
-   **Privacy-First:** All calculations and processing happen client-side in the browser. No data is sent to any server.
-   **Performance:** Built on Astro 5.0 for blazing-fast static site generation (SSG) and zero-JS default loading (islands architecture).
-   **Modern Design:** Utilizes a custom design system based on `shadcn-svelte` and Tailwind CSS v4 for a sleek, responsive UI.
-   **Dynamic OG Images:** Automatically generates branded, content-aware social sharing images for every tool at build time using Satori.
-   **Extensible:** structured to easily add new tools and calculators.

---

## 2. Technology Stack

A robust, modern stack optimized for performance and developer experience.

### Core Frameworks:
-   **[Astro 5.0](https://astro.build/):** The web framework for content-driven websites. Used for routing, static generation, and overall site layout.
-   **[Svelte 5](https://svelte.dev/):** The component framework for interactive tools. Uses the new "Runes" system for reactivity.
-   **TypeScript:** Used throughout for type safety and code quality.

### Styling & UI:
-   **[Tailwind CSS v4](https://tailwindcss.com/):** Utility-first CSS framework for rapid styling.
-   **[Shadcn-Svelte](https://www.shadcn-svelte.com/):** A collection of re-usable components built using Radix UI and Tailwind CSS.
-   **[Bits UI](https://www.bits-ui.com/):** Headless components for Svelte, powering Shadcn.
-   **[Lucide Svelte](https://lucide.dev/):** Beautiful, consistent icons.
-   **[Tailwind Typography](https://github.com/tailwindlabs/tailwindcss-typography):** For beautiful markdown content styling.

### Build and Tooling:
-   **Vite:** The build tool and dev server.
-   **npm:** Package management.


#### New Suggestion
Astro          → Routing, SSG, SEO, zero JS shell
Svelte         → Interactive tool islands
shadcn-svelte  → UI components
Melt UI        → Headless primitives for custom components
Tailwind v4    → Styling
Superforms     → Contact form + any form validation
Zod            → Schema validation
Cloudflare Pages → Hosting + CDN + image optimization
pdf-lib        → PDF tools (pure JS)
ffmpeg.wasm    → Video/audio conversion
SheetJS        → Excel/CSV tools
tesseract.js   → OCR tools

---

## 3. Project Structure

The project follows a feature-based architecture to keep tools organized and maintainable.

```
/
├── public/                 # Static assets (images, fonts, robots.txt etc.)
├── src/
│   ├── components/         # Shared UI components
│   │   ├── shared/         # specialized shared components (Header, Footer, ToolGrid, Ads)
│   │   └── ui/             # shadcn-svelte primitives (Button, Card, Input, etc.)
│   │
│   ├── content/            # Content Collections
│   │   └── tools/          # Markdown content for each tool (One folder per tool)
│   │       ├── sip-calculator/
│   │       │   └── index.md
│   │       └── ...
│   │
│   ├── features/           # Feature-specific logic (Svelte Widgets)
│   │   ├── sip-calculator/
│   │   │   ├── Widget.svelte       # Main calculator component
│   │   │   └── types.ts            # Local types
│   │   └── ...
│   │
│   ├── layouts/            # Astro Layouts
│   │   ├── BaseLayout.astro     # Root layout (HTML, Head, Body)
│   │   └── ToolLayout.astro     # Layout specifically for Tool pages (Sidebar, Article)
│   │
│   ├── pages/              # File-based routing
│   │   ├── index.astro          # Landing page
│   │   └── tools/
│   │       └── [tool].astro     # Dynamic route for all tools
│   │
│   └── styles/             # Global CSS
│       └── global.css
├── astro.config.mjs        # Astro configuration
├── tailwind.config.mjs     # Tailwind configuration
└── package.json            # Dependencies and scripts
```

---

## 4. How to Add a New Tool

Review this guide to add a new calculator or utility to the platform.

### Step 1: Create the Feature Widget
Create a new folder in `src/features/` with your tool's name (e.g., `my-new-tool`).
Create a `Widget.svelte` file inside it. This is where your interactive logic goes.

```svelte
<!-- src/features/my-new-tool/Widget.svelte -->
<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  // Your logic here
</script>

<div class="p-4">
  <!-- Your UI here -->
</div>
```

### Step 2: Create the Content
Create a new folder in `src/content/tools/` with the **same slug name** (e.g., `my-new-tool`).
Create an `index.md` file inside.

```markdown
---
title: "My New Tool"
description: "Description for SEO and cards."
icon: "Calculator"
---

## How to use
Markdown content explaining the tool...
```

### Step 3: Register the Widget
Open `src/pages/tools/[tool].astro`.
Import your new widget and add a conditional rendering block.

```astro
// src/pages/tools/[tool].astro
import MyNewToolWidget from '../../features/my-new-tool/Widget.svelte';

// ... inside the markup ...
{entry.slug === 'my-new-tool' && <MyNewToolWidget client:load />}
```

**That's it!** The tool is now live at `/tools/my-new-tool`, appears in the search, home page grid, and sidebar automatically.

---

## 5. Development Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server at `localhost:4321`. |
| `npm run build` | Builds the production site to `dist/`. |
| `npm run preview` | Preview the built site locally. |
| `npm run astro` | Run Astro CLI commands (e.g., `astro add`). |

## 6. Key Components Documentation

### Ads System
-   **Component:** `src/components/shared/AdPlaceholder.astro`
-   **Usage:** `<AdPlaceholder slotId="sidebar-ad" label="Ad" />`
-   **Configuration:** Currently static placeholders. Replace implementation in this file to integrate AdSense or other providers globally.

### Search System
-   **Component:** `src/components/shared/ToolSearch.svelte`
-   **Functionality:** Uses `shadcn-svelte` Command/Dialog. Indexes all tools via `astro:content` collection passed as props.

---

## 7. Testing & Quality Assurance

To ensure the reliability of the tools, always run type-checking and build verification before deploying.

### Run Type Checks
Astro provides a built-in strict type checker to catch Svelte and TyperScript errors across the entire project.

```sh
npx astro check
```

**Note on Shadcn Components:** In Svelte 5, if you use standard Shadcn UI components (like `Card` or `Label`) and encounter "Property 'class' is missing" errors, ensure the components export `class` as an optional property and use `Snippet` for children.

---

## 8. Deployment Strategy

The application is built using Astro's **static** output mode (SSG), making it incredibly fast and cheap to host on any static hosting provider.

### Vercel (Recommended)
1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Vercel will automatically detect the Astro preset.
4. Leave build command as `npm run build` and output directory as `dist`.
5. Deploy.

### Environment Variables (Important)
Before deploying, ensure you have configured your environment variables in your hosting provider's dashboard.
*   **Locally:** We use a `.env` file (which is gitignored).
*   **Production:** You must add the same keys in Vercel/Cloudflare settings.

**Required Variables:**
*   `PUBLIC_WEB3FORMS_ACCESS_KEY`: The access key for your contact form (web3forms.com).

### Cloudflare Pages / Netlify / GitHub Pages
Because the output is purely static HTML/CSS/JS in the `dist/` directory, you can deploy it to any of these providers using their standard Astro templates. Ensure you set the environment variables mentioned above in their respective CI/CD dashboards.


--------
## References 
- https://github.com/remarkjs/remark-math/blob/main/packages/remark-math/readme.md