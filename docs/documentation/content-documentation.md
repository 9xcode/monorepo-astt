# MultiTools Content Architecture & Configuration Guide

This unified document is the single source of truth for **all** content operations within the MultiTools project. It covers the Zod schemas defined in `src/content.config.ts`, Markdown parsing rules, Generative Engine Optimization (GEO) standards, and exact writing templates.

By centralizing both Blog and Tool specifications here, our codebase files remain exceptionally clean, making configuration changes easier to parse.

---

## 1. Unified Frontmatter Configuration

Every markdown file in `src/content/` begins with YAML frontmatter. To avoid duplicating schema documentation across multiple project guides, use the master parameter table below.

> For detailed understanding of properites, refer to `content-config-documentation.md`

**Scope Legend:**
- **`T`** = Tools (`src/content/tools`)
- **`B`** = Blog (`src/content/blog`)
- **`A`** = Author (`src/content/authors`)

| Property | Scope | Req | Example |
| :--- | :---: | :---: | :--- |
| `title` | **T, B** | Yes | `title: "SIP Calculator"` |
| `seoTitle` | **T, B** | No | `seoTitle: "Best SIP Calculator [month_year]"` |
| `description` | **T, B** | Yes | `description: "Analyze your investment growth with..."` |
| `shortDescription` | **T** | No | `shortDescription: "Calculate SIP returns in seconds"` |
| `category` | **T, B** | Yes | `category: "Finance/Tax"` |
| `tags` | **T, B** | No | `tags: ["investment", "savings"]` |
| `icon` | **T** | No | `icon: "Calculator"` |
| `publishedAt` | **T, B** | No | `publishedAt: "2026-02-08T08:00:00"` |
| `updatedAt` | **T, B** | No | `updatedAt: "2026-03-22T14:30:00Z"` |
| `author` | **T, B** | No | `author: "demo"` |
| `coAuthors` | **T, B** | No | `coAuthors: ["demo", "abhishek"]` |
| `coverImage` | **B** | No | `coverImage: "/images/blog/my-post.jpg"` |
| `coverImageAlt`| **B** | No | `coverImageAlt: "A graph showing compound growth"` |
| `widgetSlug` | **T** | No | `widgetSlug: "loan-amortization-calculator"` |
| `canonical` | **T, B** | No | `canonical: "/tools/sip-calculator"` |
| `toc` | **T, B** | No | `toc: false` |
| `hasMath` | **T, B** | No | `hasMath: true` |
| `isDraft` | **T, B** | No | `isDraft: true` |
| `noindex` | **B** | No | `noindex: true` |
| `fullWidth` | **T** | No | `fullWidth: true` |
| `featured` | **T, B** | No | `featured: true` |
| `order` | **T, B** | No | `order: 10` |
| `loadPriority` | **T** | No | `loadPriority: "idle"` |
| `name` | **A** | Yes | `name: "Demo Author"` |
| `role` | **A** | Yes | `role: "Template Reference Author"` |
| `shortBio` | **A** | Yes | `shortBio: "A demonstration author profile..."` |
| `knowsAbout` | **A** | No | `knowsAbout: ["Personal Finance"]` |
| `avatar` | **A** | Yes | `avatar: "./avatar.png"` and `avatar: "../../assets/images/authors/avatar.png"`  |
| `avatarAlt` | **A** | No | `avatarAlt: "Demo Author — Reference Author"` |
| `socials` | **A** | No | `socials:` (nested object for github, etc.) |

---

## 2. Taxonomy & Allowed Values

Defined in `src/content-enums.ts`
---

## 3. SEO, Markdown Rules & Background Parsers

Our codebase utilizes multiple background Markdown parsers during the build phase. To ensure pristine Generation Engine Optimization (GEO) and JSON-LD schema accuracy, **strict structural conformity is required.**

### 3.1. The "Features" Parser
- **Trigger Heading:** `## Features`, `## Key Features`, or `### Core Features` (H2 or H3).
- **Execution:** Whatever formatted bulleted/numbered list exists beneath this string is completely intercepted and nested cleanly into the `featureList` matrix of the Schema.org `WebApplication` payload.

### 3.2. The FAQ Parser
- **Trigger Heading:** Must contain `"FAQ"` or `"Frequently Asked Questions"`.
- **Formatting Lock:**
  - Every individual question **MUST** be an `###` (H3) heading.
  - The answer **MUST** immediately follow that heading as standard paragraph text.
  - Do NOT split your answers with nested subheadings.

### 3.3. The "How To" Parser
- **Trigger Heading:** `## How to Use` or `## How to use [Tool Name]`.
- **Formatting Lock:**
  - Must be a numbered list (`1.`, `2.`).
  - Separator logic supports colons (`:`) or hyphens (`-`).
  - (e.g. `1. **Input**: Type your text here.`)

### 3.4. KaTeX Mathematical Formulas
If `hasMath: true` is active in the tools or blog frontmatter:
- **Use Double Dollars (`$$`)**: Mathematical formulas should reside inside double dollars `$$F = ma$$`.
- **Single Dollar Disabled**: We intentionally configured `singleDollarText: false` across the Astro build so writing values like `$200 per week` does not break the renderer.
- **Block Layouts**: When requiring multi-line calculus, use:
  ```markdown
  $$
  \begin{aligned}
    M &= P \cdot \frac{r(1+r)^n}{(1+r)^n - 1} \\
    r &= \frac{\text{Annual Rate}}{12}
  \end{aligned}
  $$
  ```

---

## 4. Master Content Writing Template

To guarantee immediate AdSense/SEO minimum validation metrics (500+ minimum words, appropriate headings), copy this template when creating a new page:

```markdown
---
title: "[Exact Name] Calculator"
seoTitle: "Best [Exact Name] Calculator [month_year]"
description: "[Action-oriented verb] [What it does]. [1-2 sentences explaining core value]."
shortDescription: "[Verb] [what the tool does in plain English]"
category: "[Category]"
icon: "[LucideIconName]"
tags: ["tag-1", "tag-2"]
# publishedAt and updatedAt are auto-resolved from Git — only set them to
# override or "lock" a date (e.g. when the commit date doesn't reflect real content work).
# publishedAt: "2026-01-15"
# updatedAt: "2026-03-22"
---

## What is a [Tool Concept]?
A [Tool Concept] is a [clear, factual definition in 30-80 words].
[Add 1-2 additional context paragraphs conceptually.]

## How to Use This Tool
1. **[Step 1 Input]:** Enter your baseline data.
2. **[Step 2 Select]:** Identify parameter limits.
3. **[Step 3 Compute]:** Wait for the automatic results output.

## Essential Features
- Lightweight & private (client-side processing)
- Instantly exportable PDF results
- Generates amortization schedules

## Mathematical Logic Behind It
The underlying formula processing this data runs efficiently below the hood:
$$ M = P \frac{r(1+r)^n}{(1+r)^n - 1} $$

## Frequently Asked Questions (FAQ)

### What defines a good benchmark?
Historically, anything averaging above 8% indicates excellent compounding returns trajectory according to modern indexes.

### Do data-sets leave my device?
No, the application runs via localized JavaScript meaning inputs are completely private and never transmitted over network protocols.
```
