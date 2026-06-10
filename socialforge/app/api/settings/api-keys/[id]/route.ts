import { NextResponse } from 'next/server';

// Delete API key

export async function DELETE() {
  return NextResponse.json({ message: 'Delete API key' }, { status: 501 });
}
