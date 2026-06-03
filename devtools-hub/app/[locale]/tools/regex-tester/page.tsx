import { generateToolMetadata } from '@/lib/metadata'
import ToolClient from './client'

export const metadata = generateToolMetadata('regex-tester')

export default function ToolPage() {
  return <ToolClient />
}
