import { describe, it, expect } from 'vitest';
import {
  analyzePermissions,
  calculatePermissionScore,
  detectBroadHostPermissions,
  detectDangerousCombos,
  DANGEROUS_PERMISSIONS,
  DANGEROUS_COMBOS,
} from '../../src/permissions/analyzer';
import type { ParsedManifest } from '../../src/types';

function makeManifest(overrides: Partial<ParsedManifest> = {}): ParsedManifest {
  return {
    manifest_version: 3,
    name: 'Test',
    version: '1.0',
    permissions: [],
    host_permissions: [],
    ...overrides,
  };
}

describe('DANGEROUS_PERMISSIONS', () => {
  it('defines <all_urls> with weight 35', () => {
    expect(DANGEROUS_PERMISSIONS['<all_urls>'].weight).toBe(35);
  });

  it('defines debugger with weight 30', () => {
    expect(DANGEROUS_PERMISSIONS['debugger'].weight).toBe(30);
  });
});

describe('DANGEROUS_COMBOS', () => {
  it('has at least 5 combos defined', () => {
    expect(DANGEROUS_COMBOS.length).toBeGreaterThanOrEqual(5);
  });
});

describe('calculatePermissionScore', () => {
  it('returns 0 for no permissions', () => {
    const result = calculatePermissionScore(makeManifest());
    expect(result.score).toBe(0);
    expect(result.findings).toHaveLength(0);
  });

  it('returns high score for <all_urls>', () => {
    const result = calculatePermissionScore(
      makeManifest({ host_permissions: ['<all_urls>'] })
    );
    expect(result.score).toBeGreaterThanOrEqual(35);
  });

  it('returns high score for dangerous combo (tabs + webRequest + webRequestBlocking)', () => {
    const result = calculatePermissionScore(
      makeManifest({
        permissions: ['tabs', 'webRequest', 'webRequestBlocking'],
      })
    );
    expect(result.score).toBeGreaterThanOrEqual(35);
  });

  it('returns low score for minimal permissions (storage, activeTab)', () => {
    const result = calculatePermissionScore(
      makeManifest({ permissions: ['storage', 'activeTab'] })
    );
    expect(result.score).toBeLessThanOrEqual(5);
  });

  it('flags broad host_permissions', () => {
    const result = calculatePermissionScore(
      makeManifest({ host_permissions: ['*://*/*'] })
    );
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.findings.some((f) => f.id === 'PERM_WILDCARD_HOST')).toBe(true);
  });

  it('detects dangerous permission combinations', () => {
    const result = calculatePermissionScore(
      makeManifest({
        permissions: ['cookies'],
        host_permissions: ['<all_urls>'],
      })
    );
    expect(result.findings.some((f) => f.id.startsWith('COMBO_'))).toBe(true);
  });

  it('caps score at 100', () => {
    const result = calculatePermissionScore(
      makeManifest({
        permissions: [
          'debugger',
          'management',
          'cookies',
          'clipboardRead',
          'desktopCapture',
          'nativeMessaging',
          'pageCapture',
          'proxy',
          'tabs',
          'webRequest',
          'webRequestBlocking',
          'scripting',
          'downloads',
          'history',
          'identity',
          'browsingData',
        ],
        host_permissions: ['<all_urls>'],
      })
    );
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

describe('detectBroadHostPermissions', () => {
  it('flags <all_urls>', () => {
    const findings = detectBroadHostPermissions(['<all_urls>']);
    expect(findings).toHaveLength(1);
    expect(findings[0].id).toBe('PERM_ALL_URLS');
    expect(findings[0].severity).toBe('critical');
  });

  it('flags *://*/*', () => {
    const findings = detectBroadHostPermissions(['*://*/*']);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].severity).toBe('critical');
  });

  it('does not flag specific domains', () => {
    const findings = detectBroadHostPermissions(['https://example.com/*']);
    expect(findings).toHaveLength(0);
  });

  it('flags wildcard subdomain', () => {
    const findings = detectBroadHostPermissions(['*://*.google.com/*']);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].severity).toBe('medium');
  });
});

describe('detectDangerousCombos', () => {
  it('detects cookies + <all_urls> combo', () => {
    const findings = detectDangerousCombos(['cookies', '<all_urls>']);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].severity).toBe('critical');
  });

  it('returns empty for safe permissions', () => {
    const findings = detectDangerousCombos(['storage', 'activeTab']);
    expect(findings).toHaveLength(0);
  });
});

describe('analyzePermissions', () => {
  it('returns complete PermissionReport', () => {
    const manifest = makeManifest({
      permissions: ['tabs', 'storage'],
      host_permissions: ['<all_urls>'],
    });
    const report = analyzePermissions(manifest);
    expect(report.declared).toContain('tabs');
    expect(report.declared).toContain('<all_urls>');
    expect(report.dangerous).toContain('<all_urls>');
    expect(report.broadHostPermissions).toContain('<all_urls>');
  });

  it('reports no dangerous permissions for safe manifest', () => {
    const manifest = makeManifest({
      permissions: ['storage', 'activeTab'],
      host_permissions: ['https://example.com/*'],
    });
    const report = analyzePermissions(manifest);
    expect(report.dangerous).toHaveLength(0);
    expect(report.broadHostPermissions).toHaveLength(0);
  });
});
