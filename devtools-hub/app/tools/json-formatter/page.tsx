import { generateToolMetadata } from '@/lib/metadata'
import ToolClient from './client'

export const metadata = generateToolMetadata('json-formatter')

export default function ToolPage() {
  return <ToolClient />
}
