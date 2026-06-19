import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { initSchema, createBuildFlowTask } from '@/lib/db'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  const user = token ? verifyToken(token) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { title, columnId, description, priority, category, position } = body
  if (!title?.trim() || !columnId) return NextResponse.json({ error: 'Title and column are required' }, { status: 400 })

  try {
    await initSchema()
    const task = await createBuildFlowTask(
      Number(id), Number(columnId), title.trim(), description || '',
      priority || 'medium', category || 'general', position ?? 0, user.userId
    )
    return NextResponse.json(task)
  } catch (err) {
    console.error('Create task error:', err)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
