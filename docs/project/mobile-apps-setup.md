# Mobile Apps Architecture & Setup Guide

This document outlines the architecture, structure, and lifecycle of the mobile apps within our monorepo.

## Overview
We use **Capacitor** to build native mobile apps (Android and iOS). Instead of writing entirely separate applications, Capacitor acts as a native wrapper around our existing Astro/Svelte web applications located in the `sites/` directory.

The web components (`@mtools/core`) and sites (`sites/*`) are completely isolated from the mobile wrappers. This maintains a clean dependency graph and separation of concerns.

## Directory Structure

```text
mobile-apps/
├── _template/             # Scaffold template for creating new mobile wrappers
│   ├── capacitor.config.ts
│   ├── package.json       # @mtools/mobile-template
│   └── tsconfig.json
├── finance-tools/         # Wrapper for the finance-tools website
│   ├── capacitor.config.ts
│   ├── package.json       # @mtools/finance-app
│   └── tsconfig.json
└── shared/                # Native plugins & shared logic
    └── package.json       # @mtools/mobile-shared
```

## Key Architectural Decisions

1. **No Automatic Build via Turborepo (`pnpm build`)**:
   - The `package.json` for mobile apps **deliberately excludes** a `"build"` script.
   - This prevents `pnpm build` from executing Capacitor commands when you're just trying to build the web projects. Turborepo will silently ignore the mobile wrappers.
   - You must manually run syncing operations when packaging the mobile app.

2. **Workspace Linking**:
   - Inside each mobile app's `package.json`, there is a devDependency on its corresponding web project (e.g., `"@mtools/finance-tools": "workspace:*"`).
   - This explicitly defines the build dependency: if you ever target the mobile app in Turborepo, it knows it must compile the web project first.

3. **Capacitor Configuration**:
   - The `capacitor.config.ts` points `webDir` directly to `../../sites/<site-name>/dist`.
   - This means Capacitor immediately consumes the production-ready static assets built by Astro.

4. **Shared Directory (`mobile-apps/shared`)**:
   - **Do not put mobile code in `@mtools/core`**. Doing so would infect web-only projects with Capacitor native libraries.
   - Any custom native code (Java/Swift plugin wrappers), native mobile bridge utilities, or mobile-specific Svelte components should be placed in `mobile-apps/shared` (`@mtools/mobile-shared`).

5. **Centralized Dependency Management**:
   - All Capacitor core plugins are strictly managed via `pnpm-workspace.yaml` catalogs. This guarantees every mobile app utilizes the exact same Capacitor versions (e.g., `^8.3.1`).

## How to Create a New Mobile App

1. Copy the `mobile-apps/_template/` directory to `mobile-apps/<new-app-name>`.
2. Update `package.json`:
   - Change the package `"name"` to `@mtools/<new-app-name>`.
   - Replace `"@mtools/SITE_NAME": "workspace:*"` with the actual package name of your site (e.g., `"@mtools/my-new-site": "workspace:*"`).
3. Update `capacitor.config.ts`:
   - Set a unique `appId` (e.g., `com.mycompany.app`).
   - Set the `appName`.
   - Set `webDir` to `../../sites/<new-site-name>/dist`.
4. Run `pnpm install` from the monorepo root.

## Lifecycle Commands

To prepare and build a mobile app, navigate to its directory (`cd mobile-apps/finance-tools/`) and run:

1. **Add Native Platforms (Run Once):**
   ```bash
   pnpm run add:android
   pnpm run add:ios
   ```

2. **Sync the Web Build to Native Platforms:**
   Before running this, ensure you have built the site using `pnpm --filter @mtools/finance-tools build`.
   ```bash
   pnpm run sync
   ```

## Icons and Splash Screens

Do not define paths to app icons in `capacitor.config.ts`. Instead, use the `@capacitor/assets` generator:

1. Place an `icon.png` (1024x1024) and `splash.png` (2732x2732) inside an `assets/` directory in the mobile app folder.
2. Run `npx @capacitor/assets generate`.
3. The CLI will automatically resize and distribute the icons into the correct Xcode and Android Studio project folders.
