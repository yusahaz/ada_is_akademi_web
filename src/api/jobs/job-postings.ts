import { getApiClient } from '../core/client'
import { API_ENDPOINTS } from '../core/endpoints'
import type { JobPostingStatus } from '../core/enums'

export type CancelJobPostingCommand = {
  jobPostingId: number
}

export type CompleteJobPostingCommand = {
  jobPostingId: number
}

export type PublishJobPostingCommand = {
  jobPostingId: number
}

export type CreateJobPostingCommand = {
  description: string
  employerLocationId: number
  headCount: number
  jobCategoryId: number
  shiftDate: string
  shiftStartTime: string
  shiftEndTime: string
  title: string
  wageAmount: number
  wageCurrency: string
}

export type UpdateJobPostingCommand = CreateJobPostingCommand & {
  jobPostingId: number
}

export type ListOpenJobPostingsQuery = {
  countryCode?: string
  limit?: number
  offset?: number
  /** WGS84 degrees; must be sent together with nearLongitude for server-side distance filtering. */
  nearLatitude?: number
  nearLongitude?: number
  /** Metres; server default is 50 km when coordinates are set. */
  radiusMetres?: number
}

/** Matches <c>SemanticMatchedJobPostingModel</c> from the API (cosine similarity 0–1, or 0 in fallback rows). */
export type SemanticMatchedJobPosting = {
  jobPostingId: number
  title: string
  shiftDate: string
  shiftStartTime: string
  shiftEndTime: string
  similarityScore: number
}

export type ListSemanticMatchedJobPostingsQuery = {
  limit?: number
  /** Ignored by server; worker scope comes from JWT. */
  workerId?: number
}

export type GetJobPostingByIdQuery = {
  jobPostingId: number
}

export type ListJobPostingsByEmployerIdQuery = {
  [key: string]: never
}

export type AddJobPostingSkillCommand = {
  isRequired: boolean
  jobPostingId: number
  tag: string
}

export type RemoveJobPostingSkillCommand = {
  jobPostingId: number
  skillId: number
}

export type JobPostingSummary = {
  id: number
  title: string
  shiftDate: string
  shiftStartTime: string
  shiftEndTime: string
  wageAmount: number
  wageCurrency: string
  employerId: number
  headCount: number
  /** API may send string enum name (JsonStringEnumConverter) or number. */
  status?: JobPostingStatus | string
  /** ListOpen / employer list: şehir, ülke vb. metin. */
  locationText?: string | null
  employerName?: string | null
  applicationCount?: number
  tags?: string[]
  requiredTags?: string[]
  /** Kısa ilan metni; ListOpen cevabında varsa. */
  description?: string | null
  /** Employer location coordinate when returned by ListOpen. */
  locationLatitude?: number
  locationLongitude?: number
  /** Great-circle distance in metres when ListOpen was called with near lat/lon. */
  distanceMetres?: number | null
}

export function normalizeSemanticMatchedList(payload: unknown): SemanticMatchedJobPosting[] {
  if (!Array.isArray(payload)) {
    return []
  }
  return payload.map((row) => {
    const r = row as Record<string, unknown>
    return {
      jobPostingId: Number(r.jobPostingId ?? r.JobPostingId ?? 0),
      title: String(r.title ?? r.Title ?? ''),
      shiftDate: String(r.shiftDate ?? r.ShiftDate ?? ''),
      shiftStartTime: String(r.shiftStartTime ?? r.ShiftStartTime ?? ''),
      shiftEndTime: String(r.shiftEndTime ?? r.ShiftEndTime ?? ''),
      similarityScore: Number(r.similarityScore ?? r.SimilarityScore ?? 0),
    }
  })
}

/** API cosine similarity is typically 0–1; display as 0–100%. */
export function semanticSimilarityToPercent(score: number): number {
  if (!Number.isFinite(score)) {
    return 0
  }
  if (score >= 0 && score <= 1) {
    return Math.round(score * 100)
  }
  if (score > 1 && score <= 100) {
    return Math.round(score)
  }
  return Math.max(0, Math.min(100, Math.round(score)))
}

export type JobPostingSkillItem = {
  tag: string
  isRequired: boolean
}

export type JobPostingDetail = {
  id: number
  title: string
  description: string
  status: JobPostingStatus
  employerId: number
  employerLocationId: number
  jobCategoryId: number
  shiftDate: string
  shiftStartTime: string
  shiftEndTime: string
  wageAmount: number
  wageCurrency: string
  headCount: number
  pendingApplications: number
  acceptedApplications: number
  skills: JobPostingSkillItem[]
}

const client = getApiClient()

export const jobPostingsApi = {
  cancel(body: CancelJobPostingCommand) {
    return client.post<null, CancelJobPostingCommand>(
      API_ENDPOINTS.jobPostings.cancel,
      body,
      true,
    )
  },
  complete(body: CompleteJobPostingCommand) {
    return client.post<null, CompleteJobPostingCommand>(
      API_ENDPOINTS.jobPostings.complete,
      body,
      true,
    )
  },
  create(body: CreateJobPostingCommand) {
    return client.post<number, CreateJobPostingCommand>(
      API_ENDPOINTS.jobPostings.create,
      body,
      true,
    )
  },
  addSkill(body: AddJobPostingSkillCommand) {
    return client.post<number, AddJobPostingSkillCommand>(
      API_ENDPOINTS.jobPostings.addSkill,
      body,
      true,
    )
  },
  listOpen(body: ListOpenJobPostingsQuery = {}) {
    return client.post<JobPostingSummary[], ListOpenJobPostingsQuery>(
      API_ENDPOINTS.jobPostings.listOpen,
      body,
      false,
    )
  },
  async listSemanticMatched(body: ListSemanticMatchedJobPostingsQuery = {}) {
    const res = await client.post<unknown, ListSemanticMatchedJobPostingsQuery>(
      API_ENDPOINTS.jobPostings.listSemanticMatched,
      body,
      true,
    )
    return normalizeSemanticMatchedList(res)
  },
  listByEmployer(body: ListJobPostingsByEmployerIdQuery = {}) {
    return client.post<JobPostingSummary[], ListJobPostingsByEmployerIdQuery>(
      API_ENDPOINTS.jobPostings.listByEmployer,
      body,
      true,
    )
  },
  getById(body: GetJobPostingByIdQuery) {
    return client.post<JobPostingDetail, GetJobPostingByIdQuery>(
      API_ENDPOINTS.jobPostings.getById,
      body,
      true,
    )
  },
  publish(body: PublishJobPostingCommand) {
    return client.post<null, PublishJobPostingCommand>(
      API_ENDPOINTS.jobPostings.publish,
      body,
      true,
    )
  },
  removeSkill(body: RemoveJobPostingSkillCommand) {
    return client.post<null, RemoveJobPostingSkillCommand>(
      API_ENDPOINTS.jobPostings.removeSkill,
      body,
      true,
    )
  },
  update(body: UpdateJobPostingCommand) {
    return client.put<null, UpdateJobPostingCommand>(
      API_ENDPOINTS.jobPostings.update,
      body,
      true,
    )
  },
}
