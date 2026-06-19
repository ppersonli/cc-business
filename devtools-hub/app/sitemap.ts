import type { MetadataRoute } from 'next'
import { tools } from '@/lib/tools'
import { locales } from '@/i18n/routing'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tools.ovanime.com'

  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    // Home page for each locale
    entries.push({
      url: `${baseUrl}/${locale}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    })

    // Tool pages for each locale
    for (const tool of tools) {
      entries.push({
        url: `${baseUrl}/${locale}/tools/${tool.slug}/`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      })
    }

    // Static pages for each locale
    entries.push({
      url: `${baseUrl}/${locale}/terms/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    })
    entries.push({
      url: `${baseUrl}/${locale}/privacy/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    })
  }

  return entries
}
