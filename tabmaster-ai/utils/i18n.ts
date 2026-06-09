/**
 * i18n helper for TabMaster AI.
 * Wraps chrome.i18n.getMessage() with a fallback for dev/test environments.
 */

/**
 * Get a translated message by key, with optional substitution parameters.
 * Uses Chrome's built-in i18n API; falls back to the key itself when
 * chrome.i18n is unavailable (e.g. during unit tests or dev server).
 */
export function t(key: string, ...subs: string[]): string {
  if (typeof chrome !== 'undefined' && chrome.i18n) {
    return chrome.i18n.getMessage(key, subs.length > 0 ? subs : undefined) || key;
  }
  // Dev/test fallback — return key as-is
  return key;
}

/**
 * Map from TabCategory keys to their i18n message keys.
 */
export const CATEGORY_I18N_KEYS: Record<string, string> = {
  work: 'catWork',
  research: 'catResearch',
  social: 'catSocial',
  shopping: 'catShopping',
  entertainment: 'catEntertainment',
  news: 'catNews',
  other: 'catOther',
};
