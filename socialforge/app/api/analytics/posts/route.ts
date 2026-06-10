import { NextResponse } from 'next/server';

// Post-level analytics

export async function GET() {
  return NextResponse.json({ message: 'Post-level analytics' }, { status: 501 });
}
