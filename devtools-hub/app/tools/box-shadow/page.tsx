import { generateToolMetadata } from '@/lib/metadata'
import ToolClient from './client'

export const metadata = generateToolMetadata('box-shadow')

export default function ToolPage() {
  return <ToolClient />
}
