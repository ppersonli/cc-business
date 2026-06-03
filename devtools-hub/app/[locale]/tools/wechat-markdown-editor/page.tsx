import { generateToolMetadata } from '@/lib/metadata'
import Client from './client'

export const metadata = generateToolMetadata('wechat-markdown-editor')

export default function WeChatMarkdownEditorPage() {
  return <Client />
}
