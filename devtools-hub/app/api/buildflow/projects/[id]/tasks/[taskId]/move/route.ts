import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { initSchema, moveBuildFlowTask } from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  const user = token ? verifyToken(token) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId } = await params
  const body = await req.json()
  const { columnId, position } = body

  try {
    await initSchema()
    await moveBuildFlowTask(Number(taskId), Number(columnId), position ?? 0)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Move task error:', err)
    return NextResponse.json({ error: 'Failed to move task' }, { status: 500 })
  }
}
