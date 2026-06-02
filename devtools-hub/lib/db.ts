/**
 * SQLite database helper for devtools-hub.
 * Uses better-sqlite3 for synchronous SQLite operations.
 */

import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'devtools-hub.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initSchema();
  }
  return db;
}

function initSchema() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      provider TEXT DEFAULT 'local',
      provider_id TEXT,
      name TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plan TEXT NOT NULL DEFAULT 'pro',
      status TEXT NOT NULL DEFAULT 'active',
      waffo_order_id TEXT,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Migration: add new columns if they don't exist (safe for existing DBs)
    -- SQLite doesn't support ADD COLUMN IF NOT EXISTS, so we handle errors
  `);

  // Safe migrations for existing databases
  const columns = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  const colNames = columns.map(c => c.name);

  if (!colNames.includes('provider')) {
    try { db.exec("ALTER TABLE users ADD COLUMN provider TEXT DEFAULT 'local'"); } catch {}
  }
  if (!colNames.includes('provider_id')) {
    try { db.exec("ALTER TABLE users ADD COLUMN provider_id TEXT"); } catch {}
  }
  if (!colNames.includes('name')) {
    try { db.exec("ALTER TABLE users ADD COLUMN name TEXT"); } catch {}
  }
  if (!colNames.includes('avatar_url')) {
    try { db.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT"); } catch {}
  }
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

export function findUserByEmail(email: string): User | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
}

export function createUser(email: string, passwordHash: string): User {
  const db = getDb();
  const result = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, passwordHash);
  return { id: result.lastInsertRowid as number, email, password_hash: passwordHash, provider: 'local', provider_id: null, name: null, avatar_url: null, created_at: new Date().toISOString() };
}

export function findUserById(id: number): User | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export function getSubscriptionByUserId(userId: number): Subscription | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId) as Subscription | undefined;
}

export function upsertSubscription(userId: number, plan: string, status: string, waffoOrderId?: string, expiresAt?: string): Subscription {
  const db = getDb();
  const existing = getSubscriptionByUserId(userId);

  if (existing) {
    db.prepare('UPDATE subscriptions SET plan = ?, status = ?, waffo_order_id = ?, expires_at = ? WHERE id = ?')
      .run(plan, status, waffoOrderId || existing.waffo_order_id, expiresAt || existing.expires_at, existing.id);
    return { ...existing, plan, status, waffo_order_id: waffoOrderId || existing.waffo_order_id, expires_at: expiresAt || existing.expires_at };
  }

  const result = db.prepare('INSERT INTO subscriptions (user_id, plan, status, waffo_order_id, expires_at) VALUES (?, ?, ?, ?, ?)')
    .run(userId, plan, status, waffoOrderId || null, expiresAt || null);
  return { id: result.lastInsertRowid as number, user_id: userId, plan, status, waffo_order_id: waffoOrderId || null, expires_at: expiresAt || null, created_at: new Date().toISOString() };
}

/**
 * Find or create a user from Google OAuth.
 * If the user already exists (by provider+provider_id or email), return them.
 * Otherwise, create a new user.
 */
export function findOrCreateGoogleUser(
  googleId: string,
  email: string,
  name: string,
  avatarUrl: string
): User {
  const db = getDb();

  // First, try to find by provider + provider_id
  let user = db.prepare(
    'SELECT * FROM users WHERE provider = ? AND provider_id = ?'
  ).get('google', googleId) as User | undefined;

  if (user) {
    // Update name and avatar if changed
    db.prepare('UPDATE users SET name = ?, avatar_url = ? WHERE id = ?')
      .run(name, avatarUrl, user.id);
    return { ...user, name, avatar_url: avatarUrl };
  }

  // Try to find by email (user may have registered with email/password)
  user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;

  if (user) {
    // Link Google account to existing user
    db.prepare('UPDATE users SET provider = ?, provider_id = ?, name = ?, avatar_url = ? WHERE id = ?')
      .run('google', googleId, name, avatarUrl, user.id);
    return { ...user, provider: 'google', provider_id: googleId, name, avatar_url: avatarUrl };
  }

  // Create new user
  const result = db.prepare(
    'INSERT INTO users (email, password_hash, provider, provider_id, name, avatar_url) VALUES (?, NULL, ?, ?, ?, ?)'
  ).run(email, 'google', googleId, name, avatarUrl);

  return {
    id: result.lastInsertRowid as number,
    email,
    password_hash: null,
    provider: 'google',
    provider_id: googleId,
    name,
    avatar_url: avatarUrl,
    created_at: new Date().toISOString(),
  };
}
