import { getApiClient } from '../core/client'
import { API_ENDPOINTS } from '../core/endpoints'
import type { AccountStatus, DevicePlatform, SystemUserType } from '../core/enums'
import type { PageableListResult } from '../core/pagination'

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
  platform: DevicePlatform
  systemUserType: SystemUserType
}

export type RefreshSystemUserTokenCommand = {
  deviceIdentifier: string
  refreshToken: string
  systemUserId: number
}

export type SystemUserToken = {
  systemUserId: number
  systemUserType: SystemUserType
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
}

export type GetSystemUserMeQuery = Record<string, never>

export type SystemUserMe = {
  systemUserId: number | string
  systemUserType: SystemUserType | string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  accountStatus: AccountStatus
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

export type ListSystemUsersQuery = {
  accountStatus?: AccountStatus | null
  limit?: number
  offset?: number
  searchEmail?: string | null
  type?: SystemUserType | null
}

export type ListMyNotificationsQuery = {
  isRead?: boolean | null
  limit?: number
  offset?: number
}

export type SystemUserNotificationItem = {
  id: number | string
  title: string
  body: string
  templateCode: string
  isRead: boolean
  createdAt: string
  readAt: string | null
}

export type MarkNotificationAsReadCommand = {
  notificationId: number | string
}

export type MarkAllNotificationsAsReadCommand = Record<string, never>

export type SystemUserListItem = {
  id: number | string
  email: string
  type: SystemUserType
  accountStatus: AccountStatus
}

export type SystemUsersListResult = PageableListResult<SystemUserListItem>
export type SystemUserNotificationsListResult = PageableListResult<SystemUserNotificationItem>

const client = getApiClient()

export const systemUsersApi = {
  ban(body: BanSystemUserCommand) {
    return client.post<null, BanSystemUserCommand>(API_ENDPOINTS.systemUsers.ban, body, true)
  },
  changePassword(body: ChangeSystemUserPasswordCommand) {
    return client.post<null, ChangeSystemUserPasswordCommand>(
      API_ENDPOINTS.systemUsers.changePassword,
      body,
      true,
    )
  },
  login(body: LoginSystemUserCommand) {
    return client.post<SystemUserToken, LoginSystemUserCommand>(
      API_ENDPOINTS.systemUsers.login,
      body,
      false,
    )
  },
  list(body: ListSystemUsersQuery) {
    return client.post<SystemUsersListResult, ListSystemUsersQuery>(
      API_ENDPOINTS.systemUsers.list,
      body,
      true,
    )
  },
  me(body: GetSystemUserMeQuery = {}) {
    return client.post<SystemUserMe, GetSystemUserMeQuery>(
      API_ENDPOINTS.systemUsers.me,
      body,
      true,
    )
  },
  myNotifications(body: ListMyNotificationsQuery = {}) {
    return client.post<SystemUserNotificationsListResult, ListMyNotificationsQuery>(
      API_ENDPOINTS.systemUsers.myNotifications,
      body,
      true,
    )
  },
  markNotificationAsRead(body: MarkNotificationAsReadCommand) {
    return client.post<null, MarkNotificationAsReadCommand>(
      API_ENDPOINTS.systemUsers.markNotificationAsRead,
      body,
      true,
    )
  },
  markAllNotificationsAsRead(body: MarkAllNotificationsAsReadCommand = {}) {
    return client.post<null, MarkAllNotificationsAsReadCommand>(
      API_ENDPOINTS.systemUsers.markAllNotificationsAsRead,
      body,
      true,
    )
  },
  reactivate(body: ReactivateSystemUserCommand) {
    return client.post<null, ReactivateSystemUserCommand>(
      API_ENDPOINTS.systemUsers.reactivate,
      body,
      true,
    )
  },
  refreshToken(body: RefreshSystemUserTokenCommand) {
    return client.post<SystemUserToken, RefreshSystemUserTokenCommand>(
      API_ENDPOINTS.systemUsers.refreshToken,
      body,
      false,
    )
  },
  requestEmailVerification(body: RequestSystemUserEmailVerificationCommand) {
    return client.post<null, RequestSystemUserEmailVerificationCommand>(
      API_ENDPOINTS.systemUsers.requestEmailVerification,
      body,
      false,
    )
  },
  suspend(body: SuspendSystemUserCommand) {
    return client.post<null, SuspendSystemUserCommand>(
      API_ENDPOINTS.systemUsers.suspend,
      body,
      true,
    )
  },
  verifyEmail(body: VerifySystemUserEmailCommand) {
    return client.post<null, VerifySystemUserEmailCommand>(
      API_ENDPOINTS.systemUsers.verifyEmail,
      body,
      false,
    )
  },
}
