import { generateToolMetadata } from '@/lib/metadata'
import ToolClient from './client'

export const metadata = generateToolMetadata('css-minifier')

export default function ToolPage() {
  return <ToolClient />
}
