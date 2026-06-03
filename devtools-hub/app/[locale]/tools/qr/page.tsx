import { generateToolMetadata } from '@/lib/metadata'
import ToolClient from './client'

export const metadata = generateToolMetadata('qr')

export default function ToolPage() {
  return <ToolClient />
}
