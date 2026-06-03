// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

'use client'

import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with CodeMirror and browser APIs
const EditorLayout = dynamic(
  () => import('@/components/wemd-editor/Layout/EditorLayout'),
  { ssr: false }
)

export default function WeChatMarkdownEditorClient() {
  return <EditorLayout />
}
