// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

import { create } from 'zustand'

interface SettingsState {
  isDarkUI: boolean
  toggleDarkUI: () => void
  showThemePanel: boolean
  setShowThemePanel: (show: boolean) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  isDarkUI: false,
  toggleDarkUI: () =>
    set((state) => {
      const next = !state.isDarkUI
      if (typeof window !== 'undefined') {
        localStorage.setItem('wemd-dark-ui', String(next))
      }
      return { isDarkUI: next }
    }),
  showThemePanel: false,
  setShowThemePanel: (show) => set({ showThemePanel: show }),
}))

// Load saved dark mode from localStorage
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('wemd-dark-ui')
  if (saved === 'true') {
    useSettingsStore.setState({ isDarkUI: true })
  }
}
