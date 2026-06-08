import { generateToolMetadata, generateToolJsonLd } from '@/lib/metadata'
import ToolClient from './client'
import JsonLd from '@/components/JsonLd'

export const metadata = generateToolMetadata('password-generator')

export default function ToolPage() {
  const jsonLd = generateToolJsonLd('password-generator')
  return (
    <>
      <JsonLd data={jsonLd} />
      <ToolClient />
    </>
  )
}
