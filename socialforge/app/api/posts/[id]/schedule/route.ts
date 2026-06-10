import { NextResponse } from 'next/server';

// Schedule post

export async function POST() {
  return NextResponse.json({ message: 'Schedule post' }, { status: 501 });
}
