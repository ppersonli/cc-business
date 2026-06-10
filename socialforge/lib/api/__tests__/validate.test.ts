import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validateBody } from '../validate';

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('validateBody', () => {
  const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().optional(),
  });

  it('returns success with valid data', async () => {
    const result = await validateBody(makeRequest({ name: 'Test', email: 'test@example.com' }), schema);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Test');
    }
  });

  it('returns error with missing fields', async () => {
    const result = await validateBody(makeRequest({ name: 'Test' }), schema);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('email');
    }
  });

  it('returns error with invalid email', async () => {
    const result = await validateBody(makeRequest({ name: 'Test', email: 'not-an-email' }), schema);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('email');
    }
  });

  it('returns error with invalid JSON', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      body: 'not json',
    });
    const result = await validateBody(req, schema);
    expect(result.success).toBe(false);
  });

  it('accepts optional fields', async () => {
    const result = await validateBody(makeRequest({ name: 'Test', email: 'test@example.com', age: 25 }), schema);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.age).toBe(25);
    }
  });
});
