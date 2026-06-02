/**
 * GET /auth/google/webhook
 * Google OAuth callback — exchanges code for tokens, finds/creates user, sets JWT cookie, redirects to home.
 */
import { NextResponse } from 'next/server';
import { exchangeCodeForTokens, getGoogleUserInfo } from '@/lib/google-auth';
import { findOrCreateGoogleUser } from '@/lib/db';
import { createToken } from '@/lib/auth';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // Handle errors from Google
  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL('/?error=google_auth_failed', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  // Verify state (CSRF protection)
  const cookieHeader = request.headers.get('cookie') || '';
  const stateMatch = cookieHeader.match(/google_oauth_state=([^;]+)/);
  const cookieState = stateMatch?.[1];
  if (!cookieState || cookieState !== state) {
    console.error('OAuth state mismatch — possible CSRF attack');
    return NextResponse.redirect(new URL('/?error=invalid_state', request.url));
  }

  try {
    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Get user info from Google
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    // Find or create user in our database
    const user = findOrCreateGoogleUser(
      googleUser.id,
      googleUser.email,
      googleUser.name,
      googleUser.picture
    );

    // Create our own JWT token
    const jwtToken = createToken(user.id, user.email);

    // Redirect to home page with token in cookie
    const response = NextResponse.redirect(new URL('/', request.url));

    // Set auth token cookie (7 days)
    response.cookies.set('auth_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    // Clear the OAuth state cookie
    response.cookies.set('google_oauth_state', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }
}
