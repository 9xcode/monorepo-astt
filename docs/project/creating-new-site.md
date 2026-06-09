# Creating a New Site

This guide walks you through creating a new niche site using the `@mtools/core` monorepo.

## Quick Start

### 1. Copy an existing site or template

You can copy an existing site (like `finance-tools`) or the template:

```bash
cp -r sites/finance-tools sites/my-new-site
# OR
cp -r sites/_template sites/my-new-site
```

### 2. Clear old content (If copying an existing site)

If you copied an existing site, you need to remove its specific tools and blog posts:

```bash
rm -rf sites/my-new-site/src/content/blog/*
rm -rf sites/my-new-site/src/content/tools/*
rm -rf sites/my-new-site/src/features/*
```

### 3. Update `package.json`

Open `sites/my-new-site/package.json` and replace the name with your site's package name:

```json
{
  "name": "@mtools/my-new-site"
}
```

### 4. Update `src/content-enums.ts`

Open `sites/my-new-site/src/content-enums.ts` and define the categories and tags specific to your new site. 

For example, for a QR code scanner site:

```ts
export const TOOL_CATEGORIES = [
  'QR Tools',
  'Barcode Tools',
  'Utilities',
] as const;

export const TOOL_TAGS = [
  'qr-code', 'scanner', 'generator', 'barcode',
] as const;
```

### 5. Update `src/config.ts`

Open `sites/my-new-site/src/config.ts` and update it with your site's specific details. Key areas to update include:
> Replace every `PLACEHOLDER_` token with your site's real values if you copy from `_template`

*   **Core Identity**: `name`, `domain`, `url`
*   **Brand**: `shortName`, `tagline`
*   **SEO**: `description`, `defaultKeywords`, `categoryMappings` (make sure these match `content-enums.ts`)
*   **UI / Navigation**: Update the `header`, `footer`, and `mobile` navigation links.
*   **Features**: Adjust `homepage.toolWidgetSection.toolSlug` to point to a valid tool slug in your new site, or disable it.
*   **Content**: Update titles and descriptions for pages like `home`, `tools`, `categories`, and `blog`.

### 6. Set up environment variables

```bash
cp sites/my-new-site/.env.example sites/my-new-site/.env
# Then edit .env and fill in real keys (e.g., Web3Forms API key)
```

### 7. Install and run

```bash
pnpm install
pnpm --filter @mtools/my-new-site dev
```

---

## Site Structure

A site only contains **site-specific** files. All shared logic (layouts, components, schemas, SEO, styles) lives in `@mtools/core`.

## Adding a New Tool

1. Create `src/content/tools/<slug>/index.md` with frontmatter.
2. Create `src/features/<slug>/Widget.svelte` with your Svelte 5 widget.
3. Run `pnpm --filter @mtools/my-new-site dev` — the widget map is regenerated automatically.

### Tool frontmatter reference

```yaml
---
title: "My Tool Name"
description: "Full description for the tool page."
shortDescription: "Shorter text for grids and cards."
category: "QR Tools"         # Must match a key in src/content-enums.ts TOOL_CATEGORIES
icon: "qr-code"              # Lucide icon name
order: 10                    # Sort order in grids (lower = higher)
tags: ["qr-code", "scanner"]
featured: false
isDraft: false
loadPriority: "only"         # "only" | "load" | "idle" | "visible"
---
```

---

## Adding a New Author

1. Create `src/content/authors/<slug>.md`:

```yaml
---
name: "Author Name"
role: "Content Writer"
shortBio: "Short bio for schema.org."
avatar: "../assets/images/authors/<slug>.jpg"
knowsAbout: ["Topic 1", "Topic 2"]
socials:
  twitter: "https://twitter.com/handle"
  linkedin: ""
  github: ""
  facebook: ""
---
```

2. Add their avatar image to `src/assets/images/authors/`

---

## Themes

Themes live in `sites/<site>/src/styles/` and are plain CSS files. The active theme is set in `src/config.ts`:

```ts
theme: {
  name: "slate",   // Must match src/styles/slate.css
}
```

To create a new theme, copy an existing theme file and modify the CSS custom properties.

---

## Turborepo Commands

```bash
# Dev a specific site
pnpm --filter @mtools/my-new-site dev

# Build a specific site
pnpm --filter @mtools/my-new-site build

# Build all sites
turbo build

# Type-check a specific site
pnpm --filter @mtools/my-new-site check
```
