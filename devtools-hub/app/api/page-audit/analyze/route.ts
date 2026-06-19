import { NextRequest, NextResponse } from 'next/server'
import { takeScreenshots } from '@/lib/page-audit/screenshot'
import { analyzePageWithAI } from '@/lib/page-audit/analyzer'

// Rate limit: 3 free analyses per month (localStorage-based on client side)
const rateLimits = new Map<string, { count: number; resetAt: number }>()
const MONTHLY_LIMIT = 10

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const key = `${ip}-${new Date().toISOString().slice(0, 7)}` // monthly

  let entry = rateLimits.get(key)
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + 30 * 24 * 60 * 60 * 1000 }
    rateLimits.set(key, entry)
  }

  if (entry.count >= MONTHLY_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: MONTHLY_LIMIT - entry.count }
}

/**
 * POST /api/page-audit/analyze
 * Body: { url: string }
 * Returns: AuditResult JSON
 */
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    const normalizedUrl = parsedUrl.href

    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const { allowed, remaining } = checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Monthly analysis limit reached. Try again next month.' },
        { status: 429 }
      )
    }

    // Take screenshots
    const screenshots = await takeScreenshots(normalizedUrl)

    // AI analysis
    const result = await analyzePageWithAI(
      screenshots.desktop,
      screenshots.mobile,
      normalizedUrl
    )

    return NextResponse.json({
      result,
      screenshots: {
        desktop: screenshots.desktop,
        mobile: screenshots.mobile,
      },
      metrics: screenshots.metrics,
      remaining,
    })
  } catch (error) {
    console.error('[PageAudit] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
