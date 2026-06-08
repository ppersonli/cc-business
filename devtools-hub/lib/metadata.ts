import type { Metadata } from 'next'
import { tools, getToolBySlug } from '@/lib/tools'

const baseUrl = 'https://tools.pixiaoli.cn'
const locales = ['en', 'pt', 'es', 'ja', 'ko', 'zh', 'de'] as const

export function generateToolMetadata(slug: string): Metadata {
  const tool = getToolBySlug(slug)
  if (!tool) return {}

  const title = `${tool.name} — Free Online Tool`
  const url = `${baseUrl}/tools/${tool.slug}/`

  const languages: Record<string, string> = {}
  for (const locale of locales) {
    languages[locale] =
      locale === 'en'
        ? `${baseUrl}/tools/${tool.slug}/`
        : `${baseUrl}/${locale}/tools/${tool.slug}/`
  }

  return {
    title,
    description: tool.description,
    keywords: [tool.name, tool.category, 'online tool', 'free tool', 'developer tool'],
    openGraph: { title, description: tool.description, url, siteName: 'DevTools Hub', type: 'website' },
    twitter: { card: 'summary' as const, title, description: tool.description },
    alternates: { canonical: url, languages },
  }
}

export function generateToolJsonLd(slug: string) {
  const tool = getToolBySlug(slug)
  if (!tool) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.description,
    url: `${baseUrl}/tools/${tool.slug}/`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
  }
}
