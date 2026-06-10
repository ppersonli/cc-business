export const PLATFORM_LIMITS: Record<string, { maxChars: number; name: string; icon: string }> = {
  twitter: { maxChars: 280, name: 'Twitter/X', icon: 'twitter' },
  linkedin: { maxChars: 3000, name: 'LinkedIn', icon: 'linkedin' },
  facebook: { maxChars: 63206, name: 'Facebook', icon: 'facebook' },
  instagram: { maxChars: 2200, name: 'Instagram', icon: 'instagram' },
  bluesky: { maxChars: 300, name: 'Bluesky', icon: 'at-sign' },
};

export const ALL_PLATFORMS = Object.keys(PLATFORM_LIMITS);

export function getCharLimit(platform: string): number {
  return PLATFORM_LIMITS[platform]?.maxChars || 280;
}

export function isOverLimit(content: string, platform: string): boolean {
  return content.length > getCharLimit(platform);
}
