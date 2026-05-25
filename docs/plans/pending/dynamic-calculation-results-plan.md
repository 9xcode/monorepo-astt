What you’re noticing is actually a **very clever SEO + dynamic page strategy**, not millions of pre-written articles.

These calculator sites are not creating separate static pages for every query like
“23% of 325”, “17% of 8921”, etc.

Instead, they use **dynamic routing + URL parameters + programmatic SEO**.

Let’s break it down simply 👇

---

# 🧠 What’s really happening

When you search:

> `what is 23% of 325`

Google finds pages like:

```
/percentage-calculator/?percent=23&number=325
```

or

```
/23-percent-of-325
```

But these pages are:

✅ Not pre-written
✅ Not manually created
✅ Generated dynamically using code

---

# ⚙️ Core Idea (How they build it)

## 1. URL-based dynamic input

They extract values from URL:

### Example URL patterns:

```
/percentage-calculator/?p=23&n=325
/percentage/23-of-325
```

Then in code:

```ts
const percent = 23;
const number = 325;

const result = (percent / 100) * number;
```

---

## 2. Dynamic SEO Title + Content

They dynamically generate:

* Title
* Meta description
* H1
* Small explanation

### Example:

```
Title: What is 23% of 325? (Answer: 74.75)
H1: 23% of 325 is 74.75
```

This is **computed at runtime or build time**.

---

## 3. Pre-filled Calculator UI

When page loads:

* Input fields already filled:

  * Percent = 23
  * Number = 325
* Result auto-calculated

This gives illusion that page was made for that exact query.

---

## 4. Internal Linking (VERY IMPORTANT 🔥)

They generate tons of links like:

* 10% of 325
* 20% of 325
* 23% of 100
* 23% of 500

This creates a **crawlable network of pages**

---

## 5. Programmatic SEO (Real Secret 🚀)

They use scripts to generate combinations like:

* 1–100 (percent)
* 1–10,000 (numbers)

But they don’t always generate all pages upfront.

Instead:

### Two approaches:

#### 🅰️ On-demand generation (best for you)

Page is generated when visited.

#### 🅱️ Static generation (SSG)

Pre-build top combinations:

* 10% of 100
* 25% of 500
* etc.

---

# 🧩 How YOU can implement this (Astro based)

Since you’re using Astro → this is perfect for you.

---

## Option 1: Dynamic route (SSR style)

Create:

```
src/pages/percentage/[percent]-of-[number].astro
```

Inside:

```ts
export async function getStaticPaths() {
  return []; // fallback mode if using SSR adapter
}

const { percent, number } = Astro.params;

const p = Number(percent);
const n = Number(number);
const result = (p / 100) * n;
```

---

## Option 2: Hybrid (BEST 🔥)

Pre-generate popular pages:

```ts
export async function getStaticPaths() {
  const paths = [];

  for (let p = 1; p <= 100; p++) {
    for (let n = 1; n <= 100; n++) {
      paths.push({
        params: {
          percent: p.toString(),
          number: n.toString()
        }
      });
    }
  }

  return paths;
}
```

And handle others dynamically.

---

## 3. Dynamic SEO

```ts
const title = `What is ${p}% of ${n}? (Answer: ${result})`;
const description = `Calculate ${p}% of ${n}. The answer is ${result}.`;
```

---

## 4. Add structured data (IMPORTANT)

Use:

* FAQ schema
* HowTo schema

This helps ranking.

---

## 5. Add example links (like you noticed)

Generate:

```ts
const examples = [
  `${p}% of ${n + 10}`,
  `${p + 5}% of ${n}`,
  `${p}% of ${n * 2}`
];
```

Link them internally.

---

# 🚨 Why this works so well

Because it matches:

✅ Exact search intent
✅ Exact keyword
✅ Instant answer
✅ No fluff
✅ High CTR

Google LOVES this.

---

# 💡 Pro Tips (Most people miss this)

### 1. Don’t create infinite junk pages

Google may penalize thin content.

👉 Add:

* Explanation
* Formula
* Steps
* Examples

---

### 2. Add variations

Not just:

* “X% of Y”

Also:

* “X is what percent of Y”
* “Increase Y by X%”
* “Decrease Y by X%”

---

### 3. Fast page load (you already care about this 👍)

Use:

* minimal JS
* static HTML
* no heavy UI libs

---

# 🧠 Final Understanding

These sites are basically:

> A **single calculator engine + dynamic SEO wrapper + massive internal linking system**

NOT millions of articles.

---

If you want, I can design a **complete scalable architecture for your Astro tools site** so you can replicate this across:

* percentages
* BMI
* loan calculators
* GST calculators (very good for India traffic 🔥)

Just tell me 👍
