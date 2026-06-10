import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/api/auth-guard';
import { getTwitterAuthUrl, getLinkedInAuthUrl } from '@/lib/oauth';

// Initiate OAuth for a platform
export async function GET(
  request: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { platform } = await params;
    const state = `${userId}:${crypto.randomUUID()}`;

    if (platform === 'twitter') {
      const { url, codeVerifier } = await getTwitterAuthUrl(state);
      const response = NextResponse.redirect(url);
      response.cookies.set('twitter_pkce_verifier', codeVerifier, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 600,
      });
      return response;
    }

    if (platform === 'linkedin') {
      const url = getLinkedInAuthUrl(state);
      return NextResponse.redirect(url);
    }

    return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
  } catch (error) {
    console.error('GET /api/accounts/connect/[platform] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
