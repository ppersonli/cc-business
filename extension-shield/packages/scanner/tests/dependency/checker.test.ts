import { describe, it, expect } from 'vitest';
import { checkDependencies, VULNERABLE_LIBRARIES } from '../../src/dependency/checker';

describe('VULNERABLE_LIBRARIES', () => {
  it('has at least 3 entries', () => {
    expect(VULNERABLE_LIBRARIES.length).toBeGreaterThanOrEqual(3);
  });

  it('each entry has required fields', () => {
    for (const lib of VULNERABLE_LIBRARIES) {
      expect(lib.name).toBeTruthy();
      expect(lib.pattern).toBeInstanceOf(RegExp);
      expect(lib.maxSafeVersion).toBeTruthy();
      expect(['medium', 'high', 'critical']).toContain(lib.severity);
    }
  });
});

describe('checkDependencies', () => {
  it('detects vulnerable jQuery', () => {
    const files = {
      'vendor.js': '/* jQuery v2.1.4 */ var jQuery = function() {};',
    };
    const findings = checkDependencies(files);
    expect(findings.some((f) => f.title.includes('jQuery'))).toBe(true);
  });

  it('does not flag safe jQuery version', () => {
    const files = {
      'vendor.js': '/* jQuery v3.6.0 */ var jQuery = function() {};',
    };
    const findings = checkDependencies(files);
    expect(findings.filter((f) => f.title.includes('jQuery'))).toHaveLength(0);
  });

  it('detects vulnerable Lodash', () => {
    const files = {
      'vendor.js': '/* lodash v4.17.10 */ var _ = {};',
    };
    const findings = checkDependencies(files);
    expect(findings.some((f) => f.title.includes('Lodash'))).toBe(true);
  });

  it('skips non-JS files', () => {
    const files = {
      'style.css': '/* jQuery v1.9.1 */ body { color: red; }',
    };
    const findings = checkDependencies(files);
    expect(findings).toHaveLength(0);
  });

  it('includes CVE reference when available', () => {
    const files = {
      'vendor.js': '/* jQuery v1.9.1 */ var jQuery = {};',
    };
    const findings = checkDependencies(files);
    const jquery = findings.find((f) => f.title.includes('jQuery'));
    expect(jquery?.description).toContain('CVE-');
  });

  it('returns empty for clean files', () => {
    const files = {
      'app.js': 'const x = 1;',
    };
    const findings = checkDependencies(files);
    expect(findings).toHaveLength(0);
  });
});
