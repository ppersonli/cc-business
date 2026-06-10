import { NextResponse } from 'next/server';

// Get current user

export async function GET() {
  return NextResponse.json({ message: 'Get current user' }, { status: 501 });
}
