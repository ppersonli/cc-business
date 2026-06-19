import type { MetadataRoute } from 'next';
import { getClient } from '@/lib/db';
import { routing } from '@/i18n/routing';

const BASE_URL = 'https://scheduler.ovanime.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  const staticPages = ['', '/auth/signin'];
  for (const locale of routing.locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: page === '' ? 1 : 0.8,
      });
    }
  }

  // Dynamic booking pages (public)
  try {
    const db = getClient();
    const result = await db.execute('SELECT slug, created_at FROM booking_pages');
    for (const row of result.rows) {
      for (const locale of routing.locales) {
        entries.push({
          url: `${BASE_URL}/${locale}/book/${row.slug}`,
          lastModified: new Date(row.created_at as string),
          changeFrequency: 'daily',
          priority: 0.6,
        });
      }
    }
  } catch {
    // DB not available during build
  }

  return entries;
}
