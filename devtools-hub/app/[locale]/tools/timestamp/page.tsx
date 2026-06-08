import { generateToolMetadata, generateToolJsonLd } from '@/lib/metadata'
import ToolClient from './client'
import JsonLd from '@/components/JsonLd'

export const metadata = generateToolMetadata('timestamp')

export default function ToolPage() {
  const jsonLd = generateToolJsonLd('timestamp')
  return (
    <>
      <JsonLd data={jsonLd} />
      <ToolClient />
    </>
  )
}
