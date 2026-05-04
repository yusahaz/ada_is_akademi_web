import { getApiClient } from './client'

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

const client = getApiClient()

export const systemUserGroupsApi = {
  activate(body: ActivateSystemUserGroupCommand) {
    return client.post<null, ActivateSystemUserGroupCommand>(
      'SystemUserGroups/Activate',
      body,
      true,
    )
  },
  addPermission(body: AddSystemUserGroupPermissionCommand) {
    return client.post<number, AddSystemUserGroupPermissionCommand>(
      'SystemUserGroups/AddPermission',
      body,
      true,
    )
  },
  deactivate(body: DeactivateSystemUserGroupCommand) {
    return client.post<null, DeactivateSystemUserGroupCommand>(
      'SystemUserGroups/Deactivate',
      body,
      true,
    )
  },
}
