import { NextResponse } from 'next/server';

// Create API key

export async function POST() {
  return NextResponse.json({ message: 'Create API key' }, { status: 501 });
}
