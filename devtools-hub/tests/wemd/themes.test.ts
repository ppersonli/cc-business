// WeMD Themes Unit Tests
import { describe, it, expect } from 'vitest'
import { builtInThemes, getThemeById, getAllThemes } from '../../lib/wemd/themes'

const EXPECTED_THEME_IDS = [
  'basic',
  'academic-paper',
  'aurora-glass',
  'bauhaus',
  'code-github',
  'custom-default',
  'cyberpunk-neon',
  'knowledge-base',
  'luxury-gold',
  'morandi-forest',
  'neo-brutalism',
  'receipt',
  'sunset-film',
]

describe('WeMD Themes', () => {
  it('has 13 built-in themes', () => {
    expect(builtInThemes).toHaveLength(13)
  })

  it('contains all expected theme IDs', () => {
    const ids = builtInThemes.map((t) => t.id)
    for (const id of EXPECTED_THEME_IDS) {
      expect(ids).toContain(id)
    }
  })

  it.each(EXPECTED_THEME_IDS)('theme "%s" has valid structure', (id) => {
    const theme = getThemeById(id)
    expect(theme).toBeDefined()
    expect(theme!.id).toBe(id)
    expect(theme!.name).toBeTruthy()
    expect(typeof theme!.name).toBe('string')
    expect(theme!.isBuiltIn).toBe(true)
    expect(typeof theme!.css).toBe('string')
    expect(theme!.css.length).toBeGreaterThan(10)
  })

  it('each theme CSS contains .wemd-preview selector', () => {
    for (const theme of builtInThemes) {
      expect(theme.css).toContain('.wemd-preview')
    }
  })

  it('getThemeById returns undefined for unknown ID', () => {
    expect(getThemeById('nonexistent')).toBeUndefined()
  })

  it('getAllThemes includes custom themes', () => {
    const custom = { id: 'my-theme', name: 'My Theme', css: '.wemd-preview {}', isBuiltIn: false }
    const all = getAllThemes([custom])
    expect(all).toHaveLength(14)
    expect(all.find((t) => t.id === 'my-theme')).toBeDefined()
  })

  it('getAllThemes with no custom themes returns built-in only', () => {
    expect(getAllThemes()).toHaveLength(13)
  })

  it('no duplicate theme IDs', () => {
    const ids = builtInThemes.map((t) => t.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})
