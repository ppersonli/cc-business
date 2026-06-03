import { generateToolMetadata } from '@/lib/metadata'
import ToolClient from './client'

export const metadata = generateToolMetadata('json-to-go')

export default function ToolPage() {
  return <ToolClient />
}
