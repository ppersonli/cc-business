import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

const BASE_URL = 'https://socialforge.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  const pages = ['', '/pricing'];
  for (const locale of routing.locales) {
    for (const page of pages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: page === '' ? 1 : 0.8,
      });
    }
  }

  return entries;
}
