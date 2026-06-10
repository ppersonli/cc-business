import { NextResponse } from 'next/server';

// Delete media asset

export async function DELETE() {
  return NextResponse.json({ message: 'Delete media asset' }, { status: 501 });
}
