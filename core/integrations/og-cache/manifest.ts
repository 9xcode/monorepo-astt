import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface ManifestEntry {
  hash: string;
  version: string;
  locale: string | null;
}

export type Manifest = Record<string, ManifestEntry>;

/**
 * Returns the absolute path to the root manifest file.
 * Storing this outside of `/public` prevents accidental public exposure of build hashes.
 */
export function getManifestPath(): string {
  return path.resolve(process.cwd(), '.og-manifest.json');
}

/** Loads the manifest from disk if it exists, otherwise returns an empty manifest */
export function loadManifest(): Manifest {
  const manifestPath = getManifestPath();
  if (fs.existsSync(manifestPath)) {
    try {
      return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

/** Saves the generated manifest back to disk */
export function saveManifest(manifest: Manifest): void {
  const manifestPath = getManifestPath();
  if (!fs.existsSync(path.dirname(manifestPath))) {
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
}

export function getHash(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex');
}
