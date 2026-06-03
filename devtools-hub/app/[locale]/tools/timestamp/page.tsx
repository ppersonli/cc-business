import { generateToolMetadata } from '@/lib/metadata'
import ToolClient from './client'

export const metadata = generateToolMetadata('timestamp')

export default function ToolPage() {
  return <ToolClient />
}
