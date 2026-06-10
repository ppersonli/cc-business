import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@libsql/client';
import {
  setClient, initSchema,
  createService, getServicesByPageId, getServiceById, updateService, deleteService,
  setAvailability, getAvailabilityByPageId,
  createBooking, getBookingsByPageId, getBookingsForDateRange,
} from '../db';
import { v4 as uuidv4 } from 'uuid';

let testClient: ReturnType<typeof createClient>;
let pageId: string;

async function seedPage() {
  const userId = uuidv4();
  pageId = uuidv4();
  await testClient.execute({ sql: 'INSERT INTO users (id, email) VALUES (?, ?)', args: [userId, 'owner@test.com'] });
  await testClient.execute({
    sql: 'INSERT INTO booking_pages (id, user_id, slug, title) VALUES (?, ?, ?, ?)',
    args: [pageId, userId, 'test-page', 'Test Page'],
  });
}

beforeEach(async () => {
  testClient = createClient({ url: ':memory:' });
  setClient(testClient);
  await initSchema();
  await seedPage();
});

afterEach(() => {
  testClient.close();
});

// --- Service Tests ---

describe('createService', () => {
  it('creates a service with all fields', async () => {
    const service = await createService(pageId, {
      name: 'Consultation',
      description: 'Initial consultation',
      durationMinutes: 30,
      priceCents: 5000,
      currency: 'USD',
    });

    expect(service.id).toBeDefined();
    expect(service.name).toBe('Consultation');
    expect(service.duration_minutes).toBe(30);
    expect(service.price_cents).toBe(5000);
    expect(service.page_id).toBe(pageId);
  });

  it('creates a service with minimal fields', async () => {
    const service = await createService(pageId, {
      name: 'Free Intro',
      durationMinutes: 15,
    });

    expect(service.name).toBe('Free Intro');
    expect(service.price_cents).toBeNull();
    expect(service.currency).toBe('USD');
    expect(service.description).toBeNull();
  });
});

describe('getServicesByPageId', () => {
  it('returns services for the page', async () => {
    await createService(pageId, { name: 'Service 1', durationMinutes: 30 });
    await createService(pageId, { name: 'Service 2', durationMinutes: 60 });

    const services = await getServicesByPageId(pageId);
    expect(services).toHaveLength(2);
  });

  it('returns empty array for page with no services', async () => {
    const services = await getServicesByPageId(pageId);
    expect(services).toHaveLength(0);
  });
});

describe('getServiceById', () => {
  it('returns the service when it exists', async () => {
    const created = await createService(pageId, { name: 'Test', durationMinutes: 30 });
    const found = await getServiceById(created.id);
    expect(found).not.toBeNull();
    expect(found!.name).toBe('Test');
  });

  it('returns null when not found', async () => {
    const found = await getServiceById('nonexistent');
    expect(found).toBeNull();
  });
});

describe('updateService', () => {
  it('updates specified fields', async () => {
    const service = await createService(pageId, { name: 'Original', durationMinutes: 30 });
    const updated = await updateService(service.id, { name: 'Updated', priceCents: 9900 });

    expect(updated!.name).toBe('Updated');
    expect(updated!.price_cents).toBe(9900);
    expect(updated!.duration_minutes).toBe(30); // unchanged
  });

  it('returns null for non-existent service', async () => {
    const result = await updateService('nonexistent', { name: 'Nope' });
    expect(result).toBeNull();
  });

  it('allows setting price to null', async () => {
    const service = await createService(pageId, { name: 'Test', durationMinutes: 30, priceCents: 100 });
    const updated = await updateService(service.id, { priceCents: null });
    expect(updated!.price_cents).toBeNull();
  });
});

describe('deleteService', () => {
  it('deletes the service', async () => {
    const service = await createService(pageId, { name: 'Delete Me', durationMinutes: 30 });
    const deleted = await deleteService(service.id);
    expect(deleted).toBe(true);

    const found = await getServiceById(service.id);
    expect(found).toBeNull();
  });

  it('returns false for non-existent', async () => {
    const result = await deleteService('nonexistent');
    expect(result).toBe(false);
  });
});

// --- Availability Tests ---

describe('setAvailability', () => {
  it('replaces all rules for a page', async () => {
    await setAvailability(pageId, [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
    ]);

    const rules = await getAvailabilityByPageId(pageId);
    expect(rules).toHaveLength(2);
  });

  it('clears old rules when setting new ones', async () => {
    await setAvailability(pageId, [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
    ]);
    await setAvailability(pageId, [
      { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' },
    ]);

    const rules = await getAvailabilityByPageId(pageId);
    expect(rules).toHaveLength(1);
    expect(rules[0].day_of_week).toBe(3);
  });

  it('returns empty array when clearing all rules', async () => {
    await setAvailability(pageId, [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
    ]);
    await setAvailability(pageId, []);

    const rules = await getAvailabilityByPageId(pageId);
    expect(rules).toHaveLength(0);
  });
});

describe('getAvailabilityByPageId', () => {
  it('returns rules sorted by day and time', async () => {
    await setAvailability(pageId, [
      { dayOfWeek: 3, startTime: '14:00', endTime: '17:00' },
      { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
      { dayOfWeek: 1, startTime: '13:00', endTime: '17:00' },
    ]);

    const rules = await getAvailabilityByPageId(pageId);
    expect(rules).toHaveLength(3);
    expect(rules[0].day_of_week).toBe(1);
    expect(rules[0].start_time).toBe('09:00');
    expect(rules[1].start_time).toBe('13:00');
    expect(rules[2].day_of_week).toBe(3);
  });
});

// --- Booking Tests ---

describe('createBooking', () => {
  it('creates a booking', async () => {
    const service = await createService(pageId, { name: 'Consult', durationMinutes: 30 });
    const booking = await createBooking(pageId, {
      serviceId: service.id,
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      startTime: '2024-06-15T10:00:00Z',
      endTime: '2024-06-15T10:30:00Z',
    });

    expect(booking.id).toBeDefined();
    expect(booking.client_name).toBe('John Doe');
    expect(booking.status).toBe('confirmed');
    expect(booking.payment_status).toBe('pending');
  });
});

describe('getBookingsForDateRange', () => {
  it('returns bookings within the date range', async () => {
    const service = await createService(pageId, { name: 'Consult', durationMinutes: 30 });
    await createBooking(pageId, {
      serviceId: service.id,
      clientName: 'Alice',
      clientEmail: 'alice@test.com',
      startTime: '2024-06-15T10:00:00Z',
      endTime: '2024-06-15T10:30:00Z',
    });
    await createBooking(pageId, {
      serviceId: service.id,
      clientName: 'Bob',
      clientEmail: 'bob@test.com',
      startTime: '2024-06-16T10:00:00Z',
      endTime: '2024-06-16T10:30:00Z',
    });

    const bookings = await getBookingsForDateRange(pageId, '2024-06-15', '2024-06-16');
    expect(bookings).toHaveLength(1);
    expect(bookings[0].client_name).toBe('Alice');
  });

  it('excludes cancelled bookings', async () => {
    const service = await createService(pageId, { name: 'Consult', durationMinutes: 30 });
    const booking = await createBooking(pageId, {
      serviceId: service.id,
      clientName: 'Cancelled',
      clientEmail: 'cancel@test.com',
      startTime: '2024-06-15T10:00:00Z',
      endTime: '2024-06-15T10:30:00Z',
    });
    // Cancel it directly
    await testClient.execute({
      sql: "UPDATE bookings SET status = 'cancelled' WHERE id = ?",
      args: [booking.id],
    });

    const bookings = await getBookingsForDateRange(pageId, '2024-06-15', '2024-06-16');
    expect(bookings).toHaveLength(0);
  });
});
