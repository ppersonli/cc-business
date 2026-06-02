import { NextResponse } from 'next/server';
import { findUserById, getSubscriptionByUserId } from '@/lib/db';
import { extractToken, verifyToken } from '@/lib/auth';
export async function GET(request: Request) {
  try {
    const authorization = request.headers.get('authorization');
    const token = extractToken(authorization || undefined);

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Get user
    const user = findUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get subscription
    const subscription = getSubscriptionByUserId(user.id);
    const isPro = subscription?.status === 'active' && subscription.plan !== 'free';

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      name: user.name || null,
      avatarUrl: user.avatar_url || null,
      provider: user.provider || 'local',
      createdAt: user.created_at,
      subscription: subscription ? {
        plan: subscription.plan,
        status: subscription.status,
        expiresAt: subscription.expires_at,
      } : { plan: 'free', status: 'active', expiresAt: null },
      isPro,
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
