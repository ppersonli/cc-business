/**
 * GET /api/auth/google
 * Initiates Google OAuth flow — generates state, stores in cookie, redirects to Google.
 */
import { NextResponse } from 'next/server';
import { getGoogleAuthUrl, generateOAuthState } from '@/lib/google-auth';

export async function GET() {
  const state = generateOAuthState();

  const response = NextResponse.redirect(getGoogleAuthUrl(state));

  // Store state in cookie for CSRF verification (10 min expiry)
  response.cookies.set('google_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  return response;
}
