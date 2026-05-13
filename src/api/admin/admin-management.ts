import { getApiClient } from '../core/client'
import { API_ENDPOINTS } from '../core/endpoints'
import type { ListEmployersQuery, EmployerDetail, EmployersListResult, UpdateEmployerProfileCommand, DeleteEmployerCommand, GetEmployerByIdQuery } from '../employer/employers'
import type { ListEmployerLocationsQuery, PagedListResponse, EmployerLocationListItemModel } from '../employer/employer-locations'
import type { ListEmployerSupervisorsQuery, EmployerSupervisorListItemModel } from '../employer/employer-supervisors'
import type { ListSystemUsersQuery, SystemUsersListResult, RegisterEmployerCommand, RegisterAdminCommand, BanSystemUserCommand, SuspendSystemUserCommand, ReactivateSystemUserCommand, SystemUserMe } from '../system/system-users'
import type { DeleteWorkerCommand, GetWorkerByIdQuery, ListWorkersQuery, UpdateWorkerProfileCommand, WorkerDetail, WorkersListResult } from '../worker/workers'

const client = getApiClient()

export const adminManagementApi = {
  listEmployers(body: ListEmployersQuery) {
    return client.post<EmployersListResult, ListEmployersQuery>(API_ENDPOINTS.admin.listEmployers, body, true)
  },
  getEmployerById(body: GetEmployerByIdQuery) {
    return client.post<EmployerDetail, GetEmployerByIdQuery>(API_ENDPOINTS.admin.getEmployerById, body, true)
  },
  updateEmployerProfile(body: UpdateEmployerProfileCommand) {
    return client.post<null, UpdateEmployerProfileCommand>(API_ENDPOINTS.admin.updateEmployerProfile, body, true)
  },
  deleteEmployer(body: DeleteEmployerCommand) {
    return client.post<null, DeleteEmployerCommand>(API_ENDPOINTS.admin.deleteEmployer, body, true)
  },
  listEmployerLocations(body: ListEmployerLocationsQuery) {
    return client.post<PagedListResponse<EmployerLocationListItemModel>, ListEmployerLocationsQuery>(API_ENDPOINTS.admin.listEmployerLocations, body, true)
  },
  listEmployerSupervisors(body: ListEmployerSupervisorsQuery = {}) {
    return client.post<EmployerSupervisorListItemModel[], ListEmployerSupervisorsQuery>(
      API_ENDPOINTS.admin.listEmployerSupervisors,
      body,
      true,
    )
  },
  listSystemUsers(body: ListSystemUsersQuery) {
    return client.post<SystemUsersListResult, ListSystemUsersQuery>(API_ENDPOINTS.admin.listSystemUsers, body, true)
  },
  getSystemUserById(systemUserId: number) {
    return client.post<SystemUserMe, { systemUserId: number }>(API_ENDPOINTS.admin.getSystemUserById, { systemUserId }, true)
  },
  banSystemUser(body: BanSystemUserCommand) {
    return client.post<null, BanSystemUserCommand>(API_ENDPOINTS.admin.banSystemUser, body, true)
  },
  suspendSystemUser(body: SuspendSystemUserCommand) {
    return client.post<null, SuspendSystemUserCommand>(API_ENDPOINTS.admin.suspendSystemUser, body, true)
  },
  reactivateSystemUser(body: ReactivateSystemUserCommand) {
    return client.post<null, ReactivateSystemUserCommand>(API_ENDPOINTS.admin.reactivateSystemUser, body, true)
  },
  registerAdmin(body: RegisterAdminCommand) {
    return client.post<number, RegisterAdminCommand>(API_ENDPOINTS.admin.registerAdmin, body, true)
  },
  registerEmployer(body: RegisterEmployerCommand) {
    return client.post<number, RegisterEmployerCommand>(API_ENDPOINTS.admin.registerEmployer, body, true)
  },
  listWorkers(body: ListWorkersQuery) {
    return client.post<WorkersListResult, ListWorkersQuery>(API_ENDPOINTS.admin.listWorkers, body, true)
  },
  getWorkerDetail(body: GetWorkerByIdQuery) {
    return client.post<WorkerDetail, GetWorkerByIdQuery>(API_ENDPOINTS.admin.getWorkerDetail, body, true)
  },
  updateWorkerProfile(body: UpdateWorkerProfileCommand) {
    return client.post<null, UpdateWorkerProfileCommand>(API_ENDPOINTS.admin.updateWorkerProfile, body, true)
  },
  deleteWorker(body: DeleteWorkerCommand) {
    return client.post<null, DeleteWorkerCommand>(API_ENDPOINTS.admin.deleteWorker, body, true)
  },
}
