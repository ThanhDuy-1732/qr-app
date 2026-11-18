'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { resolveCustomBg, THEME_BASE } from '@/app/lib/resolve-custom-bg'

export type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  customBg: string
  setCustomBg: (color: string) => void
  reduceMotion: boolean
  setReduceMotion: (value: boolean) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
  customBg: '',
  setCustomBg: () => {},
  reduceMotion: false,
  setReduceMotion: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [customBg, setCustomBgState] = useState('')
  const [reduceMotion, setReduceMotionState] = useState(false)
  const [motionLoaded, setMotionLoaded] = useState(false)

  // One-time sync from localStorage after hydration. The inline script has
  // already applied the visual theme, background and motion flag before paint.
  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as Theme | null) ?? 'dark'
    const savedBg = localStorage.getItem('customBg') ?? ''
    const savedMotion = localStorage.getItem('reduceMotion')
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    /* eslint-disable react-hooks/set-state-in-effect -- one-time localStorage sync */
    setThemeState(savedTheme)
    setCustomBgState(savedBg)
    setReduceMotionState(
      savedMotion === null ? prefersReduced : savedMotion === 'true'
    )
    setMotionLoaded(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    if (!motionLoaded) return
    document.documentElement.dataset.motion = reduceMotion ? 'reduced' : 'off'
  }, [reduceMotion, motionLoaded])

  useEffect(() => {
    if (customBg) {
      const resolved = resolveCustomBg(theme, customBg)
      document.documentElement.style.setProperty('--custom-bg', resolved)
      localStorage.setItem('customBg', customBg)
      localStorage.setItem('customBgResolved', resolved)
    } else {
      document.documentElement.style.setProperty(
        '--custom-bg',
        THEME_BASE[theme]
      )
      localStorage.removeItem('customBg')
      localStorage.removeItem('customBgResolved')
    }
  }, [customBg, theme])

  // Persist only when the visitor actually uses the switch; an OS-derived
  // default must keep following the OS on later visits.
  function setReduceMotion(value: boolean) {
    setReduceMotionState(value)
    try {
      localStorage.setItem('reduceMotion', String(value))
    } catch {
      /* storage can be unavailable in private modes; the state still applies */
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: setThemeState,
        customBg,
        setCustomBg: setCustomBgState,
        reduceMotion,
        setReduceMotion,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
