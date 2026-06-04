import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { initSchema, getShieldScanById } from '@/lib/db';

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initSchema();
    const { id } = await params;
    const scanId = parseInt(id, 10);
    if (isNaN(scanId)) {
      return NextResponse.json({ error: 'Invalid scan ID' }, { status: 400 });
    }

    const scan = await getShieldScanById(scanId);
    if (!scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    if (scan.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ scan });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
