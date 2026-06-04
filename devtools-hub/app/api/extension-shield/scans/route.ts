import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import {
  initSchema,
  getShieldScansByUserId,
  getShieldScanCountByUserId,
  createShieldScan,
} from '@/lib/db';

async function getUserFromRequest(req: NextRequest): Promise<number | null> {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
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

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    const scans = await getShieldScansByUserId(userId, limit, offset);
    const total = await getShieldScanCountByUserId(userId);

    return NextResponse.json({ scans, total });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initSchema();

    const body = await req.json();
    const { extensionName, extensionId, riskScore, riskLevel, manifestVersion, reportJson, reportHtml } = body;

    if (!extensionName || riskScore === undefined || !riskLevel || !reportJson) {
      return NextResponse.json(
        { error: 'Missing required fields: extensionName, riskScore, riskLevel, reportJson' },
        { status: 400 }
      );
    }

    const scan = await createShieldScan({
      userId,
      extensionName,
      extensionId,
      riskScore,
      riskLevel,
      manifestVersion,
      reportJson: typeof reportJson === 'string' ? reportJson : JSON.stringify(reportJson),
      reportHtml,
    });

    return NextResponse.json({ scan });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
