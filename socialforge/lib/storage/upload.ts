const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  const allTypes = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];
  if (!allTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not supported` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
  }
  return { valid: true };
}

export function isImageType(fileType: string): boolean {
  return ACCEPTED_IMAGE_TYPES.includes(fileType);
}

export function isVideoType(fileType: string): boolean {
  return ACCEPTED_VIDEO_TYPES.includes(fileType);
}

export async function uploadToBlob(file: File, path: string): Promise<{ url: string; pathname: string }> {
  const { put } = await import('@vercel/blob');
  const blob = await put(path, file, { access: 'public' });
  return { url: blob.url, pathname: blob.pathname };
}

export async function deleteFromBlob(url: string): Promise<void> {
  const { del } = await import('@vercel/blob');
  await del(url);
}
