import { getApiClient } from './client'

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

export type ListOpenJobPostingsQuery = Record<string, never>

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
}

export type JobPostingSkillItem = {
  tag: string
  isRequired: boolean
}

export type JobPostingDetail = {
  id: number
  title: string
  description: string
  status: number
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
      'JobPostings/Cancel',
      body,
      true,
    )
  },
  complete(body: CompleteJobPostingCommand) {
    return client.post<null, CompleteJobPostingCommand>(
      'JobPostings/Complete',
      body,
      true,
    )
  },
  create(body: CreateJobPostingCommand) {
    return client.post<number, CreateJobPostingCommand>(
      'JobPostings/Create',
      body,
      true,
    )
  },
  addSkill(body: AddJobPostingSkillCommand) {
    return client.post<number, AddJobPostingSkillCommand>(
      'JobPostings/AddSkill',
      body,
      true,
    )
  },
  listOpen(body: ListOpenJobPostingsQuery = {}) {
    return client.post<JobPostingSummary[], ListOpenJobPostingsQuery>(
      'JobPostings/ListOpen',
      body,
      false,
    )
  },
  listByEmployer(body: ListJobPostingsByEmployerIdQuery = {}) {
    return client.post<JobPostingSummary[], ListJobPostingsByEmployerIdQuery>(
      'JobPostings/ListByEmployer',
      body,
      true,
    )
  },
  getById(body: GetJobPostingByIdQuery) {
    return client.post<JobPostingDetail, GetJobPostingByIdQuery>(
      'JobPostings/GetById',
      body,
      false,
    )
  },
  publish(body: PublishJobPostingCommand) {
    return client.post<null, PublishJobPostingCommand>(
      'JobPostings/Publish',
      body,
      true,
    )
  },
  removeSkill(body: RemoveJobPostingSkillCommand) {
    return client.post<null, RemoveJobPostingSkillCommand>(
      'JobPostings/RemoveSkill',
      body,
      true,
    )
  },
  update(body: UpdateJobPostingCommand) {
    return client.put<null, UpdateJobPostingCommand>(
      'JobPostings/Update',
      body,
      true,
    )
  },
}
