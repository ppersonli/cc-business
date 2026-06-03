import { generateToolMetadata } from '@/lib/metadata'
import ToolClient from './client'

export const metadata = generateToolMetadata('hash')

export default function ToolPage() {
  return <ToolClient />
}
