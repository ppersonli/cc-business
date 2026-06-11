// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

'use client'

interface SliderInputProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
  isDarkUI?: boolean
}

export default function SliderInput({
  label, value, min, max, step = 1, unit = 'px', onChange, isDarkUI,
}: SliderInputProps) {
  const text = isDarkUI ? '#e2e8f0' : '#1e293b'
  const textMuted = isDarkUI ? '#94a3b8' : '#64748b'
  const inputBg = isDarkUI ? '#0f172a' : '#ffffff'
  const border = isDarkUI ? '#334155' : '#e2e8f0'
  const accent = isDarkUI ? '#3b82f6' : '#07c160'

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <label style={{ fontSize: '12px', color: textMuted }}>{label}</label>
        <span style={{ fontSize: '12px', color: accent, fontWeight: 600, fontFamily: "'SF Mono', monospace" }}>
          {value}{unit}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            flex: 1,
            height: '4px',
            accentColor: accent,
            cursor: 'pointer',
          }}
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value)
            if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)))
          }}
          style={{
            width: '60px',
            padding: '4px 6px',
            backgroundColor: inputBg,
            border: `1px solid ${border}`,
            borderRadius: '4px',
            color: text,
            fontSize: '12px',
            textAlign: 'center' as const,
            outline: 'none',
            fontFamily: "'SF Mono', monospace",
          }}
        />
      </div>
    </div>
  )
}

// SelectInput for dropdown options
interface SelectInputProps {
  label: string
  value: string
  options: { label: string; value: string }[]
  onChange: (value: string) => void
  isDarkUI?: boolean
}

export function SelectInput({ label, value, options, onChange, isDarkUI }: SelectInputProps) {
  const text = isDarkUI ? '#e2e8f0' : '#1e293b'
  const textMuted = isDarkUI ? '#94a3b8' : '#64748b'
  const inputBg = isDarkUI ? '#0f172a' : '#ffffff'
  const border = isDarkUI ? '#334155' : '#e2e8f0'

  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ fontSize: '12px', color: textMuted, marginBottom: '4px', display: 'block' }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '6px 8px',
          backgroundColor: inputBg,
          border: `1px solid ${border}`,
          borderRadius: '4px',
          color: text,
          fontSize: '13px',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

// ToggleInput for boolean values
interface ToggleInputProps {
  label: string
  value: boolean
  onChange: (value: boolean) => void
  isDarkUI?: boolean
}

export function ToggleInput({ label, value, onChange, isDarkUI }: ToggleInputProps) {
  const text = isDarkUI ? '#e2e8f0' : '#1e293b'
  const textMuted = isDarkUI ? '#94a3b8' : '#64748b'
  const accent = isDarkUI ? '#3b82f6' : '#07c160'

  return (
    <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <label style={{ fontSize: '12px', color: textMuted }}>{label}</label>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: '40px',
          height: '22px',
          borderRadius: '11px',
          border: 'none',
          backgroundColor: value ? accent : isDarkUI ? '#475569' : '#cbd5e1',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background-color 0.2s',
        }}
      >
        <div
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            position: 'absolute',
            top: '3px',
            left: value ? '21px' : '3px',
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </button>
    </div>
  )
}
