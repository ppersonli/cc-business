import { NextResponse } from 'next/server';

// AI content generation

export async function POST() {
  return NextResponse.json({ message: 'AI content generation' }, { status: 501 });
}
