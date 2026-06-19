/**
 * WeMD Share — Generate shareable preview links for articles.
 * Encodes content in URL hash (base64) for server-free sharing.
 */

/** Max content length for URL sharing (safe limit for most browsers) */
const MAX_URL_CONTENT = 8000;

/**
 * Encode content to a shareable URL.
 * Returns null if content is too long.
 */
export function generateShareUrl(content: string): string | null {
  if (content.length > MAX_URL_CONTENT) {
    return null;
  }

  try {
    const encoded = btoa(unescape(encodeURIComponent(content)));
    const baseUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/tools/wechat-markdown-editor`
      : 'https://tools.ovanime.com/tools/wechat-markdown-editor';
    return `${baseUrl}#share=${encoded}`;
  } catch {
    return null;
  }
}

/**
 * Decode shared content from URL hash.
 * Returns null if no shared content found.
 */
export function parseShareContent(): string | null {
  if (typeof window === 'undefined') return null;

  const hash = window.location.hash;
  if (!hash.startsWith('#share=')) return null;

  try {
    const encoded = hash.slice(7); // Remove '#share='
    return decodeURIComponent(escape(atob(encoded)));
  } catch {
    return null;
  }
}

/**
 * Copy share link to clipboard.
 */
export async function copyShareLink(content: string): Promise<boolean> {
  const url = generateShareUrl(content);
  if (!url) return false;

  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}
