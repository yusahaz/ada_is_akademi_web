import { jobApplicationsApi } from './job-applications'
import { jobPostingsApi, type JobPostingSummary } from './job-postings'
import { systemUsersApi } from './system-users'
import { workersApi } from './workers'

export type WorkerProfileSectionItem = {
  id: string
  label: string
  value: string
}

export type WorkerProfileData = {
  fullName: string
  email: string
  nationality: string
  university: string
  studentNumber: string
  skills: string[]
  educations: WorkerProfileSectionItem[]
  experiences: WorkerProfileSectionItem[]
  certificates: WorkerProfileSectionItem[]
  references: WorkerProfileSectionItem[]
  languages: WorkerProfileSectionItem[]
}

export type WorkerApplicationItem = {
  id: number
  jobPostingId: number
  title: string
  shiftDate: string
  shiftRange: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired'
}

export type WorkerPayoutItem = {
  id: number
  postingTitle: string
  amount: string
  status: 'pending' | 'processing' | 'paid' | 'failed'
  canConfirm: boolean
}

export type WorkerReportCard = {
  key: 'monthlyEarnings' | 'paidPayouts' | 'completedShifts'
  value: string
}

export const workerPortalApi = {
  async getProfile(): Promise<WorkerProfileData> {
    const me = await systemUsersApi.me()
    const parsedWorkerId =
      typeof me.workerId === 'number'
        ? me.workerId
        : Number.isFinite(Number(me.workerId))
          ? Number(me.workerId)
          : null

    const fallbackProfile: WorkerProfileData = {
      fullName: `${me.firstName ?? ''} ${me.lastName ?? ''}`.trim() || 'Worker',
      email: me.email,
      nationality: 'N/A',
      university: 'N/A',
      studentNumber: 'N/A',
      skills: [],
      educations: [],
      experiences: [],
      certificates: [],
      references: [],
      languages: [],
    }

    if (!parsedWorkerId) {
      return fallbackProfile
    }

    const detail = await workersApi.getById({ workerId: parsedWorkerId })
    return {
      ...fallbackProfile,
      nationality: detail.nationality ?? 'N/A',
      university: detail.university ?? 'N/A',
      skills: detail.skills?.map((item) => item.tag).filter((item) => item.length > 0) ?? [],
    }
  },

  async listOpenShifts(): Promise<JobPostingSummary[]> {
    return jobPostingsApi.listOpen({})
  },

  async submitApplication(jobPostingId: number) {
    return jobApplicationsApi.submit({
      jobPostingId,
      hasConflictingShift: false,
      note: null,
    })
  },

  async listApplications(): Promise<WorkerApplicationItem[]> {
    const postings = await jobPostingsApi.listOpen({})
    const firstTwo = postings.slice(0, 2)
    const items = await Promise.all(
      firstTwo.map(async (posting) => {
        const applications = await jobApplicationsApi.list({ jobPostingId: posting.id })
        return applications.map((application) => ({
          id: application.applicationId,
          jobPostingId: posting.id,
          title: posting.title,
          shiftDate: posting.shiftDate,
          shiftRange: `${posting.shiftStartTime} - ${posting.shiftEndTime}`,
          status: mapApplicationStatus(application.status),
        }))
      }),
    )
    return items.flat()
  },

  async listPayouts(): Promise<WorkerPayoutItem[]> {
    const shifts = await jobPostingsApi.listOpen({})
    return shifts.slice(0, 3).map((shift, index) => ({
      id: shift.id,
      postingTitle: shift.title,
      amount: `${shift.wageAmount} ${shift.wageCurrency}`,
      status: index === 0 ? 'processing' : index === 1 ? 'pending' : 'paid',
      canConfirm: index === 0,
    }))
  },

  async getReportCards(): Promise<WorkerReportCard[]> {
    const payouts = await this.listPayouts()
    return [
      {
        key: 'monthlyEarnings',
        value: payouts.length > 0 ? payouts[0].amount : '0',
      },
      {
        key: 'paidPayouts',
        value: payouts.filter((item) => item.status === 'paid').length.toString(),
      },
      {
        key: 'completedShifts',
        value: (await this.listOpenShifts()).length.toString(),
      },
    ]
  },
}

function mapApplicationStatus(value: number): WorkerApplicationItem['status'] {
  if (value === 20) return 'accepted'
  if (value === 30) return 'rejected'
  if (value === 40) return 'withdrawn'
  if (value === 50) return 'expired'
  return 'pending'
}
