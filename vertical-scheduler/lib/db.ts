import { createClient, type Client } from '@libsql/client';
import { v4 as uuidv4 } from 'uuid';
import type { BookingPage, CreateBookingPageInput, UpdateBookingPageInput } from '@/types/booking-page';

export interface Service {
  id: string;
  page_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number | null;
  currency: string;
  created_at: string;
}

export interface CreateServiceInput {
  name: string;
  description?: string;
  durationMinutes: number;
  priceCents?: number;
  currency?: string;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  durationMinutes?: number;
  priceCents?: number | null;
  currency?: string;
}

export interface AvailabilityRule {
  id: string;
  page_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface CreateAvailabilityInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Booking {
  id: string;
  page_id: string;
  service_id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
}

export interface CreateBookingInput {
  serviceId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

let client: Client | null = null;

export function getClient(): Client {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url) throw new Error('TURSO_DATABASE_URL is not set');
    client = createClient({ url, authToken: authToken || undefined });
  }
  return client;
}

export function setClient(c: Client) {
  client = c;
}

export async function initSchema() {
  const db = getClient();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      image TEXT,
      plan TEXT DEFAULT 'free',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration: add calendar token columns if missing
  try {
    await db.execute("ALTER TABLE users ADD COLUMN calendar_access_token TEXT");
  } catch { /* column already exists */ }
  try {
    await db.execute("ALTER TABLE users ADD COLUMN calendar_refresh_token TEXT");
  } catch { /* column already exists */ }
  try {
    await db.execute("ALTER TABLE users ADD COLUMN calendar_token_expires_at INTEGER");
  } catch { /* column already exists */ }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS booking_pages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      brand_color TEXT DEFAULT '#3b82f6',
      logo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      page_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      duration_minutes INTEGER NOT NULL,
      price_cents INTEGER,
      currency TEXT DEFAULT 'USD',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (page_id) REFERENCES booking_pages(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS availability (
      id TEXT PRIMARY KEY,
      page_id TEXT NOT NULL,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      FOREIGN KEY (page_id) REFERENCES booking_pages(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      page_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      client_phone TEXT,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      status TEXT DEFAULT 'confirmed',
      payment_status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (page_id) REFERENCES booking_pages(id),
      FOREIGN KEY (service_id) REFERENCES services(id)
    )
  `);

  // Migration: add calendar event tracking
  try {
    await db.execute("ALTER TABLE bookings ADD COLUMN calendar_event_id TEXT");
  } catch { /* column already exists */ }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      currency TEXT DEFAULT 'USD',
      status TEXT DEFAULT 'pending',
      pancake_order_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    )
  `);
}

// --- User helpers ---

export async function findOrCreateUser(email: string, name?: string, image?: string) {
  const db = getClient();
  const existing = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });
  if (existing.rows.length > 0) return existing.rows[0];

  const id = uuidv4();
  await db.execute({
    sql: 'INSERT INTO users (id, email, name, image) VALUES (?, ?, ?, ?)',
    args: [id, email, name || null, image || null],
  });
  return { id, email, name, image, plan: 'free' };
}

// --- Booking Page CRUD ---

export async function createBookingPage(userId: string, input: CreateBookingPageInput): Promise<BookingPage> {
  const db = getClient();
  const id = uuidv4();

  await db.execute({
    sql: `INSERT INTO booking_pages (id, user_id, slug, title, description, brand_color, logo_url)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      userId,
      input.slug,
      input.title,
      input.description || null,
      input.brandColor || '#3b82f6',
      input.logoUrl || null,
    ],
  });

  return getBookingPageById(id) as Promise<BookingPage>;
}

export async function getBookingPagesByUserId(userId: string): Promise<BookingPage[]> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT * FROM booking_pages WHERE user_id = ? ORDER BY created_at DESC',
    args: [userId],
  });
  return result.rows as unknown as BookingPage[];
}

export async function getBookingPageById(id: string): Promise<BookingPage | null> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT * FROM booking_pages WHERE id = ?',
    args: [id],
  });
  return (result.rows[0] as unknown as BookingPage) || null;
}

export async function getBookingPageBySlug(slug: string): Promise<BookingPage | null> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT * FROM booking_pages WHERE slug = ?',
    args: [slug],
  });
  return (result.rows[0] as unknown as BookingPage) || null;
}

export async function updateBookingPage(id: string, input: UpdateBookingPageInput): Promise<BookingPage | null> {
  const db = getClient();
  const existing = await getBookingPageById(id);
  if (!existing) return null;

  const fields: string[] = [];
  const args: (string | null)[] = [];

  if (input.title !== undefined) { fields.push('title = ?'); args.push(input.title); }
  if (input.slug !== undefined) { fields.push('slug = ?'); args.push(input.slug); }
  if (input.description !== undefined) { fields.push('description = ?'); args.push(input.description); }
  if (input.brandColor !== undefined) { fields.push('brand_color = ?'); args.push(input.brandColor); }
  if (input.logoUrl !== undefined) { fields.push('logo_url = ?'); args.push(input.logoUrl); }

  if (fields.length === 0) return existing;

  args.push(id);
  await db.execute({
    sql: `UPDATE booking_pages SET ${fields.join(', ')} WHERE id = ?`,
    args,
  });

  return getBookingPageById(id);
}

export async function deleteBookingPage(id: string): Promise<boolean> {
  const db = getClient();
  const result = await db.execute({
    sql: 'DELETE FROM booking_pages WHERE id = ?',
    args: [id],
  });
  return result.rowsAffected > 0;
}

// --- Service CRUD ---

export async function createService(pageId: string, input: CreateServiceInput): Promise<Service> {
  const db = getClient();
  const id = uuidv4();

  await db.execute({
    sql: `INSERT INTO services (id, page_id, name, description, duration_minutes, price_cents, currency)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      pageId,
      input.name,
      input.description || null,
      input.durationMinutes,
      input.priceCents ?? null,
      input.currency || 'USD',
    ],
  });

  return getServiceById(id) as Promise<Service>;
}

export async function getServicesByPageId(pageId: string): Promise<Service[]> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT * FROM services WHERE page_id = ? ORDER BY created_at ASC',
    args: [pageId],
  });
  return result.rows as unknown as Service[];
}

export async function getServiceById(id: string): Promise<Service | null> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT * FROM services WHERE id = ?',
    args: [id],
  });
  return (result.rows[0] as unknown as Service) || null;
}

export async function updateService(id: string, input: UpdateServiceInput): Promise<Service | null> {
  const db = getClient();
  const existing = await getServiceById(id);
  if (!existing) return null;

  const fields: string[] = [];
  const args: (string | number | null)[] = [];

  if (input.name !== undefined) { fields.push('name = ?'); args.push(input.name); }
  if (input.description !== undefined) { fields.push('description = ?'); args.push(input.description); }
  if (input.durationMinutes !== undefined) { fields.push('duration_minutes = ?'); args.push(input.durationMinutes); }
  if (input.priceCents !== undefined) { fields.push('price_cents = ?'); args.push(input.priceCents); }
  if (input.currency !== undefined) { fields.push('currency = ?'); args.push(input.currency); }

  if (fields.length === 0) return existing;

  args.push(id);
  await db.execute({
    sql: `UPDATE services SET ${fields.join(', ')} WHERE id = ?`,
    args,
  });

  return getServiceById(id);
}

export async function deleteService(id: string): Promise<boolean> {
  const db = getClient();
  const result = await db.execute({
    sql: 'DELETE FROM services WHERE id = ?',
    args: [id],
  });
  return result.rowsAffected > 0;
}

// --- Availability CRUD ---

export async function setAvailability(pageId: string, rules: CreateAvailabilityInput[]): Promise<AvailabilityRule[]> {
  const db = getClient();

  // Clear existing rules for this page
  await db.execute({
    sql: 'DELETE FROM availability WHERE page_id = ?',
    args: [pageId],
  });

  // Insert new rules
  const created: AvailabilityRule[] = [];
  for (const rule of rules) {
    const id = uuidv4();
    await db.execute({
      sql: 'INSERT INTO availability (id, page_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
      args: [id, pageId, rule.dayOfWeek, rule.startTime, rule.endTime],
    });
    created.push({ id, page_id: pageId, day_of_week: rule.dayOfWeek, start_time: rule.startTime, end_time: rule.endTime });
  }

  return created;
}

export async function getAvailabilityByPageId(pageId: string): Promise<AvailabilityRule[]> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT * FROM availability WHERE page_id = ? ORDER BY day_of_week ASC, start_time ASC',
    args: [pageId],
  });
  return result.rows as unknown as AvailabilityRule[];
}

// --- Booking CRUD ---

export async function createBooking(pageId: string, input: CreateBookingInput): Promise<Booking> {
  const db = getClient();
  const id = uuidv4();

  await db.execute({
    sql: `INSERT INTO bookings (id, page_id, service_id, client_name, client_email, client_phone, start_time, end_time, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      pageId,
      input.serviceId,
      input.clientName,
      input.clientEmail,
      input.clientPhone || null,
      input.startTime,
      input.endTime,
      input.notes || null,
    ],
  });

  return getBookingById(id) as Promise<Booking>;
}

export async function getBookingsByPageId(pageId: string): Promise<Booking[]> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT * FROM bookings WHERE page_id = ? ORDER BY start_time DESC',
    args: [pageId],
  });
  return result.rows as unknown as Booking[];
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT * FROM bookings WHERE id = ?',
    args: [id],
  });
  return (result.rows[0] as unknown as Booking) || null;
}

export async function getBookingsForDateRange(pageId: string, startDate: string, endDate: string): Promise<Booking[]> {
  const db = getClient();
  const result = await db.execute({
    sql: `SELECT * FROM bookings WHERE page_id = ? AND start_time >= ? AND start_time < ? AND status != 'cancelled' ORDER BY start_time ASC`,
    args: [pageId, startDate, endDate],
  });
  return result.rows as unknown as Booking[];
}
