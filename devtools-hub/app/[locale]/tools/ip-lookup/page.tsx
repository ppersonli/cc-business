import { generateToolMetadata } from '@/lib/metadata'
import ToolClient from './client'

export const metadata = generateToolMetadata('ip-lookup')

export default function ToolPage() {
  return <ToolClient />
}
