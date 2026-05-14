/**
 * Resolves the frozen build time from the environment.
 * 
 * The buildTime field is resolved at call time from process.env.BUILD_TIME
 * (set by astro.config.mjs before anything else runs) so every page in a build
 * sees the exact same frozen timestamp.
 * 
 * Falls back to PUBLIC_BUILD_TIME (client hydration) or current time (SSR edge case).
 */
export function getBuildTime(): string {
  return (typeof process !== 'undefined' && process.env['BUILD_TIME'])
    ? process.env['BUILD_TIME']!
    : (typeof import.meta !== 'undefined' && (import.meta as any).env?.PUBLIC_BUILD_TIME)
      ? (import.meta as any).env.PUBLIC_BUILD_TIME
      : new Date().toISOString().split('.')[0] + '+00:00';
}

/**
 * Safely calculates the copyright year based on the build time.
 * Prevents year drift if a build runs across midnight on New Year's Eve.
 */
export function getCopyrightYear(): number {
  return new Date(getBuildTime()).getFullYear();
}
