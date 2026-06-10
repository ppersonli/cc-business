import { setRequestLocale } from 'next-intl/server';
import { getDb } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import PostEditorClient from '../new/post-editor-client';

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditPostPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const { userId: clerkId } = await auth();
  if (!clerkId) notFound();

  const db = getDb();
  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (result.length === 0) notFound();

  const post = result[0];

  return (
    <PostEditorClient
      mode="edit"
      initialData={{
        id: post.id,
        content: post.content,
        targetPlatforms: JSON.parse(post.targetPlatforms),
        status: post.status,
        scheduledAt: post.scheduledAt,
      }}
    />
  );
}
