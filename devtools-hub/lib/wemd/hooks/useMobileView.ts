// Mobile view state management for WeMD editor

import { useState, useEffect, useCallback } from 'react'

export type MobileView = 'editor' | 'preview'

const BREAKPOINT = 768

export function useMobileView() {
  const [isMobile, setIsMobile] = useState(false)
  const [mobileView, setMobileView] = useState<MobileView>('editor')

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth <= BREAKPOINT
      setIsMobile(mobile)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const toggleMobileView = useCallback(() => {
    setMobileView((v) => (v === 'editor' ? 'preview' : 'editor'))
  }, [])

  const showEditor = !isMobile || mobileView === 'editor'
  const showPreview = !isMobile || mobileView === 'preview'

  return {
    isMobile,
    mobileView,
    setMobileView,
    toggleMobileView,
    showEditor,
    showPreview,
  }
}
