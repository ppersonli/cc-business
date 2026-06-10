import { describe, it, expect } from 'vitest';
import { validateFile, isImageType, isVideoType } from '../upload';

function makeFile(type: string, size: number, name = 'test.jpg'): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

describe('validateFile', () => {
  it('accepts valid image files', () => {
    const result = validateFile(makeFile('image/jpeg', 1024));
    expect(result.valid).toBe(true);
  });

  it('accepts valid video files', () => {
    const result = validateFile(makeFile('video/mp4', 1024));
    expect(result.valid).toBe(true);
  });

  it('rejects unsupported file types', () => {
    const result = validateFile(makeFile('application/pdf', 1024));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('not supported');
  });

  it('rejects files over 10MB', () => {
    const result = validateFile(makeFile('image/jpeg', 11 * 1024 * 1024));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('10MB');
  });

  it('accepts files exactly at 10MB', () => {
    const result = validateFile(makeFile('image/png', 10 * 1024 * 1024));
    expect(result.valid).toBe(true);
  });
});

describe('isImageType', () => {
  it('returns true for image types', () => {
    expect(isImageType('image/jpeg')).toBe(true);
    expect(isImageType('image/png')).toBe(true);
    expect(isImageType('image/gif')).toBe(true);
    expect(isImageType('image/webp')).toBe(true);
  });

  it('returns false for non-image types', () => {
    expect(isImageType('video/mp4')).toBe(false);
    expect(isImageType('application/pdf')).toBe(false);
  });
});

describe('isVideoType', () => {
  it('returns true for video types', () => {
    expect(isVideoType('video/mp4')).toBe(true);
    expect(isVideoType('video/webm')).toBe(true);
  });

  it('returns false for non-video types', () => {
    expect(isVideoType('image/jpeg')).toBe(false);
  });
});
