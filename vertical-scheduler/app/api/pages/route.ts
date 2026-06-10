import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-helpers';
import { createBookingPage, getBookingPagesByUserId, getBookingPageBySlug } from '@/lib/db';

export async function GET() {
  try {
    const user = await requireUser();
    const pages = await getBookingPagesByUserId(user.id);
    return NextResponse.json({ pages });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('GET /api/pages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const { title, slug, description, brandColor, logoUrl } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Slug must contain only lowercase letters, numbers, and hyphens' }, { status: 400 });
    }

    const existing = await getBookingPageBySlug(slug);
    if (existing) {
      return NextResponse.json({ error: 'Slug is already taken' }, { status: 409 });
    }

    const page = await createBookingPage(user.id, { title: title.trim(), slug, description, brandColor, logoUrl });
    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('POST /api/pages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
