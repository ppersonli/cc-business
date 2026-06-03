// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

'use client'

import { useEffect, useRef } from 'react'

export function useAutoSave(key: string, value: string, delay = 1000) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, value)
      } catch {
        // Storage full or unavailable
      }
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [key, value, delay])
}
