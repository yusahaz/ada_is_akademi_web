import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { createAuthAdapter, type AuthAdapter } from '../../api/auth/auth'
import { ApiClient, ApiError, setApiAccessTokenProvider, setApiRefreshHandlers } from '../../api/core/client'
import { API_ENDPOINTS } from '../../api/core/endpoints'
import type { SystemUserMe } from '../../api/system/system-users'
import { appQueryClient } from '../../query/query-client'
import { AuthContext, type AuthContextValue, type AuthSession } from './auth-context'
import { decryptAuthSession, encryptAuthSession } from './storage-crypto'

const AUTH_STORAGE_KEY = 'ada-is-akademi:auth-session'

async function validateStoredSession(authAdapter: AuthAdapter, session: AuthSession): Promise<AuthSession | null> {
  const callMe = async (accessToken: string) => {
    const client = new ApiClient({ getAccessToken: () => accessToken })
    await client.post<SystemUserMe, Record<string, never>>(API_ENDPOINTS.systemUsers.me, {}, true)
  }

  try {
    await callMe(session.accessToken)
    return session
  } catch (e) {
    if (!(e instanceof ApiError) || e.status !== 401) {
      return null
    }
  }

  const systemUserId = Number(session.systemUserId)
  if (!Number.isFinite(systemUserId)) {
    return null
  }

  try {
    const tokens = await authAdapter.refreshToken({
      systemUserId,
      refreshToken: session.refreshToken,
      deviceIdentifier: 'web-browser',
    })
    const updated: AuthSession = { ...session, ...tokens }
    await callMe(updated.accessToken)
    return updated
  } catch {
    return null
  }
}

function loginPathForAudience(audience: AuthSession['audience']): string {
  return audience === 'admin' ? '/admin' : '/'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const authAdapter = useMemo(() => createAuthAdapter(), [])
  const [session, setSession] = useState<AuthSession | null>(null)
  const [hydrated, setHydrated] = useState(() => typeof window === 'undefined')

  useEffect(() => {
    if (typeof window === 'undefined') return

    let isActive = true
    void (async () => {
      const raw = window.sessionStorage.getItem(AUTH_STORAGE_KEY)
      if (!raw) {
        if (isActive) setHydrated(true)
        return
      }

      const decrypted = await decryptAuthSession(raw)
      if (!isActive) return

      if (
        !decrypted?.accessToken ||
        !decrypted?.refreshToken ||
        !decrypted?.email
      ) {
        window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
        if (isActive) setHydrated(true)
        return
      }

      const validated = await validateStoredSession(authAdapter, decrypted)
      if (!isActive) return

      if (!validated) {
        appQueryClient.clear()
        window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
        navigate(loginPathForAudience(decrypted.audience), { replace: true })
        if (isActive) setHydrated(true)
        return
      }

      if (isActive) setSession(validated)
      if (isActive) setHydrated(true)
    })()

    return () => {
      isActive = false
    }
  }, [authAdapter, navigate])

  useLayoutEffect(() => {
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
      onAuthFailure: () => {
        appQueryClient.clear()
        setSession(null)
      },
    })
  }, [authAdapter, session])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!hydrated) return

    if (!session) {
      window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
      return
    }

    void (async () => {
      const encrypted = await encryptAuthSession(session)
      window.sessionStorage.setItem(AUTH_STORAGE_KEY, encrypted)
    })()
  }, [hydrated, session])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session?.accessToken),
      isHydrating: !hydrated,
      signIn: ({ authResult, audience, email }) => {
        appQueryClient.clear()
        setSession({
          ...authResult,
          audience,
          email,
          signedInAt: new Date().toISOString(),
        })
      },
      logout: () => {
        appQueryClient.clear()
        setSession(null)
      },
    }),
    [hydrated, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
