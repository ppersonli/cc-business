import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { initSchema, createBuildFlowProject } from '@/lib/db'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  const user = token ? verifyToken(token) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, description, budget, startDate, endDate, address, currency, coverColor } = body
  if (!name?.trim()) return NextResponse.json({ error: 'Project name is required' }, { status: 400 })

  try {
    await initSchema()
    const project = await createBuildFlowProject(
      user.userId, name.trim(), description || '', budget || 0,
      startDate || null, endDate || null, address || null, currency || 'USD', coverColor || '#3b82f6'
    )
    return NextResponse.json(project)
  } catch (err) {
    console.error('Create project error:', err)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
