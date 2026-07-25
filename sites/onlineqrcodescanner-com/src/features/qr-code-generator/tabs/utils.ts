/**
 * Smartly formats and validates a URL.
 * Automatically prepends 'https://' if missing when domain pattern is detected.
 */
export function formatUrl(input: string): string {
  let cleaned = input.trim();
  if (!cleaned || cleaned === 'http://' || cleaned === 'https://') return '';

  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }

  try {
    const url = new URL(cleaned);
    if (url.hostname && url.hostname.includes('.')) {
      return url.toString();
    }
  } catch {
    // Return original if invalid URL, caller can check validity
  }

  return cleaned;
}

/**
 * Smartly builds a social media URL.
 * If the user pastes a full URL or domain, it returns the formatted URL.
 * Otherwise, it treats the input as a username/handle and appends it to the base URL.
 */
export function buildSocialUrl(input: string, baseUrl: string): string {
  let cleaned = input.trim();
  if (!cleaned) return '';

  if (baseUrl && !baseUrl.startsWith('http')) {
    baseUrl = `https://${baseUrl}`;
  }

  // If input is already a full link or contains a domain
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://') || cleaned.includes('.')) {
    return formatUrl(cleaned);
  }

  // Handle usernames with leading @
  if (cleaned.startsWith('@')) {
    cleaned = cleaned.substring(1).trim();
  }

  if (!cleaned) return '';

  const separator = baseUrl.endsWith('/') || baseUrl.endsWith('=') ? '' : '/';
  return `${baseUrl}${separator}${encodeURIComponent(cleaned)}`;
}

/**
 * Validates whether a URL string is valid.
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
