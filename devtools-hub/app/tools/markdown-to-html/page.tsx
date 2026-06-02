import { generateToolMetadata } from '@/lib/metadata'
import ToolClient from './client'

export const metadata = generateToolMetadata('markdown-to-html')

export default function ToolPage() {
  return <ToolClient />
}
