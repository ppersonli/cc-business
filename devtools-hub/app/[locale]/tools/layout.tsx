import type { Metadata } from 'next'
import { tools } from '@/lib/tools'

const baseUrl = 'https://tools.ovanime.com'

type Props = {
  params: Promise<{ slug?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  if (!slug) {
    return { title: 'All Tools', description: 'Browse all developer tools.' }
  }

  const tool = tools.find(t => t.slug === slug)

  if (!tool) {
    return { title: 'Tool Not Found', description: 'The requested tool was not found.' }
  }

  const title = `${tool.name} — Free Online Tool`
  const url = `${baseUrl}/tools/${tool.slug}/`

  return {
    title,
    description: tool.description,
    keywords: [tool.name, tool.category, 'online tool', 'free tool', 'developer tool'],
    openGraph: { title, description: tool.description, url, siteName: 'DevTools Hub', type: 'website' },
    twitter: { card: 'summary', title, description: tool.description },
    alternates: { canonical: url },
  }
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
