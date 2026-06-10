import { NextResponse } from 'next/server';

// Get and update settings
export async function GET() {
  return NextResponse.json({ message: 'Get settings' }, { status: 501 });
}

export async function PUT() {
  return NextResponse.json({ message: 'Update settings' }, { status: 501 });
}
