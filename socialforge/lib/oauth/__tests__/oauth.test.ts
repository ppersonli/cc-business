import { describe, it, expect } from 'vitest';
import { TWITTER_CONFIG, LINKEDIN_CONFIG, getTwitterAuthUrl, getLinkedInAuthUrl, parseOAuthCallback } from '../index';

describe('getTwitterAuthUrl', () => {
  it('generates a valid Twitter OAuth URL', async () => {
    const { url, codeVerifier } = await getTwitterAuthUrl('test-state');
    expect(url).toContain('twitter.com/i/oauth2/authorize');
    expect(url).toContain('response_type=code');
    expect(url).toContain('client_id=');
    expect(url).toContain('state=test-state');
    expect(url).toContain('code_challenge=');
    expect(url).toContain('code_challenge_method=S256');
    expect(codeVerifier).toBeDefined();
    expect(codeVerifier.length).toBeGreaterThan(0);
  });

  it('includes required scopes', async () => {
    const { url } = await getTwitterAuthUrl('state');
    expect(url).toContain('scope=');
    expect(url).toContain('tweet.read');
    expect(url).toContain('tweet.write');
    expect(url).toContain('users.read');
  });
});

describe('getLinkedInAuthUrl', () => {
  it('generates a valid LinkedIn OAuth URL', () => {
    const url = getLinkedInAuthUrl('test-state');
    expect(url).toContain('linkedin.com/oauth/v2/authorization');
    expect(url).toContain('response_type=code');
    expect(url).toContain('client_id=');
    expect(url).toContain('state=test-state');
  });

  it('includes required scopes', () => {
    const url = getLinkedInAuthUrl('state');
    expect(url).toContain('scope=');
    expect(url).toContain('w_member_social');
  });
});

describe('parseOAuthCallback', () => {
  it('parses code and state from URL', () => {
    const url = 'https://app.example.com/callback?code=abc123&state=xyz789';
    const result = parseOAuthCallback(url);
    expect(result.code).toBe('abc123');
    expect(result.state).toBe('xyz789');
  });

  it('returns error for missing code', () => {
    const url = 'https://app.example.com/callback?state=xyz789';
    const result = parseOAuthCallback(url);
    expect(result.error).toBeDefined();
  });

  it('returns error param when present', () => {
    const url = 'https://app.example.com/callback?error=access_denied&error_description=User+denied+access';
    const result = parseOAuthCallback(url);
    expect(result.error).toBe('access_denied');
  });
});
