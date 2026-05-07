import { getApiClient } from './client'
import { API_ENDPOINTS } from './endpoints'
import type { AccountStatus } from './enums'

export type AddWorkerSkillCommand = {
  tag: string
  workerId: number
}

export type AddWorkerExperienceCommand = {
  companyName: string
  position: string
  startDate: string
  endDate: string | null
  description: string | null
}

export type RemoveWorkerExperienceCommand = {
  experienceId: number | string
}

export type AddWorkerCertificateCommand = {
  name: string
  issuingOrganization: string
  issuedAt: string
  expiresAt: string | null
  documentUrl: string | null
}

export type RemoveWorkerCertificateCommand = {
  certificateId: number | string
}

export type AddWorkerReferenceCommand = {
  company: string
  position: string
  contactFirstName: string
  contactLastName: string
  contactEmail: string
  contactPhone: string | null
}

export type RemoveWorkerReferenceCommand = {
  referenceId: number | string
}

export type UpdateWorkerProfileCommand = {
  firstName: string | null
  lastName: string | null
  nationality: string | null
  university: string | null
}

export type DeleteWorkerCommand = {
  workerId: number | string
}

export type RemoveWorkerSkillCommand = {
  skillId: number | string
}

export type GetWorkerByIdQuery = {
  workerId: number
}

export type AddWorkerAvailabilityCommand = {
  dayOfWeek: number
  timeFrom: string
  timeTo: string
}

export type RemoveWorkerAvailabilityCommand = {
  availabilityId: number | string
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
export type PagedListResponse<TItem> = {
  data: TItem[] | null
  hasMore: boolean
  limit: number | string
  offset: number | string
  totalCount: number | string
}

export type SemanticSearchWorkersQuery = {
  queryText: string
  locationId?: number
  limit?: number
  offset?: number
}

export type SemanticSearchedWorkerListItem = {
  workerId: number
  fullName: string
  semanticScore: number
  reliabilityScore: number
  lastWorkedAt: string | null
  skills: string[]
  languages: string[]
  city: string | null
}

const client = getApiClient()

export const workersApi = {
  addCertificate(body: AddWorkerCertificateCommand) {
    return client.post<number, AddWorkerCertificateCommand>(
      API_ENDPOINTS.workers.addCertificate,
      body,
      true,
    )
  },
  addExperience(body: AddWorkerExperienceCommand) {
    return client.post<number, AddWorkerExperienceCommand>(
      API_ENDPOINTS.workers.addExperience,
      body,
      true,
    )
  },
  addReference(body: AddWorkerReferenceCommand) {
    return client.post<number, AddWorkerReferenceCommand>(
      API_ENDPOINTS.workers.addReference,
      body,
      true,
    )
  },
  addAvailability(body: AddWorkerAvailabilityCommand) {
    return client.post<number, AddWorkerAvailabilityCommand>(
      API_ENDPOINTS.workers.addAvailability,
      body,
      true,
    )
  },
  addSkill(body: AddWorkerSkillCommand) {
    return client.post<number, AddWorkerSkillCommand>(
      API_ENDPOINTS.workers.addSkill,
      body,
      true,
    )
  },
  removeSkill(body: RemoveWorkerSkillCommand) {
    return client.post<null, RemoveWorkerSkillCommand>(
      API_ENDPOINTS.workers.removeSkill,
      body,
      true,
    )
  },
  removeCertificate(body: RemoveWorkerCertificateCommand) {
    return client.post<null, RemoveWorkerCertificateCommand>(
      API_ENDPOINTS.workers.removeCertificate,
      body,
      true,
    )
  },
  removeExperience(body: RemoveWorkerExperienceCommand) {
    return client.post<null, RemoveWorkerExperienceCommand>(
      API_ENDPOINTS.workers.removeExperience,
      body,
      true,
    )
  },
  removeReference(body: RemoveWorkerReferenceCommand) {
    return client.post<null, RemoveWorkerReferenceCommand>(
      API_ENDPOINTS.workers.removeReference,
      body,
      true,
    )
  },
  updateProfile(body: UpdateWorkerProfileCommand) {
    return client.post<null, UpdateWorkerProfileCommand>(
      API_ENDPOINTS.workers.updateProfile,
      body,
      true,
    )
  },
  delete(body: DeleteWorkerCommand) {
    return client.post<null, DeleteWorkerCommand>(API_ENDPOINTS.workers.delete, body, true)
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
  semanticSearch(body: SemanticSearchWorkersQuery) {
    return client.post<PagedListResponse<SemanticSearchedWorkerListItem>, SemanticSearchWorkersQuery>(
      API_ENDPOINTS.workers.semanticSearch,
      body,
      true,
    )
  },
  removeAvailability(body: RemoveWorkerAvailabilityCommand) {
    return client.post<null, RemoveWorkerAvailabilityCommand>(
      API_ENDPOINTS.workers.removeAvailability,
      body,
      true,
    )
  },
}
