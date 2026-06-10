/**
 * OAuth 2.0 configuration and URL generation for social platforms.
 * Twitter uses PKCE flow, LinkedIn uses standard authorization code flow.
 */

import { generatePKCEAsync } from '@/lib/crypto';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// --- Platform Configurations ---

export const TWITTER_CONFIG = {
  clientId: process.env.TWITTER_CLIENT_ID || '',
  clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
  authUrl: 'https://twitter.com/i/oauth2/authorize',
  tokenUrl: 'https://api.twitter.com/2/oauth2/token',
  revokeUrl: 'https://api.twitter.com/2/oauth2/revoke',
  callbackUrl: `${BASE_URL}/api/accounts/connect/twitter/callback`,
  scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
  userUrl: 'https://api.twitter.com/2/users/me?user.fields=id,name,username,profile_image_url',
};

export const LINKEDIN_CONFIG = {
  clientId: process.env.LINKEDIN_CLIENT_ID || '',
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
  authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
  tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
  callbackUrl: `${BASE_URL}/api/accounts/connect/linkedin/callback`,
  scopes: ['openid', 'profile', 'w_member_social', 'email'],
  userUrl: 'https://api.linkedin.com/v2/userinfo',
};

// --- OAuth URL Generation ---

export async function getTwitterAuthUrl(state: string): Promise<{ url: string; codeVerifier: string }> {
  const { codeVerifier, codeChallenge } = await generatePKCEAsync();

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: TWITTER_CONFIG.clientId,
    redirect_uri: TWITTER_CONFIG.callbackUrl,
    scope: TWITTER_CONFIG.scopes.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return {
    url: `${TWITTER_CONFIG.authUrl}?${params.toString()}`,
    codeVerifier,
  };
}

export function getLinkedInAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINKEDIN_CONFIG.clientId,
    redirect_uri: LINKEDIN_CONFIG.callbackUrl,
    scope: LINKEDIN_CONFIG.scopes.join(' '),
    state,
  });

  return `${LINKEDIN_CONFIG.authUrl}?${params.toString()}`;
}

// --- Token Exchange ---

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  platformUserId?: string;
  username?: string;
}

export async function exchangeTwitterCode(
  code: string,
  codeVerifier: string,
): Promise<TokenResponse> {
  const response = await fetch(TWITTER_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${TWITTER_CONFIG.clientId}:${TWITTER_CONFIG.clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: TWITTER_CONFIG.callbackUrl,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twitter token exchange failed: ${error}`);
  }

  const data = await response.json();

  // Fetch user info
  const userResponse = await fetch(TWITTER_CONFIG.userUrl, {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const userData = await userResponse.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    platformUserId: userData.data?.id,
    username: userData.data?.username,
  };
}

export async function exchangeLinkedInCode(code: string): Promise<TokenResponse> {
  const response = await fetch(LINKEDIN_CONFIG.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: LINKEDIN_CONFIG.callbackUrl,
      client_id: LINKEDIN_CONFIG.clientId,
      client_secret: LINKEDIN_CONFIG.clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LinkedIn token exchange failed: ${error}`);
  }

  const data = await response.json();

  // Fetch user info
  const userResponse = await fetch(LINKEDIN_CONFIG.userUrl, {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const userData = await userResponse.json();

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    platformUserId: userData.sub,
    username: userData.name || userData.given_name,
  };
}

// --- Token Refresh ---

export async function refreshTwitterToken(refreshToken: string): Promise<TokenResponse> {
  const response = await fetch(TWITTER_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${TWITTER_CONFIG.clientId}:${TWITTER_CONFIG.clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error('Twitter token refresh failed');
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

// LinkedIn tokens are short-lived (60 days) and don't support refresh
// Users need to reconnect when token expires

// --- Callback Parsing ---

export function parseOAuthCallback(url: string): {
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
} {
  const params = new URL(url).searchParams;

  const error = params.get('error');
  if (error) {
    return {
      error,
      errorDescription: params.get('error_description') || undefined,
    };
  }

  const code = params.get('code');
  const state = params.get('state');

  if (!code) {
    return { error: 'missing_code' };
  }

  return { code: code || undefined, state: state || undefined };
}
