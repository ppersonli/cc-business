import { generateToolMetadata } from '@/lib/metadata'
import ToolClient from './client'

export const metadata = generateToolMetadata('json-diff')

export default function ToolPage() {
  return <ToolClient />
}
