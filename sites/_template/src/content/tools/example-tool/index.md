---
title: "Example Tool"
seoTitle: "Best Example [month_year]"
description: "A comprehensive example tool demonstrating all available frontmatter features, options, and layouts in the Astro application."
shortDescription: "A example tool to test options and layouts of the app"
category: "General"
tags: ["utility", "text"]
icon: "Wrench"
publishedAt: "2026-02-08T08:00:00"
updatedAt: 2026-02-15T14:24:33
author: example-author
coAuthors: ["example-author-2", "example-author-3"]
# widgetSlug: "example-tool-widget"
canonical: "/tools/example-tool"
toc: true
hasMath: true
isDraft: true
fullWidth: true
featured: true
order: 99
loadPriority: "visible"
---

## All Markdown Syntax is supported

Astro uses **GitHub Flavored Markdown (GFM)** as its standard, which is incredibly versatile for building modern, content-rich websites. Whether you are using `.md` or `.mdx` files, you have a full suite of formatting tools at your disposal.

Here is a comprehensive guide (and demonstration) of the markdown features available in Astro.

---

## 1. Text Formatting & Hierarchy

Headings are the backbone of your content structure. In Astro, these are automatically converted into HTML `<h1>` through `<h6>` tags.

# H1: The Page Title

## H2: Major Sections

### H3: Sub-sections

#### H4: Minor details

You can also apply standard emphasis:

* **Bold text** for impact.
* *Italicized text* for emphasis.
* ~~Strikethrough~~ for corrections.
* ***Combined emphasis*** for when you're feeling fancy.

---

## 2. Lists and Organization

### Unordered Lists

* Astro is fast.
* Astro is flexible.
* It supports React, Vue, and Svelte.
* It supports Markdown out of the box.



### Ordered Lists

1. Write your content.
2. Add some frontmatter metadata.
3. Deploy to the web.

### Task Lists

* [x] Integrate Markdown
* [x] Style with CSS
* [ ] Add interactive components

---

## 3. Structural Elements

### Blockquotes

Sometimes you need to highlight a specific piece of wisdom:

> "Astro builds fast websites, faster." — The Astro Docs

> [!IMPORTANT]
> Crucial information necessary for users to succeed.


### Horizontal Rules

To separate different themes or sections visually:

---

### Tables

Organizing data is straightforward with GFM tables.

| Feature | Support | Performance |
| --- | --- | --- |
| Markdown | Native | Ultra Fast |
| MDX | Plugin | Fast |
| Images | Optimized | High |

---

## 4. Technical Content

### Code Blocks

Astro includes built-in syntax highlighting (often via Shiki or Prism).

```js
// An example of a basic Astro component script
const name = "Astro User";
console.log(`Hello, ${name}!`);

```

You can also use **inline code** `const astro = true;` to reference variables within a sentence.

### Mathematical Expressions

If you have enabled LaTeX support (usually via `remark-math` and `rehype-katex`), you can render complex formulas:

When gravity is a factor, we use:


$$F = G \frac{m_1 m_2}{r^2}$$

---

## 5. Media and Links

### Links

You can create [standard hyperlinks](https://www.google.com/search?q=https://astro.build) or use [Relative Links](https://www.google.com/search?q=./about) to navigate between pages in your project.

### Images

Astro's Markdown allows for standard image syntax. If you use the `@astrojs/image` integration, these can be automatically optimized.

---

## 6. Advanced GFM Features

### Footnotes

You can add references to the bottom of your page easily.
Here is a simple footnote[^1].

### Autolinks

URLs like https://google.com are automatically turned into clickable links without extra syntax.

---
## Formulas
**Rendered using KaTeX**

Our platform supports high-fidelity math rendering alongside standard currency formatting. Because we regularly write about finance (budget increase from $100 per month up to a more significant investment of $200 per week), standard single-dollar math is disabled to prevent formatting errors.

Here is how formulas are rendered across the site:

### 1. Inline Formulas
To write variables seamlessly inside a sentence, use the escaped parenthesis syntax `\( ... \)` or `$$ ... $$`.

**This is inline formula** Even formula is wrtten on second line but it is attach to this line in final rendering:
$$ M = P \frac{r(1+r)^n}{(1+r)^n - 1} $$

**This is seprate block formula** If we add gap of one line between any paragraph and formula then it will be rendered as separate block (left aligned):

$$ M = P \frac{r(1+r)^n}{(1+r)^n - 1} $$

For example, the monthly payment $$M$$ (`$$..$$`) is calculated using the principal amount $$ P $$ (`$$ .. $$`), the monthly interest rate \( r \) (`\(...\)`), and the total number of months **n** (`**...**`).

*(Note: Using double dollars like `$$M$$` inline will render the character in "display" style—making it larger—but will keep it attached to the text line. and syntex `\( \)` is not also working).*
*(Note: Using single doller `$..$` is feature of KaTeX but it is not working here, because we disabled it by `singleDollarMath: false` in `astro.config.ts` so now it is reserved for currency values ).*

### 2. Centered Block Formulas
If you use double dollars `$$` right after a paragraph, it often stays attached to the text and fails to center. To guarantee a beautifully centered, standalone formula, use a dedicated `math` code block:

```math
M = P \frac{r(1+r)^n}{(1+r)^n - 1}
```

### 3. Multi-Line Aligned Blocks
For complex formulas that require multiple steps or variable definitions on separate lines, use the `\begin{aligned}` environment wrapped in double dollars:

$$
\begin{aligned}
  M &= P \cdot \frac{r(1+r)^n}{(1+r)^n - 1} \\
  r &= \frac{\text{Annual Rate}}{12}
\end{aligned}
$$

**Multi-line block**: By math (Not Work)

```math
  M &= P \cdot \frac{r(1+r)^n}{(1+r)^n - 1} \\
  r &= \frac{\text{Annual Rate}}{12}
```

---
