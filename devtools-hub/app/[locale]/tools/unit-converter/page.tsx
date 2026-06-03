import { generateToolMetadata } from '@/lib/metadata'
import ToolClient from './client'

export const metadata = generateToolMetadata('unit-converter')

export default function ToolPage() {
  return <ToolClient />
}
