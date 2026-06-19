// PageAudit: Screenshot service using Playwright
// Falls back to placeholder if Playwright is unavailable (e.g., on Vercel serverless)
// For Vercel deployment: use an external screenshot API or deploy screenshot service separately

export interface ScreenshotResult {
  desktop: string  // base64 PNG
  mobile: string   // base64 PNG
  loadTime: number // ms
  url: string
}

export interface PerformanceMetrics {
  loadTime: number
  domContentLoaded: number
  resourceCount: number
  totalSize: number
}

let playwrightModule: any = null

async function getPlaywright(): Promise<any> {
  if (playwrightModule) return playwrightModule
  try {
    playwrightModule = await import('playwright')
    return playwrightModule
  } catch {
    return null
  }
}

export async function takeScreenshots(url: string): Promise<ScreenshotResult & { metrics: PerformanceMetrics }> {
  const pw = await getPlaywright()

  if (!pw) {
    // Fallback: return placeholder screenshots
    return createPlaceholderResult(url)
  }

  const metrics: PerformanceMetrics = {
    loadTime: 0,
    domContentLoaded: 0,
    resourceCount: 0,
    totalSize: 0,
  }

  let browser: any
  try {
    browser = await pw.chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    })

    // Desktop screenshot
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    })
    const desktopPage = await desktopContext.newPage()

    const desktopStart = Date.now()
    await desktopPage.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    metrics.loadTime = Date.now() - desktopStart

    // Collect performance metrics
    const perfData = await desktopPage.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const resources = performance.getEntriesByType('resource')
      return {
        loadTime: perf ? perf.loadEventEnd - perf.startTime : 0,
        domContentLoaded: perf ? perf.domContentLoadedEventEnd - perf.startTime : 0,
        resourceCount: resources.length,
        totalSize: resources.reduce((sum: number, r: any) => sum + (r.transferSize || 0), 0),
      }
    })
    metrics.loadTime = Math.round(perfData.loadTime) || metrics.loadTime
    metrics.domContentLoaded = Math.round(perfData.domContentLoaded)
    metrics.resourceCount = perfData.resourceCount
    metrics.totalSize = perfData.totalSize

    const desktopBuffer = await desktopPage.screenshot({ type: 'png', fullPage: false })
    const desktop = desktopBuffer.toString('base64')
    await desktopContext.close()

    // Mobile screenshot
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    })
    const mobilePage = await mobileContext.newPage()
    await mobilePage.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    const mobileBuffer = await mobilePage.screenshot({ type: 'png', fullPage: false })
    const mobile = mobileBuffer.toString('base64')
    await mobileContext.close()

    return { desktop, mobile, loadTime: metrics.loadTime, url, metrics }
  } finally {
    if (browser) await browser.close().catch(() => {})
  }
}

function createPlaceholderResult(url: string): ScreenshotResult & { metrics: PerformanceMetrics } {
  // Create a simple SVG-based placeholder
  const makeSvg = (w: number, h: number, label: string) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <rect width="100%" height="100%" fill="#f1f5f9"/>
      <text x="50%" y="40%" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#64748b">${label}</text>
      <text x="50%" y="55%" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#94a3b8">${url.slice(0, 60)}</text>
      <text x="50%" y="70%" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#cbd5e1">Screenshot service unavailable</text>
    </svg>`
    return Buffer.from(svg).toString('base64')
  }

  return {
    desktop: makeSvg(1280, 800, 'Desktop View'),
    mobile: makeSvg(375, 812, 'Mobile View'),
    loadTime: 0,
    url,
    metrics: { loadTime: 0, domContentLoaded: 0, resourceCount: 0, totalSize: 0 },
  }
}
