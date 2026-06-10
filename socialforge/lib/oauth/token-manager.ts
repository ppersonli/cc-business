/**
 * Token management for social accounts.
 * Handles encrypted storage, retrieval, and refresh of OAuth tokens.
 */

import { getDb } from '@/lib/db';
import { socialAccounts } from '@/lib/db/schema';
import { eq, and, lt } from 'drizzle-orm';
import { encryptToken, decryptToken } from '@/lib/crypto';
import { refreshTwitterToken } from '@/lib/oauth';
import { nowISO } from '@/lib/utils/format';

export interface StoredAccount {
  id: string;
  userId: string;
  platform: string;
  username: string;
  platformUserId: string | null;
  status: string;
  expiresAt: string | null;
  createdAt: string;
}

/**
 * Store a new social account with encrypted tokens.
 */
export async function storeAccount(params: {
  userId: string;
  platform: string;
  accessToken: string;
  refreshToken?: string;
  username: string;
  platformUserId?: string;
  expiresIn: number;
}): Promise<StoredAccount> {
  const db = getDb();
  const encryptedAccess = await encryptToken(params.accessToken);
  const encryptedRefresh = params.refreshToken ? await encryptToken(params.refreshToken) : null;
  const expiresAt = new Date(Date.now() + params.expiresIn * 1000).toISOString();

  const account = {
    id: crypto.randomUUID(),
    userId: params.userId,
    platform: params.platform,
    accessToken: encryptedAccess,
    refreshToken: encryptedRefresh,
    username: params.username,
    platformUserId: params.platformUserId || null,
    status: 'active',
    expiresAt,
    createdAt: nowISO(),
  };

  await db.insert(socialAccounts).values(account);

  return {
    id: account.id,
    userId: account.userId,
    platform: account.platform,
    username: account.username,
    platformUserId: account.platformUserId,
    status: account.status,
    expiresAt: account.expiresAt,
    createdAt: account.createdAt,
  };
}

/**
 * Get all accounts for a user (without tokens).
 */
export async function getUserAccounts(userId: string): Promise<StoredAccount[]> {
  const db = getDb();
  const results = await db
    .select({
      id: socialAccounts.id,
      userId: socialAccounts.userId,
      platform: socialAccounts.platform,
      username: socialAccounts.username,
      platformUserId: socialAccounts.platformUserId,
      status: socialAccounts.status,
      expiresAt: socialAccounts.expiresAt,
      createdAt: socialAccounts.createdAt,
    })
    .from(socialAccounts)
    .where(eq(socialAccounts.userId, userId));

  return results;
}

/**
 * Get decrypted access token for an account.
 */
export async function getAccountToken(accountId: string): Promise<string | null> {
  const db = getDb();
  const results = await db
    .select({ accessToken: socialAccounts.accessToken })
    .from(socialAccounts)
    .where(eq(socialAccounts.id, accountId))
    .limit(1);

  if (results.length === 0) return null;
  return decryptToken(results[0].accessToken);
}

/**
 * Delete a social account.
 */
export async function deleteAccount(accountId: string, userId: string): Promise<boolean> {
  const db = getDb();
  const result = await db
    .delete(socialAccounts)
    .where(and(eq(socialAccounts.id, accountId), eq(socialAccounts.userId, userId)));
  return true;
}

/**
 * Refresh tokens for accounts expiring within the given threshold.
 * Returns the number of accounts refreshed.
 */
export async function refreshExpiringTokens(thresholdHours = 24): Promise<number> {
  const db = getDb();
  const threshold = new Date(Date.now() + thresholdHours * 60 * 60 * 1000).toISOString();

  const expiringAccounts = await db
    .select()
    .from(socialAccounts)
    .where(
      and(
        eq(socialAccounts.status, 'active'),
        lt(socialAccounts.expiresAt, threshold)
      )
    );

  let refreshed = 0;

  for (const account of expiringAccounts) {
    try {
      if (account.platform === 'twitter' && account.refreshToken) {
        const refreshToken = await decryptToken(account.refreshToken);
        const newTokens = await refreshTwitterToken(refreshToken);

        const encryptedAccess = await encryptToken(newTokens.accessToken);
        const encryptedRefresh = newTokens.refreshToken
          ? await encryptToken(newTokens.refreshToken)
          : account.refreshToken;

        const newExpiresAt = new Date(Date.now() + newTokens.expiresIn * 1000).toISOString();

        await db
          .update(socialAccounts)
          .set({
            accessToken: encryptedAccess,
            refreshToken: encryptedRefresh,
            expiresAt: newExpiresAt,
            status: 'active',
          })
          .where(eq(socialAccounts.id, account.id));

        refreshed++;
      }
      // LinkedIn tokens don't support refresh - mark as expired
      if (account.platform === 'linkedin') {
        await db
          .update(socialAccounts)
          .set({ status: 'expired' })
          .where(eq(socialAccounts.id, account.id));
      }
    } catch (error) {
      console.error(`Failed to refresh token for account ${account.id}:`, error);
      await db
        .update(socialAccounts)
        .set({ status: 'error' })
        .where(eq(socialAccounts.id, account.id));
    }
  }

  return refreshed;
}
