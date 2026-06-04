import { describe, it, expect } from 'vitest';
import {
  detectObfuscation,
  analyzeObfuscationScore,
  detectObfuscationSignatures,
} from '../../src/obfuscation/detector';

describe('analyzeObfuscationScore', () => {
  it('returns 0 for empty string', () => {
    expect(analyzeObfuscationScore('')).toBe(0);
  });

  it('returns low score for normal code', () => {
    const score = analyzeObfuscationScore(
      'const x = 1;\nconst y = 2;\nconsole.log(x + y);'
    );
    expect(score).toBeLessThan(30);
  });

  it('returns high score for obfuscated-like code', () => {
    const lines = Array(100)
      .fill(null)
      .map(() => 'var ' + Math.random().toString(36).substring(2, 15) + '="' + 'x'.repeat(200) + '";');
    const score = analyzeObfuscationScore(lines.join(''));
    expect(score).toBeGreaterThan(20);
  });

  it('caps score at 100', () => {
    const longLine = 'a'.repeat(10000);
    const score = analyzeObfuscationScore(longLine.repeat(100));
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('detectObfuscationSignatures', () => {
  it('detects hex variable names', () => {
    const code = Array(10)
      .fill(null)
      .map((_, i) => `_0x${i.toString(16).padStart(4, '0')} = 1;`)
      .join('\n');
    const sigs = detectObfuscationSignatures(code);
    expect(sigs).toContain('hex-variable-names');
  });

  it('returns empty for clean code', () => {
    const sigs = detectObfuscationSignatures('const x = 1;');
    expect(sigs).toHaveLength(0);
  });

  it('detects heavy fromCharCode usage', () => {
    const code = Array(15)
      .fill('String.fromCharCode(65)')
      .join(' + ');
    const sigs = detectObfuscationSignatures(code);
    expect(sigs).toContain('fromCharCode-heavy');
  });

  it('detects heavy base64 decoding', () => {
    const code = Array(8)
      .fill('atob("aGVsbG8=")')
      .join(';\n');
    const sigs = detectObfuscationSignatures(code);
    expect(sigs).toContain('base64-decoding-heavy');
  });
});

describe('detectObfuscation', () => {
  it('returns empty for normal JS files', () => {
    const findings = detectObfuscation({
      'app.js': 'const x = 1;\nconsole.log(x);',
    });
    expect(findings).toHaveLength(0);
  });

  it('skips non-JS files', () => {
    const findings = detectObfuscation({
      'style.css': 'body { color: red; }',
    });
    expect(findings).toHaveLength(0);
  });

  it('skips empty files', () => {
    const findings = detectObfuscation({ 'empty.js': '' });
    expect(findings).toHaveLength(0);
  });
});
