import { generateToolMetadata, generateToolJsonLd } from '@/lib/metadata'
import ToolClient from './client'
import JsonLd from '@/components/JsonLd'

export const metadata = generateToolMetadata('json-schema-validator')

export default function ToolPage() {
  const jsonLd = generateToolJsonLd('json-schema-validator')
  return (
    <>
      <JsonLd data={jsonLd} />
      <ToolClient />
    </>
  )
}
