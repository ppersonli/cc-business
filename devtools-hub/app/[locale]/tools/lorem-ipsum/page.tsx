import { generateToolMetadata, generateToolJsonLd } from '@/lib/metadata'
import ToolClient from './client'
import JsonLd from '@/components/JsonLd'

export const metadata = generateToolMetadata('lorem-ipsum')

export default function ToolPage() {
  const jsonLd = generateToolJsonLd('lorem-ipsum')
  return (
    <>
      <JsonLd data={jsonLd} />
      <ToolClient />
    </>
  )
}
