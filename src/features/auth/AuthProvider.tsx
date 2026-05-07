import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { createAuthAdapter } from '../../api/auth/auth'
import { setApiAccessTokenProvider, setApiRefreshHandlers } from '../../api/core/client'
import { AuthContext, type AuthContextValue, type AuthSession } from './auth-context'
import { decryptAuthSession, encryptAuthSession } from './storage-crypto'

const AUTH_STORAGE_KEY = 'ada-is-akademi:auth-session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const authAdapter = useMemo(() => createAuthAdapter(), [])
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
    setApiRefreshHandlers({
      getRefreshContext: () => {
        if (!session?.refreshToken || !Number.isFinite(Number(session.systemUserId))) {
          return null
        }
        return {
          systemUserId: Number(session.systemUserId),
          refreshToken: session.refreshToken,
        }
      },
      refreshToken: ({ systemUserId, refreshToken }) =>
        authAdapter.refreshToken({
          systemUserId,
          refreshToken,
          deviceIdentifier: 'web-browser',
        }),
      onRefreshSuccess: (tokens) =>
        setSession((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            accessTokenExpiresAt: tokens.accessTokenExpiresAt,
            refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
          }
        }),
      onAuthFailure: () => setSession(null),
    })
  }, [authAdapter, session])

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
