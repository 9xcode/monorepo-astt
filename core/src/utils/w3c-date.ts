/**
 * Normalizes any date input into a full W3C / ISO 8601 datetime string
 * with explicit timezone — the format required by both Google Rich Results
 * (JSON-LD datePublished/dateModified) and XML sitemaps (<lastmod>).
 *
 * Output format: YYYY-MM-DDThh:mm:ss+00:00
 *
 * Accepted inputs:
 *   - "2025-03-15"                    → "2025-03-15T00:00:00+00:00"
 *   - "2026-04-09T15:30:00"          → "2026-04-09T15:30:00+00:00"
 *   - "2026-04-09T15:30:00Z"         → "2026-04-09T15:30:00+00:00"
 *   - "2026-04-09T15:30:00+05:30"    → "2026-04-09T10:00:00+00:00"
 *   - Date object                     → normalized to UTC
 *   - undefined / invalid             → returns fallback
 *
 * IMPORTANT: The `fallback` parameter is no longer defaulted from siteConfig.
 * Callers that need siteConfig.buildTime must pass it explicitly as the second arg.
 * Callers that only need "a valid date" can omit it (defaults to current UTC time).
 *
 * @param d        The date to normalize (string, Date, or undefined)
 * @param fallback What to return if d is missing/invalid
 *                 (default: current UTC time in W3C format)
 */
export function formatW3CDate(
  d: string | Date | undefined,
  fallback: string = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00')
): string {
  if (!d) return fallback;

  try {
    let dateObj: Date;

    if (typeof d === 'string') {
      // Simple date "YYYY-MM-DD" — treat as midnight UTC
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        dateObj = new Date(d + 'T00:00:00Z');
      } else {
        dateObj = new Date(d);
      }
    } else {
      dateObj = d;
    }

    if (isNaN(dateObj.getTime())) return fallback;

    // Output: YYYY-MM-DDThh:mm:ss+00:00 (no milliseconds, explicit timezone)
    return dateObj.toISOString().replace(/\.\d{3}Z$/, '+00:00');
  } catch {
    return fallback;
  }
}
