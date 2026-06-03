// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

'use client'

import { useEffect, useRef, type RefObject } from 'react'

export function useSyncScroll(
  editorRef: RefObject<HTMLDivElement | null>,
  previewRef: RefObject<HTMLDivElement | null>
) {
  const isEditorScrolling = useRef(false)
  const isPreviewScrolling = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const editor = editorRef.current
    const preview = previewRef.current
    if (!editor || !preview) return

    const handleEditorScroll = () => {
      if (isPreviewScrolling.current) return
      isEditorScrolling.current = true

      const editorScrollable = editor.querySelector('.cm-scroller')
      if (!editorScrollable) return

      const ratio =
        editorScrollable.scrollTop /
        (editorScrollable.scrollHeight - editorScrollable.clientHeight || 1)
      const previewMax = preview.scrollHeight - preview.clientHeight
      preview.scrollTop = ratio * previewMax

      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        isEditorScrolling.current = false
      }, 100)
    }

    const handlePreviewScroll = () => {
      if (isEditorScrolling.current) return
      isPreviewScrolling.current = true

      const editorScrollable = editor.querySelector('.cm-scroller')
      if (!editorScrollable) return

      const ratio =
        preview.scrollTop /
        (preview.scrollHeight - preview.clientHeight || 1)
      const editorMax = editorScrollable.scrollHeight - editorScrollable.clientHeight
      editorScrollable.scrollTop = ratio * editorMax

      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        isPreviewScrolling.current = false
      }, 100)
    }

    const editorScrollable = editor.querySelector('.cm-scroller')
    editorScrollable?.addEventListener('scroll', handleEditorScroll, { passive: true })
    preview.addEventListener('scroll', handlePreviewScroll, { passive: true })

    return () => {
      editorScrollable?.removeEventListener('scroll', handleEditorScroll)
      preview.removeEventListener('scroll', handlePreviewScroll)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [editorRef, previewRef])
}
