'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  customBg: string
  setCustomBg: (color: string) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
  customBg: '',
  setCustomBg: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [customBg, setCustomBgState] = useState('')

  // Sync initial values from localStorage (set by anti-FOUC script)
  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as Theme | null) ?? 'dark'
    const savedBg = localStorage.getItem('customBg') ?? ''
    // One-time sync from localStorage after hydration. The inline script already
    // applied the visual theme before paint; this only syncs the settings panel.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(savedTheme)
    setCustomBgState(savedBg)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    if (customBg) {
      document.documentElement.style.setProperty('--custom-bg', customBg)
      localStorage.setItem('customBg', customBg)
    } else {
      document.documentElement.style.removeProperty('--custom-bg')
      localStorage.removeItem('customBg')
    }
  }, [customBg])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: setThemeState,
        customBg,
        setCustomBg: setCustomBgState,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
