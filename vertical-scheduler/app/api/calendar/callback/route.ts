import { NextResponse } from 'next/server';
import { exchangeCalendarCode } from '@/lib/google-calendar';
import { getClient } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // userId

    if (!code || !state) {
      return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
    }

    const tokens = await exchangeCalendarCode(code);

    // Store tokens in DB
    const db = getClient();
    await db.execute({
      sql: `UPDATE users SET calendar_access_token = ?, calendar_refresh_token = ?, calendar_token_expires_at = ?
            WHERE id = ?`,
      args: [tokens.access_token, tokens.refresh_token || null, tokens.expires_at, state],
    });

    // Redirect to dashboard with success
    return NextResponse.redirect(new URL('/dashboard/settings?calendar=connected', request.url));
  } catch (error) {
    console.error('GET /api/calendar/callback error:', error);
    return NextResponse.redirect(new URL('/dashboard/settings?calendar=error', request.url));
  }
}
