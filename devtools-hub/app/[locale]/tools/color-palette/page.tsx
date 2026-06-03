import { generateToolMetadata } from '@/lib/metadata'
import ToolClient from './client'

export const metadata = generateToolMetadata('color-palette')

export default function ToolPage() {
  return <ToolClient />
}
