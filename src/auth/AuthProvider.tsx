import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { setApiAccessTokenProvider } from '../api/client'
import { AuthContext, type AuthContextValue, type AuthSession } from './auth-context'
import { decryptAuthSession, encryptAuthSession } from './storage-crypto'

const AUTH_STORAGE_KEY = 'ada-is-akademi:auth-session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [hydrated, setHydrated] = useState(() => typeof window === 'undefined')

  useEffect(() => {
    if (typeof window === 'undefined') return

    let isActive = true
    void (async () => {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
      if (!raw) {
        if (isActive) setHydrated(true)
        return
      }

      const decrypted = await decryptAuthSession(raw)
      if (!isActive) return

      if (
        decrypted?.accessToken &&
        decrypted?.refreshToken &&
        decrypted?.email
      ) {
        setSession(decrypted)
      } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEY)
      }

      setHydrated(true)
    })()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    setApiAccessTokenProvider(() => session?.accessToken ?? null)
  }, [session])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!hydrated) return

    if (!session) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
      return
    }

    void (async () => {
      const encrypted = await encryptAuthSession(session)
      window.localStorage.setItem(AUTH_STORAGE_KEY, encrypted)
    })()
  }, [hydrated, session])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session?.accessToken),
      isHydrating: !hydrated,
      signIn: ({ authResult, audience, email }) => {
        setSession({
          ...authResult,
          audience,
          email,
          signedInAt: new Date().toISOString(),
        })
      },
      logout: () => setSession(null),
    }),
    [hydrated, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
