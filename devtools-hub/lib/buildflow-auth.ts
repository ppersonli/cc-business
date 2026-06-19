/**
 * BuildFlow auth helper.
 * Uses the same JWT auth_token cookie as the rest of devtools-hub.
 */
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export async function getBuildFlowUser(): Promise<{ userId: number; email: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) return null
  return verifyToken(token)
}
