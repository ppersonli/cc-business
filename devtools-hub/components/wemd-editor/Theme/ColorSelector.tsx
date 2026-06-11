// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

'use client'

interface ColorSelectorProps {
  label: string
  value: string
  onChange: (value: string) => void
  isDarkUI?: boolean
}

export default function ColorSelector({ label, value, onChange, isDarkUI }: ColorSelectorProps) {
  const text = isDarkUI ? '#e2e8f0' : '#1e293b'
  const textMuted = isDarkUI ? '#94a3b8' : '#64748b'
  const inputBg = isDarkUI ? '#0f172a' : '#ffffff'
  const border = isDarkUI ? '#334155' : '#e2e8f0'

  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ fontSize: '12px', color: textMuted, marginBottom: '4px', display: 'block' }}>{label}</label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '32px',
            height: '32px',
            border: `1px solid ${border}`,
            borderRadius: '6px',
            cursor: 'pointer',
            padding: '2px',
            backgroundColor: 'transparent',
          }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value
            if (/^#[0-9a-fA-F]{0,6}$/.test(v) || v === '') {
              onChange(v)
            }
          }}
          style={{
            flex: 1,
            padding: '6px 8px',
            backgroundColor: inputBg,
            border: `1px solid ${border}`,
            borderRadius: '4px',
            color: text,
            fontSize: '13px',
            fontFamily: "'SF Mono', monospace",
            outline: 'none',
            boxSizing: 'border-box' as const,
          }}
        />
      </div>
    </div>
  )
}
