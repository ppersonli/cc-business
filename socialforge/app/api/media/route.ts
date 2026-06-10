import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/api/auth-guard';
import { getDb } from '@/lib/db';
import { mediaAssets } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { validateFile } from '@/lib/storage/upload';

// List media assets
export async function GET(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const assets = await db.select().from(mediaAssets).where(eq(mediaAssets.userId, userId)).orderBy(desc(mediaAssets.createdAt));

    return NextResponse.json({ media: assets });
  } catch (error) {
    console.error('GET /api/media error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Upload media file
export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Upload to Vercel Blob
    const { uploadToBlob } = await import('@/lib/storage/upload');
    const path = `media/${userId}/${Date.now()}-${file.name}`;
    const { url } = await uploadToBlob(file, path);

    // Store in database
    const db = getDb();
    const asset = {
      id: crypto.randomUUID(),
      userId,
      filename: file.name,
      blobUrl: url,
      fileType: file.type,
      fileSize: file.size,
      createdAt: new Date().toISOString(),
    };

    await db.insert(mediaAssets).values(asset);

    return NextResponse.json({ media: asset }, { status: 201 });
  } catch (error) {
    console.error('POST /api/media error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
