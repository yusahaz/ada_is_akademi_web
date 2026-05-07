import { getApiClient } from '../core/client'
import { API_ENDPOINTS } from '../core/endpoints'
import type { MembershipScopeType } from './employer-supervisors'

export type SpotDashboardSummaryModel = {
  dailyFillRatePercent: number
  activeWorkerCount: number
  openPostingCount: number
  pendingApplicationCount: number
  activeAnomalyCount: number
  pendingPayoutCount: number
}

export type GetSpotDashboardSummaryQuery = Record<string, never>

export type GetWorkerPortfolioQuery = {
  [key: string]: never
}

export type WorkerPortfolioListItemModel = {
  workerId: number
  fullName: string
  reliabilityScore: number
  completedAssignmentCount: number
  noShowCount: number
  disputeCount: number
  lastWorkedAt: string | null
}

export type ListEmployerDisputesQuery = {
  status?: 'InReview' | 'Resolved'
  dateFrom?: string
  dateTo?: string
  locationId?: number
  limit?: number
  offset?: number
}

export type EmployerDisputeListItemModel = {
  disputeId: number
  assignmentId: number
  workerId: number
  reasonCode: string
  reasonText: string
  status: 'InReview' | 'Resolved'
  openedAt: string
  resolvedAt: string | null
  isAnomalyRelated: boolean
  anomalyCode: string | null
  scopeType?: MembershipScopeType
}

export type PagedListResponse<TItem> = {
  data: TItem[] | null
  hasMore: boolean
  limit: number | string
  offset: number | string
  totalCount: number | string
}

const client = getApiClient()

export const employerSpotApi = {
  summary(body: GetSpotDashboardSummaryQuery = {}) {
    return client.post<SpotDashboardSummaryModel, GetSpotDashboardSummaryQuery>(
      API_ENDPOINTS.employers.spotDashboardSummary,
      body,
      true,
    )
  },
  workerPortfolio(body: GetWorkerPortfolioQuery = {}) {
    return client.post<WorkerPortfolioListItemModel[], GetWorkerPortfolioQuery>(
      API_ENDPOINTS.employers.workerPortfolio,
      body,
      true,
    )
  },
  listDisputes(body: ListEmployerDisputesQuery = {}) {
    return client.post<PagedListResponse<EmployerDisputeListItemModel>, ListEmployerDisputesQuery>(
      API_ENDPOINTS.employers.listDisputes,
      body,
      true,
    )
  },
}

