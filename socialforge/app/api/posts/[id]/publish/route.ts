import { NextResponse } from 'next/server';

// Publish post now

export async function POST() {
  return NextResponse.json({ message: 'Publish post now' }, { status: 501 });
}
