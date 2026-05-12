import { jobApplicationsApi, type MyJobApplicationItem } from '../jobs/job-applications'
import { EducationType, JobPostingStatus, LanguageLevel } from '../core/enums'
import {
  jobPostingsApi,
  type JobPostingDetail,
  type JobPostingSummary,
  type SemanticMatchedJobPosting,
} from '../jobs/job-postings'
import { normalizePageableList, type PageableListResult } from '../core/pagination'
import { shiftAssignmentsApi, type WorkerShiftAssignmentListItem } from '../jobs/shift-assignments'
import { systemUsersApi, type SystemUserNotificationItem } from '../system/system-users'
import { skillsApi } from '../skills/skills'
import { resolveObjectStorageUrlCandidates, sanitizeObjectStorageUrl } from '../../shared/lib/object-storage-url'
import { workersApi } from './workers'

export type WorkerProfileSectionItem = {
  id: string
  label: string
  value: string
}

export type WorkerProfileData = {
  workerId: number
  systemUserId: number
  fullName: string
  email: string
  phone: string
  nationality: string
  university: string
  studentNumber: string
  cvOptions: string | null
  profilePhotoObjectKey: string | null
  skills: Array<{ id: number; tag: string }>
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
  wageAmount?: number
  wageCurrency?: string
  rejectionReason?: string
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
export type WorkerCvUploadSnapshot = {
  fileName: string
  sizeBytes: number
  uploadedAt: string
}

export type WorkerReliabilityScore = {
  value: number | null
  sampleSize: number
  hasData: boolean
}

export type WorkerShiftHistoryItem = {
  assignmentId: number
  jobPostingId: number
  jobApplicationId: number
  status: 'pending' | 'awaitingMutualQr' | 'checkedIn' | 'checkedOut'
  shiftDate: string
  shiftStartTime: string
  shiftEndTime: string
  isAnomalyFlagged: boolean
  anomalyCode: string | null
  checkedInAt: string | null
  checkedOutAt: string | null
}

export type WorkerNotificationItem = {
  id: string
  title: string
  description: string | null
  type: 'matching' | 'payout' | 'application' | 'shift' | 'general'
  createdAt: string | null
  isRead: boolean
}

export type WorkerLiveCounters = {
  pendingPayouts: number
  newMatches: number
  upcomingShifts: number
  unreadNotifications: number
}

export type WorkerAvailabilitySlot = {
  id: string
  dayOfWeek: number
  timeFrom: string
  timeTo: string
}

type WorkerDataSnapshot = {
  openPostings: JobPostingSummary[]
  applications: Awaited<ReturnType<typeof jobApplicationsApi.myApplications>>
}

export const workerPortalApi = {
  resolveWorkerCvOptions(detail: { cvOptions?: string | null }): string | null {
    return detail.cvOptions ?? null
  },

  async getProfile(): Promise<WorkerProfileData> {
    const [me, detail] = await Promise.all([
      systemUsersApi.me(),
      workersApi.getSelfFullDetail(),
    ])

    const fallbackProfile: WorkerProfileData = {
      workerId: Number(detail.id) || 0,
      systemUserId: Number(me.systemUserId) || 0,
      fullName: `${me.firstName ?? ''} ${me.lastName ?? ''}`.trim() || 'Worker',
      email: me.email,
      phone: me.phone ?? 'N/A',
      nationality: 'N/A',
      university: 'N/A',
      studentNumber: 'N/A',
      cvOptions: this.resolveWorkerCvOptions(detail),
      profilePhotoObjectKey: detail.profilePhotoObjectKey ?? null,
      skills: [],
      educations: [],
      experiences: [],
      certificates: [],
      references: [],
      languages: [],
    }

    return {
      ...fallbackProfile,
      cvOptions: this.resolveWorkerCvOptions(detail),
      profilePhotoObjectKey: detail.profilePhotoObjectKey ?? null,
      nationality: detail.nationality ?? 'N/A',
      university: detail.university ?? 'N/A',
      skills:
        detail.skills
          ?.map((item) => ({
            id: Number(item.id) || 0,
            tag: item.tag,
          }))
          .filter((item) => item.tag.length > 0 && item.id > 0) ?? [],
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

  async listOpenShifts(options?: {
    limit?: number
    offset?: number
    nearLatitude?: number
    nearLongitude?: number
    radiusMetres?: number
  }): Promise<JobPostingSummary[]> {
    const limit = options?.limit
    const offset = options?.offset
    const hasNear =
      options?.nearLatitude != null &&
      options?.nearLongitude != null &&
      Number.isFinite(options.nearLatitude) &&
      Number.isFinite(options.nearLongitude)
    return jobPostingsApi.listOpen({
      ...(limit != null ? { limit } : {}),
      ...(offset != null ? { offset } : {}),
      ...(hasNear
        ? {
            nearLatitude: options!.nearLatitude,
            nearLongitude: options!.nearLongitude,
            radiusMetres: options?.radiusMetres ?? 50_000,
          }
        : {}),
    })
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
    const base = mapApplicationsFromSnapshot(snapshot)
    const missingIds = Array.from(
      new Set(
        base
          .filter((item) => item.shiftDate === '-' || item.shiftRange === '-')
          .map((item) => item.jobPostingId),
      ),
    )
    if (missingIds.length === 0) {
      return base
    }

    const missingDetails = await Promise.allSettled(
      missingIds.map((jobPostingId) => jobPostingsApi.getById({ jobPostingId })),
    )
    const detailByPostingId = new Map<number, JobPostingDetail>()
    missingDetails.forEach((res, idx) => {
      if (res.status === 'fulfilled') {
        detailByPostingId.set(missingIds[idx], res.value)
      }
    })

    return base.map((item) => {
      const detail = detailByPostingId.get(item.jobPostingId)
      if (!detail) return item
      return {
        ...item,
        title: detail.title || item.title,
        shiftDate: detail.shiftDate || item.shiftDate,
        shiftRange: `${detail.shiftStartTime} - ${detail.shiftEndTime}`,
        wageAmount: Number.isFinite(detail.wageAmount) ? detail.wageAmount : item.wageAmount,
        wageCurrency: detail.wageCurrency || item.wageCurrency,
      }
    })
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

  async listSemanticMatchedShifts(): Promise<SemanticMatchedJobPosting[]> {
    try {
      return await jobPostingsApi.listSemanticMatched({ limit: 20 })
    } catch {
      return []
    }
  },

  async getCvImportState(): Promise<WorkerCvState> {
    const uploadSnapshot = this.getCvUploadSnapshot()
    if (uploadSnapshot) {
      const uploadedAtMs = new Date(uploadSnapshot.uploadedAt).getTime()
      const elapsedMs = Number.isFinite(uploadedAtMs) ? Date.now() - uploadedAtMs : Number.MAX_SAFE_INTEGER
      if (elapsedMs < 4_000) return 'uploaded'
      if (elapsedMs < 12_000) return 'extracting'
    }

    const profile = await this.getProfile()
    if (profile.skills.length === 0) {
      return 'extracting'
    }
    if (!profile.university || profile.university === 'N/A') {
      return 'awaitingReview'
    }
    return 'confirmed'
  },

  async createCvDraftFromProfile(profile?: WorkerProfileData): Promise<Blob> {
    const source = profile ?? (await this.getProfile())
    const lines = [
      source.fullName,
      source.email,
      source.phone && source.phone !== 'N/A' ? source.phone : '',
      source.nationality && source.nationality !== 'N/A' ? source.nationality : '',
      source.university && source.university !== 'N/A' ? source.university : '',
      '',
      'EXPERIENCE',
      ...(source.experiences.length > 0
        ? source.experiences.map((item) => `- ${item.label}: ${item.value}`)
        : ['- N/A']),
      '',
      'SKILLS',
      ...(source.skills.length > 0 ? source.skills.map((skill) => `- ${skill.tag}`) : ['- N/A']),
      '',
      'CERTIFICATES',
      ...(source.certificates.length > 0
        ? source.certificates.map((item) => `- ${item.label}: ${item.value}`)
        : ['- N/A']),
      '',
      'REFERENCES',
      ...(source.references.length > 0
        ? source.references.map((item) => `- ${item.label}: ${item.value}`)
        : ['- N/A']),
    ]
    return new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  },

  async uploadCvFile(file: File): Promise<WorkerCvUploadSnapshot> {
    const contentType = resolveCvContentType(file)
    const initResult = await workersApi.initCvUpload({
      fileName: file.name,
      contentType,
    })

    const uploadSucceeded = await tryUploadToObjectStorage(
      initResult.uploadUrl,
      file,
      contentType,
    )
    if (!uploadSucceeded) {
      throw new Error('CV upload failed.')
    }

    await workersApi.confirmCvUpload({
      objectKey: initResult.objectKey,
      fileName: file.name,
      contentType,
      fileSizeBytes: file.size,
    })

    const snapshot: WorkerCvUploadSnapshot = {
      fileName: file.name,
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
    }
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('ada-is-akademi:worker-cv-upload', JSON.stringify(snapshot))
    }
    return snapshot
  },

  getCvUploadSnapshot(): WorkerCvUploadSnapshot | null {
    if (typeof window === 'undefined') return null
    const raw = window.sessionStorage.getItem('ada-is-akademi:worker-cv-upload')
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as Partial<WorkerCvUploadSnapshot>
      if (
        typeof parsed.fileName !== 'string' ||
        typeof parsed.sizeBytes !== 'number' ||
        typeof parsed.uploadedAt !== 'string'
      ) {
        return null
      }
      return {
        fileName: parsed.fileName,
        sizeBytes: parsed.sizeBytes,
        uploadedAt: parsed.uploadedAt,
      }
    } catch {
      return null
    }
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

  async getReliabilityScore(): Promise<WorkerReliabilityScore> {
    try {
      const snapshot = await getWorkerDataSnapshot()
      const applications = mapApplicationsFromSnapshot(snapshot)
      const meaningful = applications.filter((item) =>
        item.status === 'accepted' || item.status === 'rejected' || item.status === 'expired',
      )
      if (meaningful.length === 0) {
        return { value: null, sampleSize: 0, hasData: false }
      }
      const positives = meaningful.filter((item) => item.status === 'accepted').length
      const value = Math.round((positives / meaningful.length) * 100)
      return { value, sampleSize: meaningful.length, hasData: true }
    } catch {
      return { value: null, sampleSize: 0, hasData: false }
    }
  },

  async getUpcomingShiftAssignments(limit: number = 5): Promise<WorkerShiftHistoryItem[]> {
    const items = await fetchMyShiftAssignments({ limit, offset: 0 })
    return items.filter((item) => item.status === 'pending' || item.status === 'awaitingMutualQr')
  },

  async getActiveShiftAssignment(): Promise<WorkerShiftHistoryItem | null> {
    const items = await fetchMyShiftAssignments({ limit: 10, offset: 0 })
    return (
      items.find((item) => item.status === 'checkedIn' || item.status === 'awaitingMutualQr') ?? null
    )
  },

  async listShiftHistory(limit: number = 20, offset: number = 0): Promise<WorkerShiftHistoryItem[]> {
    return fetchMyShiftAssignments({ limit, offset })
  },

  async listNotifications(): Promise<WorkerNotificationItem[]> {
    try {
      const response = await systemUsersApi.myNotifications({ limit: 50, offset: 0 })
      const { rows } = normalizePageableList(response)
      return rows
        .map((item) => mapSystemNotificationItem(item))
        .filter((item): item is WorkerNotificationItem => item !== null)
    } catch {
      return []
    }
  },

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await systemUsersApi.markNotificationAsRead({ notificationId })
  },

  async markAllNotificationsAsRead(): Promise<void> {
    await systemUsersApi.markAllNotificationsAsRead({})
  },

  async getLiveCounters(): Promise<WorkerLiveCounters> {
    const [payouts, matched, upcoming, notifications] = await Promise.allSettled([
      this.listPayouts(),
      this.listSemanticMatchedShifts(),
      this.getUpcomingShiftAssignments(20),
      this.listNotifications(),
    ])
    return {
      pendingPayouts:
        payouts.status === 'fulfilled'
          ? payouts.value.filter((item) => item.status === 'pending' || item.status === 'processing').length
          : 0,
      newMatches: matched.status === 'fulfilled' ? matched.value.length : 0,
      upcomingShifts: upcoming.status === 'fulfilled' ? upcoming.value.length : 0,
      unreadNotifications:
        notifications.status === 'fulfilled' ? notifications.value.filter((item) => !item.isRead).length : 0,
    }
  },

  async getAvailabilityCalendar(): Promise<WorkerAvailabilitySlot[]> {
    try {
      const detail = await workersApi.getSelfFullDetail()
      return (detail.availabilities ?? []).map((slot) => ({
        id: String(slot.id),
        dayOfWeek: normalizeDayOfWeek(slot.dayOfWeek),
        timeFrom: slot.timeFrom ?? '',
        timeTo: slot.timeTo ?? '',
      }))
    } catch {
      return []
    }
  },

  async saveAvailabilityCalendar(slots: WorkerAvailabilitySlot[]): Promise<WorkerAvailabilitySlot[]> {
    const detail = await workersApi.getSelfFullDetail()
    const existing = (detail.availabilities ?? []).map((slot) => ({
      id: String(slot.id),
      dayOfWeek: Number(slot.dayOfWeek) || 0,
      timeFrom: slot.timeFrom ?? '',
      timeTo: slot.timeTo ?? '',
    }))

    const nextKeys = new Set(slots.map((slot) => toAvailabilityKey(slot)))
    const existingKeys = new Set(existing.map((slot) => toAvailabilityKey(slot)))

    const toRemove = existing.filter((slot) => !nextKeys.has(toAvailabilityKey(slot)))
    const toAdd = slots.filter((slot) => !existingKeys.has(toAvailabilityKey(slot)))

    await Promise.all([
      ...toRemove.map((slot) => workersApi.removeAvailability({ availabilityId: slot.id })),
      ...toAdd.map((slot) =>
        workersApi.addAvailability({
          dayOfWeek: slot.dayOfWeek,
          timeFrom: slot.timeFrom,
          timeTo: slot.timeTo,
        }),
      ),
    ])

    return this.getAvailabilityCalendar()
  },

  async copyAvailabilityWeekdaysFromDay(sourceDay: number = 1): Promise<WorkerAvailabilitySlot[]> {
    const current = await this.getAvailabilityCalendar()
    const source = current.find((slot) => Number(slot.dayOfWeek) === sourceDay)
    if (!source) {
      return current
    }

    const weekdays = [1, 2, 3, 4, 5]
    const preserved = current.filter((slot) => !weekdays.includes(Number(slot.dayOfWeek)))
    const copied: WorkerAvailabilitySlot[] = weekdays.map((day) => ({
      id: `copy-${day}`,
      dayOfWeek: day,
      timeFrom: source.timeFrom,
      timeTo: source.timeTo,
    }))

    return this.saveAvailabilityCalendar([...preserved, ...copied])
  },

  async clearAvailabilityCalendar(): Promise<WorkerAvailabilitySlot[]> {
    return this.saveAvailabilityCalendar([])
  },

  async requestEmailVerification(systemUserId: number): Promise<void> {
    const tokenHash = generateClientTokenHash()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    await systemUsersApi.requestEmailVerification({
      systemUserId,
      tokenHash,
      expiresAt,
    })
  },

  async getProfilePhotoViewUrl(): Promise<string | null> {
    try {
      const response = await workersApi.getProfilePhotoViewUrl({})
      return sanitizeObjectStorageUrl(response.url)
    } catch {
      return null
    }
  },

  async addWorkerSkill(workerId: number, tag: string): Promise<number> {
    return workersApi.addSkill({ workerId, tag })
  },

  async listGlobalSkills(limit: number = 1000): Promise<string[]> {
    try {
      const rows = await skillsApi.list({ limit })
      return Array.isArray(rows) ? rows : []
    } catch {
      return []
    }
  },

  async removeWorkerSkill(skillId: number): Promise<void> {
    await workersApi.removeSkill({ skillId })
  },

  async removeAvailability(availabilityId: number): Promise<void> {
    await workersApi.removeAvailability({ availabilityId })
  },

  async updateBasicProfile(payload: {
    firstName: string | null
    lastName: string | null
    nationality: string | null
    university: string | null
    phone?: string | null
  }): Promise<void> {
    await workersApi.updateProfile(payload)
  },

  async updateCvTemplatePreference(cvOptions: string | null): Promise<void> {
    await workersApi.updateCvTemplatePreference({ cvOptions })
  },

  async addExperience(payload: {
    companyName: string
    position: string
    startDate: string
    endDate: string | null
    description: string | null
  }): Promise<number> {
    return workersApi.addExperience(payload)
  },

  async removeExperience(experienceId: number): Promise<void> {
    await workersApi.removeExperience({ experienceId })
  },

  async addCertificate(payload: {
    name: string
    issuingOrganization: string
    issuedAt: string
    expiresAt: string | null
    documentUrl: string | null
  }): Promise<number> {
    return workersApi.addCertificate(payload)
  },

  async removeCertificate(certificateId: number): Promise<void> {
    await workersApi.removeCertificate({ certificateId })
  },

  async addReference(payload: {
    company: string
    position: string
    contactFirstName: string
    contactLastName: string
    contactEmail: string
    contactPhone: string | null
  }): Promise<number> {
    return workersApi.addReference(payload)
  },

  async removeReference(referenceId: number): Promise<void> {
    await workersApi.removeReference({ referenceId })
  },

  async suspendAccount(systemUserId: number): Promise<void> {
    await systemUsersApi.suspend({ systemUserId })
  },

  async deleteWorker(workerId: number): Promise<void> {
    await workersApi.delete({ workerId })
  },

  async changePassword(systemUserId: number, password: string): Promise<void> {
    await systemUsersApi.changePassword({ systemUserId, password })
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
  const { rows: applications } = normalizePageableList<MyJobApplicationItem>(snapshot.applications)
  const postingById = new Map<number, JobPostingSummary>(
    snapshot.openPostings.map((posting) => [posting.id, posting]),
  )

  return applications
    .map((application) => {
      const jobPostingId = Number(application.jobPostingId)
      const id = Number(application.applicationId)
      if (!Number.isFinite(jobPostingId) || jobPostingId <= 0 || !Number.isFinite(id)) {
        return null
      }
      const posting = postingById.get(jobPostingId)
      const raw = application as Record<string, unknown>
      const reasonCandidate =
        raw.rejectionReason ??
        raw.rejectReason ??
        raw.reason ??
        raw.note
      const rejectionReason =
        typeof reasonCandidate === 'string' && reasonCandidate.trim().length > 0
          ? reasonCandidate.trim()
          : undefined
      const mapped: WorkerApplicationItem = {
        id,
        jobPostingId,
        title: posting?.title ?? `#${jobPostingId}`,
        shiftDate: posting?.shiftDate ?? '-',
        shiftRange: posting ? `${posting.shiftStartTime} - ${posting.shiftEndTime}` : '-',
        status: mapApplicationStatus(application.status),
      }
      if (mapped.status === 'rejected' && rejectionReason) {
        mapped.rejectionReason = rejectionReason
      }
      if (posting?.wageAmount != null && posting.wageCurrency) {
        mapped.wageAmount = posting.wageAmount
        mapped.wageCurrency = posting.wageCurrency
      }
      return mapped
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

async function fetchMyShiftAssignments(query: { limit?: number; offset?: number }): Promise<WorkerShiftHistoryItem[]> {
  try {
    const response = (await shiftAssignmentsApi.myAssignments({
      limit: query.limit,
      offset: query.offset,
    })) as unknown as PageableListResult<WorkerShiftAssignmentListItem>
    const { rows } = normalizePageableList(response)
    return rows.map(mapShiftAssignmentItem)
  } catch {
    return []
  }
}

function mapShiftAssignmentItem(item: WorkerShiftAssignmentListItem): WorkerShiftHistoryItem {
  return {
    assignmentId: Number(item.assignmentId) || 0,
    jobPostingId: Number(item.jobPostingId) || 0,
    jobApplicationId: Number(item.jobApplicationId) || 0,
    status: normalizeShiftStatus(item.status),
    shiftDate: item.shiftDate ?? '',
    shiftStartTime: item.shiftStartTime ?? '',
    shiftEndTime: item.shiftEndTime ?? '',
    isAnomalyFlagged: Boolean(item.isAnomalyFlagged),
    anomalyCode: item.anomalyCode ?? null,
    checkedInAt: item.checkedInAt ?? null,
    checkedOutAt: item.checkedOutAt ?? null,
  }
}

function normalizeShiftStatus(value: string | number | null | undefined): WorkerShiftHistoryItem['status'] {
  const text = String(value ?? '').toLowerCase()
  if (text.includes('checkedout') || text.includes('checked_out') || text.includes('check-out')) return 'checkedOut'
  if (text.includes('checkedin') || text.includes('checked_in') || text.includes('check-in')) return 'checkedIn'
  if (text.includes('mutual') || text.includes('awaiting')) return 'awaitingMutualQr'
  return 'pending'
}

function mapSystemNotificationItem(item: SystemUserNotificationItem): WorkerNotificationItem | null {
  const title = item.title?.trim()
  if (!title) return null
  const typeText = `${item.templateCode ?? ''} ${item.title ?? ''} ${item.body ?? ''}`.toLowerCase()
  const type: WorkerNotificationItem['type'] = typeText.includes('match')
    ? 'matching'
    : typeText.includes('payout') || typeText.includes('payment')
      ? 'payout'
      : typeText.includes('application') || typeText.includes('apply')
        ? 'application'
        : typeText.includes('shift') || typeText.includes('assignment') || typeText.includes('checkin')
          ? 'shift'
          : 'general'
  return {
    id: String(item.id),
    title,
    description: item.body?.trim() || null,
    type,
    createdAt: item.createdAt ?? null,
    isRead: Boolean(item.isRead),
  }
}

function generateClientTokenHash(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '')
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function toAvailabilityKey(slot: { dayOfWeek: number; timeFrom: string; timeTo: string }) {
  return `${Number(slot.dayOfWeek)}|${slot.timeFrom}|${slot.timeTo}`
}

function normalizeDayOfWeek(value: unknown): number {
  const numeric = Number(value)
  if (Number.isFinite(numeric) && numeric >= 0 && numeric <= 6) {
    return numeric
  }

  const text = String(value ?? '').trim().toLowerCase()
  if (text === 'monday') return 1
  if (text === 'tuesday') return 2
  if (text === 'wednesday') return 3
  if (text === 'thursday') return 4
  if (text === 'friday') return 5
  if (text === 'saturday') return 6
  if (text === 'sunday') return 0
  return 0
}

function resolveCvContentType(file: File): string {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) {
    return 'application/pdf'
  }
  if (name.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }

  // Backend only accepts PDF/DOCX for CV upload init/confirm.
  throw new Error('Unsupported CV format. Please upload PDF or DOCX.')
}

async function tryUploadToObjectStorage(url: unknown, file: File, contentType: string): Promise<boolean> {
  const candidates = resolveObjectStorageUrlCandidates(url)
  if (candidates.length === 0) return false

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: file,
      })
      if (response.ok) return true
    } catch {
      // Try next candidate URL.
    }
  }
  return false
}
