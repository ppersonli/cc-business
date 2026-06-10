import { describe, it, expect } from 'vitest';
import { generateId, isValidUUID } from '../uuid';

describe('generateId', () => {
  it('returns a valid UUID', () => {
    const id = generateId();
    expect(isValidUUID(id)).toBe(true);
  });

  it('returns unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe('isValidUUID', () => {
  it('returns true for valid UUIDs', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidUUID(crypto.randomUUID())).toBe(true);
  });

  it('returns false for invalid strings', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false);
    expect(isValidUUID('')).toBe(false);
    expect(isValidUUID('550e8400')).toBe(false);
  });
});
