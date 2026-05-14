import type { AstroIntegration } from 'astro';
import fg from 'fast-glob';
import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import { loadManifest, saveManifest, getHash } from './manifest.ts';
import { generateOgImage } from './generator.ts';
import { runInPool } from './pool.ts';
import { toolsAdapter, blogAdapter } from './collections.ts';

export interface OGCacheConfig {
  templateVersion?: string;
  forceRegenerate?: boolean;
  locales?: string[];
  defaultLocale?: string;
  concurrency?: number;
  outputDir?: string;
  siteConfig: any; // Required inject
  collections?: {
    name: string;
    template: any;
  }[];
}

/**
 * Astro Integration for caching and generating Open Graph (OG) images at build time.
 * Hooking into `astro:build:start` prevents images from being regenerated if the source data hasn't changed,
 * massively improving SEO processing time and preserving cached URLs for social crawlers via cache-busting hashes.
 */
export function ogCache(config: OGCacheConfig): AstroIntegration {
  const {
    templateVersion = 'v1',
    forceRegenerate = false,
    locales = [],
    defaultLocale = 'en',
    concurrency = 8,
    outputDir = './public/og',
    siteConfig,
    collections = [],
  } = config;

  return {
    name: 'og-cache',
    hooks: {
      'astro:build:start': async ({ logger }) => {
        logger.info('Starting OG Image generation...');
        const startTime = performance.now();
        
        const manifest = loadManifest();
        const newManifest = { ...manifest };
        
        let generated = 0;
        let skipped = 0;
        let failed = 0;
        
        const regenerations: string[] = [];
        const tasks: any[] = [];

        if (!siteConfig) {
            logger.error(`Critical Error: siteConfig is missing from ogCache configuration. OG Image generation aborted.`);
            return;
        }

        // Hardcore mapping for adapter resolutions (simplifies module reloading)
        const ADAPTERS: Record<string, any> = {
            tools: toolsAdapter,
            blog: blogAdapter
        };

        for (const collectionDef of collections) {
          const colName = collectionDef.name;
          const templateFn = collectionDef.template;
          
          const adapterFn = ADAPTERS[colName];
          if (!adapterFn) {
            logger.warn(`No adapter found for collection: ${colName}`);
            continue;
          }

          const files = await fg(`src/content/${colName}/**/*.{md,mdx}`);
          
          for (const file of files) {
            const rawContent = fs.readFileSync(file, 'utf-8');
            const { data } = matter(rawContent);

            if (process.env.NODE_ENV === 'production' && data.isDraft) {
               continue;
            }
            
            let slug = path.basename(file).replace(/\.mdx?$/, '');
            if (slug === 'index') {
              slug = path.basename(path.dirname(file));
            }
            if (data.slug) {
                slug = data.slug;
            }
            
            // Per-image content hashing
            const stringToHash = `${data.title || ''}${data.description || ''}${data.category || ''}`;
            const hash = getHash(stringToHash);
            
            const processLocale = (locale: string | null) => {
              const adapterData = adapterFn(slug, data, locale, siteConfig);
              
              let outPathParts = [process.cwd(), outputDir];
              if (locale && locales.length > 0) {
                outPathParts.push(locale);
              }
              outPathParts.push(colName);
              outPathParts.push(`${slug}.png`);
              
              const outputPath = path.resolve(...outPathParts);
              
              let manifestKey = `${colName}/${slug}`;
              if (locale && locales.length > 0) {
                  manifestKey = `${locale}/${colName}/${slug}`;
              }
              
              const currentEntry = manifest[manifestKey];
              const fileExists = fs.existsSync(outputPath);
              
              // Check if the OG image needs to be regenerated
              const needsRegeneration = 
                forceRegenerate ||
                !fileExists ||
                !currentEntry ||
                currentEntry.hash !== hash ||
                currentEntry.version !== templateVersion;
                
              if (needsRegeneration) {
                return {
                    manifestKey,
                    hash,
                    locale,
                    outputPath,
                    adapterData,
                    templateFn
                };
              } else {
                skipped++;
                newManifest[manifestKey] = currentEntry;
                return null;
              }
            };
            
            if (locales && locales.length > 0) {
               for (const loc of locales) {
                   const t = processLocale(loc);
                   if (t) tasks.push(t);
               }
               if (defaultLocale && locales.includes(defaultLocale)) {
                   const fallbackTask = processLocale(null); 
                   if (fallbackTask) tasks.push(fallbackTask);
               }
            } else {
               const t = processLocale(null);
               if (t) tasks.push(t);
            }
          }
        }
        
        await runInPool(concurrency, tasks, async (task) => {
            try {
               await generateOgImage(task.adapterData, task.templateFn, task.outputPath);
               newManifest[task.manifestKey] = {
                   hash: task.hash,
                   version: templateVersion,
                   locale: task.locale
               };
               generated++;
               regenerations.push(task.manifestKey);
            } catch (err: any) {
               logger.error(`Failed to generate OG image for ${task.manifestKey}: ${err.message}`);
               failed++;
            }
        });
        
        saveManifest(newManifest);
        
        const durationStr = ((performance.now() - startTime) / 1000).toFixed(1);
        logger.info(`[og-cache] ${generated} generated, ${skipped} skipped, ${failed} failed — ${durationStr}s`);
        if (regenerations.length > 0) {
            logger.info(`Regenerated: ${regenerations.join(', ')}`);
        }
      }
    }
  };
}
