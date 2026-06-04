import { describe, it, expect } from 'vitest';
import { generateScanReport, generateHtmlReport } from '../src/report/generator';
import type { ScanInput } from '../src/types';

describe('Integration: full scan pipeline', () => {
  it('scans a minimal safe extension and returns low risk', () => {
    const input: ScanInput = {
      manifest: {
        manifest_version: 3,
        name: 'Minimal Safe',
        version: '1.0.0',
        permissions: ['storage'],
        host_permissions: [],
        content_security_policy: { extension_pages: "script-src 'self'; object-src 'self'" },
      },
      files: {
        'background.js': 'chrome.storage.local.set({ count: 0 });',
      },
    };

    const report = generateScanReport(input);
    expect(report.riskLevel).toBe('low');
    expect(report.riskScore).toBeLessThanOrEqual(20);
    expect(report.summary.critical).toBe(0);
  });

  it('scans a suspicious extension and returns high risk', () => {
    const input: ScanInput = {
      manifest: {
        manifest_version: 3,
        name: 'Suspicious Ext',
        version: '2.0.0',
        permissions: ['tabs', 'cookies', 'scripting', 'management', 'debugger'],
        host_permissions: ['<all_urls>'],
        content_security_policy: { extension_pages: "script-src 'self' 'unsafe-eval' 'unsafe-inline'" },
        content_scripts: [{ matches: ['<all_urls>'], js: ['inject.js'], all_frames: true }],
      },
      files: {
        'background.js': [
          'eval("fetch(\\"http://evil.com\\")");',
          'const secret = "AKIAIOSFODNN7EXAMPLE";',
          'setTimeout("alert(1)", 100);',
        ].join('\n'),
        'inject.js': 'document.write("<script>...</script>");',
        'index.html': '<script src="https://evil.com/payload.js"></script>',
      },
    };

    const report = generateScanReport(input);
    expect(report.riskLevel).toBe('critical');
    expect(report.riskScore).toBeGreaterThan(60);
    expect(report.summary.critical).toBeGreaterThan(0);
    expect(report.findings.length).toBeGreaterThan(5);
  });

  it('scans an extension with unsafe-eval CSP and flags it', () => {
    const input: ScanInput = {
      manifest: {
        manifest_version: 3,
        name: 'Unsafe CSP',
        version: '1.0.0',
        permissions: [],
        host_permissions: [],
        content_security_policy: { extension_pages: "script-src 'self' 'unsafe-eval'" },
      },
      files: {},
    };

    const report = generateScanReport(input);
    expect(report.csp.hasUnsafeEval).toBe(true);
    expect(report.findings.some((f) => f.id === 'CSP_UNSAFE_EVAL')).toBe(true);
  });

  it('scans an extension with hardcoded secrets and flags them', () => {
    const input: ScanInput = {
      manifest: {
        manifest_version: 3,
        name: 'Leaky Extension',
        version: '1.0.0',
        permissions: [],
        host_permissions: [],
      },
      files: {
        'config.js': 'const apiKey = "AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI";',
      },
    };

    const report = generateScanReport(input);
    expect(report.findings.some((f) => f.id === 'SECRET_GOOGLE_API')).toBe(true);
  });

  it('generates valid HTML report', () => {
    const input: ScanInput = {
      manifest: {
        manifest_version: 3,
        name: 'HTML Test',
        version: '1.0',
        permissions: [],
        host_permissions: [],
      },
      files: {},
    };

    const report = generateScanReport(input);
    const html = generateHtmlReport(report);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('HTML Test');
    expect(html).toContain('</html>');
  });
});
