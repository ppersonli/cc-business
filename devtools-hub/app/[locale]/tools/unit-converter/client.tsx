'use client'
import { useState } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('unit-converter')!

type UnitCategory = 'length' | 'weight' | 'temperature' | 'volume' | 'speed' | 'data'

interface UnitDef {
  name: string
  abbr: string
  factor: number // relative to base unit (meters, grams, etc.)
}

const categories: Record<UnitCategory, { label: string; units: UnitDef[] }> = {
  length: {
    label: 'Length',
    units: [
      { name: 'Meter', abbr: 'm', factor: 1 },
      { name: 'Kilometer', abbr: 'km', factor: 1000 },
      { name: 'Centimeter', abbr: 'cm', factor: 0.01 },
      { name: 'Millimeter', abbr: 'mm', factor: 0.001 },
      { name: 'Mile', abbr: 'mi', factor: 1609.344 },
      { name: 'Yard', abbr: 'yd', factor: 0.9144 },
      { name: 'Foot', abbr: 'ft', factor: 0.3048 },
      { name: 'Inch', abbr: 'in', factor: 0.0254 },
      { name: 'Nautical Mile', abbr: 'nmi', factor: 1852 },
    ],
  },
  weight: {
    label: 'Weight',
    units: [
      { name: 'Kilogram', abbr: 'kg', factor: 1 },
      { name: 'Gram', abbr: 'g', factor: 0.001 },
      { name: 'Milligram', abbr: 'mg', factor: 0.000001 },
      { name: 'Metric Ton', abbr: 't', factor: 1000 },
      { name: 'Pound', abbr: 'lb', factor: 0.453592 },
      { name: 'Ounce', abbr: 'oz', factor: 0.0283495 },
      { name: 'Stone', abbr: 'st', factor: 6.35029 },
    ],
  },
  temperature: {
    label: 'Temperature',
    units: [
      { name: 'Celsius', abbr: '°C', factor: 0 },
      { name: 'Fahrenheit', abbr: '°F', factor: 0 },
      { name: 'Kelvin', abbr: 'K', factor: 0 },
    ],
  },
  volume: {
    label: 'Volume',
    units: [
      { name: 'Liter', abbr: 'L', factor: 1 },
      { name: 'Milliliter', abbr: 'mL', factor: 0.001 },
      { name: 'Cubic Meter', abbr: 'm³', factor: 1000 },
      { name: 'Gallon (US)', abbr: 'gal', factor: 3.78541 },
      { name: 'Quart (US)', abbr: 'qt', factor: 0.946353 },
      { name: 'Pint (US)', abbr: 'pt', factor: 0.473176 },
      { name: 'Cup (US)', abbr: 'cup', factor: 0.236588 },
      { name: 'Fluid Ounce (US)', abbr: 'fl oz', factor: 0.0295735 },
    ],
  },
  speed: {
    label: 'Speed',
    units: [
      { name: 'Meters/Second', abbr: 'm/s', factor: 1 },
      { name: 'Kilometers/Hour', abbr: 'km/h', factor: 0.277778 },
      { name: 'Miles/Hour', abbr: 'mph', factor: 0.44704 },
      { name: 'Knots', abbr: 'kn', factor: 0.514444 },
      { name: 'Feet/Second', abbr: 'ft/s', factor: 0.3048 },
    ],
  },
  data: {
    label: 'Data Storage',
    units: [
      { name: 'Byte', abbr: 'B', factor: 1 },
      { name: 'Kilobyte', abbr: 'KB', factor: 1024 },
      { name: 'Megabyte', abbr: 'MB', factor: 1048576 },
      { name: 'Gigabyte', abbr: 'GB', factor: 1073741824 },
      { name: 'Terabyte', abbr: 'TB', factor: 1099511627776 },
      { name: 'Bit', abbr: 'bit', factor: 0.125 },
      { name: 'Kilobit', abbr: 'Kbit', factor: 128 },
      { name: 'Megabit', abbr: 'Mbit', factor: 131072 },
    ],
  },
}

function convertTemp(value: number, from: string, to: string): number {
  let celsius: number
  if (from === '°C') celsius = value
  else if (from === '°F') celsius = (value - 32) * 5 / 9
  else celsius = value - 273.15

  if (to === '°C') return celsius
  if (to === '°F') return celsius * 9 / 5 + 32
  return celsius + 273.15
}

function formatNumber(n: number): string {
  if (Math.abs(n) < 0.000001 && n !== 0) return n.toExponential(4)
  if (Math.abs(n) >= 1e12) return n.toExponential(4)
  const s = n.toFixed(8)
  return parseFloat(s).toString()
}

export default function UnitConverter() {
  const [category, setCategory] = useState<UnitCategory>('length')
  const [fromUnit, setFromUnit] = useState(0)
  const [toUnit, setToUnit] = useState(1)
  const [inputValue, setInputValue] = useState('1')
  const [copied, setCopied] = useState(false)

  const cat = categories[category]
  const value = parseFloat(inputValue) || 0

  let result: number
  if (category === 'temperature') {
    result = convertTemp(value, cat.units[fromUnit].abbr, cat.units[toUnit].abbr)
  } else {
    const baseValue = value * cat.units[fromUnit].factor
    result = baseValue / cat.units[toUnit].factor
  }

  const copy = async () => {
    const text = `${inputValue} ${cat.units[fromUnit].abbr} = ${formatNumber(result)} ${cat.units[toUnit].abbr}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const swap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    setInputValue(formatNumber(result))
  }

  return (
    <ToolLayout tool={tool}>
      <div style={{ marginBottom: 16 }}>
        <div className="options-row">
          {(Object.keys(categories) as UnitCategory[]).map(key => (
            <button
              key={key}
              className={`btn ${category === key ? 'btn-primary' : ''}`}
              onClick={() => {
                setCategory(key)
                setFromUnit(0)
                setToUnit(1)
                setInputValue('1')
              }}
            >
              {categories[key].label}
            </button>
          ))}
        </div>
      </div>

      <div className="tool-panel" style={{ marginBottom: 16 }}>
        <div className="panel-header">
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Convert</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn btn-sm" onClick={swap}>⇄ Swap</button>
            <button className="btn btn-sm" onClick={copy}>
              {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
            </button>
          </div>
        </div>
        <div className="panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'start' }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>From</label>
              <select
                value={fromUnit}
                onChange={e => setFromUnit(Number(e.target.value))}
                style={{ width: '100%', marginBottom: 8 }}
              >
                {cat.units.map((u, i) => (
                  <option key={i} value={i}>{u.name} ({u.abbr})</option>
                ))}
              </select>
              <input
                type="number"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                style={{ width: '100%', fontSize: 20, fontWeight: 600 }}
              />
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 36,
              fontSize: 24,
              color: 'var(--text-muted)',
            }}>
              =
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>To</label>
              <select
                value={toUnit}
                onChange={e => setToUnit(Number(e.target.value))}
                style={{ width: '100%', marginBottom: 8 }}
              >
                {cat.units.map((u, i) => (
                  <option key={i} value={i}>{u.name} ({u.abbr})</option>
                ))}
              </select>
              <div style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '12px 16px',
                fontSize: 20,
                fontWeight: 600,
                color: 'var(--accent)',
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                minHeight: 48,
                display: 'flex',
                alignItems: 'center',
              }}>
                {formatNumber(result)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tool-panel">
        <div className="panel-header">
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>All {cat.label} Conversions</span>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          {cat.units.filter((_, i) => i !== fromUnit).map((u, i) => {
            let convResult: number
            if (category === 'temperature') {
              convResult = convertTemp(value, cat.units[fromUnit].abbr, u.abbr)
            } else {
              convResult = (value * cat.units[fromUnit].factor) / u.factor
            }
            return (
              <div key={u.abbr} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                borderBottom: i < cat.units.length - 2 ? '1px solid var(--border)' : 'none',
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.name}</span>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'monospace' }}>
                  {formatNumber(convResult)} {u.abbr}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </ToolLayout>
  )
}
