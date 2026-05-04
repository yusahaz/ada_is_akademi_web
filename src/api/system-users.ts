import { getApiClient } from './client'

export type BanSystemUserCommand = {
  systemUserId: number
}

export type SuspendSystemUserCommand = {
  systemUserId: number
}

export type ReactivateSystemUserCommand = {
  systemUserId: number
}

export type ChangeSystemUserPasswordCommand = {
  systemUserId: number
  password: string
}

export type LoginSystemUserCommand = {
  deviceIdentifier: string
  deviceToken: string | null
  email: string
  password: string
  platform: number
}

export type RefreshSystemUserTokenCommand = {
  deviceIdentifier: string
  refreshToken: string
  systemUserId: number
}

export type SystemUserToken = {
  systemUserId: number
  systemUserType: number
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
}

export type GetSystemUserMeQuery = Record<string, never>

export type SystemUserMe = {
  systemUserId: number | string
  systemUserType: number | string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  accountStatus: number
  isLocked: boolean
  employerId: number | string | null
  workerId: number | string | null
}

export type RequestSystemUserEmailVerificationCommand = {
  systemUserId: number
  tokenHash: string
  expiresAt: string
}

export type VerifySystemUserEmailCommand = {
  systemUserId: number
  tokenHash: string
}

const client = getApiClient()

export const systemUsersApi = {
  ban(body: BanSystemUserCommand) {
    return client.post<null, BanSystemUserCommand>('SystemUsers/Ban', body, true)
  },
  changePassword(body: ChangeSystemUserPasswordCommand) {
    return client.post<null, ChangeSystemUserPasswordCommand>(
      'SystemUsers/ChangePassword',
      body,
      true,
    )
  },
  login(body: LoginSystemUserCommand) {
    return client.post<SystemUserToken, LoginSystemUserCommand>(
      'SystemUsers/Login',
      body,
      false,
    )
  },
  me(body: GetSystemUserMeQuery = {}) {
    return client.post<SystemUserMe, GetSystemUserMeQuery>(
      'SystemUsers/Me',
      body,
      true,
    )
  },
  reactivate(body: ReactivateSystemUserCommand) {
    return client.post<null, ReactivateSystemUserCommand>(
      'SystemUsers/Reactivate',
      body,
      true,
    )
  },
  refreshToken(body: RefreshSystemUserTokenCommand) {
    return client.post<SystemUserToken, RefreshSystemUserTokenCommand>(
      'SystemUsers/RefreshToken',
      body,
      false,
    )
  },
  requestEmailVerification(body: RequestSystemUserEmailVerificationCommand) {
    return client.post<null, RequestSystemUserEmailVerificationCommand>(
      'SystemUsers/RequestEmailVerification',
      body,
      false,
    )
  },
  suspend(body: SuspendSystemUserCommand) {
    return client.post<null, SuspendSystemUserCommand>(
      'SystemUsers/Suspend',
      body,
      true,
    )
  },
  verifyEmail(body: VerifySystemUserEmailCommand) {
    return client.post<null, VerifySystemUserEmailCommand>(
      'SystemUsers/VerifyEmail',
      body,
      false,
    )
  },
}
