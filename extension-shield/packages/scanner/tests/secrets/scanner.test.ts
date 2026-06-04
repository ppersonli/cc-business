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
    const files = { 'config.js': 'const key = "AKIA_FAKE_EXAMPLE";' };
    const findings = scanForSecrets(files);
    expect(findings.some((f) => f.id === 'SECRET_AWS_KEY')).toBe(true);
  });

  it('detects GitHub tokens', () => {
    const files = {
      'config.js': 'const token = "ghp_FAKE_TOKEN_EXAMPLE";',
    };
    const findings = scanForSecrets(files);
    expect(findings.some((f) => f.id === 'SECRET_GITHUB_TOKEN')).toBe(true);
  });

  it('detects Google API keys', () => {
    const files = {
      'config.js': 'const apiKey = "AIza_FAKE_KEY_EXAMPLE";',
    };
    const findings = scanForSecrets(files);
    expect(findings.some((f) => f.id === 'SECRET_GOOGLE_API')).toBe(true);
  });

  it('detects Stripe keys', () => {
    const files = { 'config.js': 'const sk = "sk_FAKE_EXAMPLE";' };
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
      'src/config.js': 'const key = "AKIA_FAKE_EXAMPLE";',
    };
    const findings = scanForSecrets(files);
    expect(findings[0].file).toBe('src/config.js');
  });

  it('includes line number in findings', () => {
    const files = {
      'test.js': 'const a = 1;\nconst b = 2;\nconst key = "AKIA_FAKE_EXAMPLE";',
    };
    const findings = scanForSecrets(files);
    expect(findings[0].line).toBe(3);
  });
});
