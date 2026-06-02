import { NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/db';
import { verifyPassword, createToken } from '@/lib/auth';
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password — OAuth-only users don't have a password
    if (!user.password_hash) {
      return NextResponse.json({ error: 'This account uses Google sign-in. Please log in with Google.' }, { status: 401 });
    }
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate JWT token
    const token = createToken(user.id, user.email);

    return NextResponse.json({ token, userId: user.id, email: user.email });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
