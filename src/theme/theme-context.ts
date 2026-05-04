import { createContext, useContext } from 'react'

export type AppTheme = 'dark' | 'light'

export type ThemeContextValue = {
  theme: AppTheme
  toggleTheme: () => void
  setTheme: (theme: AppTheme) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
