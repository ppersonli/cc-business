import { generateToolMetadata } from '@/lib/metadata'
import ToolClient from './client'

export const metadata = generateToolMetadata('css-flexbox')

export default function ToolPage() {
  return <ToolClient />
}
