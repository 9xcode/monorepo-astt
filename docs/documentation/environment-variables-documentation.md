# Environment Variables Guide

This document defines the environment variable architecture, naming conventions, and file hierarchy used across this monorepo.

## Quick Reference Table

| Variable Name | Scope | Description | Required | Source |
| :--- | :--- | :--- | :---: | :--- |
| `PUBLIC_WEB3FORMS_ACCESS_KEY` | `sites/*` | Access key for Web3Forms contact forms. | Yes | [Web3Forms](https://web3forms.com) |

 
> When you add a new variable anywhere in the repo, update this table.
---

## Environment File Hierarchy

We follow the standard that Vite and Astro load `.env` files in this order. Files lower in the list override files above them.

1. **`.env`**: Default variables for all modes.
2. **`.env.local`**: Local overrides. **Never committed.**
3. **`.env.[mode]`**: Mode-specific (e.g., `.env.development`, `.env.production`).
4. **`.env.[mode].local`**: Local mode-specific overrides. **Never committed.**

---

## Naming Conventions

To maintain a professional, scalable, and self-documenting codebase, we follow a strict naming architecture.

### The Pattern: `[PREFIX]_[SERVICE]_[ATTRIBUTE]`

We use a three-part naming convention to ensure every variable has a clear purpose and scope.
The prefix controls where the variable is accessible. The service and attribute describe what it's for.


#### The Prefix (Framework & Security)
- **`PUBLIC_`**: **Required** for any variable that needs to be accessed by client-side code (browser). Astro/Vite will only expose these to the client.
    > Astro/Vite will **not** expose unprefixed variables to the browser. Use `PUBLIC_` only when the value is safe to be public (e.g. a form key, a public API endpoint). Never use it for secrets.
- **`SECRET_`** (Optional): Used for high-security backend keys to distinguish them from standard config.
- **(No Prefix)**: Default for server-side only variables (Database URLs, private API keys).

#### The Service (External Integration)
(Optional): Name of the service the variable belongs to. Makes it easy to scan and find related variables.
- examples: `WEB3FORMS`, `STRIPE`, `CLERK`, `SUPABASE`, `REPLICATE`, `DB`

#### The Attribute (Data Type)
What aspect of the service this variable holds. Use descriptive suffixes to define exactly what the data is.
- examples: `ACCESS_KEY`, `API_KEY`, `ID`, `URL`, `ENDPOINT`, `SECRET`, `DOMAIN`, `WEBHOOK_KEY`

#### Examples
```
# Public contact form key — safe to expose to the browser
PUBLIC_WEB3FORMS_ACCESS_KEY=your_key_here

# Private database connection — server only, never exposed
DATABASE_URL=postgresql://user:password@host:5432/dbname
DB_URL=libsql://your-db.turso.io

# Private Stripe secret key — server only
STRIPE_SECRET_KEY=sk_live_...

# Public Stripe publishable key — safe for the browser
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Resend API key — server only
RESEND_API_KEY=re_...

# OpenAI API key — server only
OPENAI_API_KEY=sk_...

# Debug flags (optional)
DEBUG=true
NODE_ENV=development
```

---

## Best Practices & Security

### Security First
- **Never commit `.env` or `.env.*.local` files** to Git.
- Add a `.env.example` in each package with placeholder values so other developers know what's needed
- Store production secrets in your CI/CD platform (Vercel dashboard, GitHub Actions secrets, etc.) — not in files

### Monorepo Strategy
- **Workspace Isolation**: Environment variables are defined at the package level (`sites/site-name/.env`).
- **Root Documentation**: When adding a new variable, you MUST update the **Quick Reference Table** at the top of this document.

---