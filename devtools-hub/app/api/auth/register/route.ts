import { NextResponse } from 'next/server';
import { findUserByEmail, createUser, initSchema } from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Ensure database tables exist
    await initSchema();

    // Check if user already exists
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await createUser(email, passwordHash);

    // Generate JWT token
    const token = createToken(user.id, user.email);

    return NextResponse.json({ token, userId: user.id, email: user.email });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
