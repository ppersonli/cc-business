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
      // Sync with global data-theme
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', next ? 'dark' : 'light')
      }
      return { isDarkUI: next }
    }),
  showThemePanel: false,
  setShowThemePanel: (show) => set({ showThemePanel: show }),
}))

// Sync isDarkUI with global [data-theme]
if (typeof window !== 'undefined') {
  const readTheme = () =>
    document.documentElement.getAttribute('data-theme') === 'dark'

  useSettingsStore.setState({ isDarkUI: readTheme() })

  // Listen for global theme changes (from ThemeToggle)
  const observer = new MutationObserver(() => {
    useSettingsStore.setState({ isDarkUI: readTheme() })
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
}
