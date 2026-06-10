import { describe, it, expect } from 'vitest';
import { success, created, error, paginated, notFound, forbidden } from '../response';

describe('API response helpers', () => {
  it('success returns 200 with data', async () => {
    const res = success({ name: 'test' });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe('test');
  });

  it('success with custom status', async () => {
    const res = success({ ok: true }, 202);
    expect(res.status).toBe(202);
  });

  it('created returns 201', async () => {
    const res = created({ id: '123' });
    expect(res.status).toBe(201);
  });

  it('error returns 400 by default', async () => {
    const res = error('Bad request');
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Bad request');
  });

  it('error with custom status', async () => {
    const res = error('Conflict', 409);
    expect(res.status).toBe(409);
  });

  it('paginated returns items with pagination info', async () => {
    const res = paginated([1, 2, 3], 10, 1, 3);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toEqual([1, 2, 3]);
    expect(data.pagination.total).toBe(10);
    expect(data.pagination.totalPages).toBe(4);
  });

  it('notFound returns 404', async () => {
    const res = notFound();
    expect(res.status).toBe(404);
  });

  it('forbidden returns 403', async () => {
    const res = forbidden();
    expect(res.status).toBe(403);
  });
});
