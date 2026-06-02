import { generateToolMetadata } from '@/lib/metadata'
import ToolClient from './client'

export const metadata = generateToolMetadata('word-counter')

export default function ToolPage() {
  return <ToolClient />
}
