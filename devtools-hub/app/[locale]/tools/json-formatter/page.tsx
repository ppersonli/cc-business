import { generateToolMetadata, generateToolJsonLd } from '@/lib/metadata'
import ToolClient from './client'
import JsonLd from '@/components/JsonLd'

export const metadata = generateToolMetadata('json-formatter')

export default function ToolPage() {
  const jsonLd = generateToolJsonLd('json-formatter')
  return (
    <>
      <JsonLd data={jsonLd} />
      <ToolClient />
    </>
  )
}
