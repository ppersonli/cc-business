import { generateToolMetadata } from '@/lib/metadata'
import ToolClient from './client'

export const metadata = generateToolMetadata('color-picker')

export default function ToolPage() {
  return <ToolClient />
}
