import { generateToolMetadata } from '@/lib/metadata'
import ToolClient from './client'

export const metadata = generateToolMetadata('base64')

export default function ToolPage() {
  return <ToolClient />
}
