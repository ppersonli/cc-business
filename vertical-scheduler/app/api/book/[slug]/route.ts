import { NextResponse } from 'next/server';
import { getBookingPageBySlug, getServicesByPageId, getAvailabilityByPageId, getBookingsForDateRange, createBooking } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const page = await getBookingPageBySlug(slug);
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const services = await getServicesByPageId(page.id);
    const availability = await getAvailabilityByPageId(page.id);

    return NextResponse.json({ page, services, availability });
  } catch (error) {
    console.error('GET /api/book/[slug] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const page = await getBookingPageBySlug(slug);
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const body = await request.json();
    const { serviceId, clientName, clientEmail, clientPhone, startTime, endTime, notes } = body;

    if (!serviceId || !clientName || !clientEmail || !startTime || !endTime) {
      return NextResponse.json({ error: 'serviceId, clientName, clientEmail, startTime, and endTime are required' }, { status: 400 });
    }

    // Check for overlapping bookings
    const dateStr = startTime.split('T')[0];
    const existingBookings = await getBookingsForDateRange(page.id, dateStr, dateStr + 'T23:59:59');
    const hasOverlap = existingBookings.some(b =>
      (startTime < b.end_time && endTime > b.start_time)
    );
    if (hasOverlap) {
      return NextResponse.json({ error: 'Time slot is already booked' }, { status: 409 });
    }

    const booking = await createBooking(page.id, {
      serviceId,
      clientName,
      clientEmail,
      clientPhone,
      startTime,
      endTime,
      notes,
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('POST /api/book/[slug] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
