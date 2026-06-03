import { generateToolMetadata } from '@/lib/metadata'
import ToolClient from './client'

export const metadata = generateToolMetadata('password-generator')

export default function ToolPage() {
  return <ToolClient />
}
