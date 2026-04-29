<think>
The user wants to implement a rating system on their website (Astro + Svelte + TypeScript + Tailwind + shadcn). They want:

1. Users can click stars to rate
2. Display aggregated rating (total votes + average rating)
3. Currently no backend/database

They're asking for:
1. Best minimal + efficient way to implement this
2. Possible solutions
3. Best free database options
4. Future scalability (user subscriptions, email)

Let me provide a comprehensive answer with different approaches and a recommendation.

## Approaches:

### 1. **Serverless/Edge Functions + Free Database (Recommended)**


I'll pair serverless functions through Vercel or Cloudflare with a free database like PlanetScale, Turso, or Supabase.

### 2. **Third-party Rating Services**
There are services likeIEWS and others that handle ratings, though many require payment.

### 3. **Firebase Firestore**
A solid free tier option that's straightforward to set up.

### 4. **JSON File in Git (Very Minimal but Limited)**
Not ideal since you'd lose track of who voted and risk duplicates.

### 5. **External API (like Cusdis, etc.)**
Some platforms offer simple rating APIs, though they may have limitations.

For free databases, PlanetScale offers a MySQL-compatible serverless option with a free tier, Turso uses SQLite at the edge with generous limits, Supabase provides PostgreSQL with a free tier, and Neon offers serverless PostgreSQL also with free options. I'm leaning toward Turso since it's SQLite-based, fast, and has a free tier that should work well for this use case.

Since they're using Astro, I can leverage Astro's API routes for the backend. I'll go with Astro API routes plus Turso as the database, which gives them a solid full-stack solution without needing a separate backend.
</think># Implementing an Aggregated Rating System (No Backend → Scalable)

## Quick Overview of Your Options

| Approach | Complexity | Cost | Scalability |
|----------|-----------|------|-------------|
| **Astro API Routes + Turso (SQLite)** | ⭐ Medium | Free tier | Excellent |
| **Astro API Routes + Supabase** | ⭐ Medium | Free tier | Excellent |
| **Firebase Firestore** | ⭐ Easy | Free tier | Good |
| **Third-party (e.g., RapidAPI)** | ⭐ Easy | Free/Paid | Limited |
| **Client-side only (localStorage)** | ⭐ Easy | Free | ❌ Poor |

---

## ✅ Best Recommendation: Astro API Routes + Turso (libSQL)

**Why Turso?**
- Free tier: **500 databases, 9 GB storage, 25 million row reads/month**
- SQLite-based → blazing fast, single-file simplicity
- Edge-first → low latency globally
- Perfect fit for your stack (Astro already supports API routes)

---

## Step-by-Step Implementation

### 1. Install Dependencies

```bash
npm install @libsql/client
```

### 2. Database Schema (Turso)

```sql
CREATE TABLE ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT NOT NULL,          -- e.g., "homepage", "product-123"
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- For future: users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Database Client (`src/lib/db.ts`)

```typescript
import { createClient } from "@libsql/client";

export const db = createClient({
  url: import.meta.env.TURSO_DATABASE_URL,
  authToken: import.meta.env.TURSO_AUTH_TOKEN,
});
```

### 4. API Route — Get Rating (`src/pages/api/ratings/[itemId].ts`)

```typescript
import type { APIRoute } from "astro";
import { db } from "../../../lib/db";

export const GET: APIRoute = async ({ params }) => {
  const { itemId } = params;

  const result = await db.execute({
    sql: `
      SELECT 
        COUNT(*) as total_votes,
        ROUND(AVG(score), 1) as average_rating
      FROM ratings 
      WHERE item_id = ?
    `,
    args: [itemId],
  });

  const { total_votes, average_rating } = result.rows[0];

  return new Response(
    JSON.stringify({
      itemId,
      totalVotes: Number(total_votes),
      averageRating: Number(average_rating) || 0,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};
```

### 5. API Route — Submit Rating (`src/pages/api/ratings/index.ts`)

```typescript
import type { APIRoute } from "astro";
import { db } from "../../../lib/db";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { itemId, score } = body;

  // Validation
  if (!itemId || !score || score < 1 || score > 5) {
    return new Response(JSON.stringify({ error: "Invalid input" }), {
      status: 400,
    });
  }

  // Optional: Rate-limit by IP or cookie to prevent spam
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  // Check if already voted (simple dedup)
  const existing = await db.execute({
    sql: "SELECT id FROM ratings WHERE item_id = ? AND ip_hash = ?",
    args: [itemId, ip],
  });

  if (existing.rows.length > 0) {
    return new Response(JSON.stringify({ error: "Already voted" }), {
      status: 429,
    });
  }

  await db.execute({
    sql: "INSERT INTO ratings (item_id, score, ip_hash) VALUES (?, ?, ?)",
    args: [itemId, score, ip],
  });

  // Fetch updated aggregate
  const updated = await db.execute({
    sql: `
      SELECT COUNT(*) as total_votes, ROUND(AVG(score), 1) as average_rating
      FROM ratings WHERE item_id = ?
    `,
    args: [itemId],
  });

  return new Response(
    JSON.stringify({
      success: true,
      totalVotes: Number(updated.rows[0].total_votes),
      averageRating: Number(updated.rows[0].average_rating),
    })
  );
};
```

### 6. Svelte Rating Component (`src/components/StarRating.svelte`)

```svelte
<script lang="ts">
  import { onMount } from "svelte";

  export let itemId: string;

  let hoverScore = 0;
  let selectedScore = 0;
  let averageRating = 0;
  let totalVotes = 0;
  let hasVoted = false;
  let loading = true;

  onMount(async () => {
    const res = await fetch(`/api/ratings/${itemId}`);
    const data = await res.json();
    averageRating = data.averageRating;
    totalVotes = data.totalVotes;
    loading = false;

    // Check if user already voted (localStorage fallback)
    hasVoted = localStorage.getItem(`voted_${itemId}`) !== null;
  });

  async function submitRating(score: number) {
    if (hasVoted) return;

    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, score }),
    });

    if (res.ok) {
      const data = await res.json();
      averageRating = data.averageRating;
      totalVotes = data.totalVotes;
      hasVoted = true;
      selectedScore = score;
      localStorage.setItem(`voted_${itemId}`, String(score));
    }
  }

  function getStarClass(star: number, rating: number): string {
    const current = hoverScore || selectedScore || rating;
    if (star <= Math.floor(current)) return "fill-yellow-400 text-yellow-400";
    if (star - 0.5 <= current) return "fill-yellow-400/50 text-yellow-400";
    return "fill-transparent text-gray-300";
  }
</script>

<div class="flex items-center gap-3">
  <!-- Stars -->
  <div class="flex">
    {#each [1, 2, 3, 4, 5] as star}
      <button
        class="cursor-pointer transition-transform hover:scale-110
               {hasVoted ? 'pointer-events-none' : ''}"
        on:mouseenter={() => !hasVoted && (hoverScore = star)}
        on:mouseleave={() => (hoverScore = 0)}
        on:click={() => submitRating(star)}
      >
        <svg
          class="w-6 h-6 transition-colors {getStarClass(star, averageRating)}"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
          />
        </svg>
      </button>
    {/each}
  </div>

  <!-- Aggregate Display -->
  {#if !loading}
    <span class="text-sm font-semibold text-blue-400">
      {averageRating.toFixed(1)}
    </span>
    <span class="text-sm text-gray-400">
      ({totalVotes.toLocaleString()} votes)
    </span>
  {/if}
</div>
```

### 7. Use It Anywhere in Astro

```astro
---
import StarRating from "../components/StarRating.svelte";
---

<StarRating itemId="homepage" client:load />
```

### 8. Environment Variables (`.env`)

```env
TURSO_DATABASE_URL=file:local.db        # For local dev
# TURSO_DATABASE_URL=libsql://your-db.turso.io  # For production
# TURSO_AUTH_TOKEN=your-token-here
```

---

## Free Database Comparison for Your Use Case

```
┌─────────────────┬────────────┬────────────┬────────────┐
│   Database      │ Free Tier  │ Complexity │ Best For   │
├─────────────────┼────────────┼────────────┼────────────┤
│ Turso (libSQL)  │ 500 DBs,   │ ⭐ Easy    │ Your case! │
│                 │ 9GB, 25M   │            │            │
│                 │ reads/mo   │            │            │
├─────────────────┼────────────┼────────────┼────────────┤
│ Supabase        │ 500MB,     │ Medium     │ Full auth  │
│ (Postgres)      │ 50k rows   │            │ + realtime │
├─────────────────┼────────────┼────────────┼────────────┤
│ Neon            │ 512MB,     │ Medium     │ Postgres   │
│ (Postgres)      │ 191 compute│            │ fans       │
├─────────────────┼────────────┼────────────┼────────────┤
│ PlanetScale     │ ❌ Removed  │ -          │ No longer  │
│                 │ free tier  │            │ free       │
├─────────────────┼────────────┼────────────┼────────────┤
│ Cloudflare D1   │ 5GB,       │ Medium     │ If on CF   │
│ (SQLite)        │ 5M reads/d │            │ Workers    │
└─────────────────┴────────────┴────────────┴────────────┘
```

**Winner → Turso**: free tier is the most generous, SQLite is zero-config, edge-replicated, and perfect for your use case.

---

## Architecture Summary

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Svelte     │────▶│  Astro API Route │────▶│   Turso     │
│  StarRating  │     │  /api/ratings/*  │     │  (libSQL)   │
│  Component   │◀────│                  │◀────│             │
└──────────────┘     └──────────────────┘     └─────────────┘
     │                                              │
     │ localStorage (spam prevention)               │
     └──────────────────────────────────────────────┘
```

---

## Future-Proofing: Adding User Subscriptions

When you're ready, just add a `users` table to the **same Turso database**:

```sql
ALTER TABLE ratings ADD COLUMN user_id TEXT;
ALTER TABLE users ADD COLUMN subscription_tier TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN subscription_expiry DATETIME;
```

No migration headaches — it's just SQLite. You can even embed [Drizzle ORM](https://orm.drizzle.team/) or [Prisma](https://www.prisma.io/) later for type-safe queries:

```bash
npm install drizzle-orm @libsql/client
npm install -D drizzle-kit
```

---

## TL;DR — Your Action Plan

| Step | Action |
|------|--------|
| 1 | Sign up at [turso.tech](https://turso.tech) (free) |
| 2 | `npm install @libsql/client` |
| 3 | Create the `ratings` table |
| 4 | Add API routes in `src/pages/api/ratings/` |
| 5 | Drop `StarRating.svelte` in your components |
| 6 | Deploy to Vercel/Netlify (env vars in dashboard) |
| 7 | Later: add `users` table for subscriptions |

This gets you a **production-grade, free, scalable** rating system with ~50 lines of backend code and one Svelte component. 🚀