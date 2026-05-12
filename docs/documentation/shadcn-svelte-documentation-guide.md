# Shadcn-Svelte in Monorepo

This project uses **shadcn-svelte** for UI components, integrated with **Tailwind v4**.

## Configuration
The CLI config is located at `core/components.json`. It is configured to:
- Use **Tailwind v4** (no `tailwind.config.js` required).
- Place components in `src/lib/components/ui`.
- Map utilities to `src/lib/utils.ts`.

## How to add components
Always run the CLI from the `core/` directory:

```bash
cd core
# Using npx
npx shadcn-svelte@latest add <component-name>

# Using pnpm (Recommended)
pnpm dlx shadcn-svelte@latest add <component-name>
```

## Key Paths
- **Components:** `core/src/lib/components/ui/`
- **Utilities:** `core/src/lib/utils.ts`
- **Global CSS:** `core/src/styles/global.css`

## Why is it in `core`?
In this monorepo, `@mtools/core` acts as the single source of truth for UI. By keeping shadcn here, all sites (`sites/*`) share the same atomic components and design tokens.
