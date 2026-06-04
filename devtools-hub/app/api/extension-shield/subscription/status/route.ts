import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { initSchema, getShieldScanById, findUserById, getSubscriptionByUserId } from '@/lib/db';

const FREE_SCAN_LIMIT = 3;

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initSchema();

    const user = await findUserById(userId);
    const subscription = await getSubscriptionByUserId(userId);

    const plan = subscription?.status === 'active' ? subscription.plan : 'free';
    const isPro = plan !== 'free';

    return NextResponse.json({
      plan,
      isPro,
      expiresAt: subscription?.expires_at ? new Date(subscription.expires_at).getTime() : undefined,
      scansRemaining: isPro ? Infinity : FREE_SCAN_LIMIT,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
