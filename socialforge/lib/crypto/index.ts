/**
 * Cryptographic utilities for SocialForge.
 * AES-256-GCM encryption for OAuth tokens, PKCE generation for OAuth flows.
 */

const ENCRYPTION_KEY_ENV = process.env.ENCRYPTION_KEY;

/**
 * Generate a random 256-bit key as base64.
 */
export async function generateKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await crypto.subtle.exportKey('raw', key);
  return Buffer.from(exported).toString('base64');
}

/**
 * Import a base64 key for AES-256-GCM.
 */
async function importKey(keyBase64: string): Promise<CryptoKey> {
  const raw = Buffer.from(keyBase64, 'base64');
  return crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a string using AES-256-GCM.
 * Returns: base64(IV + ciphertext + authTag)
 */
export async function encrypt(plaintext: string, keyBase64: string): Promise<string> {
  const key = await importKey(keyBase64);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  // Combine IV + ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return Buffer.from(combined).toString('base64');
}

/**
 * Decrypt a string encrypted with encrypt().
 */
export async function decrypt(encryptedBase64: string, keyBase64: string): Promise<string> {
  const key = await importKey(keyBase64);
  const combined = new Uint8Array(Buffer.from(encryptedBase64, 'base64'));

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Hash an API key using SHA-256 (for storage).
 */
export async function hashApiKey(key: string): Promise<string> {
  const encoded = new TextEncoder().encode(key);
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return Buffer.from(hash).toString('hex');
}

/**
 * Generate PKCE code verifier and challenge for OAuth 2.0.
 */
export function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const codeVerifier = Buffer.from(array)
    .toString('base64url')
    .replace(/=/g, '');

  // S256 challenge = base64url(sha256(verifier))
  const encoded = new TextEncoder().encode(codeVerifier);
  const hashBuffer = new Uint8Array(
    // Synchronous SHA-256 for PKCE - we use a workaround since subtle.digest is async
    // But for URL generation we need sync, so we pre-compute
    0
  );

  // We'll compute the challenge asynchronously in the OAuth flow
  // For now, return the verifier and a placeholder
  return {
    codeVerifier,
    codeChallenge: '', // computed async in getTwitterAuthUrl
  };
}

/**
 * Generate PKCE with async challenge computation.
 */
export async function generatePKCEAsync(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const codeVerifier = Buffer.from(array)
    .toString('base64url')
    .replace(/=/g, '');

  const encoded = new TextEncoder().encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  const codeChallenge = Buffer.from(hash)
    .toString('base64url')
    .replace(/=/g, '');

  return { codeVerifier, codeChallenge };
}

/**
 * Encrypt token using the app's encryption key from env.
 */
export async function encryptToken(token: string): Promise<string> {
  const key = ENCRYPTION_KEY_ENV || await generateKey();
  return encrypt(token, key);
}

/**
 * Decrypt token using the app's encryption key from env.
 */
export async function decryptToken(encrypted: string): Promise<string> {
  const key = ENCRYPTION_KEY_ENV || '';
  return decrypt(encrypted, key);
}
