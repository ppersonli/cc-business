import { describe, it, expect } from 'vitest';
import {
  scanForSecrets,
  calculateEntropy,
  SECRET_RULES,
} from '../../src/secrets/scanner';

describe('calculateEntropy', () => {
  it('returns 0 for empty string', () => {
    expect(calculateEntropy('')).toBe(0);
  });

  it('returns low entropy for repeated characters', () => {
    expect(calculateEntropy('aaaaaaaaaa')).toBe(0);
  });

  it('returns high entropy for random-looking strings', () => {
    const entropy = calculateEntropy('aB3$xK9!mZ2@pQ7&');
    expect(entropy).toBeGreaterThan(3.5);
  });

  it('returns moderate entropy for English-like text', () => {
    const entropy = calculateEntropy('hello world');
    expect(entropy).toBeGreaterThan(2);
    expect(entropy).toBeLessThan(4);
  });
});

describe('SECRET_RULES', () => {
  it('has at least 8 rules', () => {
    expect(SECRET_RULES.length).toBeGreaterThanOrEqual(8);
  });

  it('each rule has required fields', () => {
    for (const rule of SECRET_RULES) {
      expect(rule.id).toBeTruthy();
      expect(rule.name).toBeTruthy();
      expect(rule.pattern).toBeInstanceOf(RegExp);
      expect(typeof rule.entropyThreshold).toBe('number');
      expect(['medium', 'high']).toContain(rule.severity);
    }
  });
});

describe('scanForSecrets', () => {
  it('detects AWS access keys', () => {
    // Pattern: /(?:AKIA|ABIA|ACCA|ASIA)[A-Z0-9]{16}/g — AKIA + 16 uppercase alphanumeric
    const files = { 'config.js': 'const key = "AKIA1234567890ABCDEF";' };
    const findings = scanForSecrets(files);
    expect(findings.some((f) => f.id === 'SECRET_AWS_KEY')).toBe(true);
  });

  it('detects GitHub tokens', () => {
    // Pattern: /gh[pousr]_[A-Za-z0-9_]{36,}/g — ghp_ + 36 alphanumeric
    const token = 'ghp_' + 'a'.repeat(36);
    const files = { 'config.js': `const token = "${token}";` };
    const findings = scanForSecrets(files);
    expect(findings.some((f) => f.id === 'SECRET_GITHUB_TOKEN')).toBe(true);
  });

  it('detects Google API keys', () => {
    // Pattern: /AIza[A-Za-z0-9_-]{35}/g — AIza + 35 alphanumeric
    const key = 'AIza' + 'S'.repeat(35);
    const files = { 'config.js': `const apiKey = "${key}";` };
    const findings = scanForSecrets(files);
    expect(findings.some((f) => f.id === 'SECRET_GOOGLE_API')).toBe(true);
  });

  it('detects Stripe keys', () => {
    // Pattern: /(sk|pk)_(test|live)_[A-Za-z0-9]{20,}/g — sk_test_ + 20 alphanumeric
    const key = 'sk_test_' + 'a'.repeat(24);
    const files = { 'config.js': `const sk = "${key}";` };
    const findings = scanForSecrets(files);
    expect(findings.some((f) => f.id === 'SECRET_STRIPE_KEY')).toBe(true);
  });

  it('detects private key blocks', () => {
    const files = {
      'key.pem': '-----BEGIN RSA PRIVATE KEY-----\nMIIE_FAKE_EXAMPLE',
    };
    const findings = scanForSecrets(files);
    expect(findings.some((f) => f.id === 'SECRET_PRIVATE_KEY')).toBe(true);
  });

  it('ignores low-entropy generic API key matches', () => {
    const files = { 'config.js': 'const apiKey = "aaaaaaaaaaaaaaaaaaaa";' };
    const findings = scanForSecrets(files);
    expect(findings.filter((f) => f.id === 'SECRET_GENERIC_API_KEY')).toHaveLength(0);
  });

  it('does not flag empty files', () => {
    const findings = scanForSecrets({ 'empty.js': '' });
    expect(findings).toHaveLength(0);
  });

  it('includes file path in findings', () => {
    const files = {
      'src/config.js': 'const key = "AKIA1234567890ABCDEF";',
    };
    const findings = scanForSecrets(files);
    expect(findings[0].file).toBe('src/config.js');
  });

  it('includes line number in findings', () => {
    const files = {
      'test.js': 'const a = 1;\nconst b = 2;\nconst key = "AKIA1234567890ABCDEF";',
    };
    const findings = scanForSecrets(files);
    expect(findings[0].line).toBe(3);
  });
});
