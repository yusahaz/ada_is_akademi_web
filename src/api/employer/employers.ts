import { getApiClient } from '../core/client'
import { API_ENDPOINTS } from '../core/endpoints'
import type { EmployerStatus } from '../core/enums'
import type { PageableListResult } from '../core/pagination'

export type ActivateEmployerCommand = {
  employerId: number
}

export type BanEmployerCommand = {
  employerId: number
}

export type SuspendEmployerCommand = {
  employerId: number
}

export type GetEmployerByIdQuery = {
  employerId: number
}

export type EmployerContact = {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export type EmployerDetail = {
  id: number
  name: string
  description: string | null
  /** API may return numeric enum or string name depending on serializer settings. */
  status: EmployerStatus | string
  taxNumber: string
  contact: EmployerContact | null
}

export type ListEmployersQuery = {
  commissionRateMax?: number | string | null
  commissionRateMin?: number | string | null
  limit?: number
  offset?: number
  searchText?: string | null
  status?: EmployerStatus | null
  /** name | taxNumber | status | commissionRate | employerId */
  sortBy?: string | null
  sortDescending?: boolean
}

export type EmployerListItem = {
  commissionRate: number | string
  employerId: number | string
  name: string
  /** API may return numeric enum or string name depending on serializer settings. */
  status: EmployerStatus | string
  taxNumber: string
  logoObjectKey?: string | null
  logoViewUrl?: string | null
}

export type DeleteEmployerCommand = {
  employerId: number
}

export type UpdateEmployerProfileCommand = {
  employerId: number
  name: string
  taxNumber: string
  description?: string | null
  firstName: string
  lastName: string
  email: string
  phone: string
}

export type EmployersListResult = PageableListResult<EmployerListItem>

const client = getApiClient()

export const employersApi = {
  activate(body: ActivateEmployerCommand) {
    return client.post<null, ActivateEmployerCommand>(
      API_ENDPOINTS.employers.activate,
      body,
      true,
    )
  },
  ban(body: BanEmployerCommand) {
    return client.post<null, BanEmployerCommand>(
      API_ENDPOINTS.employers.ban,
      body,
      true,
    )
  },
  delete(body: DeleteEmployerCommand) {
    return client.post<null, DeleteEmployerCommand>(API_ENDPOINTS.employers.delete, body, true)
  },
  getById(body: GetEmployerByIdQuery) {
    return client.post<EmployerDetail, GetEmployerByIdQuery>(
      API_ENDPOINTS.employers.getById,
      body,
      true,
    )
  },
  list(body: ListEmployersQuery) {
    return client.post<EmployersListResult, ListEmployersQuery>(
      API_ENDPOINTS.employers.list,
      body,
      true,
    )
  },
  suspend(body: SuspendEmployerCommand) {
    return client.post<null, SuspendEmployerCommand>(
      API_ENDPOINTS.employers.suspend,
      body,
      true,
    )
  },
  updateProfile(body: UpdateEmployerProfileCommand) {
    return client.post<null, UpdateEmployerProfileCommand>(
      API_ENDPOINTS.employers.updateProfile,
      body,
      true,
    )
  },
}
