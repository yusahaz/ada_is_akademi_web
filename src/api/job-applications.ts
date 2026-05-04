import { getApiClient } from './client'

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
  status: number
  appliedAt: string
  note: string | null
}

const client = getApiClient()

export const jobApplicationsApi = {
  accept(body: AcceptJobPostingApplicationCommand) {
    return client.post<null, AcceptJobPostingApplicationCommand>(
      'JobApplications/Accept',
      body,
      true,
    )
  },
  list(body: ListJobApplicationsByJobPostingIdQuery) {
    return client.post<JobApplicationListItem[], ListJobApplicationsByJobPostingIdQuery>(
      'JobApplications/List',
      body,
      true,
    )
  },
  reject(body: RejectJobPostingApplicationCommand) {
    return client.post<null, RejectJobPostingApplicationCommand>(
      'JobApplications/Reject',
      body,
      true,
    )
  },
  submit(body: SubmitJobPostingApplicationCommand) {
    return client.post<number, SubmitJobPostingApplicationCommand>(
      'JobApplications/Submit',
      body,
      true,
    )
  },
  withdraw(body: WithdrawJobPostingApplicationCommand) {
    return client.post<null, WithdrawJobPostingApplicationCommand>(
      'JobApplications/Withdraw',
      body,
      true,
    )
  },
}
