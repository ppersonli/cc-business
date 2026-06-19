'use client'
import { useState, useCallback } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import type { AuditResult, DimensionScore } from '@/lib/page-audit/analyzer'
import { openReportForPrint } from '@/lib/page-audit/report'

const tool = getToolBySlug('page-audit')!
const FREE_LIMIT = 3

const DIMENSION_ICONS: Record<string, string> = {
  'Visual Design': '🎨',
  'Copy Quality': '✍️',
  'CTA Effectiveness': '🎯',
  'Mobile Adaptability': '📱',
  'Performance': '⚡',
}

function getScoreColor(score: number): string {
  if (score >= 7) return '#16a34a'
  if (score >= 4) return '#e6a23c'
  return '#ef4444'
}

function getUsageCount(): number {
  if (typeof window === 'undefined') return 0
  const key = `page-audit-usage-${new Date().toISOString().slice(0, 7)}`
  return parseInt(localStorage.getItem(key) || '0', 10)
}

function incrementUsage(): void {
  const key = `page-audit-usage-${new Date().toISOString().slice(0, 7)}`
  const count = getUsageCount() + 1
  localStorage.setItem(key, String(count))
}

export default function PageAuditTool() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AuditResult | null>(null)
  const [screenshots, setScreenshots] = useState<{ desktop: string; mobile: string } | null>(null)
  const [showMobile, setShowMobile] = useState(false)
  const usageCount = getUsageCount()

  const handleAnalyze = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    // Check local free limit
    if (usageCount >= FREE_LIMIT) {
      setError(`Free limit reached (${FREE_LIMIT}/month). Upgrade to Pro for unlimited analyses.`)
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setScreenshots(null)

    try {
      const res = await fetch('/api/page-audit/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Analysis failed')
        return
      }

      setResult(data.result)
      setScreenshots(data.screenshots)
      incrementUsage()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [url, usageCount])

  const handleExportPDF = useCallback(() => {
    if (result) openReportForPrint(result)
  }, [result])

  return (
    <ToolLayout tool={tool}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px' }}>
            📊 PageAudit — AI Landing Page CRO Analyzer
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
            Analyze your landing page with AI and get actionable CRO optimization suggestions
          </p>
        </div>

        {/* URL Input */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
          <input
            type="url"
            placeholder="Enter URL to analyze (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !loading) handleAnalyze() }}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0' }}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#94a3b8' : '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background-color 0.2s',
            }}
          >
            {loading ? '⏳ Analyzing...' : '🔍 Analyze'}
          </button>
        </div>

        {/* Usage indicator */}
        <div style={{ textAlign: 'center', marginBottom: '24px', fontSize: '13px', color: '#64748b' }}>
          Free: {usageCount}/{FREE_LIMIT} used this month
          {usageCount >= FREE_LIMIT && (
            <span style={{ color: '#f59e0b', fontWeight: 600, marginLeft: '8px' }}>
              — Upgrade to Pro for unlimited
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#991b1b',
            fontSize: '14px',
            marginBottom: '24px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 2s linear infinite' }}>🔍</div>
            <p style={{ color: '#64748b', fontSize: '15px' }}>
              Taking screenshots and analyzing with AI...
            </p>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>
              This may take 15-30 seconds
            </p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div>
            {/* Overall Score */}
            <div style={{
              textAlign: 'center',
              padding: '32px',
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              marginBottom: '24px',
              border: '1px solid #e2e8f0',
            }}>
              <div style={{
                fontSize: '72px',
                fontWeight: 800,
                color: getScoreColor(result.overallScore / 10),
                lineHeight: 1,
              }}>
                {result.overallScore}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
                Overall Score / 100
              </div>
              <p style={{ fontSize: '14px', color: '#475569', marginTop: '16px', maxWidth: '500px', margin: '16px auto 0', lineHeight: 1.6 }}>
                {result.summary}
              </p>
            </div>

            {/* Screenshots */}
            {screenshots && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', justifyContent: 'center' }}>
                  <button
                    onClick={() => setShowMobile(false)}
                    style={{
                      padding: '6px 16px',
                      backgroundColor: !showMobile ? '#3b82f6' : '#f1f5f9',
                      color: !showMobile ? '#fff' : '#64748b',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    🖥 Desktop
                  </button>
                  <button
                    onClick={() => setShowMobile(true)}
                    style={{
                      padding: '6px 16px',
                      backgroundColor: showMobile ? '#3b82f6' : '#f1f5f9',
                      color: showMobile ? '#fff' : '#64748b',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    📱 Mobile
                  </button>
                </div>
                <div style={{ textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fff' }}>
                  <img
                    src={`data:image/png;base64,${showMobile ? screenshots.mobile : screenshots.desktop}`}
                    alt={showMobile ? 'Mobile screenshot' : 'Desktop screenshot'}
                    style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
                  />
                </div>
              </div>
            )}

            {/* Dimension Scores */}
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Dimension Scores</h2>
            <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
              {result.dimensions.map((dim: DimensionScore) => (
                <div key={dim.name} style={{
                  padding: '16px',
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 600, fontSize: '15px' }}>
                      {DIMENSION_ICONS[dim.name] || '📊'} {dim.name}
                    </span>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '18px',
                      color: getScoreColor(dim.score),
                    }}>
                      {dim.score}/10
                    </span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', marginBottom: '12px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${dim.score * 10}%`,
                      backgroundColor: getScoreColor(dim.score),
                      borderRadius: '3px',
                      transition: 'width 0.5s',
                    }} />
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '13px', lineHeight: 1.8 }}>
                    {dim.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Top Actions */}
            {result.topActions.length > 0 && (
              <>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>🎯 Top Priority Actions</h2>
                <div style={{
                  padding: '20px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '12px',
                  marginBottom: '24px',
                }}>
                  {result.topActions.map((action, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 0',
                      borderBottom: i < result.topActions.length - 1 ? '1px solid #fde68a' : 'none',
                    }}>
                      <span style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '13px',
                        flexShrink: 0,
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: '14px', lineHeight: 1.6, color: '#1e293b' }}>
                        {action}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Export button */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <button
                onClick={handleExportPDF}
                style={{
                  padding: '12px 32px',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                📄 Export PDF Report
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
