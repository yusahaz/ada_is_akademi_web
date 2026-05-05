import { getApiClient } from './client'
import { API_ENDPOINTS } from './endpoints'
import type { PageableListResult } from './pagination'

export type ActivateSystemUserGroupCommand = {
  systemUserGroupId: number
}

export type DeactivateSystemUserGroupCommand = {
  systemUserGroupId: number
}

export type AddSystemUserGroupPermissionCommand = {
  effect: number
  permissionId: number
  systemUserGroupId: number
}

export type ListSystemUserGroupsQuery = {
  isActive?: boolean | null
  isSystem?: boolean | null
  limit?: number
  offset?: number
  searchName?: string | null
}

export type SystemUserGroupListItem = {
  id: number | string
  isActive: boolean
  isSystem: boolean
  level: number | string
  name: string
}

export type SystemUserGroupsListResult = PageableListResult<SystemUserGroupListItem>

const client = getApiClient()

export const systemUserGroupsApi = {
  activate(body: ActivateSystemUserGroupCommand) {
    return client.post<null, ActivateSystemUserGroupCommand>(
      API_ENDPOINTS.systemUserGroups.activate,
      body,
      true,
    )
  },
  addPermission(body: AddSystemUserGroupPermissionCommand) {
    return client.post<number, AddSystemUserGroupPermissionCommand>(
      API_ENDPOINTS.systemUserGroups.addPermission,
      body,
      true,
    )
  },
  deactivate(body: DeactivateSystemUserGroupCommand) {
    return client.post<null, DeactivateSystemUserGroupCommand>(
      API_ENDPOINTS.systemUserGroups.deactivate,
      body,
      true,
    )
  },
  list(body: ListSystemUserGroupsQuery) {
    return client.post<SystemUserGroupsListResult, ListSystemUserGroupsQuery>(
      API_ENDPOINTS.systemUserGroups.list,
      body,
      true,
    )
  },
}
