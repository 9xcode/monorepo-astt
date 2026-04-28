import fs from 'node:fs';
import path from 'node:path';

let _manifestCache: Record<string, any> | null = null;

/**
 * Safely fetches an OG image from the static manifest registry.
 * Returns undefined if no image has been generated for this slug yet,
 * permitting robust fallback handling downstream.
 */
export function getStaticOgImage(collection: string, slug: string, locale: string | null = null): string | undefined {
  try {
    if (!_manifestCache) {
      // Use root manifest to avoid inadvertently exposing the file in Astro's output folder
      const manifestPath = path.resolve(process.cwd(), '.og-manifest.json');
      if (!fs.existsSync(manifestPath)) {
        return undefined;
      }
      const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
      _manifestCache = JSON.parse(manifestContent);
    }
    
    const manifest = _manifestCache!;
    
    let manifestKey = `${collection}/${slug}`;
    if (locale) {
        manifestKey = `${locale}/${collection}/${slug}`;
    }
    
    if (manifest[manifestKey]) {
      const hash = manifest[manifestKey].hash;
      
      let outPathParts: string[] = ['/images/og'];
      if (locale) {
        outPathParts.push(locale);
      }
      outPathParts.push(collection);
      outPathParts.push(`${slug}.png`);
      
      // We append ?v=hash to ensure social scrapers refetch if content changes
      return `${outPathParts.join('/')}?v=${hash}`;
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return undefined;
  }
}
