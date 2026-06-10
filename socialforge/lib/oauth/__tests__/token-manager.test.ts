import { describe, it, expect, vi, beforeEach } from 'vitest';
import { encrypt, decrypt, generateKey } from '../../crypto';

describe('Token encryption workflow', () => {
  it('encrypts, stores, and retrieves a token', async () => {
    const key = await generateKey();
    const originalToken = 'ya29.a0AfH6SMBx-example-oauth-token';

    // Encrypt
    const encrypted = await encrypt(originalToken, key);
    expect(encrypted).not.toBe(originalToken);

    // Decrypt
    const decrypted = await decrypt(encrypted, key);
    expect(decrypted).toBe(originalToken);
  });

  it('handles token refresh cycle', async () => {
    const key = await generateKey();

    const oldToken = 'old-access-token';
    const newToken = 'new-refreshed-token';

    const encryptedOld = await encrypt(oldToken, key);
    const encryptedNew = await encrypt(newToken, key);

    // Both should decrypt correctly
    expect(await decrypt(encryptedOld, key)).toBe(oldToken);
    expect(await decrypt(encryptedNew, key)).toBe(newToken);

    // They should be different encrypted values
    expect(encryptedOld).not.toBe(encryptedNew);
  });

  it('handles multiple platform tokens independently', async () => {
    const key = await generateKey();

    const twitterToken = 'twitter-token-123';
    const linkedinToken = 'linkedin-token-456';

    const encTwitter = await encrypt(twitterToken, key);
    const encLinkedin = await encrypt(linkedinToken, key);

    expect(await decrypt(encTwitter, key)).toBe(twitterToken);
    expect(await decrypt(encLinkedin, key)).toBe(linkedinToken);
  });
});
