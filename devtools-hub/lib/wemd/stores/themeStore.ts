// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

import { create } from 'zustand'
import type { Theme } from '../types'

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

// Load saved theme from localStorage
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('wemd-theme-id')
  if (saved) {
    useThemeStore.setState({ currentThemeId: saved })
  }
}
