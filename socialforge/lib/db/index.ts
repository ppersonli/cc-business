import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';

let client: Client | null = null;
let db: LibSQLDatabase<typeof schema> | null = null;

export function getDb(): LibSQLDatabase<typeof schema> {
  if (!db) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) throw new Error('TURSO_DATABASE_URL is not set');

    client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN || undefined,
    });
    db = drizzle(client, { schema });
  }
  return db;
}

export function setDb(d: LibSQLDatabase<typeof schema>, c: Client) {
  db = d;
  client = c;
}

export function closeDb() {
  if (client) {
    client.close();
    client = null;
    db = null;
  }
}
