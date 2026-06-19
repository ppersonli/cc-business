// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

import { create } from 'zustand'
import type { Theme } from '../types'
import { builtInThemes, getAllThemes } from '../themes'

interface ThemeState {
  currentThemeId: string
  setCurrentThemeId: (id: string) => void
  customThemes: Theme[]
  addCustomTheme: (theme: Theme) => void
  removeCustomTheme: (id: string) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  currentThemeId: 'basic',
  setCurrentThemeId: (id) => {
    set({ currentThemeId: id })
    if (typeof window !== 'undefined') {
      localStorage.setItem('wemd-theme-id', id)
    }
  },
  customThemes: [],
  addCustomTheme: (theme) =>
    set((state) => ({ customThemes: [...state.customThemes, theme] })),
  removeCustomTheme: (id) =>
    set((state) => ({
      customThemes: state.customThemes.filter((t) => t.id !== id),
    })),
}))

// --- Theme Export/Import Utilities ---

/** Export current theme as CSS file download */
export function exportThemeCSS(themeId?: string): void {
  const all = getAllThemes(useThemeStore.getState().customThemes)
  const theme = all.find((t) => t.id === (themeId || useThemeStore.getState().currentThemeId))
  if (!theme) return
  const blob = new Blob([theme.css], { type: 'text/css;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `wemd-theme-${theme.id}.css`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Export theme as JSON file download (includes CSS + designer variables) */
export function exportThemeJSON(themeId?: string): void {
  const all = getAllThemes(useThemeStore.getState().customThemes)
  const theme = all.find((t) => t.id === (themeId || useThemeStore.getState().currentThemeId))
  if (!theme) return
  const data = {
    id: theme.id,
    name: theme.name,
    css: theme.css,
    isBuiltIn: false, // exported themes become custom
    designerVariables: theme.designerVariables,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `wemd-theme-${theme.id}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Import theme from JSON file */
export async function importThemeJSON(): Promise<Theme | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) { resolve(null); return }
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (!data.css || typeof data.css !== 'string') {
          alert('无效的 JSON 文件：缺少 css 字段')
          resolve(null)
          return
        }
        const theme: Theme = {
          id: `custom-${Date.now()}`,
          name: data.name || file.name.replace('.json', ''),
          css: data.css,
          isBuiltIn: false,
          designerVariables: data.designerVariables,
        }
        useThemeStore.getState().addCustomTheme(theme)
        resolve(theme)
      } catch (err) {
        alert(`导入失败: ${err instanceof Error ? err.message : String(err)}`)
        resolve(null)
      }
    }
    input.click()
  })
}

// Load saved theme from localStorage
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('wemd-theme-id')
  if (saved) {
    useThemeStore.setState({ currentThemeId: saved })
  }
}
