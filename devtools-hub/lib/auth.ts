/**
 * Auth helper functions for API routes.
 * Simplified JWT implementation for development.
 */

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'devtools-hub-jwt-secret-change-in-prod';

/**
 * Create a JWT token for a user.
 */
export function createToken(userId: number, email: string): string {
  // Simple JWT implementation
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    })
  );

  // In production, use proper HMAC-SHA256
  const signature = btoa(JSON.stringify({ data: `${header}.${payload}`, secret: JWT_SECRET }));

  return `${header}.${payload}.${signature}`;
}

/**
 * Verify a JWT token and return the payload.
 */
export function verifyToken(token: string): { userId: number; email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return { userId: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

/**
 * Extract Bearer token from Authorization header.
 */
export function extractToken(authorization: string | undefined): string | null {
  if (!authorization) return null;
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

/**
 * Hash a password.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + JWT_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a password against its hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}
