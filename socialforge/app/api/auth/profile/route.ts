import { NextResponse } from 'next/server';

// Update user profile

export async function PUT() {
  return NextResponse.json({ message: 'Update user profile' }, { status: 501 });
}
