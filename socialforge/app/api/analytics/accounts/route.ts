import { NextResponse } from 'next/server';

// Account-level analytics

export async function GET() {
  return NextResponse.json({ message: 'Account-level analytics' }, { status: 501 });
}
