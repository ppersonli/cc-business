import { NextResponse } from 'next/server';

// Analytics overview

export async function GET() {
  return NextResponse.json({ message: 'Analytics overview' }, { status: 501 });
}
