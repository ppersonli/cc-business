/**
 * Platform-specific content validation and adaptation.
 * Handles character limits, content formatting, and multi-platform publishing.
 */

export const PLATFORM_LIMITS: Record<string, { maxChars: number; name: string }> = {
  twitter: { maxChars: 280, name: 'Twitter/X' },
  linkedin: { maxChars: 3000, name: 'LinkedIn' },
  facebook: { maxChars: 63206, name: 'Facebook' },
  instagram: { maxChars: 2200, name: 'Instagram' },
  bluesky: { maxChars: 300, name: 'Bluesky' },
};

export function getCharLimit(platform: string): number {
  return PLATFORM_LIMITS[platform]?.maxChars || 280;
}

export function getCharCount(content: string): number {
  return content.length;
}

export function isOverLimit(content: string, platform: string): boolean {
  return getCharCount(content) > getCharLimit(platform);
}

export function getRemainingChars(content: string, platform: string): number {
  return getCharLimit(platform) - getCharCount(content);
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export function validatePostContent(
  content: string,
  platforms: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const plainText = stripHtml(content);

  if (!plainText.trim()) {
    return { valid: false, errors: ['Content cannot be empty'] };
  }

  for (const platform of platforms) {
    const limit = getCharLimit(platform);
    if (plainText.length > limit) {
      errors.push(
        `Content exceeds ${PLATFORM_LIMITS[platform]?.name || platform} limit of ${limit} characters (currently ${plainText.length})`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

export function adaptContentForPlatform(content: string, platform: string): string {
  const limit = getCharLimit(platform);
  const plainText = stripHtml(content);

  if (plainText.length <= limit) {
    return content;
  }

  // Truncate and add ellipsis
  return plainText.slice(0, limit - 3) + '...';
}

export function getPlatformWarnings(content: string, platforms: string[]): Record<string, string | null> {
  const warnings: Record<string, string | null> = {};
  const plainText = stripHtml(content);

  for (const platform of platforms) {
    const limit = getCharLimit(platform);
    const remaining = limit - plainText.length;

    if (remaining < 0) {
      warnings[platform] = `${Math.abs(remaining)} chars over limit`;
    } else if (remaining < 20) {
      warnings[platform] = `${remaining} chars remaining`;
    } else {
      warnings[platform] = null;
    }
  }

  return warnings;
}
