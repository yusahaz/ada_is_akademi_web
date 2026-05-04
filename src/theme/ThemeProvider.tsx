import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { ThemeContext, type AppTheme, type ThemeContextValue } from './theme-context'

const STORAGE_KEY = 'ada-is-akademi:theme'

function getSystemTheme(): AppTheme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark'
}

function getInitialTheme(): AppTheme {
  if (typeof window === 'undefined') return 'dark'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') {
    return stored
  }
  return getSystemTheme()
}

function applyThemeToDocument(theme: AppTheme) {
  document.documentElement.dataset.theme = theme
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>(() => getInitialTheme())

  useEffect(() => {
    applyThemeToDocument(theme)
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
      },
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
