import { describe, it, expect } from 'vitest';
import { validatePrivacyPolicy, checkDataCollectionIndicators } from '../../src/privacy/validator';
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

describe('checkDataCollectionIndicators', () => {
  it('detects cookies permission', () => {
    const result = checkDataCollectionIndicators(
      makeManifest({ permissions: ['cookies'] }),
      {}
    );
    expect(result.collectsData).toBe(true);
    expect(result.indicators).toContain('chrome.cookies API');
  });

  it('detects fetch calls in files', () => {
    const result = checkDataCollectionIndicators(makeManifest(), {
      'bg.js': 'fetch("https://example.com/api")',
    });
    expect(result.collectsData).toBe(true);
    expect(result.indicators).toContain('network requests (fetch/XHR)');
  });

  it('detects analytics tracking', () => {
    const result = checkDataCollectionIndicators(makeManifest(), {
      'bg.js': 'google-analytics.com/analytics.js',
    });
    expect(result.indicators).toContain('analytics tracking');
  });

  it('returns false for clean extension', () => {
    const result = checkDataCollectionIndicators(makeManifest(), {
      'bg.js': 'console.log("hello");',
    });
    expect(result.collectsData).toBe(false);
    expect(result.indicators).toHaveLength(0);
  });

  it('detects localStorage usage', () => {
    const result = checkDataCollectionIndicators(makeManifest(), {
      'bg.js': 'localStorage.setItem("key", "value");',
    });
    expect(result.indicators).toContain('local/session storage usage');
  });
});

describe('validatePrivacyPolicy', () => {
  it('flags data collection without privacy policy', () => {
    const findings = validatePrivacyPolicy(
      makeManifest({ permissions: ['cookies'] }),
      undefined
    );
    expect(findings.some((f) => f.id === 'PRIVACY_NO_POLICY')).toBe(true);
    expect(findings.find((f) => f.id === 'PRIVACY_NO_POLICY')!.severity).toBe('high');
  });

  it('notes data collection with privacy policy', () => {
    const findings = validatePrivacyPolicy(
      makeManifest({ permissions: ['cookies'] }),
      { name: 'Test', version: '1.0', privacyPolicyUrl: 'https://example.com/privacy' }
    );
    expect(findings.some((f) => f.id === 'PRIVACY_COLLECTS_DATA')).toBe(true);
    expect(findings.find((f) => f.id === 'PRIVACY_COLLECTS_DATA')!.severity).toBe('low');
  });

  it('returns empty for extension with no data collection', () => {
    const findings = validatePrivacyPolicy(makeManifest(), undefined);
    expect(findings).toHaveLength(0);
  });
});
