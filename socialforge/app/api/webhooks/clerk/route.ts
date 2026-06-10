import { NextResponse } from 'next/server';

// Clerk webhook handler

export async function POST() {
  return NextResponse.json({ message: 'Clerk webhook handler' }, { status: 501 });
}
