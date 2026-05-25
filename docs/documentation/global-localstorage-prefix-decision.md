# Global LocalStorage Prefix Mechanism

## Understanding Summary
- **What is being built:** A global `localStorage` prefix mechanism controlled centrally.
- **Why it exists:** To prevent key collisions across different sites or domains when running multiple instances, and to organize your stored keys neatly.
- **Key changes:** Added a `localStoragePrefix` property to `siteConfig`, renamed specific keys like `theme`, `mt_favourites`, and `mt_recents` to natively use this prefix, and updated all `localStorage` reads/writes across the project.
- **Explicit Non-Goals:** No migration of old `localStorage` data for existing users (Fresh Start approach).

## Assumptions
- Performance impact is negligible (simple string concatenation).
- End users on production aren't yet live, meaning no legacy migration path is required.

## Decision Log
**1. Configuration Definition**
- **Decision:** Add a dedicated `localStoragePrefix` string to the root of `SiteConfig` (set initially to `"mt_"`).
- **Alternatives considered:** Deriving it implicitly from `brand.shortName` or `domain`.
- **Why chosen:** A dedicated field offers explicit, granular control. If you change your brand name, you can still keep the old prefix and not unexpectedly drop user data.

**2. Handling Existing User Data**
- **Decision:** Fresh Start (No Migration).
- **Alternatives considered:** Adding a migration utility on load to remap old keys to new keys.
- **Why chosen:** The project isn't publicly deployed yet. Avoiding a migration script keeps the codebase simpler and avoids tech debt for an audience of 0.

**3. Implementation Approach in Svelte vs. Astro**
- **Decision:** Import `siteConfig` directly in `.svelte` components, and use Astro's `define:vars` to pass the prefix logically to inline scripts in `BaseLayout.astro`.
- **Alternatives considered:** Extracting a unified vanilla TypeScript `StorageController` utility.
- **Why chosen:** Adding the prefix inline was the lightest-touch solution that minimized refactoring the entire codebase structure while achieving the same goal robustly.
