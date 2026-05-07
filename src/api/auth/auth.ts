import { ApiError, getApiClient } from '../core/client'
import { API_ENDPOINTS } from '../core/endpoints'
import { DevicePlatform, SystemUserType } from '../core/enums'
import { systemUsersApi, type SystemUserToken } from '../system/system-users'

export type AuthAudience = 'individual' | 'corporate' | 'admin'

export type LoginPayload = {
  email: string
  password: string
  audience: AuthAudience
}

export type RegisterPayload = {
  fullName?: string
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  email: string
  password: string
  audience?: AuthAudience
}

export type RegisterRole = 'worker' | 'employer' | 'admin'

export type AuthResult = {
  systemUserId: number
  systemUserType: SystemUserType
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
}

export type AuthAdapter = {
  login: (payload: LoginPayload) => Promise<AuthResult>
  register: (payload: RegisterPayload) => Promise<AuthResult>
  registerByRole: (
    role: RegisterRole,
    payload: RegisterPayload,
  ) => Promise<AuthResult>
  refreshToken: (payload: {
    deviceIdentifier: string
    refreshToken: string
    systemUserId: number
  }) => Promise<AuthResult>
}

function ensurePath(path: string | null): string {
  if (!path) {
    throw new ApiError('Auth endpoint is not configured.', {
      status: 500,
      code: 'AUTH_NOT_CONFIGURED',
      fieldErrors: null,
    })
  }
  return path
}

export function createAuthAdapter(): AuthAdapter {
  const client = getApiClient()
  const registerWorkerPath = API_ENDPOINTS.systemUsers.registerWorker
  const registerEmployerPath = API_ENDPOINTS.systemUsers.registerEmployer
  const registerAdminPath = API_ENDPOINTS.systemUsers.registerAdmin

  function splitName(payload: RegisterPayload): {
    firstName: string | null
    lastName: string | null
  } {
    if (payload.firstName || payload.lastName) {
      return {
        firstName: payload.firstName ?? null,
        lastName: payload.lastName ?? null,
      }
    }

    const parts = (payload.fullName ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
    if (parts.length === 0) {
      return { firstName: null, lastName: null }
    }
    return {
      firstName: parts[0] ?? null,
      lastName: parts.length > 1 ? parts.slice(1).join(' ') : null,
    }
  }

  async function registerToPath(
    role: RegisterRole,
    payload: RegisterPayload,
  ): Promise<AuthResult> {
    const { firstName, lastName } = splitName(payload)
    const phone = payload.phone ?? null

    if (role === 'admin') {
      return client.post<AuthResult, Record<string, string | null>>(ensurePath(registerAdminPath), {
        email: payload.email,
        password: payload.password,
        firstName,
        lastName,
        phone,
      }, false)
    }

    if (role === 'employer') {
      return client.post<AuthResult, Record<string, string | null>>(ensurePath(registerEmployerPath), {
        email: payload.email,
        password: payload.password,
        firstName,
        lastName,
        phone,
        employerName: payload.fullName ?? payload.firstName ?? payload.email,
        employerDescription: null,
        employerAddressCountry: 'TR',
        employerAddressCity: 'Istanbul',
        employerAddressLine1: '-',
        employerTaxNumber: '-',
      }, false)
    }

    return client.post<AuthResult, Record<string, string | null>>(ensurePath(registerWorkerPath), {
      email: payload.email,
      password: payload.password,
      firstName,
      lastName,
      phone,
    }, false)
  }

  function toAuthResult(token: SystemUserToken): AuthResult {
    const normalizedUserId = Number(token.systemUserId)
    const normalizedUserType = Number(token.systemUserType)

    return {
      systemUserId: Number.isFinite(normalizedUserId) ? normalizedUserId : 0,
      systemUserType: Number.isFinite(normalizedUserType)
        ? (normalizedUserType as SystemUserType)
        : SystemUserType.Worker,
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
    }
  }

  function audienceToSystemUserType(audience: AuthAudience): SystemUserType {
    if (audience === 'corporate') return SystemUserType.Employer
    if (audience === 'admin') return SystemUserType.Admin
    return SystemUserType.Worker
  }

  return {
    async login(payload) {
      const token = await systemUsersApi.login({
        email: payload.email,
        password: payload.password,
        deviceIdentifier: 'web-browser',
        deviceToken: null,
        platform: DevicePlatform.Web,
        systemUserType: audienceToSystemUserType(payload.audience),
      })
      return toAuthResult(token)
    },
    async register(payload) {
      const role: RegisterRole =
        payload.audience === 'corporate' ? 'employer' : 'worker'
      return registerToPath(role, payload)
    },
    async registerByRole(role, payload) {
      return registerToPath(role, payload)
    },
    async refreshToken(payload) {
      const token = await systemUsersApi.refreshToken(payload)
      return toAuthResult(token)
    },
  }
}
