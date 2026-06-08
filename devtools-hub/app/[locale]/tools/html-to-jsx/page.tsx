import { generateToolMetadata } from '@/lib/metadata'
import ToolClient from './client'

export const metadata = generateToolMetadata('html-to-jsx')

export default function ToolPage() {
  return <ToolClient />
}
