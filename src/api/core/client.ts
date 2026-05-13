import { getApiBaseUrl } from './config'
import type { ApiEnvelope, RequestOptions } from './types'

/**
 * Backend `PageableApiResponse<T>` places the row array in `data` and paging metadata
 * (`totalCount`, `limit`, …) on the same object as `isSuccess` — not nested under `data`.
 * Without this branch, callers only receive the array and lose `totalCount`, breaking paging.
 */
function tryPageableEnvelope<TResponse>(payload: unknown): TResponse | null {
  if (!payload || typeof payload !== 'object') return null
  const p = payload as Record<string, unknown>
  if (!Array.isArray(p.data)) return null
  if (p.totalCount === undefined || p.totalCount === null) return null
  return {
    data: p.data,
    totalCount: p.totalCount,
    hasMore: p.hasMore ?? false,
    limit: p.limit,
    offset: p.offset,
  } as TResponse
}

export class ApiError extends Error {
  public readonly status: number
  public readonly code: string | null
  public readonly fieldErrors: ApiEnvelope<unknown>['fieldErrors']

  constructor(
    message: string,
    options: {
      status: number
      code: string | null
      fieldErrors: ApiEnvelope<unknown>['fieldErrors']
    },
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status
    this.code = options.code
    this.fieldErrors = options.fieldErrors
  }
}

type TokenProvider = () => string | null
let sharedTokenProvider: TokenProvider = () => null
type RefreshContextProvider = () => { systemUserId: number; refreshToken: string } | null
type RefreshTokenHandler = (payload: {
  systemUserId: number
  refreshToken: string
}) => Promise<{
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  refreshTokenExpiresAt: string
}>
type RefreshSessionUpdater = (tokens: {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  refreshTokenExpiresAt: string
}) => void
type AuthFailureHandler = () => void

let sharedRefreshContextProvider: RefreshContextProvider = () => null
let sharedRefreshTokenHandler: RefreshTokenHandler | null = null
let sharedRefreshSessionUpdater: RefreshSessionUpdater = () => undefined
let sharedAuthFailureHandler: AuthFailureHandler = () => undefined

type MutationToastHandlers = {
  success: (message: string) => void
  error: (message: string) => void
  messages: () => { success: string; error: string }
  formatError?: (error: ApiError) => string | null
}

let sharedMutationToastHandlers: MutationToastHandlers | null = null

export function setApiMutationToastHandlers(handlers: MutationToastHandlers | null) {
  sharedMutationToastHandlers = handlers
}

function shouldToastForRequest(method: string, path: string): boolean {
  // Only toast for potential mutations; list/get/search endpoints are treated as queries.
  if (method !== 'POST' && method !== 'PUT' && method !== 'DELETE') return false

  const p = path.toLowerCase()

  // Auth/session management: keep quiet.
  if (p.includes('systemusers/login') || p.includes('systemusers/refreshtoken')) return false
  // Password rotation: callers show contextual UI (e.g. admin profile form).
  if (p.includes('systemusers/changepassword')) return false
  // Admin commission rule detail form uses local notifications.
  if (p.includes('employers/setcommissionpolicy')) return false

  // Query-ish endpoints (even if implemented as POST).
  if (p.includes('/list') || p.includes('/get') || p.includes('/overview') || p.includes('/me') || p.includes('/my')) return false
  if (p.includes('semanticsearch') || p.includes('/export')) return false

  return true
}

export function setApiAccessTokenProvider(provider: TokenProvider) {
  sharedTokenProvider = provider
}

export function setApiRefreshHandlers(handlers: {
  getRefreshContext: RefreshContextProvider
  refreshToken: RefreshTokenHandler
  onRefreshSuccess: RefreshSessionUpdater
  onAuthFailure: AuthFailureHandler
}) {
  sharedRefreshContextProvider = handlers.getRefreshContext
  sharedRefreshTokenHandler = handlers.refreshToken
  sharedRefreshSessionUpdater = handlers.onRefreshSuccess
  sharedAuthFailureHandler = handlers.onAuthFailure
}

export type ApiClientOptions = {
  getAccessToken?: TokenProvider
}

export class ApiClient {
  private readonly getAccessToken: TokenProvider
  private readonly baseUrl: string

  constructor(options: ApiClientOptions = {}) {
    this.getAccessToken = options.getAccessToken ?? (() => sharedTokenProvider())
    this.baseUrl = getApiBaseUrl()
  }

  public post<TResponse, TBody = Record<string, never>>(
    path: string,
    body?: TBody,
    requiresAuth = false,
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>({
      method: 'POST',
      path,
      body,
      requiresAuth,
    })
  }

  public put<TResponse, TBody>(
    path: string,
    body: TBody,
    requiresAuth = false,
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>({
      method: 'PUT',
      path,
      body,
      requiresAuth,
    })
  }

  private async request<TResponse, TBody = undefined>(
    options: RequestOptions<TBody>,
    attempt = 0,
  ): Promise<TResponse> {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    })

    if (options.requiresAuth) {
      const token = this.getAccessToken()
      if (!token) {
        throw new ApiError('Authentication token is missing.', {
          status: 401,
          code: 'AUTH_TOKEN_MISSING',
          fieldErrors: null,
        })
      }
      headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(`${this.baseUrl}/${options.path}`, {
      method: options.method,
      headers,
      cache: 'no-store',
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })

    if (response.status === 401 && options.requiresAuth && attempt === 0) {
      const refreshContext = sharedRefreshContextProvider()
      if (!refreshContext || !sharedRefreshTokenHandler) {
        sharedAuthFailureHandler()
        throw new ApiError('Authentication session expired.', {
          status: 401,
          code: 'AUTH_SESSION_EXPIRED',
          fieldErrors: null,
        })
      }

      try {
        const refreshedTokens = await sharedRefreshTokenHandler(refreshContext)
        sharedRefreshSessionUpdater(refreshedTokens)
        return this.request<TResponse, TBody>(options, attempt + 1)
      } catch {
        sharedAuthFailureHandler()
        throw new ApiError('Authentication refresh failed.', {
          status: 401,
          code: 'AUTH_REFRESH_FAILED',
          fieldErrors: null,
        })
      }
    }

    const payload = (await response.json()) as ApiEnvelope<TResponse>
    const normalizedSuccess = payload.success ?? payload.isSuccess ?? response.ok
    const normalizedCode = payload.code ?? payload.errorCode ?? null
    const normalizedFieldErrors = payload.fieldErrors ?? payload.errors ?? null

    if (!response.ok || !normalizedSuccess) {
      if (sharedMutationToastHandlers && shouldToastForRequest(options.method, options.path)) {
        const formatted = new ApiError(payload.message ?? 'API request failed.', {
          status: response.status,
          code: normalizedCode,
          fieldErrors: normalizedFieldErrors,
        })
        const msg = sharedMutationToastHandlers.formatError?.(formatted) ?? null
        sharedMutationToastHandlers.error(msg ?? sharedMutationToastHandlers.messages().error)
      }
      throw new ApiError(payload.message ?? 'API request failed.', {
        status: response.status,
        code: normalizedCode,
        fieldErrors: normalizedFieldErrors,
      })
    }

    const pageable = tryPageableEnvelope<TResponse>(payload)
    if (pageable !== null) {
      return pageable
    }

    if (sharedMutationToastHandlers && shouldToastForRequest(options.method, options.path)) {
      const msg = sharedMutationToastHandlers.messages().success
      sharedMutationToastHandlers.success(msg)
    }

    return payload.data as TResponse
  }
}

let singletonClient: ApiClient | null = null

export function getApiClient(): ApiClient {
  if (!singletonClient) {
    singletonClient = new ApiClient()
  }
  return singletonClient
}
