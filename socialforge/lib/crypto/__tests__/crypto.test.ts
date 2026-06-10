import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, generateKey, hashApiKey, generatePKCEAsync } from '../index';

describe('encrypt/decrypt', () => {
  it('encrypts and decrypts a string correctly', async () => {
    const key = await generateKey();
    const plaintext = 'my-secret-oauth-token-12345';
    const encrypted = await encrypt(plaintext, key);
    const decrypted = await decrypt(encrypted, key);
    expect(decrypted).toBe(plaintext);
  });

  it('produces different ciphertext for same plaintext (random IV)', async () => {
    const key = await generateKey();
    const plaintext = 'same-token';
    const enc1 = await encrypt(plaintext, key);
    const enc2 = await encrypt(plaintext, key);
    expect(enc1).not.toBe(enc2);
  });

  it('fails to decrypt with wrong key', async () => {
    const key1 = await generateKey();
    const key2 = await generateKey();
    const encrypted = await encrypt('secret', key1);
    await expect(decrypt(encrypted, key2)).rejects.toThrow();
  });

  it('handles empty string', async () => {
    const key = await generateKey();
    const encrypted = await encrypt('', key);
    const decrypted = await decrypt(encrypted, key);
    expect(decrypted).toBe('');
  });

  it('handles unicode characters', async () => {
    const key = await generateKey();
    const plaintext = '🔐 Token with émojis and ñ';
    const encrypted = await encrypt(plaintext, key);
    const decrypted = await decrypt(encrypted, key);
    expect(decrypted).toBe(plaintext);
  });
});

describe('generateKey', () => {
  it('returns a base64-encoded 256-bit key', async () => {
    const key = await generateKey();
    expect(typeof key).toBe('string');
    // base64 encoded 32 bytes = 44 chars (with padding)
    const decoded = Buffer.from(key, 'base64');
    expect(decoded.length).toBe(32);
  });

  it('returns unique keys each time', async () => {
    const key1 = await generateKey();
    const key2 = await generateKey();
    expect(key1).not.toBe(key2);
  });
});

describe('hashApiKey', () => {
  it('returns a consistent hash for the same input', async () => {
    const hash1 = await hashApiKey('sk-abc123');
    const hash2 = await hashApiKey('sk-abc123');
    expect(hash1).toBe(hash2);
  });

  it('returns different hashes for different inputs', async () => {
    const hash1 = await hashApiKey('sk-abc123');
    const hash2 = await hashApiKey('sk-def456');
    expect(hash1).not.toBe(hash2);
  });

  it('returns a hex string', async () => {
    const hash = await hashApiKey('test');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe('generatePKCEAsync', () => {
  it('returns codeVerifier and codeChallenge', async () => {
    const pkce = await generatePKCEAsync();
    expect(pkce.codeVerifier).toBeDefined();
    expect(pkce.codeChallenge).toBeDefined();
    expect(typeof pkce.codeVerifier).toBe('string');
    expect(typeof pkce.codeChallenge).toBe('string');
  });

  it('codeVerifier is URL-safe', async () => {
    const pkce = await generatePKCEAsync();
    expect(pkce.codeVerifier).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('generates unique values each time', async () => {
    const pkce1 = await generatePKCEAsync();
    const pkce2 = await generatePKCEAsync();
    expect(pkce1.codeVerifier).not.toBe(pkce2.codeVerifier);
  });
});
