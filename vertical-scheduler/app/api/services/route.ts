import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-helpers';
import { getBookingPageById, createService, getServicesByPageId } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');
    if (!pageId) {
      return NextResponse.json({ error: 'pageId is required' }, { status: 400 });
    }

    const user = await requireUser();
    const page = await getBookingPageById(pageId);
    if (!page || page.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const services = await getServicesByPageId(pageId);
    return NextResponse.json({ services });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('GET /api/services error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const { pageId, name, description, durationMinutes, priceCents, currency } = body;

    if (!pageId || !name || !durationMinutes) {
      return NextResponse.json({ error: 'pageId, name, and durationMinutes are required' }, { status: 400 });
    }

    const page = await getBookingPageById(pageId);
    if (!page || page.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const service = await createService(pageId, { name, description, durationMinutes, priceCents, currency });
    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('POST /api/services error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
