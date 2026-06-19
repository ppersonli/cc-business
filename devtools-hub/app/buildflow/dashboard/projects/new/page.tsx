'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#22c55e', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', budget: '', startDate: '', endDate: '', address: '', currency: 'USD', coverColor: '#3b82f6' })

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/buildflow/projects', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, budget: form.budget ? parseFloat(form.budget) : 0 }),
      })
      const project = await res.json()
      if (project.id) router.push(`/buildflow/dashboard/projects/${project.id}`)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const inputStyle = { width: '100%', padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }

  return (
    <div style={{ padding: '24px 32px', maxWidth: '640px', margin: '0 auto' }}>
      <Link href="/buildflow/dashboard/projects" style={{ fontSize: '14px', color: '#6b7280', textDecoration: 'none', marginBottom: '24px', display: 'inline-block' }}>← Back</Link>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '32px' }}>Create New Project</h1>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Project Name *</label>
          <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Riverside Office Complex" style={inputStyle} required />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Description</label>
          <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} placeholder="Brief description..." style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Site Address</label>
          <input type="text" value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="123 Main St, City" style={inputStyle} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Budget</label>
            <input type="number" value={form.budget} onChange={(e) => update('budget', e.target.value)} placeholder="500000" min="0" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Currency</label>
            <select value={form.currency} onChange={(e) => update('currency', e.target.value)} style={inputStyle}>
              <option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="CNY">CNY (¥)</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Start Date</label>
            <input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>End Date</label>
            <input type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} style={inputStyle} />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Color</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {colors.map((c) => (
              <button key={c} type="button" onClick={() => update('coverColor', c)}
                style={{ width: '32px', height: '32px', borderRadius: '999px', backgroundColor: c, border: form.coverColor === c ? '3px solid #111827' : '2px solid transparent', cursor: 'pointer' }} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
          <button type="submit" disabled={loading} style={{ padding: '10px 24px', backgroundColor: '#d97706', color: '#fff', fontWeight: 600, fontSize: '14px', borderRadius: '8px', border: 'none', cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Creating...' : 'Create Project'}
          </button>
          <Link href="/buildflow/dashboard/projects" style={{ padding: '10px 24px', color: '#6b7280', fontWeight: 500, fontSize: '14px', textDecoration: 'none' }}>Cancel</Link>
        </div>
      </form>
    </div>
  )
}
