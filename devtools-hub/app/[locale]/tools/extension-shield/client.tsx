'use client'
import { useState, useCallback, useEffect, type DragEvent, type ChangeEvent } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { extractExtension, generateScanReport } from 'extension-shield-scanner'
import type { ScanReport, RiskLevel, RiskCategory } from 'extension-shield-scanner'

const tool = getToolBySlug('extension-shield')!

const RISK_COLORS: Record<RiskLevel, string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#16a34a',
}

const CATEGORY_LABELS: Record<RiskCategory, string> = {
  permission: 'Permissions',
  csp: 'Content Security Policy',
  'remote-code': 'Remote Code',
  'content-script': 'Content Scripts',
  secrets: 'Secrets',
  privacy: 'Privacy',
  'single-purpose': 'Single Purpose',
  obfuscation: 'Obfuscation',
  network: 'Network',
  dependency: 'Dependencies',
}

const FREE_SCAN_LIMIT = 3

function getScanCount(): number {
  try {
    const stored = localStorage.getItem('es_scans')
    if (!stored) return 0
    const { count, date } = JSON.parse(stored)
    return date === new Date().toDateString() ? count : 0
  } catch { return 0 }
}

function incrementScanCount() {
  const count = getScanCount() + 1
  localStorage.setItem('es_scans', JSON.stringify({ count, date: new Date().toDateString() }))
}

export default function ExtensionShieldClient() {
  const [report, setReport] = useState<ScanReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scansUsed, setScansUsed] = useState(0)
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => { setScansUsed(getScanCount()) }, [])

  const processFile = useCallback(async (file: File) => {
    setError('')
    setReport(null)
    if (getScanCount() >= FREE_SCAN_LIMIT) {
      setError('Free scan limit reached (3/day). Sign in for more scans.')
      return
    }
    setLoading(true)
    try {
      const buffer = await file.arrayBuffer()
      const { manifest, files } = await extractExtension(buffer)
      const scanInput = { manifest: manifest as any, files }
      const result = generateScanReport(scanInput)
      setReport(result)
      incrementScanCount()
      setScansUsed(getScanCount())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to analyze the extension file.')
    }
    setLoading(false)
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
    else setError('Please drop a .zip or .crx file.')
  }, [processFile])

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handleShare = useCallback(() => {
    if (!report) return
    const params = new URLSearchParams({
      name: report.extensionName, v: report.extensionVersion,
      score: String(report.riskScore), level: report.riskLevel,
    })
    navigator.clipboard.writeText(`${window.location.origin}/tools/extension-shield/?${params}`)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }, [report])

  return (
    <ToolLayout tool={tool}>
      {/* Upload Zone */}
      {!report && !loading && (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          data-testid="upload-zone"
          style={{
            border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'var(--bg-secondary)',
            transition: 'border-color 0.2s',
            position: 'relative',
          }}
        >
          <input
            type="file"
            accept=".zip,.crx"
            onChange={handleChange}
            data-testid="file-input"
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
          />
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛡</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
            Drop a .zip or .crx file here
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>or click to browse</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
            Free scans today: {scansUsed} / {FREE_SCAN_LIMIT}
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <div style={{
            width: 40, height: 40, border: '3px solid var(--border)',
            borderTopColor: 'var(--error)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ color: 'var(--text-muted)' }}>Analyzing extension...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="status-badge status-invalid" style={{ padding: 16, marginBottom: 16, textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Report */}
      {report && <ReportView report={report} expandedFinding={expandedFinding}
        setExpandedFinding={setExpandedFinding} copiedLink={copiedLink} handleShare={handleShare}
        onReset={() => { setReport(null); setError('') }} />}
    </ToolLayout>
  )
}

// ── Report View ────────────────────────────────────────────────

function RiskGauge({ score, level }: { score: number; level: RiskLevel }) {
  const r = 54, stroke = 8, circ = 2 * Math.PI * r
  const color = RISK_COLORS[level]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ}
          strokeLinecap="round" transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
        <text x="70" y="64" textAnchor="middle" fill="var(--text-primary)"
          fontSize="32" fontWeight="800">{score}</text>
        <text x="70" y="84" textAnchor="middle" fill="var(--text-muted)" fontSize="12">/ 100</text>
      </svg>
      <span className={`status-badge status-${level === 'critical' || level === 'high' ? 'invalid' : level === 'medium' ? 'ready' : 'valid'}`}
        style={{ marginTop: 8, textTransform: 'uppercase', fontWeight: 700 }}>
        {level} risk
      </span>
    </div>
  )
}

function SeverityBadge({ level }: { level: RiskLevel }) {
  const cls = level === 'critical' || level === 'high' ? 'status-invalid' : level === 'medium' ? 'status-ready' : 'status-valid'
  return <span className={`status-badge ${cls}`} style={{ textTransform: 'uppercase', fontSize: 11 }}>{level}</span>
}

function ReportView({ report, expandedFinding, setExpandedFinding, copiedLink, handleShare, onReset }: {
  report: ScanReport; expandedFinding: string | null; setExpandedFinding: (id: string | null) => void
  copiedLink: boolean; handleShare: () => void; onReset: () => void
}) {
  return (
    <div>
      {/* Score Header */}
      <div className="tool-panel" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <RiskGauge score={report.riskScore} level={report.riskLevel} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{report.extensionName}</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              v{report.extensionVersion} · Manifest V{report.manifestVersion}
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {(['critical', 'high', 'medium', 'low'] as const).map(l =>
                report.summary[l] > 0 && (
                  <span key={l} style={{
                    padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontSize: 12, fontWeight: 600,
                    background: `${RISK_COLORS[l]}18`, color: RISK_COLORS[l],
                  }}>{report.summary[l]} {l}</span>
                )
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-sm" onClick={handleShare}>
                {copiedLink ? '✓ Copied' : '📋 Copy Report Link'}
              </button>
              <button className="btn btn-sm" onClick={onReset}>Scan Another</button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {report.categories.some(c => c.findings.length > 0) && (
        <div className="tool-panel" style={{ marginBottom: 16 }}>
          <div className="panel-header">Category Breakdown</div>
          <div className="panel-body">
            {report.categories.filter(c => c.findings.length > 0).map(c => (
              <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                <span style={{ width: 140, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                  {CATEGORY_LABELS[c.category]}
                </span>
                <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${c.score}%`, height: '100%', borderRadius: 3, background: c.score >= 50 ? '#ea580c' : c.score >= 20 ? '#ca8a04' : '#16a34a', transition: 'width 0.5s' }} />
                </div>
                <span style={{ width: 28, textAlign: 'right', fontSize: 13, fontWeight: 600 }}>{c.score}</span>
                <span style={{ width: 70, fontSize: 11, color: 'var(--text-muted)' }}>{c.findings.length} finding(s)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Findings */}
      {report.findings.length > 0 && (
        <div className="tool-panel" style={{ marginBottom: 16 }}>
          <div className="panel-header">Findings ({report.summary.total})</div>
          <div className="panel-body" style={{ padding: 0 }}>
            {report.findings.map(f => (
              <div key={`${f.id}-${f.file}-${f.line}`}
                style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                  borderLeft: `3px solid ${RISK_COLORS[f.severity]}` }}
                onClick={() => setExpandedFinding(expandedFinding === f.id ? null : f.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SeverityBadge level={f.severity} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{f.title}</span>
                  {f.file && <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--accent)', fontFamily: 'monospace' }}>{f.file}{f.line ? `:${f.line}` : ''}</span>}
                </div>
                {expandedFinding === f.id && (
                  <div style={{ marginTop: 8, paddingLeft: 4 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>{f.description}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}><strong>Fix:</strong> {f.suggestion}</p>
                    {f.casReference && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>CASA: {f.casReference}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissions */}
      <div className="tool-panel" style={{ marginBottom: 16 }}>
        <div className="panel-header">Permissions</div>
        <div className="panel-body">
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>DECLARED</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {report.permissions.declared.map(p => (
                <span key={p} style={{
                  padding: '2px 10px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontFamily: 'monospace',
                  background: report.permissions.dangerous.includes(p) ? '#dc262618' : 'var(--bg-tertiary)',
                  color: report.permissions.dangerous.includes(p) ? '#dc2626' : 'var(--text-secondary)',
                  border: `1px solid ${report.permissions.dangerous.includes(p) ? '#dc262640' : 'var(--border)'}`,
                }}>{p}</span>
              ))}
            </div>
          </div>
          {report.permissions.broadHostPermissions.length > 0 && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#ea580c', marginBottom: 6 }}>BROAD HOST PERMISSIONS</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {report.permissions.broadHostPermissions.map(p => (
                  <span key={p} style={{
                    padding: '2px 10px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontFamily: 'monospace',
                    background: '#ea580c18', color: '#ea580c', border: '1px solid #ea580c40',
                  }}>{p}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSP */}
      <div className="tool-panel" style={{ marginBottom: 16 }}>
        <div className="panel-header">Content Security Policy</div>
        <div className="panel-body">
          {report.csp.raw ? (
            <div>
              <pre style={{
                padding: 12, borderRadius: 'var(--radius-sm)', fontSize: 12, fontFamily: 'monospace',
                background: 'var(--bg-tertiary)', overflow: 'auto', wordBreak: 'break-all',
                color: 'var(--text-secondary)',
              }}>{report.csp.raw}</pre>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {report.csp.hasUnsafeEval && <span className="status-badge status-invalid">unsafe-eval</span>}
                {report.csp.hasUnsafeInline && <span className="status-badge status-invalid">unsafe-inline</span>}
                {report.csp.allowsDataUri && <span className="status-badge status-ready">data: allowed</span>}
                {report.csp.allowsRemoteScript && <span className="status-badge status-invalid">remote scripts</span>}
                {!report.csp.hasUnsafeEval && !report.csp.hasUnsafeInline && !report.csp.allowsRemoteScript && (
                  <span className="status-badge status-valid">No critical CSP issues</span>
                )}
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              No custom CSP defined — uses Chrome&apos;s default policy
              {report.manifestVersion === 3 && ' (stricter in MV3)'}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button className="btn btn-primary" onClick={onReset}>Scan Another Extension</button>
      </div>
    </div>
  )
}
