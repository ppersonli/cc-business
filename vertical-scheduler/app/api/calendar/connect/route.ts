import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCalendarAuthUrl } from '@/lib/google-calendar';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = getCalendarAuthUrl(session.user.id);
    return NextResponse.redirect(url);
  } catch (error) {
    console.error('GET /api/calendar/connect error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
