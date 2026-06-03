'use client'
import { useState, useMemo, useCallback } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('json-schema-validator')!

interface ValidationError {
  path: string
  message: string
}

function validateSchema(data: unknown, schema: unknown, path = '$'): ValidationError[] {
  if (!schema || typeof schema !== 'object') return []
  const s = schema as Record<string, unknown>
  const errors: ValidationError[] = []

  if (s.type) {
    const types = Array.isArray(s.type) ? s.type : [s.type]
    const actualType = data === null ? 'null' : Array.isArray(data) ? 'array' : typeof data
    if (!types.includes(actualType)) {
      errors.push({ path, message: `Expected type ${types.join(' | ')}, got ${actualType}` })
      return errors
    }
  }

  if (s.enum && Array.isArray(s.enum) && !s.enum.includes(data)) {
    errors.push({ path, message: `Value must be one of: ${JSON.stringify(s.enum)}` })
  }

  if (s.const !== undefined && data !== s.const) {
    errors.push({ path, message: `Value must be ${JSON.stringify(s.const)}` })
  }

  if (typeof data === 'string') {
    if (s.minLength !== undefined && data.length < (s.minLength as number)) {
      errors.push({ path, message: `String length ${data.length} is less than minimum ${s.minLength}` })
    }
    if (s.maxLength !== undefined && data.length > (s.maxLength as number)) {
      errors.push({ path, message: `String length ${data.length} is greater than maximum ${s.maxLength}` })
    }
    if (s.pattern && !new RegExp(s.pattern as string).test(data)) {
      errors.push({ path, message: `String does not match pattern: ${s.pattern}` })
    }
    if (s.format) {
      const formatChecks: Record<string, RegExp> = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        uri: /^https?:\/\/.+/,
        date: /^\d{4}-\d{2}-\d{2}$/,
        'date-time': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/,
        uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      }
      if (formatChecks[s.format as string] && !formatChecks[s.format as string].test(data)) {
        errors.push({ path, message: `String does not match format "${s.format}"` })
      }
    }
  }

  if (typeof data === 'number') {
    if (s.minimum !== undefined && data < (s.minimum as number)) {
      errors.push({ path, message: `Value ${data} is less than minimum ${s.minimum}` })
    }
    if (s.maximum !== undefined && data > (s.maximum as number)) {
      errors.push({ path, message: `Value ${data} is greater than maximum ${s.maximum}` })
    }
    if (s.exclusiveMinimum !== undefined && data <= (s.exclusiveMinimum as number)) {
      errors.push({ path, message: `Value ${data} must be greater than ${s.exclusiveMinimum}` })
    }
    if (s.exclusiveMaximum !== undefined && data >= (s.exclusiveMaximum as number)) {
      errors.push({ path, message: `Value ${data} must be less than ${s.exclusiveMaximum}` })
    }
    if (s.multipleOf !== undefined && data % (s.multipleOf as number) !== 0) {
      errors.push({ path, message: `Value must be a multiple of ${s.multipleOf}` })
    }
  }

  if (Array.isArray(data)) {
    if (s.minItems !== undefined && data.length < (s.minItems as number)) {
      errors.push({ path, message: `Array length ${data.length} is less than minimum ${s.minItems}` })
    }
    if (s.maxItems !== undefined && data.length > (s.maxItems as number)) {
      errors.push({ path, message: `Array length ${data.length} is greater than maximum ${s.maxItems}` })
    }
    if (s.items && typeof s.items === 'object') {
      data.forEach((item, i) => {
        errors.push(...validateSchema(item, s.items, `${path}[${i}]`))
      })
    }
    if (s.uniqueItems) {
      const seen = new Set(data.map(d => JSON.stringify(d)))
      if (seen.size !== data.length) {
        errors.push({ path, message: 'Array items must be unique' })
      }
    }
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>
    const required = s.required as string[] | undefined
    if (required) {
      for (const key of required) {
        if (obj[key] === undefined) {
          errors.push({ path, message: `Missing required property "${key}"` })
        }
      }
    }

    const properties = s.properties as Record<string, unknown> | undefined
    if (properties) {
      for (const [key, subSchema] of Object.entries(properties)) {
        if (obj[key] !== undefined) {
          errors.push(...validateSchema(obj[key], subSchema, `${path}.${key}`))
        }
      }
    }

    const additional = s.additionalProperties
    if (additional === false && properties) {
      for (const key of Object.keys(obj)) {
        if (!(key in properties)) {
          errors.push({ path: `${path}.${key}`, message: `Additional property "${key}" is not allowed` })
        }
      }
    }

    if (s.minProperties !== undefined && Object.keys(obj).length < (s.minProperties as number)) {
      errors.push({ path, message: `Object has fewer properties than minimum ${s.minProperties}` })
    }
    if (s.maxProperties !== undefined && Object.keys(obj).length > (s.maxProperties as number)) {
      errors.push({ path, message: `Object has more properties than maximum ${s.maxProperties}` })
    }
  }

  return errors
}

const SAMPLE_DATA = `{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "tags": ["developer", "designer"]
}`

const SAMPLE_SCHEMA = `{
  "type": "object",
  "required": ["name", "email", "age"],
  "properties": {
    "name": { "type": "string", "minLength": 1 },
    "email": { "type": "string", "format": "email" },
    "age": { "type": "number", "minimum": 0, "maximum": 150 },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "additionalProperties": false
}`

export default function JsonSchemaValidator() {
  const [dataInput, setDataInput] = useState(SAMPLE_DATA)
  const [schemaInput, setSchemaInput] = useState(SAMPLE_SCHEMA)
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => {
    try {
      const data = JSON.parse(dataInput)
      try {
        const schema = JSON.parse(schemaInput)
        const errors = validateSchema(data, schema)
        return { valid: errors.length === 0, errors, dataError: null, schemaError: null }
      } catch (e) {
        return { valid: false, errors: [], dataError: null, schemaError: `Invalid JSON Schema: ${e instanceof Error ? e.message : 'parse error'}` }
      }
    } catch (e) {
      return { valid: false, errors: [], dataError: `Invalid JSON: ${e instanceof Error ? e.message : 'parse error'}`, schemaError: null }
    }
  }, [dataInput, schemaInput])

  const copyErrors = useCallback(() => {
    const text = result.errors.map(e => `${e.path}: ${e.message}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [result.errors])

  return (
    <ToolLayout tool={tool}>
      {result.dataError && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#fca5a5', fontSize: 13 }}>
          {result.dataError}
        </div>
      )}
      {result.schemaError && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#fca5a5', fontSize: 13 }}>
          {result.schemaError}
        </div>
      )}

      <div className="tool-grid">
        <div className="tool-panel">
          <div className="panel-header">
            <span>JSON Data</span>
          </div>
          <div className="panel-body">
            <textarea
              value={dataInput}
              onChange={(e) => setDataInput(e.target.value)}
              placeholder="Paste JSON data here..."
              style={{
                width: '100%',
                minHeight: 250,
                padding: 12,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                resize: 'vertical',
              }}
            />
          </div>
        </div>

        <div className="tool-panel">
          <div className="panel-header">
            <span>JSON Schema</span>
          </div>
          <div className="panel-body">
            <textarea
              value={schemaInput}
              onChange={(e) => setSchemaInput(e.target.value)}
              placeholder="Paste JSON Schema here..."
              style={{
                width: '100%',
                minHeight: 250,
                padding: 12,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                resize: 'vertical',
              }}
            />
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 16,
        padding: '14px 18px',
        background: result.valid ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
        border: `1px solid ${result.valid ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: result.valid ? '#86efac' : '#fca5a5' }}>
          {result.valid ? 'Valid — No errors found' : `${result.errors.length} error${result.errors.length !== 1 ? 's' : ''} found`}
        </span>
        {result.errors.length > 0 && (
          <button className="btn btn-sm" onClick={copyErrors}>
            {copied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy Errors</>}
          </button>
        )}
      </div>

      {result.errors.length > 0 && (
        <div className="tool-panel" style={{ marginTop: 12 }}>
          <div className="panel-header">
            <span>Validation Errors</span>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            {result.errors.map((err, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 16px',
                  borderBottom: i < result.errors.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex',
                  gap: 12,
                  fontSize: 13,
                }}
              >
                <code style={{ color: '#f59e0b', fontFamily: 'var(--font-mono)', fontSize: 12, flexShrink: 0 }}>
                  {err.path}
                </code>
                <span style={{ color: '#fca5a5' }}>{err.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
