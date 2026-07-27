/**
 * Smartly formats and validates a URL.
 * Automatically prepends 'https://' if the input has no scheme.
 * Handles any protocol (http, https, viber, mailto, etc.)
 *
 * @example
 * formatUrl('example.com')    // → 'https://example.com/'
 * formatUrl('https://x.com') // → 'https://x.com/'
 * formatUrl('')               // → ''
 */
export function formatUrl(input: string): string {
  const cleaned = input.trim();
  if (!cleaned || cleaned === 'http://' || cleaned === 'https://') return '';

  const withScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/i.test(cleaned)
    ? cleaned
    : `https://${cleaned}`;

  try {
    const url = new URL(withScheme);
    if (url.hostname && url.hostname.includes('.')) {
      return url.toString();
    }
  } catch {
    // fall through — return prefixed string so caller can decide
  }

  return withScheme;
}

/**
 * Smartly builds a social media profile URL from either a username or a full URL.
 *
 * Detection rules (applied in order):
 *  1. Has a scheme (http://, https://, viber://, …)   → treat as URL
 *  2. Starts with 'www.'                               → treat as URL
 *  3. Contains '/'                                     → treat as URL
 *  4. Unless `allowDots` is true: contains '.'         → treat as URL
 *     (use allowDots for platforms like Bluesky where handles look like user.bsky.social,
 *      or Signal where usernames look like john.123)
 *  5. Contains the base platform's hostname             → treat as URL
 *  Otherwise → treat as username and append to baseUrl.
 *
 * @param input     - What the user typed (username, handle, or full URL)
 * @param baseUrl   - The platform's profile base URL (e.g. 'https://instagram.com/')
 * @param allowDots - When true, a bare dot in the input does NOT trigger URL treatment.
 *
 * @example
 * buildSocialUrl('john', 'https://instagram.com/')              // → 'https://instagram.com/john'
 * buildSocialUrl('@john', 'https://instagram.com/')             // → 'https://instagram.com/john'
 * buildSocialUrl('john.bsky.social', 'https://bsky.app/profile/', true) // → 'https://bsky.app/profile/john.bsky.social'
 * buildSocialUrl('john.123', 'https://signal.me/#p/', true)    // → 'https://signal.me/#p/john.123'
 */
export function buildSocialUrl(
  input: string,
  baseUrl: string,
  allowDots = false,
): string {
  let cleaned = input.trim();
  if (!cleaned) return '';

  // Ensure baseUrl has a scheme (supports custom schemes like viber://)
  if (baseUrl && !/^[a-zA-Z][a-zA-Z\d+\-.]*:/i.test(baseUrl)) {
    baseUrl = `https://${baseUrl}`;
  }

  // ── Detect whether the user's input is a URL or a username ─────────────────
  const hasScheme    = /^[a-zA-Z][a-zA-Z\d+\-.]*:/i.test(cleaned);
  const startsWww    = cleaned.startsWith('www.');
  const hasSlash     = cleaned.includes('/');
  const hasDot       = !allowDots && cleaned.includes('.');

  let containsHost = false;
  if (!hasScheme && !startsWww && !hasSlash && !hasDot && baseUrl.startsWith('http')) {
    try {
      const baseHost = new URL(baseUrl).hostname.replace(/^www\./, '');
      if (baseHost && cleaned.toLowerCase().includes(baseHost.toLowerCase())) {
        containsHost = true;
      }
    } catch {
      // ignore
    }
  }

  if (hasScheme || startsWww || hasSlash || hasDot || containsHost) {
    return formatUrl(cleaned);
  }

  // ── Treat as username ───────────────────────────────────────────────────────

  // Strip a leading '@' (e.g. '@john' → 'john')
  if (cleaned.startsWith('@')) {
    cleaned = cleaned.substring(1).trim();
  }

  if (!cleaned) return '';

  // No extra separator if the baseUrl already ends with /, =, ~, @, or #
  const separator = /[/=~@#]$/.test(baseUrl) ? '' : '/';

  return `${baseUrl}${separator}${encodeURIComponent(cleaned)}`;
}

/**
 * Validates whether a string is a well-formed URL with a dot in the hostname.
 */
export function isValidUrl(input: string): boolean {
  const formatted = formatUrl(input);
  if (!formatted) return false;
  try {
    const parsed = new URL(formatted);
    return Boolean(parsed.hostname && parsed.hostname.includes('.'));
  } catch {
    return false;
  }
}
