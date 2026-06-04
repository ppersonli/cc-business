import { describe, it, expect } from 'vitest';
import { parseCSP, analyzeCSP, calculateCSPScore } from '../../src/csp/analyzer';
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

describe('parseCSP', () => {
  it('returns empty report when no CSP defined', () => {
    const report = parseCSP(makeManifest());
    expect(report.raw).toBeNull();
    expect(report.hasUnsafeEval).toBe(false);
    expect(report.hasUnsafeInline).toBe(false);
  });

  it('detects unsafe-eval', () => {
    const report = parseCSP(
      makeManifest({
        content_security_policy: { extension_pages: "script-src 'self' 'unsafe-eval'" },
      })
    );
    expect(report.hasUnsafeEval).toBe(true);
    expect(report.hasUnsafeInline).toBe(false);
  });

  it('detects unsafe-inline', () => {
    const report = parseCSP(
      makeManifest({
        content_security_policy: { extension_pages: "script-src 'self' 'unsafe-inline'" },
      })
    );
    expect(report.hasUnsafeInline).toBe(true);
  });

  it('detects data: URIs', () => {
    const report = parseCSP(
      makeManifest({
        content_security_policy: { extension_pages: "script-src 'self' data:" },
      })
    );
    expect(report.allowsDataUri).toBe(true);
  });

  it('detects remote script sources', () => {
    const report = parseCSP(
      makeManifest({
        content_security_policy: {
          extension_pages: "script-src 'self' https://cdn.example.com",
        },
      })
    );
    expect(report.allowsRemoteScript).toBe(true);
  });

  it('parses MV2 string format CSP', () => {
    const report = parseCSP(
      makeManifest({
        content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self'",
      })
    );
    expect(report.hasUnsafeEval).toBe(true);
    expect(report.directives['object-src']).toEqual(["'self'"]);
  });

  it('parses MV3 object format CSP', () => {
    const report = parseCSP(
      makeManifest({
        content_security_policy: {
          extension_pages: "script-src 'self'; object-src 'self'",
        },
      })
    );
    expect(report.directives['script-src']).toEqual(["'self'"]);
  });
});

describe('analyzeCSP', () => {
  it('returns no findings for safe CSP', () => {
    const findings = analyzeCSP(
      makeManifest({
        content_security_policy: { extension_pages: "script-src 'self'; object-src 'self'" },
      })
    );
    expect(findings).toHaveLength(0);
  });

  it('flags unsafe-eval', () => {
    const findings = analyzeCSP(
      makeManifest({
        content_security_policy: { extension_pages: "script-src 'self' 'unsafe-eval'" },
      })
    );
    expect(findings.some((f) => f.id === 'CSP_UNSAFE_EVAL')).toBe(true);
    expect(findings.find((f) => f.id === 'CSP_UNSAFE_EVAL')!.severity).toBe('critical');
  });

  it('flags unsafe-inline', () => {
    const findings = analyzeCSP(
      makeManifest({
        content_security_policy: { extension_pages: "script-src 'self' 'unsafe-inline'" },
      })
    );
    expect(findings.some((f) => f.id === 'CSP_UNSAFE_INLINE')).toBe(true);
    expect(findings.find((f) => f.id === 'CSP_UNSAFE_INLINE')!.severity).toBe('high');
  });

  it('flags data: URIs', () => {
    const findings = analyzeCSP(
      makeManifest({
        content_security_policy: { extension_pages: "script-src 'self' data:" },
      })
    );
    expect(findings.some((f) => f.id === 'CSP_DATA_URI')).toBe(true);
  });

  it('flags remote script sources', () => {
    const findings = analyzeCSP(
      makeManifest({
        content_security_policy: {
          extension_pages: "script-src 'self' https://cdn.example.com",
        },
      })
    );
    expect(findings.some((f) => f.id === 'CSP_REMOTE_SCRIPT')).toBe(true);
  });

  it('flags missing CSP for MV2', () => {
    const findings = analyzeCSP(makeManifest({ manifest_version: 2 }));
    expect(findings.some((f) => f.id === 'CSP_MISSING')).toBe(true);
  });

  it('does not flag missing CSP for MV3 (defaults are safe)', () => {
    const findings = analyzeCSP(makeManifest({ manifest_version: 3 }));
    expect(findings.some((f) => f.id === 'CSP_MISSING')).toBe(false);
  });
});

describe('calculateCSPScore', () => {
  it('returns 0 for safe CSP', () => {
    const result = calculateCSPScore(
      makeManifest({
        content_security_policy: { extension_pages: "script-src 'self'" },
      })
    );
    expect(result.score).toBe(0);
  });

  it('returns high score for unsafe-eval', () => {
    const result = calculateCSPScore(
      makeManifest({
        content_security_policy: { extension_pages: "script-src 'self' 'unsafe-eval'" },
      })
    );
    expect(result.score).toBe(40);
  });

  it('caps score at 100', () => {
    const result = calculateCSPScore(
      makeManifest({
        content_security_policy: {
          extension_pages:
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' data: https://evil.com",
        },
      })
    );
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
