import { getApiClient } from '../core/client'
import { API_ENDPOINTS } from '../core/endpoints'
import type { PageableListResult } from '../core/pagination'
import type { JobApplicationStatus } from '../core/enums'

export type AcceptJobPostingApplicationCommand = {
  jobPostingId: number
  applicationId: number
}

export type RejectJobPostingApplicationCommand = {
  jobPostingId: number
  applicationId: number
  reason?: string | null
}

export type ListJobApplicationsByJobPostingIdQuery = {
  jobPostingId: number
}

export type SubmitJobPostingApplicationCommand = {
  jobPostingId: number
  hasConflictingShift: boolean
  note?: string | null
}

export type WithdrawJobPostingApplicationCommand = {
  jobPostingId: number
  applicationId: number
}

export type JobApplicationListItem = {
  applicationId: number
  workerId: number
  status: JobApplicationStatus
  appliedAt: string
  note: string | null
}

export type MyJobApplicationItem = {
  applicationId: number | string
  jobPostingId: number | string
  status: JobApplicationStatus | number | string
  appliedAt?: string | null
  note?: string | null
}

const client = getApiClient()

export const jobApplicationsApi = {
  accept(body: AcceptJobPostingApplicationCommand) {
    return client.post<null, AcceptJobPostingApplicationCommand>(
      API_ENDPOINTS.jobApplications.accept,
      body,
      true,
    )
  },
  list(body: ListJobApplicationsByJobPostingIdQuery) {
    return client.post<JobApplicationListItem[], ListJobApplicationsByJobPostingIdQuery>(
      API_ENDPOINTS.jobApplications.list,
      body,
      true,
    )
  },
  myApplications(body: Record<string, never> = {}) {
    return client.post<PageableListResult<MyJobApplicationItem>, Record<string, never>>(
      API_ENDPOINTS.jobApplications.myApplications,
      body,
      true,
    )
  },
  reject(body: RejectJobPostingApplicationCommand) {
    return client.post<null, RejectJobPostingApplicationCommand>(
      API_ENDPOINTS.jobApplications.reject,
      body,
      true,
    )
  },
  submit(body: SubmitJobPostingApplicationCommand) {
    return client.post<number, SubmitJobPostingApplicationCommand>(
      API_ENDPOINTS.jobApplications.submit,
      body,
      true,
    )
  },
  withdraw(body: WithdrawJobPostingApplicationCommand) {
    return client.post<null, WithdrawJobPostingApplicationCommand>(
      API_ENDPOINTS.jobApplications.withdraw,
      body,
      true,
    )
  },
}
