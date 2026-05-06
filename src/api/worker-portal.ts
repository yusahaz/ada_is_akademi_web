import { jobApplicationsApi } from './job-applications'
import { EducationType, JobPostingStatus, LanguageLevel } from './enums'
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

export type WorkerCvState = 'uploaded' | 'extracting' | 'awaitingReview' | 'confirmed' | 'failed'
export type WorkerQrStatus = 'idle' | 'validating' | 'success' | 'failed'
type WorkerDataSnapshot = {
  openPostings: JobPostingSummary[]
  applications: Awaited<ReturnType<typeof jobApplicationsApi.myApplications>>
}

export const workerPortalApi = {
  async getProfile(): Promise<WorkerProfileData> {
    const [me, detail] = await Promise.all([
      systemUsersApi.me(),
      workersApi.getSelfFullDetail(),
    ])

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

    return {
      ...fallbackProfile,
      nationality: detail.nationality ?? 'N/A',
      university: detail.university ?? 'N/A',
      skills: detail.skills?.map((item) => item.tag).filter((item) => item.length > 0) ?? [],
      educations:
        detail.educations?.map((item) => ({
          id: String(item.id),
          label: [item.school, item.department].filter(Boolean).join(' - ') || resolveEducationType(item.educationType),
          value: resolveEducationPeriod(item.startYear, item.endYear, item.isOngoing),
        })) ?? [],
      experiences:
        detail.experiences?.map((item) => ({
          id: String(item.id),
          label: [item.companyName, item.position].filter(Boolean).join(' - ') || 'N/A',
          value: resolveExperiencePeriod(item.startDate, item.endDate, item.isCurrent),
        })) ?? [],
      certificates:
        detail.certificates?.map((item) => ({
          id: String(item.id),
          label: item.name || 'N/A',
          value: [item.issuingOrganization, resolveIssuedWindow(item.issuedAt, item.expiresAt)]
            .filter((value) => value && value.length > 0)
            .join(' • ') || 'N/A',
        })) ?? [],
      references:
        detail.references?.map((item) => ({
          id: String(item.id),
          label: [item.contactFirstName, item.contactLastName].filter(Boolean).join(' ') || 'N/A',
          value: [item.company, item.position, item.contactEmail, item.contactPhone]
            .filter((value) => value && value.length > 0)
            .join(' • ') || 'N/A',
        })) ?? [],
      languages:
        detail.languages?.map((item) => ({
          id: String(item.id),
          label: item.language || 'N/A',
          value: resolveLanguageLevel(item.level),
        })) ?? [],
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
    const snapshot = await getWorkerDataSnapshot()
    return mapApplicationsFromSnapshot(snapshot)
  },

  async listPayouts(): Promise<WorkerPayoutItem[]> {
    const snapshot = await getWorkerDataSnapshot()
    const applications = mapApplicationsFromSnapshot(snapshot)
    const postingMap = new Map<number, JobPostingSummary>(snapshot.openPostings.map((posting) => [posting.id, posting]))

    return applications.reduce<WorkerPayoutItem[]>((acc, application) => {
        const posting = postingMap.get(application.jobPostingId)
        if (!posting) return acc
        const status: WorkerPayoutItem['status'] =
          application.status === 'accepted'
            ? 'processing'
            : application.status === 'pending'
              ? 'pending'
              : application.status === 'rejected' || application.status === 'expired'
                ? 'failed'
                : 'paid'
        acc.push({
          id: application.id,
          postingTitle: posting.title,
          amount: `${posting.wageAmount} ${posting.wageCurrency}`,
          status,
          canConfirm: false,
        })
        return acc
      }, [])
  },

  async getReportCards(): Promise<WorkerReportCard[]> {
    const snapshot = await getWorkerDataSnapshot()
    const payouts = mapPayoutsFromSnapshot(snapshot)
    return [
      {
        key: 'monthlyEarnings',
        value:
          payouts
            .reduce((total, item) => total + Number(item.amount.replace(/[^\d.-]/g, '')), 0)
            .toLocaleString('tr-TR') + ' TRY',
      },
      {
        key: 'paidPayouts',
        value: payouts.filter((item) => item.status === 'paid').length.toString(),
      },
      {
        key: 'completedShifts',
        value: snapshot.openPostings.length.toString(),
      },
    ]
  },

  async getOverviewData(): Promise<{
    reportCards: WorkerReportCard[]
    openShifts: JobPostingSummary[]
    liveMatchSignal: string | null
  }> {
    const snapshot = await getWorkerDataSnapshot()
    const reportCards = buildReportCardsFromSnapshot(snapshot)
    const liveMatchSignal = await resolveLiveMatchSignal()
    return {
      reportCards,
      openShifts: snapshot.openPostings,
      liveMatchSignal,
    }
  },

  async listSemanticMatchedShifts(): Promise<JobPostingSummary[]> {
    try {
      const matched = await jobPostingsApi.listSemanticMatched({})
      return matched
    } catch {
      return this.listOpenShifts()
    }
  },

  async getCvImportState(): Promise<WorkerCvState> {
    const profile = await this.getProfile()
    if (profile.skills.length === 0) {
      return 'extracting'
    }
    if (!profile.university || profile.university === 'N/A') {
      return 'awaitingReview'
    }
    return 'confirmed'
  },

  async validateQrToken(payload: string): Promise<WorkerQrStatus> {
    const token = payload.trim()
    if (token.length === 0) {
      return 'failed'
    }
    const postingId = Number(token.replace(/[^\d]/g, ''))
    if (!Number.isFinite(postingId) || postingId <= 0) {
      return 'failed'
    }
    try {
      const posting = await jobPostingsApi.getById({ jobPostingId: postingId })
      if (posting.status === JobPostingStatus.Cancelled) {
        return 'failed'
      }
      return 'success'
    } catch {
      return 'failed'
    }
  },
}

async function getWorkerDataSnapshot(): Promise<WorkerDataSnapshot> {
  const [openPostings, applications] = await Promise.all([
    jobPostingsApi.listOpen({}),
    jobApplicationsApi.myApplications(),
  ])
  return { openPostings, applications }
}

function mapApplicationsFromSnapshot(snapshot: WorkerDataSnapshot): WorkerApplicationItem[] {
  const postingById = new Map<number, JobPostingSummary>(
    snapshot.openPostings.map((posting) => [posting.id, posting]),
  )

  return snapshot.applications
    .map((application) => {
      const jobPostingId = Number(application.jobPostingId)
      const id = Number(application.applicationId)
      if (!Number.isFinite(jobPostingId) || jobPostingId <= 0 || !Number.isFinite(id)) {
        return null
      }
      const posting = postingById.get(jobPostingId)
      return {
        id,
        jobPostingId,
        title: posting?.title ?? `#${jobPostingId}`,
        shiftDate: posting?.shiftDate ?? '-',
        shiftRange: posting ? `${posting.shiftStartTime} - ${posting.shiftEndTime}` : '-',
        status: mapApplicationStatus(application.status),
      } satisfies WorkerApplicationItem
    })
    .filter((item): item is WorkerApplicationItem => item !== null)
}

function mapPayoutsFromSnapshot(snapshot: WorkerDataSnapshot): WorkerPayoutItem[] {
  const applications = mapApplicationsFromSnapshot(snapshot)
  const postingMap = new Map<number, JobPostingSummary>(
    snapshot.openPostings.map((posting) => [posting.id, posting]),
  )

  return applications.reduce<WorkerPayoutItem[]>((acc, application) => {
    const posting = postingMap.get(application.jobPostingId)
    if (!posting) return acc
    const status: WorkerPayoutItem['status'] =
      application.status === 'accepted'
        ? 'processing'
        : application.status === 'pending'
          ? 'pending'
          : application.status === 'rejected' || application.status === 'expired'
            ? 'failed'
            : 'paid'
    acc.push({
      id: application.id,
      postingTitle: posting.title,
      amount: `${posting.wageAmount} ${posting.wageCurrency}`,
      status,
      canConfirm: false,
    })
    return acc
  }, [])
}

function buildReportCardsFromSnapshot(snapshot: WorkerDataSnapshot): WorkerReportCard[] {
  const payouts = mapPayoutsFromSnapshot(snapshot)
  return [
    {
      key: 'monthlyEarnings',
      value:
        payouts
          .reduce((total, item) => total + Number(item.amount.replace(/[^\d.-]/g, '')), 0)
          .toLocaleString('tr-TR') + ' TRY',
    },
    {
      key: 'paidPayouts',
      value: payouts.filter((item) => item.status === 'paid').length.toString(),
    },
    {
      key: 'completedShifts',
      value: snapshot.openPostings.length.toString(),
    },
  ]
}

async function resolveLiveMatchSignal(): Promise<string | null> {
  try {
    const statuses = await workersApi.liveStatus({})
    const candidate = statuses.find((item) => {
      const typeValue = `${item.type ?? ''} ${item.itemType ?? ''} ${item.eventType ?? ''}`.toLowerCase()
      return typeValue.includes('matching_update') || typeValue.includes('matching')
    })
    if (!candidate) return null
    const message = candidate.message ?? candidate.text ?? candidate.title ?? candidate.description
    return typeof message === 'string' && message.trim().length > 0 ? message.trim() : null
  } catch {
    return null
  }
}

function mapApplicationStatus(value: number | string): WorkerApplicationItem['status'] {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    const normalized = String(value).toLowerCase()
    if (normalized.includes('accept')) return 'accepted'
    if (normalized.includes('reject')) return 'rejected'
    if (normalized.includes('withdraw')) return 'withdrawn'
    if (normalized.includes('expire')) return 'expired'
    return 'pending'
  }

  if (numeric === 20) return 'accepted'
  if (numeric === 30) return 'rejected'
  if (numeric === 40) return 'withdrawn'
  if (numeric === 50) return 'expired'
  return 'pending'
}

function resolveEducationType(value: number): string {
  if (value === EducationType.HighSchool) return 'HighSchool'
  if (value === EducationType.VocationalCourse) return 'VocationalCourse'
  if (value === EducationType.AssociateDegree) return 'AssociateDegree'
  if (value === EducationType.BachelorDegree) return 'BachelorDegree'
  if (value === EducationType.MasterDegree) return 'MasterDegree'
  if (value === EducationType.Doctorate) return 'Doctorate'
  return 'Other'
}

function resolveEducationPeriod(startYear: number | null, endYear: number | null, isOngoing: boolean): string {
  const start = Number.isFinite(startYear) ? String(startYear) : '-'
  const end = isOngoing ? '...' : Number.isFinite(endYear) ? String(endYear) : '-'
  return `${start} - ${end}`
}

function resolveExperiencePeriod(startDate: string | null, endDate: string | null, isCurrent: boolean): string {
  const start = normalizeDate(startDate)
  const end = isCurrent ? '...' : normalizeDate(endDate)
  return `${start} - ${end}`
}

function resolveIssuedWindow(issuedAt: string | null, expiresAt: string | null): string {
  const start = normalizeDate(issuedAt)
  const end = expiresAt ? normalizeDate(expiresAt) : '-'
  return `${start} - ${end}`
}

function normalizeDate(value: string | null): string {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleDateString('tr-TR')
}

function resolveLanguageLevel(value: number): string {
  if (value === LanguageLevel.Beginner) return 'Beginner'
  if (value === LanguageLevel.Elementary) return 'Elementary'
  if (value === LanguageLevel.Intermediate) return 'Intermediate'
  if (value === LanguageLevel.UpperIntermediate) return 'UpperIntermediate'
  if (value === LanguageLevel.Advanced) return 'Advanced'
  if (value === LanguageLevel.Native) return 'Native'
  return String(value)
}
