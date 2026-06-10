import { NextResponse } from 'next/server';
import { parseOAuthCallback, exchangeTwitterCode, exchangeLinkedInCode } from '@/lib/oauth';
import { storeAccount } from '@/lib/oauth/token-manager';

// OAuth callback handler for all platforms
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const platform = url.pathname.split('/').at(-2); // 'twitter' or 'linkedin' from the path
    const result = parseOAuthCallback(request.url);

    if (result.error) {
      return NextResponse.redirect(
        new URL(`/accounts?error=${result.error}`, url.origin)
      );
    }

    if (!result.code || !result.state) {
      return NextResponse.redirect(
        new URL('/accounts?error=missing_params', url.origin)
      );
    }

    const userId = result.state.split(':')[0];

    let tokenResponse;
    if (platform === 'twitter') {
      const codeVerifier = request.headers.get('cookie')
        ?.split(';')
        .find(c => c.trim().startsWith('twitter_pkce_verifier='))
        ?.split('=')[1];

      if (!codeVerifier) {
        return NextResponse.redirect(
          new URL('/accounts?error=missing_verifier', url.origin)
        );
      }

      tokenResponse = await exchangeTwitterCode(result.code, codeVerifier);
    } else if (platform === 'linkedin') {
      tokenResponse = await exchangeLinkedInCode(result.code);
    } else {
      return NextResponse.redirect(
        new URL('/accounts?error=unsupported_platform', url.origin)
      );
    }

    await storeAccount({
      userId,
      platform: platform!,
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      username: tokenResponse.username || 'Unknown',
      platformUserId: tokenResponse.platformUserId,
      expiresIn: tokenResponse.expiresIn,
    });

    const response = NextResponse.redirect(
      new URL('/accounts?connected=' + platform, url.origin)
    );

    // Clear the PKCE verifier cookie
    if (platform === 'twitter') {
      response.cookies.delete('twitter_pkce_verifier');
    }

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    const url = new URL(request.url);
    return NextResponse.redirect(
      new URL('/accounts?error=callback_failed', url.origin)
    );
  }
}
