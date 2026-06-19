import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { initSchema, createBuildFlowColumn } from '@/lib/db'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  const user = token ? verifyToken(token) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name, color, position } = body
  if (!name?.trim()) return NextResponse.json({ error: 'Column name is required' }, { status: 400 })

  try {
    await initSchema()
    const col = await createBuildFlowColumn(Number(id), name.trim(), color || '#94a3b8', position ?? 0)
    return NextResponse.json(col)
  } catch (err) {
    console.error('Create column error:', err)
    return NextResponse.json({ error: 'Failed to create column' }, { status: 500 })
  }
}
