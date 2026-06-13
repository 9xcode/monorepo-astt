#!/usr/bin/env node
/**
 * validate-authors.js
 *
 * Pre-build script that checks every author slug referenced in content
 * frontmatter and site configs actually exists in src/content/authors/.
 *
 * Catches:
 *   - Typos in `author:` or `coAuthors:` frontmatter (blog + tools)
 *   - Duplicate slugs inside a single file's coAuthors list
 *   - author slug that is also in coAuthors (would render twice)
 *   - defaultAuthorSlug in src/config.ts pointing to a non-existent author
 *
 * Usage:
 *   node scripts/validate-authors.js
 *   node scripts/validate-authors.js --site finance-tools   # check one site only
 *
 * Exit codes:
 *   0 — all slugs valid
 *   1 — one or more errors found (build should not proceed)
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Paths ─────────────────────────────────────────────────────────────────────

const __dirname  = fileURLToPath(new URL('.', import.meta.url));
const ROOT       = join(__dirname, '..');
const SITES_DIR  = join(ROOT, 'sites');

// ── CLI args ─────────────────────────────────────────────────────────────────

const args         = process.argv.slice(2);
const siteFilter   = args.includes('--site') ? args[args.indexOf('--site') + 1] : null;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Read a file as text, return empty string on error */
function readFile(path) {
  try { return readFileSync(path, 'utf-8'); } catch { return ''; }
}

/**
 * List direct child directory names inside a given path.
 * These are the valid author slugs (each author lives in its own folder).
 * Also accepts a flat .md at the root level (e.g. abhishek.md → slug "abhishek").
 */
function getAuthorSlugs(authorsDir) {
  if (!existsSync(authorsDir)) return new Set();
  const entries = readdirSync(authorsDir, { withFileTypes: true });
  const slugs = new Set();
  for (const entry of entries) {
    if (entry.isDirectory()) {
      slugs.add(entry.name);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      slugs.add(entry.name.replace(/\.md$/, ''));
    }
  }
  return slugs;
}

/**
 * Walk a directory recursively and return all .md file paths.
 */
function findMarkdownFiles(dir) {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findMarkdownFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.md')) results.push(full);
  }
  return results;
}

/**
 * Extract the YAML frontmatter block from a markdown file.
 * Returns the raw YAML string between the --- delimiters.
 */
function extractFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : '';
}

/**
 * Parse a single YAML value from frontmatter text.
 * Handles:
 *   author: slug-name
 *   author: "slug-name"
 */
function parseAuthorField(frontmatter) {
  const match = frontmatter.match(/^author:\s*["']?([a-z0-9_-]+)["']?\s*$/m);
  return match ? match[1].trim() : null;
}

/**
 * Parse the coAuthors array from frontmatter text.
 * Handles both inline: coAuthors: ["a", "b"] and block list styles.
 */
function parseCoAuthorsField(frontmatter) {
  // Inline array: coAuthors: ["slug-a", "slug-b", "slug-c"]
  const inlineMatch = frontmatter.match(/^coAuthors:\s*\[([^\]]*)\]/m);
  if (inlineMatch) {
    const raw = inlineMatch[1];
    if (!raw.trim()) return [];
    return raw
      .split(',')
      .map(s => s.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }

  // Block list style:
  //   coAuthors:
  //     - slug-a
  //     - slug-b
  const blockMatch = frontmatter.match(/^coAuthors:\s*\n((?:\s+-\s+\S+\s*\n?)+)/m);
  if (blockMatch) {
    return blockMatch[1]
      .split('\n')
      .map(line => line.replace(/^\s+-\s+/, '').trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }

  return [];
}

/**
 * Extract defaultAuthorSlug from a site's config.ts.
 * Uses a regex — no TypeScript execution needed.
 */
function parseDefaultAuthorSlug(configPath) {
  const content = readFile(configPath);
  const match = content.match(/defaultAuthorSlug:\s*["']([^"']+)["']/);
  return match ? match[1] : null;
}

// ── Core validation ───────────────────────────────────────────────────────────

let totalErrors = 0;

function error(msg) {
  console.error(`  ✗ ${msg}`);
  totalErrors++;
}

function validateSite(siteName) {
  const siteDir    = join(SITES_DIR, siteName);
  const authorsDir = join(siteDir, 'src', 'content', 'authors');
  const configPath = join(siteDir, 'src', 'config.ts');

  const validSlugs = getAuthorSlugs(authorsDir);

  // Skip template placeholders
  if (validSlugs.size === 0 && !existsSync(authorsDir)) {
    console.log(`  ℹ  No authors directory found — skipping\n`);
    return;
  }

  let siteErrors = 0;

  // 1. Validate defaultAuthorSlug from config.ts
  if (existsSync(configPath)) {
    const defaultSlug = parseDefaultAuthorSlug(configPath);
    if (defaultSlug) {
      if (defaultSlug === 'PLACEHOLDER_AUTHOR_SLUG') {
        // template site — warn but don't error
        console.log(`  ⚠  defaultAuthorSlug is still the placeholder value in config.ts — update before going live`);
      } else if (!validSlugs.has(defaultSlug)) {
        error(
          `config.ts: defaultAuthorSlug "${defaultSlug}" has no matching author directory.\n` +
          `     Create src/content/authors/${defaultSlug}/ with an index.md to fix this.`
        );
        siteErrors++;
      } else {
        console.log(`  ✓  defaultAuthorSlug "${defaultSlug}" — valid`);
      }
    }
  }

  // 2. Scan blog and tools content files
  const collectionsToCheck = ['blog', 'tools'];

  for (const collection of collectionsToCheck) {
    const contentDir = join(siteDir, 'src', 'content', collection);
    const mdFiles    = findMarkdownFiles(contentDir);

    for (const filePath of mdFiles) {
      const rel         = relative(ROOT, filePath);
      const content     = readFile(filePath);
      const frontmatter = extractFrontmatter(content);
      if (!frontmatter) continue;

      const authorSlug    = parseAuthorField(frontmatter);
      const coAuthorSlugs = parseCoAuthorsField(frontmatter);

      // Check primary author
      if (authorSlug && !validSlugs.has(authorSlug)) {
        error(
          `${rel}\n` +
          `     author: "${authorSlug}" — not found in src/content/authors/.\n` +
          `     Valid slugs: ${[...validSlugs].sort().join(', ') || '(none)'}`
        );
        siteErrors++;
      }

      // Check co-authors
      const seenInThisFile = new Set();
      if (authorSlug) seenInThisFile.add(authorSlug);

      for (const coSlug of coAuthorSlugs) {
        if (!validSlugs.has(coSlug)) {
          error(
            `${rel}\n` +
            `     coAuthors: "${coSlug}" — not found in src/content/authors/.\n` +
            `     Valid slugs: ${[...validSlugs].sort().join(', ') || '(none)'}`
          );
          siteErrors++;
        } else if (seenInThisFile.has(coSlug)) {
          error(
            `${rel}\n` +
            `     coAuthors: "${coSlug}" — duplicate slug. ` +
            `This author is already listed as primary or earlier co-author.`
          );
          siteErrors++;
        } else {
          seenInThisFile.add(coSlug);
        }
      }
    }
  }

  if (siteErrors === 0) {
    console.log(`  ✓  All author references valid`);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════');
console.log('  Author Slug Validator');
console.log('══════════════════════════════════════════════\n');

const allSites = readdirSync(SITES_DIR, { withFileTypes: true })
  .filter(e => e.isDirectory() && !e.name.startsWith('.'))
  .map(e => e.name);

const sitesToCheck = siteFilter
  ? allSites.filter(s => s === siteFilter)
  : allSites;

if (siteFilter && sitesToCheck.length === 0) {
  console.error(`Error: site "${siteFilter}" not found in sites/`);
  process.exit(1);
}

for (const site of sitesToCheck) {
  console.log(`─── ${site} ───────────────────────────────────`);
  validateSite(site);
  console.log('');
}

console.log('══════════════════════════════════════════════');

if (totalErrors > 0) {
  console.error(`\n✗ ${totalErrors} error${totalErrors > 1 ? 's' : ''} found. Fix them before building.\n`);
  process.exit(1);
} else {
  console.log('\n✓ All author slugs are valid.\n');
  process.exit(0);
}
