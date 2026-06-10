import { auth as clerkAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function getAuthUserId(): Promise<string | null> {
  const { userId } = await clerkAuth();
  return userId;
}

export async function requireApiAuth(): Promise<string> {
  const userId = await getAuthUserId();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

export function handleAuthError(error: unknown) {
  if (error instanceof Error && error.message === 'Unauthorized') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  console.error('API error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
