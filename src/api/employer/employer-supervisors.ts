import { getApiClient } from '../core/client'
import { API_ENDPOINTS } from '../core/endpoints'

export type AddEmployerSupervisorCommand = {
  systemUserId: number
  locationId?: number | null
}

export type RemoveEmployerSupervisorCommand = {
  systemUserId: number
  locationId?: number | null
}

export type MembershipScopeType = 'Global' | 'EmployerScoped' | 'LocationScoped'

export type ListEmployerSupervisorsQuery = {
  [key: string]: never
}

export type EmployerSupervisorListItemModel = {
  systemUserId: number
  fullName: string
  email: string
  assignedLocationIds: number[]
  groupIds: number[]
  scopeType: MembershipScopeType
}

const client = getApiClient()

export const employerSupervisorsApi = {
  listSupervisors(body: ListEmployerSupervisorsQuery = {}) {
    return client.post<EmployerSupervisorListItemModel[], ListEmployerSupervisorsQuery>(
      API_ENDPOINTS.employers.listSupervisors,
      body,
      true,
    )
  },
  addSupervisor(body: AddEmployerSupervisorCommand) {
    return client.post<number, AddEmployerSupervisorCommand>(API_ENDPOINTS.employers.addSupervisor, body, true)
  },
  removeSupervisor(body: RemoveEmployerSupervisorCommand) {
    return client.post<null, RemoveEmployerSupervisorCommand>(API_ENDPOINTS.employers.removeSupervisor, body, true)
  },
}

