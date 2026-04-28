---
# ──────────────────────────────────────────────────────────────────────────────
# DEMO AUTHOR — Template Reference File
# ──────────────────────────────────────────────────────────────────────────────
# This file exists purely as a template reference showing every available field
# in the author schema. It is NOT used in real content.
#
# To assign this author to a blog post or tool, add to its frontmatter:
#   author: demo
#
# To create a real author, copy this file, rename it (e.g. priya.md),
# and fill in the real details. The filename slug (without .md) is the author ID.
# ──────────────────────────────────────────────────────────────────────────────

# REQUIRED — Display name shown in AuthorCard, AuthorByline, and profile page.
name: "Demo Author"

# REQUIRED — Role / job title shown below the name in AuthorCard and ProfileHero.
# Use role, not literal job title — covers "Guest Contributor", "Community Author", etc.
# Maps to Schema.org Person.jobTitle in JSON-LD output.
role: "Template Reference Author"

# REQUIRED — One-sentence bio shown in AuthorCard and hover popover.
# Keep it under 160 characters for clean truncation.
shortBio: "A demonstration author profile that showcases every available field in the author schema. Use this as a reference when creating real author profiles."

# REQUIRED — Expertise tags. Rendered as badge chips in AuthorCard and ProfileHero.
# Maps to Schema.org Person.knowsAbout in JSON-LD output.
# Can be empty array [] if the author has no listed expertise.
knowsAbout:
  - "Personal Finance"
  - "Taxation"
  - "Investment Strategies"
  - "Software Development"
  - "Content Writing"
  - "Data Analysis"

# REQUIRED — Avatar image. Must be a path relative to THIS file (content/authors/).
# Image lives in src/assets/ so Astro's <Image> component can optimise it.
# Supported formats: .webp, .png, .jpg, .avif
avatar: "../../assets/images/authors/demo.png"

# OPTIONAL — Alt text for the avatar image. Defaults gracefully if omitted.
# Include the author's name and role for accessibility.
avatarAlt: "Demo Author — Template Reference Author"

# OPTIONAL — Social profile URLs. Leave as empty string "" to hide that icon.
# All four slots are available: github, twitter, linkedin, facebook.
socials:
  github: "https://github.com"
  twitter: "https://x.com"
  linkedin: "https://linkedin.com"
  facebook: "https://facebook.com"
---

<!-- ─────────────────────────────────────────────────────────────────────────
  MARKDOWN BODY — Long-form bio rendered on /authors/[slug] profile page.

  This is standard Markdown. Supports headings, lists, blockquotes, links,
  bold/italic, code blocks — anything valid in Markdown.

  On the profile page, this body appears between the AuthorProfileHero
  (avatar + role + socials) and the "Posts by {name}" grid.

  Keep this section focused on the author's background, perspective, and
  approach. Blog post summaries are automatically pulled from content.
────────────────────────────────────────────────────────────────────────── -->

This is the **demo author profile** — a template reference showing every field available in the author schema. This profile is never assigned to real content; it exists so you can see exactly how the system works.

## How the Author System Works

Each author has a Markdown file in `src/content/authors/`. The **filename** (without `.md`) becomes the author's slug — e.g. `abhishek.md` → slug `abhishek` → URL `/authors/abhishek`.

To assign an author to a blog post, add this to the post's frontmatter:

```yaml
author: abhishek
```

If no `author` field is set, the site falls back to `siteConfig.seo.defaultAuthorSlug` automatically. This means existing content requires **zero changes**.

## Adding a New Author

1. Copy this file to `src/content/authors/your-slug.md`.
2. Replace all placeholder values with real data.
3. Add the author's avatar image to `src/assets/images/authors/`.
4. Update the `avatar` path in the frontmatter.
5. That's it — the author page at `/authors/your-slug` is created automatically.

## Available Fields Reference

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | `string` | ✅ | Display name |
| `role` | `string` | ✅ | Role / job title |
| `shortBio` | `string` | ✅ | One-sentence bio, max ~160 chars |
| `knowsAbout` | `string[]` | ✅ | Expertise tags (can be `[]`) |
| `avatar` | `image()` | ✅ | Relative path to `src/assets/` |
| `avatarAlt` | `string` | optional | Defaults gracefully |
| `socials.github` | `string` | optional | Empty string `""` hides icon |
| `socials.twitter` | `string` | optional | Empty string `""` hides icon |
| `socials.linkedin` | `string` | optional | Empty string `""` hides icon |
| `socials.facebook` | `string` | optional | Empty string `""` hides icon |

## Future Extensions

When co-authors are needed, add to blog/tool frontmatter:

```yaml
author: abhishek
coAuthors:
  - priya
```

The schema handles this as `coAuthors: z.array(reference('authors')).default([])`.
