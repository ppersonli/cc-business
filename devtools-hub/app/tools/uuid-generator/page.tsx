import { generateToolMetadata } from '@/lib/metadata'
import ToolClient from './client'

export const metadata = generateToolMetadata('uuid-generator')

export default function ToolPage() {
  return <ToolClient />
}
