/**
 * Turso (libSQL) database helper for devtools-hub.
 * Uses @libsql/client for serverless SQLite operations.
 */

import { createClient, type Client } from '@libsql/client';

let client: Client | null = null;

function getClient(): Client {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    
    if (!url) {
      throw new Error('TURSO_DATABASE_URL is not set');
    }
    
    client = createClient({
      url,
      authToken: authToken || undefined,
    });
  }
  return client;
}

export async function initSchema() {
  const db = getClient();
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      provider TEXT DEFAULT 'local',
      provider_id TEXT,
      name TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plan TEXT NOT NULL DEFAULT 'pro',
      status TEXT NOT NULL DEFAULT 'active',
      waffo_order_id TEXT,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Migrate: add missing columns to existing tables
  const columns = await db.execute("PRAGMA table_info(users)");
  const colNames = columns.rows.map((r: any) => r.name);
  
  for (const [col, type] of [
    ['provider', "TEXT DEFAULT 'local'"],
    ['provider_id', 'TEXT'],
    ['name', 'TEXT'],
    ['avatar_url', 'TEXT'],
  ] as [string, string][]) {
    if (!colNames.includes(col)) {
      try { await db.execute(`ALTER TABLE users ADD COLUMN ${col} ${type}`); } catch {}
    }
  }
  // ExtensionShield tables
  await db.execute(`
    CREATE TABLE IF NOT EXISTS extension_shield_scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      extension_name TEXT NOT NULL,
      extension_id TEXT,
      risk_score INTEGER NOT NULL,
      risk_level TEXT NOT NULL,
      manifest_version INTEGER,
      report_json TEXT NOT NULL,
      report_html TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS extension_shield_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      scan_type TEXT NOT NULL,
      scan_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (scan_id) REFERENCES extension_shield_scans(id)
    )
  `);
}

export interface User {
  id: number;
  email: string;
  password_hash: string | null;
  provider: string;
  provider_id: string | null;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  plan: string;
  status: string;
  waffo_order_id: string | null;
  expires_at: string | null;
  created_at: string;
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });
  return result.rows[0] as unknown as User | undefined;
}

export async function createUser(email: string, passwordHash: string): Promise<User> {
  const db = getClient();
  const result = await db.execute({
    sql: 'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    args: [email, passwordHash],
  });
  return { 
    id: Number(result.lastInsertRowid), 
    email, 
    password_hash: passwordHash, 
    provider: 'local', 
    provider_id: null, 
    name: null, 
    avatar_url: null, 
    created_at: new Date().toISOString() 
  };
}

export async function findUserById(id: number): Promise<User | undefined> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [id],
  });
  return result.rows[0] as unknown as User | undefined;
}

export async function getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
    args: [userId],
  });
  return result.rows[0] as unknown as Subscription | undefined;
}

export async function upsertSubscription(
  userId: number, 
  plan: string, 
  status: string, 
  waffoOrderId?: string, 
  expiresAt?: string
): Promise<Subscription> {
  const db = getClient();
  const existing = await getSubscriptionByUserId(userId);

  if (existing) {
    await db.execute({
      sql: 'UPDATE subscriptions SET plan = ?, status = ?, waffo_order_id = ?, expires_at = ? WHERE id = ?',
      args: [plan, status, waffoOrderId || existing.waffo_order_id, expiresAt || existing.expires_at, existing.id],
    });
    return { ...existing, plan, status, waffo_order_id: waffoOrderId || existing.waffo_order_id, expires_at: expiresAt || existing.expires_at };
  }

  const result = await db.execute({
    sql: 'INSERT INTO subscriptions (user_id, plan, status, waffo_order_id, expires_at) VALUES (?, ?, ?, ?, ?)',
    args: [userId, plan, status, waffoOrderId || null, expiresAt || null],
  });
  return { 
    id: Number(result.lastInsertRowid), 
    user_id: userId, 
    plan, 
    status, 
    waffo_order_id: waffoOrderId || null, 
    expires_at: expiresAt || null, 
    created_at: new Date().toISOString() 
  };
}

/**
 * Find or create a user from Google OAuth.
 */
export async function findOrCreateGoogleUser(
  googleId: string,
  email: string,
  name: string,
  avatarUrl: string
): Promise<User> {
  const db = getClient();

  // First, try to find by provider + provider_id
  let result = await db.execute({
    sql: 'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
    args: ['google', googleId],
  });
  let user = result.rows[0] as unknown as User | undefined;

  if (user) {
    // Update name and avatar if changed
    await db.execute({
      sql: 'UPDATE users SET name = ?, avatar_url = ? WHERE id = ?',
      args: [name, avatarUrl, user.id],
    });
    return { ...user, name, avatar_url: avatarUrl };
  }

  // Try to find by email (user may have registered with email/password)
  result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });
  user = result.rows[0] as unknown as User | undefined;

  if (user) {
    // Link Google account to existing user
    await db.execute({
      sql: 'UPDATE users SET provider = ?, provider_id = ?, name = ?, avatar_url = ? WHERE id = ?',
      args: ['google', googleId, name, avatarUrl, user.id],
    });
    return { ...user, provider: 'google', provider_id: googleId, name, avatar_url: avatarUrl };
  }

  // Create new user
  const insertResult = await db.execute({
    sql: 'INSERT INTO users (email, password_hash, provider, provider_id, name, avatar_url) VALUES (?, NULL, ?, ?, ?, ?)',
    args: [email, 'google', googleId, name, avatarUrl],
  });

  return {
    id: Number(insertResult.lastInsertRowid),
    email,
    password_hash: null,
    provider: 'google',
    provider_id: googleId,
    name,
    avatar_url: avatarUrl,
    created_at: new Date().toISOString(),
  };
}

// ===== ExtensionShield Functions =====

export interface ShieldScan {
  id: number;
  user_id: number;
  extension_name: string;
  extension_id: string | null;
  risk_score: number;
  risk_level: string;
  manifest_version: number | null;
  report_json: string;
  report_html: string | null;
  created_at: string;
}

export async function createShieldScan(params: {
  userId: number;
  extensionName: string;
  extensionId?: string;
  riskScore: number;
  riskLevel: string;
  manifestVersion?: number;
  reportJson: string;
  reportHtml?: string;
}): Promise<ShieldScan> {
  const db = getClient();
  const result = await db.execute({
    sql: `INSERT INTO extension_shield_scans
      (user_id, extension_name, extension_id, risk_score, risk_level, manifest_version, report_json, report_html)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      params.userId,
      params.extensionName,
      params.extensionId || null,
      params.riskScore,
      params.riskLevel,
      params.manifestVersion || null,
      params.reportJson,
      params.reportHtml || null,
    ],
  });

  return {
    id: Number(result.lastInsertRowid),
    user_id: params.userId,
    extension_name: params.extensionName,
    extension_id: params.extensionId || null,
    risk_score: params.riskScore,
    risk_level: params.riskLevel,
    manifest_version: params.manifestVersion || null,
    report_json: params.reportJson,
    report_html: params.reportHtml || null,
    created_at: new Date().toISOString(),
  };
}

export async function getShieldScansByUserId(
  userId: number,
  limit = 20,
  offset = 0
): Promise<ShieldScan[]> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT * FROM extension_shield_scans WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    args: [userId, limit, offset],
  });
  return result.rows as unknown as ShieldScan[];
}

export async function getShieldScanById(
  scanId: number
): Promise<ShieldScan | undefined> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT * FROM extension_shield_scans WHERE id = ?',
    args: [scanId],
  });
  return result.rows[0] as unknown as ShieldScan | undefined;
}

export async function getShieldScanCountByUserId(
  userId: number
): Promise<number> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM extension_shield_scans WHERE user_id = ?',
    args: [userId],
  });
  return (result.rows[0] as any).count;
}
