import { ApiError, getApiClient } from '../core/client'
import { API_ENDPOINTS } from '../core/endpoints'

export type AdminSummaryStats = {
  systemUsersCount: number
  approvalsCount: number
  securityStatus: string
  usersHint: string
  approvalsHint: string
  securityHint: string
  overview: {
    activatedTodayCount: number
    totalWorkerCount: number
    activeWorkerCount: number
    totalEmployerCount: number
    activeEmployerCount: number
    totalJobPostingCount: number
    openJobPostingCount: number
    totalJobApplicationCount: number
    pendingJobApplicationCount: number
    acceptedJobApplicationCount: number
    rejectedJobApplicationCount: number
  } | null
}

type AdminSummaryEndpointResponse = Partial<AdminSummaryStats> & {
  totalSystemUsers?: number
  pendingApprovals?: number
  pendingSystemUserCount?: number | string
  activeSystemUserCount?: number | string
  suspendedSystemUserCount?: number | string
  bannedSystemUserCount?: number | string
  activatedTodayCount?: number | string
  totalWorkerCount?: number | string
  activeWorkerCount?: number | string
  totalEmployerCount?: number | string
  activeEmployerCount?: number | string
  totalJobPostingCount?: number | string
  openJobPostingCount?: number | string
  totalJobApplicationCount?: number | string
  pendingJobApplicationCount?: number | string
  acceptedJobApplicationCount?: number | string
  rejectedJobApplicationCount?: number | string
}

function parseNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

const client = getApiClient()

export async function getAdminSummaryStats(): Promise<AdminSummaryStats | null> {
  const result: AdminSummaryStats = {
    systemUsersCount: 0,
    approvalsCount: 0,
    securityStatus: '',
    usersHint: '',
    approvalsHint: '',
    securityHint: '',
    overview: null,
  }

  let hasAnyValue = false

  const summary = await client.post<AdminSummaryEndpointResponse, Record<string, never>>(
    API_ENDPOINTS.statistics.overview,
    {},
    true,
  )
  const totalSystemUsers =
    parseNumber(summary.systemUsersCount) ??
    parseNumber(summary.totalSystemUsers)
  if (totalSystemUsers !== null) {
    result.systemUsersCount = totalSystemUsers
    hasAnyValue = true
  }

  const pendingApprovals =
    parseNumber(summary.approvalsCount) ??
    parseNumber(summary.pendingApprovals) ??
    parseNumber(summary.pendingSystemUserCount)
  if (pendingApprovals !== null) {
    result.approvalsCount = pendingApprovals
    hasAnyValue = true
  }

  const activeUsers = parseNumber(summary.activeSystemUserCount)
  if (activeUsers !== null) {
    result.securityStatus = String(activeUsers)
    hasAnyValue = true
  }

  const suspendedUsers = parseNumber(summary.suspendedSystemUserCount)
  const bannedUsers = parseNumber(summary.bannedSystemUserCount)
  if (suspendedUsers !== null || bannedUsers !== null) {
    result.securityHint = `${suspendedUsers ?? 0} / ${bannedUsers ?? 0}`
    hasAnyValue = true
  }

  result.securityStatus = summary.securityStatus ?? result.securityStatus
  result.usersHint = summary.usersHint ?? result.usersHint
  result.approvalsHint = summary.approvalsHint ?? result.approvalsHint
  result.securityHint = summary.securityHint ?? result.securityHint

  const overview = {
    activatedTodayCount: parseNumber(summary.activatedTodayCount),
    totalWorkerCount: parseNumber(summary.totalWorkerCount),
    activeWorkerCount: parseNumber(summary.activeWorkerCount),
    totalEmployerCount: parseNumber(summary.totalEmployerCount),
    activeEmployerCount: parseNumber(summary.activeEmployerCount),
    totalJobPostingCount: parseNumber(summary.totalJobPostingCount),
    openJobPostingCount: parseNumber(summary.openJobPostingCount),
    totalJobApplicationCount: parseNumber(summary.totalJobApplicationCount),
    pendingJobApplicationCount: parseNumber(summary.pendingJobApplicationCount),
    acceptedJobApplicationCount: parseNumber(summary.acceptedJobApplicationCount),
    rejectedJobApplicationCount: parseNumber(summary.rejectedJobApplicationCount),
  }

  if (Object.values(overview).some((value) => value !== null)) {
    result.overview = {
      activatedTodayCount: overview.activatedTodayCount ?? 0,
      totalWorkerCount: overview.totalWorkerCount ?? 0,
      activeWorkerCount: overview.activeWorkerCount ?? 0,
      totalEmployerCount: overview.totalEmployerCount ?? 0,
      activeEmployerCount: overview.activeEmployerCount ?? 0,
      totalJobPostingCount: overview.totalJobPostingCount ?? 0,
      openJobPostingCount: overview.openJobPostingCount ?? 0,
      totalJobApplicationCount: overview.totalJobApplicationCount ?? 0,
      pendingJobApplicationCount: overview.pendingJobApplicationCount ?? 0,
      acceptedJobApplicationCount: overview.acceptedJobApplicationCount ?? 0,
      rejectedJobApplicationCount: overview.rejectedJobApplicationCount ?? 0,
    }
    hasAnyValue = true
  }

  hasAnyValue ||= Boolean(
    summary.securityStatus ||
      summary.usersHint ||
      summary.approvalsHint ||
      summary.securityHint,
  )

  if (!hasAnyValue) {
    throw new ApiError('Admin summary endpoints are configured but returned no usable data.', {
      status: 422,
      code: 'ADMIN_SUMMARY_EMPTY',
      fieldErrors: null,
    })
  }

  return result
}
