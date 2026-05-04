import { createContext, useContext } from 'react'

import type { AuthAudience, AuthResult } from '../api/auth'

export type AuthSession = AuthResult & {
  audience: AuthAudience
  email: string
  signedInAt: string
}

export type AuthContextValue = {
  session: AuthSession | null
  isAuthenticated: boolean
  signIn: (payload: {
    authResult: AuthResult
    audience: AuthAudience
    email: string
  }) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
