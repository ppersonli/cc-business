// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

'use client'

import { useEditorStore } from '../../../lib/wemd/stores/editorStore'
import { useSettingsStore } from '../../../lib/wemd/stores/settingsStore'

export default function StatusBar() {
  const { lineCount, wordCount, saveStatus, lastSaved } = useEditorStore()
  const { isDarkUI } = useSettingsStore()

  const bg = isDarkUI ? '#1e293b' : '#f8fafc'
  const border = isDarkUI ? '#334155' : '#e2e8f0'
  const text = isDarkUI ? '#94a3b8' : '#64748b'

  const saveText = saveStatus === 'saving'
    ? '保存中...'
    : saveStatus === 'saved' && lastSaved
      ? '刚刚保存'
      : '未保存'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '4px 16px',
        backgroundColor: bg,
        borderTop: `1px solid ${border}`,
        fontSize: '12px',
        color: text,
        flexShrink: 0,
      }}
    >
      <span>行数: {lineCount}</span>
      <span>字数: {wordCount}</span>
      <div style={{ flex: 1 }} />
      <span
        style={{
          color: saveStatus === 'saved' ? '#07c160' : saveStatus === 'saving' ? '#e6a23c' : text,
        }}
      >
        {saveText}
      </span>
    </div>
  )
}
