import type { Metadata } from 'next'
import { tools, getToolBySlug } from '@/lib/tools'

const baseUrl = 'https://tools.pixiaoli.cn'

export function generateToolMetadata(slug: string): Metadata {
  const tool = getToolBySlug(slug)
  if (!tool) return {}

  const title = `${tool.name} — Free Online Tool`
  const url = `${baseUrl}/tools/${tool.slug}/`

  return {
    title,
    description: tool.description,
    keywords: [tool.name, tool.category, 'online tool', 'free tool', 'developer tool'],
    openGraph: { title, description: tool.description, url, siteName: 'DevTools Hub', type: 'website' },
    twitter: { card: 'summary' as const, title, description: tool.description },
    alternates: { canonical: url },
  }
}
