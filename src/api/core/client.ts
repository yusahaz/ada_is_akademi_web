import { getApiBaseUrl } from './config'
import type { ApiEnvelope, RequestOptions } from './types'

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
      throw new ApiError(payload.message ?? 'API request failed.', {
        status: response.status,
        code: normalizedCode,
        fieldErrors: normalizedFieldErrors,
      })
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
