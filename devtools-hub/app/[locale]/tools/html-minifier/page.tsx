import { generateToolMetadata } from '@/lib/metadata'
import ToolClient from './client'

export const metadata = generateToolMetadata('html-minifier')

export default function ToolPage() {
  return <ToolClient />
}
