import { setRequestLocale } from 'next-intl/server';
import PostEditorClient from './post-editor-client';

type Props = { params: Promise<{ locale: string }> };

export default async function NewPostPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PostEditorClient mode="create" />;
}
