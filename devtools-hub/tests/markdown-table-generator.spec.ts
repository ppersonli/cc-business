import { test, expect } from '@playwright/test'

const SAMPLE_TABLE = `| Name | Age | City |
| --- | --- | --- |
| Alice | 30 | NYC |
| Bob | 25 | LA |`

test.describe('Markdown Table Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/tools/markdown-table-generator')
    await page.waitForLoadState('networkidle')
  })

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Markdown Table Generator/)
  })

  test('input textarea is present', async ({ page }) => {
    const textarea = page.locator('textarea').first()
    await expect(textarea).toBeVisible()
  })

  test('live preview renders a table from markdown input', async ({ page }) => {
    // Clear default content and type fresh
    const textarea = page.locator('textarea').first()
    await textarea.fill('')
    await textarea.fill(SAMPLE_TABLE)
    await textarea.press('Tab')

    // The preview table is the one whose th/td do NOT contain input elements
    const previewTable = page.locator('table:not(:has(input))').first()
    await expect(previewTable).toBeVisible()

    await expect(previewTable.locator('th')).toHaveCount(3)
    await expect(previewTable.locator('th').filter({ hasText: 'Name' })).toBeVisible()
    await expect(previewTable.locator('td').filter({ hasText: 'Alice' })).toBeVisible()
    await expect(previewTable.locator('td').filter({ hasText: 'Bob' })).toBeVisible()
  })

  test('live preview updates when input changes', async ({ page }) => {
    const textarea = page.locator('textarea').first()
    await textarea.fill(SAMPLE_TABLE)
    await textarea.press('Tab')

    const previewTable = page.locator('table:not(:has(input))').first()
    await expect(previewTable.locator('td').filter({ hasText: 'Alice' })).toBeVisible()

    const updated = `| Name | Age |
| --- | --- |
| Eve | 22 |`
    await textarea.fill(updated)
    await textarea.press('Tab')

    await expect(previewTable.locator('td').filter({ hasText: 'Eve' })).toBeVisible()
    await expect(previewTable.locator('td').filter({ hasText: 'Alice' })).not.toBeVisible()
  })

  test('Copy as Markdown button copies markdown table', async ({ page }) => {
    await page.evaluate(() => {
      let lastClip = ''
      ;(window as any).__copiedText = ''
      navigator.clipboard.writeText = async (t: string) => { lastClip = t ; (window as any).__copiedText = t ; return }
      navigator.clipboard.readText = async () => lastClip
    })

    const textarea = page.locator('textarea').first()
    await textarea.fill(SAMPLE_TABLE)
    await textarea.press('Tab')

    const copyMdBtn = page.locator('button', { hasText: /Copy as MARKDOWN/i })
    await expect(copyMdBtn).toBeVisible()
    await copyMdBtn.click()

    const clipboard = await page.evaluate(() => (window as any).__copiedText)
    expect(clipboard).toContain('Name')
    expect(clipboard).toContain('Age')
    expect(clipboard).toContain('City')
    expect(clipboard).toContain('Alice')
    expect(clipboard).toContain('NYC')
    expect(clipboard).toMatch(/^\|.*\|$/m) // has pipe-delimited rows
  })

  test('Copy as HTML button copies HTML table', async ({ page }) => {
    await page.evaluate(() => {
      let lastClip = ''
      ;(window as any).__copiedText = ''
      navigator.clipboard.writeText = async (t: string) => { lastClip = t ; (window as any).__copiedText = t ; return }
      navigator.clipboard.readText = async () => lastClip
    })

    const textarea = page.locator('textarea').first()
    await textarea.fill(SAMPLE_TABLE)
    await textarea.press('Tab')

    const copyHtmlBtn = page.locator('button', { hasText: /Copy as HTML/i })
    await expect(copyHtmlBtn).toBeVisible()
    await copyHtmlBtn.click()

    const clipboard = await page.evaluate(() => (window as any).__copiedText)
    expect(clipboard).toContain('<table>')
    expect(clipboard).toContain('<th>Name</th>')
    expect(clipboard).toContain('<td>Alice</td>')
  })

  test('Copy as CSV button copies CSV data', async ({ page }) => {
    await page.evaluate(() => {
      let lastClip = ''
      ;(window as any).__copiedText = ''
      navigator.clipboard.writeText = async (t: string) => { lastClip = t ; (window as any).__copiedText = t ; return }
      navigator.clipboard.readText = async () => lastClip
    })

    const textarea = page.locator('textarea').first()
    await textarea.fill(SAMPLE_TABLE)
    await textarea.press('Tab')

    const copyCsvBtn = page.locator('button', { hasText: /Copy as CSV/i })
    await expect(copyCsvBtn).toBeVisible()
    await copyCsvBtn.click()

    const clipboard = await page.evaluate(() => (window as any).__copiedText)
    expect(clipboard).toContain('Name,Age,City')
    expect(clipboard).toContain('Alice,30,NYC')
  })

  test('shows empty state when no input', async ({ page }) => {
    const textarea = page.locator('textarea').first()
    await textarea.fill('')
    await textarea.press('Tab')

    // No table should be rendered
    await expect(page.locator('table')).toHaveCount(0)

    // Empty state message should be visible
    await expect(page.locator('text=Paste a Markdown table')).toBeVisible()
  })

  test('add row and column buttons work', async ({ page }) => {
    // Buttons appear when there's a valid table
    const textarea = page.locator('textarea').first()
    await textarea.fill(SAMPLE_TABLE)
    await textarea.press('Tab')

    const addRowBtn = page.locator('button', { hasText: '+ Row' })
    const addColBtn = page.locator('button', { hasText: '+ Column' })

    await expect(addRowBtn).toBeVisible()
    await expect(addColBtn).toBeVisible()
  })

  test('is mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/en/tools/markdown-table-generator')
    await page.waitForLoadState('networkidle')

    const textarea = page.locator('textarea').first()
    await expect(textarea).toBeVisible()
    await textarea.fill(SAMPLE_TABLE)
    await textarea.press('Tab')

    const previewTable = page.locator('table:not(:has(input))').first()
    await expect(previewTable).toBeVisible()
  })
})
