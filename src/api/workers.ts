import { getApiClient } from './client'
import { API_ENDPOINTS } from './endpoints'
import type { AccountStatus } from './enums'

export type AddWorkerSkillCommand = {
  tag: string
  workerId: number
}

export type GetWorkerByIdQuery = {
  workerId: number
}

export type WorkerDetail = {
  id: number
  systemUserId: number
  nationality: string | null
  university: string | null
  embeddingUpdatedAt: string | null
  systemUser: {
    id: number | string
    email: string
    firstName: string | null
    lastName: string | null
    phone: string | null
    accountStatus: AccountStatus
  } | null
  skills: Array<{
    id: number | string
    tag: string
    createdAt: string | null
  }>
  availabilities: Array<{
    id: number | string
    dayOfWeek: number
    timeFrom: string
    timeTo: string
  }>
  certificates: Array<{
    id: number | string
    name: string
    issuingOrganization: string | null
    issuedAt: string | null
    expiresAt: string | null
    documentUrl: string | null
    createdAt: string | null
  }>
  educations: Array<{
    id: number | string
    school: string | null
    department: string | null
    educationType: number
    startYear: number | null
    endYear: number | null
    isOngoing: boolean
  }>
  experiences: Array<{
    id: number | string
    companyName: string | null
    position: string | null
    startDate: string | null
    endDate: string | null
    isCurrent: boolean
    description: string | null
  }>
  languages: Array<{
    id: number | string
    language: string | null
    level: number
  }>
  references: Array<{
    id: number | string
    company: string | null
    position: string | null
    contactFirstName: string | null
    contactLastName: string | null
    contactEmail: string | null
    contactPhone: string | null
  }>
}

export type WorkerLiveStatusItem = {
  id?: number | string
  type?: string | null
  itemType?: string | null
  eventType?: string | null
  message?: string | null
  text?: string | null
  title?: string | null
  description?: string | null
  createdAt?: string | null
  timestamp?: string | null
}

export type ListWorkersQuery = {
  accountStatus?: AccountStatus | null
  limit?: number
  offset?: number
  searchEmail?: string | null
}

export type WorkerListItem = {
  workerId: number | string
  systemUserId: number | string
  email: string
  firstName?: string | null
  lastName?: string | null
  accountStatus: AccountStatus
}

export type WorkersListResponse = {
  data: WorkerListItem[] | null
  hasMore: boolean
  limit: number | string
  offset: number | string
  totalCount: number | string
}

export type WorkersListResult = WorkerListItem[] | WorkersListResponse

const client = getApiClient()

export const workersApi = {
  addSkill(body: AddWorkerSkillCommand) {
    return client.post<number, AddWorkerSkillCommand>(
      API_ENDPOINTS.workers.addSkill,
      body,
      true,
    )
  },
  async getDetail(body: GetWorkerByIdQuery) {
    return client.post<WorkerDetail, GetWorkerByIdQuery>(
      API_ENDPOINTS.workers.getDetail,
      body,
      true,
    )
  },
  getSelfSummary() {
    return client.post<WorkerDetail, Record<string, never>>(
      API_ENDPOINTS.workers.getSelfSummary,
      {},
      true,
    )
  },
  getSelfFullDetail() {
    return client.post<WorkerDetail, Record<string, never>>(
      API_ENDPOINTS.workers.getSelfFullDetail,
      {},
      true,
    )
  },
  liveStatus(body: Record<string, never> = {}) {
    return client.post<WorkerLiveStatusItem[], Record<string, never>>(
      API_ENDPOINTS.workers.liveStatus,
      body,
      true,
    )
  },
  getById(body: GetWorkerByIdQuery) {
    return this.getDetail(body)
  },
  list(body: ListWorkersQuery) {
    return client.post<WorkersListResult, ListWorkersQuery>(
      API_ENDPOINTS.workers.list,
      body,
      true,
    )
  },
}
