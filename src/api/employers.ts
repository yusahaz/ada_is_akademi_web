import { getApiClient } from './client'
import { API_ENDPOINTS } from './endpoints'
import type { EmployerStatus } from './enums'
import type { PageableListResult } from './pagination'

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
  status: EmployerStatus
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
}

export type EmployerListItem = {
  commissionRate: number | string
  employerId: number | string
  name: string
  status: EmployerStatus
  taxNumber: string
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
}
