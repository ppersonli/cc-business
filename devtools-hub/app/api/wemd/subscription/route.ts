import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { initSchema, findUserById, getSubscriptionByUserId } from '@/lib/db';

/**
 * WeMD Pro subscription status endpoint.
 * Returns the user's current plan and Pro status.
 */

async function getUserFromRequest(req: NextRequest): Promise<number | null> {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const payload = verifyToken(authHeader.slice(7));
    if (payload) return payload.userId;
  }
  const cookie = req.cookies.get('auth_token');
  if (cookie?.value) {
    const payload = verifyToken(cookie.value);
    if (payload) return payload.userId;
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ isPro: false, plan: 'free' });
    }

    await initSchema();

    const subscription = await getSubscriptionByUserId(userId);
    if (!subscription) {
      return NextResponse.json({ isPro: false, plan: 'free' });
    }

    // Check if subscription is active and not expired
    const isWemdPro = subscription.plan?.startsWith('wemd-pro');
    const isActive = subscription.status === 'active';
    const notExpired = !subscription.expires_at || new Date(subscription.expires_at) > new Date();
    const isPro = isWemdPro && isActive && notExpired;

    return NextResponse.json({
      isPro,
      plan: isPro ? subscription.plan : 'free',
      expiresAt: subscription.expires_at,
    });
  } catch (error) {
    console.error('[WeMD Subscription] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
