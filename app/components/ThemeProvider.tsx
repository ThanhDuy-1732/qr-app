'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { resolveCustomBg } from '@/app/lib/resolve-custom-bg'

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

const THEME_BASE: Record<Theme, string> = {
  dark: '#04050d',
  light: '#f6f1ff',
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [customBg, setCustomBgState] = useState('')
  const [reduceMotion, setReduceMotion] = useState(false)
  const [motionLoaded, setMotionLoaded] = useState(false)

  // One-time sync from localStorage after hydration. The inline script has
  // already applied the visual theme and motion flag before paint.
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
    setReduceMotion(
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
    localStorage.setItem('reduceMotion', String(reduceMotion))
  }, [reduceMotion, motionLoaded])

  useEffect(() => {
    if (customBg) {
      document.documentElement.style.setProperty(
        '--custom-bg',
        resolveCustomBg(theme, customBg)
      )
      localStorage.setItem('customBg', customBg)
    } else {
      document.documentElement.style.setProperty(
        '--custom-bg',
        THEME_BASE[theme]
      )
      localStorage.removeItem('customBg')
    }
  }, [customBg, theme])

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
