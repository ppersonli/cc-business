import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const db = getDb();
    const subscription = db.prepare(
      'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
    ).get(userId) as any;

    if (!subscription) {
      return NextResponse.json({ plan: 'free', isPro: false });
    }

    // Check if subscription expired
    if (subscription.expires_at && new Date(subscription.expires_at) < new Date()) {
      return NextResponse.json({ plan: 'free', isPro: false });
    }

    return NextResponse.json({
      plan: subscription.plan,
      isPro: subscription.status === 'active' && subscription.plan !== 'free',
      expiresAt: subscription.expires_at,
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
