import { auth as clerkAuth } from '@clerk/nextjs/server';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getCurrentUser() {
  const { userId: clerkId } = await clerkAuth();
  if (!clerkId) return null;

  const db = getDb();
  const result = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  return result[0] || null;
}

export async function requireAuth() {
  const { userId } = await clerkAuth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const db = getDb();
  const result = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (result.length === 0) {
    throw new Error('User not found');
  }
  return result[0];
}

export async function syncUser(clerkUser: {
  id: string;
  emailAddresses: { emailAddress: string }[];
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}) {
  const db = getDb();
  const email = clerkUser.emailAddresses[0]?.emailAddress;
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;

  const existing = await db.select().from(users).where(eq(users.clerkId, clerkUser.id)).limit(1);

  if (existing.length > 0) {
    await db.update(users)
      .set({ name, imageUrl: clerkUser.imageUrl, email: email || existing[0].email })
      .where(eq(users.clerkId, clerkUser.id));
    return existing[0];
  }

  const newUser = {
    id: crypto.randomUUID(),
    email: email || '',
    name,
    clerkId: clerkUser.id,
    imageUrl: clerkUser.imageUrl || null,
    createdAt: new Date().toISOString(),
  };

  await db.insert(users).values(newUser);
  return newUser;
}
