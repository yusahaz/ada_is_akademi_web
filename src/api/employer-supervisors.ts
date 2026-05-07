import { getApiClient } from './client'
import { API_ENDPOINTS } from './endpoints'

export type AddEmployerSupervisorCommand = {
  systemUserId: number
  locationId?: number | null
}

export type RemoveEmployerSupervisorCommand = {
  systemUserId: number
  locationId?: number | null
}

const client = getApiClient()

export const employerSupervisorsApi = {
  addSupervisor(body: AddEmployerSupervisorCommand) {
    return client.post<number, AddEmployerSupervisorCommand>(API_ENDPOINTS.employers.addSupervisor, body, true)
  },
  removeSupervisor(body: RemoveEmployerSupervisorCommand) {
    return client.post<null, RemoveEmployerSupervisorCommand>(API_ENDPOINTS.employers.removeSupervisor, body, true)
  },
}

