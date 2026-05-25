// generator.ts — Content Dates Core Logic
//
// Resolves publishedAt and updatedAt for every tool and blog content file
// using a two-tier fallback:
//
//   1. Frontmatter (explicit, highest trust — author "locks" the date)
//   2. Git history  (automatic, accurate, rebuild-safe)
//      - publishedAt → first commit that added the file
//      - updatedAt   → most recent commit that touched the file
//   3. publishedAt fallback for updatedAt
//      (if file was never modified, updatedAt = publishedAt)
//
// WHY A SINGLE BATCH GIT COMMAND:
//   Per-file `git log` spawns N processes — expensive and slow.
//   One `git log --name-only` traversal parses ALL file dates in a
//   single process (~50-200ms for a repo of typical size).
//   Same approach used by documentation generators like VitePress.
//
// WHY AN INTEGRATION, NOT A REMARK PLUGIN:
//   - Remark plugins run inside the markdown pipeline (per-file, fragile).
//   - This runs once in astro:config:setup — before Vite starts.
//   - Output is a static JSON file, not an injected frontmatter field.
//   - The JSON can be consumed by sitemap, pages, layouts, and utilities
//     without coupling anything to the markdown pipeline.
//
// Called by the contentDates() Astro integration in astro:config:setup.

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
} from 'node:fs';
import { execSync } from 'node:child_process';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegrationLogger } from 'astro';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ResolvedDates {
  publishedAt: string;
  updatedAt: string;
}

export interface ContentDatesManifest {
  _meta: {
    /** Year of the newest git commit — used for copyright display. */
    copyrightYear: number;
    /** ISO timestamp of when this manifest was generated. */
    generatedAt: string;
  };
  /** Keys: "tools/<slug>" or "blog/<slug>" */
  [key: string]: ResolvedDates | { copyrightYear: number; generatedAt: string };
}

export interface GenerateResult {
  tools: number;
  blog: number;
  fromFrontmatter: number;
  fromGit: number;
  gitUnavailable: boolean;
  copyrightYear: number;
}

// ---------------------------------------------------------------------------
// Frontmatter parser
// ---------------------------------------------------------------------------

/**
 * Lightweight YAML frontmatter parser — reads only publishedAt and updatedAt.
 * Does not depend on any YAML library; matches simple scalar values only.
 * Follows the same pattern used in widget-map/generator.ts.
 */
function parseFrontmatter(mdPath: string): {
  publishedAt?: string;
  updatedAt?: string;
} {
  if (!existsSync(mdPath)) return {};
  const text = readFileSync(mdPath, 'utf-8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match || !match[1]) return {};

  const result: { publishedAt?: string; updatedAt?: string } = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w+)\s*:\s*"?([^"#\r\n]*)"?\s*$/);
    if (!kv || !kv[1] || kv[2] === undefined) continue;
    const key = kv[1].trim();
    const val = kv[2].trim();
    if (key === 'publishedAt') result.publishedAt = val;
    if (key === 'updatedAt') result.updatedAt = val;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Git history — single batch pass
// ---------------------------------------------------------------------------

interface GitFileDates {
  firstCommit?: string; // ISO date of the commit that added the file
  lastCommit?: string;  // ISO date of the most recent commit touching the file
}

/**
 * Runs ONE git log command and parses dates for all content files in a single pass.
 *
 * Output format we parse:
 *   COMMIT 2026-04-09T10:00:00+00:00
 *   src/content/tools/sip-calculator/index.md
 *   src/content/blog/my-post/index.md
 *
 *   COMMIT 2025-03-15T00:00:00+00:00
 *   src/content/tools/sip-calculator/index.md
 *
 * Since git log walks from newest → oldest:
 *   - The LAST time we see a file = its first commit (oldest)
 *   - The FIRST time we see a file = its last commit (newest)
 *
 * Returns a Map keyed by relative path from siteRoot.
 * Returns an empty Map if git is unavailable (shallow clone, no .git dir, CI issue).
 */
function getGitDates(
  siteRoot: string,
  logger: Pick<AstroIntegrationLogger, 'warn' | 'debug'>,
): Map<string, GitFileDates> {
  const result = new Map<string, GitFileDates>();

  try {
    // Check git is available and we have history
    execSync('git rev-parse --git-dir', { cwd: siteRoot, stdio: 'pipe' });
  } catch {
    logger.warn(
      '[content-dates] No git repository found. Dates will use frontmatter only. ' +
      'Run inside a git repo with full history (fetch-depth: 0 in CI).',
    );
    return result;
  }

  try {
    // Single batch command — gets all commits that touched content files.
    // --diff-filter=ACRM: Added, Copied, Renamed, Modified (excludes Deleted)
    // --name-only: list affected files per commit
    // --follow is not used here (batch mode); rename tracking is covered by ACRM filter
    const raw = execSync(
      'git log --format="COMMIT %aI" --name-only --diff-filter=ACRM -- ' +
      '"src/content/tools/*/index.md" "src/content/blog/*/index.md"',
      { cwd: siteRoot, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
    );

    let currentDate: string | undefined;

    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('COMMIT ')) {
        currentDate = trimmed.slice('COMMIT '.length).trim();
        continue;
      }

      // It's a file path
      if (!currentDate) continue;
      const relPath = trimmed; // relative to repo root (which should be siteRoot for site repos)

      const existing = result.get(relPath);
      if (!existing) {
        // First time we see this file = most recent commit (newest → oldest traversal)
        result.set(relPath, { lastCommit: currentDate, firstCommit: currentDate });
      } else {
        // Subsequent times = older commits → update firstCommit
        existing.firstCommit = currentDate;
      }
    }
  } catch (err: any) {
    logger.warn(
      `[content-dates] git log failed: ${err?.message ?? String(err)}. ` +
      'Falling back to frontmatter-only dates.',
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// Copyright year — newest commit
// ---------------------------------------------------------------------------

/**
 * Returns the year of the most recent git commit in the repo.
 * Falls back to current year if git is unavailable.
 */
function getNewestCommitYear(
  siteRoot: string,
  logger: Pick<AstroIntegrationLogger, 'warn'>,
): number {
  try {
    const raw = execSync('git log -1 --format="%aI"', {
      cwd: siteRoot,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim().replace(/^"|"$/g, '');

    if (raw) {
      const year = new Date(raw).getFullYear();
      if (!isNaN(year)) return year;
    }
  } catch {
    // intentional — falls through to default
  }

  const fallbackYear = new Date().getFullYear();
  logger.warn(
    `[content-dates] Could not read git commit year. Using ${fallbackYear} as copyright year.`,
  );
  return fallbackYear;
}

// ---------------------------------------------------------------------------
// W3C date normalizer (inline — avoids importing from src/ at integration time)
// ---------------------------------------------------------------------------

/**
 * Converts any date string to the W3C/ISO 8601 format with explicit UTC offset.
 * Output: YYYY-MM-DDThh:mm:ss+00:00
 */
function toW3CDate(d: string): string {
  try {
    let dateObj: Date;
    // Simple "YYYY-MM-DD" — treat as midnight UTC to avoid timezone shifts
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      dateObj = new Date(d + 'T00:00:00Z');
    } else {
      dateObj = new Date(d);
    }
    if (isNaN(dateObj.getTime())) return d; // return as-is if unparseable
    return dateObj.toISOString().replace(/\.\d{3}Z$/, '+00:00');
  } catch {
    return d;
  }
}

// ---------------------------------------------------------------------------
// Write-if-changed (same pattern as widget-map)
// ---------------------------------------------------------------------------

function writeIfChanged(filePath: string, content: string): boolean {
  const existing = existsSync(filePath) ? readFileSync(filePath, 'utf-8') : '';
  if (existing !== content) {
    writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

/**
 * Scans all tool and blog content files, resolves their dates via frontmatter
 * and git history, and writes `src/generated/content-dates.json`.
 *
 * @param siteRoot  Absolute path to the site root
 * @param logger    Astro integration logger
 */
export function generateContentDates(
  siteRoot: string,
  logger: Pick<AstroIntegrationLogger, 'info' | 'warn' | 'debug'>,
): GenerateResult {
  const toolsDir   = join(siteRoot, 'src', 'content', 'tools');
  const blogDir    = join(siteRoot, 'src', 'content', 'blog');
  const genDir     = join(siteRoot, 'src', 'generated');
  const outputPath = join(genDir, 'content-dates.json');

  // Ensure generated/ exists
  if (!existsSync(genDir)) mkdirSync(genDir, { recursive: true });

  // ── 1. Get git dates (single batch pass) ──────────────────────────────────
  const gitDates = getGitDates(siteRoot, logger);
  const gitUnavailable = gitDates.size === 0;

  // ── 2. Copyright year ─────────────────────────────────────────────────────
  const copyrightYear = getNewestCommitYear(siteRoot, logger);

  // ── 3. Discover content slugs ─────────────────────────────────────────────
  function getSlugs(dir: string): string[] {
    if (!existsSync(dir)) return [];
    return readdirSync(dir, { withFileTypes: true })
      .filter(d => d.isDirectory() && existsSync(join(dir, d.name, 'index.md')))
      .map(d => d.name)
      .sort();
  }

  const toolSlugs = getSlugs(toolsDir);
  const blogSlugs = getSlugs(blogDir);

  // ── 4. Resolve dates for each file ────────────────────────────────────────
  const manifest: Record<string, ResolvedDates> = {};
  let fromFrontmatter = 0;
  let fromGit = 0;

  function resolveEntry(
    collection: 'tools' | 'blog',
    slug: string,
    contentDir: string,
  ): void {
    const mdPath    = join(contentDir, slug, 'index.md');
    const fm        = parseFrontmatter(mdPath);
    // git log paths are relative to repo root — try both siteRoot-relative and bare
    const relPath   = relative(siteRoot, mdPath).replace(/\\/g, '/');
    // Also try without leading siteRoot (for repos where siteRoot IS the repo root)
    const gitEntry  = gitDates.get(relPath) ?? gitDates.get(`src/content/${collection}/${slug}/index.md`);

    // publishedAt: frontmatter → git first-commit → undefined
    let publishedAt: string | undefined;
    let publishedSource: 'frontmatter' | 'git' | undefined;

    if (fm.publishedAt) {
      publishedAt = toW3CDate(fm.publishedAt);
      publishedSource = 'frontmatter';
    } else if (gitEntry?.firstCommit) {
      publishedAt = toW3CDate(gitEntry.firstCommit);
      publishedSource = 'git';
    }

    // updatedAt: frontmatter → git last-commit → publishedAt
    let updatedAt: string | undefined;

    if (fm.updatedAt) {
      updatedAt = toW3CDate(fm.updatedAt);
    } else if (gitEntry?.lastCommit) {
      updatedAt = toW3CDate(gitEntry.lastCommit);
    } else if (publishedAt) {
      updatedAt = publishedAt;
    }

    // Track stats
    if (publishedSource === 'frontmatter') {
      fromFrontmatter++;
    } else if (publishedSource === 'git') {
      fromGit++;
    }

    // Only write to manifest if we have at least one date resolved
    if (publishedAt && updatedAt) {
      manifest[`${collection}/${slug}`] = { publishedAt, updatedAt };
    } else {
      logger.warn(
        `[content-dates] No date found for ${collection}/${slug}. ` +
        'Add publishedAt to frontmatter or ensure git history is available.',
      );
    }
  }

  for (const slug of toolSlugs) resolveEntry('tools', slug, toolsDir);
  for (const slug of blogSlugs) resolveEntry('blog', slug, blogDir);

  // ── 5. Write manifest ─────────────────────────────────────────────────────
  const output: ContentDatesManifest = {
    _meta: {
      copyrightYear,
      generatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00'),
    },
    ...manifest,
  };

  const changed = writeIfChanged(outputPath, JSON.stringify(output, null, 2) + '\n');
  logger.debug(`[content-dates] manifest ${changed ? 'updated' : 'unchanged'}: ${outputPath}`);

  return {
    tools: toolSlugs.length,
    blog: blogSlugs.length,
    fromFrontmatter,
    fromGit,
    gitUnavailable,
    copyrightYear,
  };
}

// ---------------------------------------------------------------------------
// Exported path helper (consumed by astro-config.ts for Vite alias)
// ---------------------------------------------------------------------------

/**
 * Returns the absolute path to the site's src/generated/ directory.
 * Exported so astro-config.ts can set up the @content-dates Vite alias.
 */
export function getGeneratedDir(siteRoot: URL): string {
  return fileURLToPath(new URL('src/generated/', siteRoot));
}
