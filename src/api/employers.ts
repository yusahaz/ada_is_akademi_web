import { getApiClient } from './client'

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
  status: number
  taxNumber: string
  contact: EmployerContact | null
}

const client = getApiClient()

export const employersApi = {
  activate(body: ActivateEmployerCommand) {
    return client.post<null, ActivateEmployerCommand>(
      'Employers/Activate',
      body,
      true,
    )
  },
  ban(body: BanEmployerCommand) {
    return client.post<null, BanEmployerCommand>(
      'Employers/Ban',
      body,
      true,
    )
  },
  getById(body: GetEmployerByIdQuery) {
    return client.post<EmployerDetail, GetEmployerByIdQuery>(
      'Employers/GetById',
      body,
      true,
    )
  },
  suspend(body: SuspendEmployerCommand) {
    return client.post<null, SuspendEmployerCommand>(
      'Employers/Suspend',
      body,
      true,
    )
  },
}
