import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import {
  employerCommissionsApi,
  employerLocationsApi,
  employerPayoutsApi,
  employerSpotApi,
  employerSupervisorsApi,
  JobApplicationStatus,
  JobPostingStatus,
  jobApplicationsApi,
  jobPostingsApi,
  shiftAssignmentsApi,
  workersApi,
} from '../../api'
import type { EmployerLocationListItemModel } from '../../api/employer-locations'
import type { EmployerDisputeListItemModel, SpotDashboardSummaryModel, WorkerPortfolioListItemModel } from '../../api/employer-spot'
import type { EmployerSupervisorListItemModel } from '../../api/employer-supervisors'
import type { ShiftAssignmentHistoryListItemModel, WorkerShiftAssignmentListItem } from '../../api/shift-assignments'
import type { JobApplicationListItem } from '../../api/job-applications'
import type { JobPostingDetail, JobPostingSummary } from '../../api/job-postings'
import type { SemanticSearchedWorkerListItem } from '../../api/workers'
import { normalizePageableList } from '../../api/pagination'
import { EmployerPortalContext } from './employer-portal-context'
import type {
  EmployerExportFormat,
  EmployerPayoutStatus,
  EmployerPortalValue,
  EmployerReceivableStatus,
} from './employer-portal-types'

export function EmployerPortalProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [postings, setPostings] = useState<JobPostingSummary[]>([])
  const [selectedPostingId, setSelectedPostingId] = useState<number | null>(null)
  const [selectedPosting, setSelectedPosting] = useState<JobPostingDetail | null>(null)
  const [applications, setApplications] = useState<JobApplicationListItem[]>([])
  const [postingsFilter, setPostingsFilter] = useState<'all' | 'open' | 'draft' | 'completed'>('all')
  const [payoutFilter, setPayoutFilter] = useState<EmployerPayoutStatus | 'all'>('all')
  const [receivableFilter, setReceivableFilter] = useState<EmployerReceivableStatus | 'all'>('all')
  const [reportFormat, setReportFormat] = useState<EmployerExportFormat>('csv')
  const [spotSummary, setSpotSummary] = useState<SpotDashboardSummaryModel | null>(null)
  const [activeAssignments, setActiveAssignments] = useState<WorkerShiftAssignmentListItem[]>([])
  const [assignmentHistory, setAssignmentHistory] = useState<ShiftAssignmentHistoryListItemModel[]>([])
  const [semanticResults, setSemanticResults] = useState<SemanticSearchedWorkerListItem[]>([])
  const [workerPortfolio, setWorkerPortfolio] = useState<WorkerPortfolioListItemModel[]>([])
  const [employerLocations, setEmployerLocations] = useState<EmployerLocationListItemModel[]>([])
  const [employerSupervisors, setEmployerSupervisors] = useState<EmployerSupervisorListItemModel[]>([])
  const [disputes, setDisputes] = useState<EmployerDisputeListItemModel[]>([])
  const [payoutsFromApi, setPayoutsFromApi] = useState<
    Array<{
      workerPayoutId: number
      workerName: string
      amount: number
      currency: string
      status: EmployerPayoutStatus
      isLocked: boolean
    }>
  >([])
  const [receivablesFromApi, setReceivablesFromApi] = useState<
    Array<{
      id: number
      period: string
      totalAmount: number
      status: EmployerReceivableStatus
    }>
  >([])

  const reloadPostings = useCallback(async () => {
    const items = await jobPostingsApi.listByEmployer({})
    setError(null)
    setPostings(items)
    const nextSelectedPostingId = items[0]?.id ?? null
    setSelectedPostingId(nextSelectedPostingId)
    if (nextSelectedPostingId === null) {
      setSelectedPosting(null)
    }
  }, [])

  useEffect(() => {
    let isActive = true
    void jobPostingsApi
      .listByEmployer({})
      .then((items) => {
        if (!isActive) return
        setError(null)
        setPostings(items)
        const nextSelectedPostingId = items[0]?.id ?? null
        setSelectedPostingId(nextSelectedPostingId)
        if (nextSelectedPostingId === null) {
          setSelectedPosting(null)
        }
      })
      .catch(() => {
        if (!isActive) return
        setError(t('dashboard.employer.sections.fetchError'))
        setPostings([])
      })
      .finally(() => {
        if (isActive) setLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [t])

  useEffect(() => {
    if (!selectedPostingId) return

    let isActive = true
    void jobApplicationsApi
      .list({ jobPostingId: selectedPostingId })
      .then((items) => {
        if (!isActive) return
        setApplications(items)
      })
      .catch(() => {
        if (!isActive) return
        setApplications([])
      })

    return () => {
      isActive = false
    }
  }, [selectedPostingId])

  useEffect(() => {
    let isActive = true
    void employerSpotApi
      .summary({})
      .then((summary) => {
        if (!isActive) return
        setSpotSummary(summary)
      })
      .catch(() => {
        if (!isActive) return
        setSpotSummary(null)
      })

    void shiftAssignmentsApi
      .myAssignments({})
      .then((res) => {
        if (!isActive) return
        setActiveAssignments(res.data.items ?? [])
      })
      .catch(() => {
        if (!isActive) return
        setActiveAssignments([])
      })

    void shiftAssignmentsApi
      .listHistory({ limit: 20, offset: 0 })
      .then((res) => {
        if (!isActive) return
        setAssignmentHistory(res.data.items ?? [])
      })
      .catch(() => {
        if (!isActive) return
        setAssignmentHistory([])
      })

    void employerPayoutsApi
      .list({ limit: 30, offset: 0 })
      .then((res) => {
        if (!isActive) return
        const rows = normalizePageableList(res).rows
        setPayoutsFromApi(rows)
      })
      .catch(() => {
        if (!isActive) return
        setPayoutsFromApi([])
      })

    void employerCommissionsApi
      .listReceivables({ limit: 30, offset: 0 })
      .then((res) => {
        if (!isActive) return
        const rows = (res.data.items ?? []).map((item) => ({
          status: (() => {
            const candidate = item.status
            if (candidate === 'PartiallyPaid' || candidate === 'Paid' || candidate === 'Overdue') {
              return candidate
            }
            return 'Invoiced'
          })() as EmployerReceivableStatus,
          id: Number(item.id),
          period: item.period,
          totalAmount: Number(item.totalAmount),
        }))
        setReceivablesFromApi(rows)
      })
      .catch(() => {
        if (!isActive) return
        setReceivablesFromApi([])
      })

    void employerSpotApi
      .workerPortfolio({})
      .then((rows) => {
        if (!isActive) return
        setWorkerPortfolio(rows)
      })
      .catch(() => {
        if (!isActive) return
        setWorkerPortfolio([])
      })

    void employerLocationsApi
      .listLocations({ limit: 50, offset: 0 })
      .then((res) => {
        if (!isActive) return
        setEmployerLocations(normalizePageableList(res).rows)
      })
      .catch(() => {
        if (!isActive) return
        setEmployerLocations([])
      })

    void employerSupervisorsApi
      .listSupervisors({})
      .then((rows) => {
        if (!isActive) return
        setEmployerSupervisors(rows)
      })
      .catch(() => {
        if (!isActive) return
        setEmployerSupervisors([])
      })

    void employerSpotApi
      .listDisputes({ limit: 30, offset: 0 })
      .then((res) => {
        if (!isActive) return
        setDisputes(normalizePageableList(res).rows)
      })
      .catch(() => {
        if (!isActive) return
        setDisputes([])
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (!selectedPostingId) return
    let isActive = true
    void jobPostingsApi
      .getById({ jobPostingId: selectedPostingId })
      .then((item) => {
        if (!isActive) return
        setSelectedPosting(item)
      })
      .catch(() => {
        if (!isActive) return
        setSelectedPosting(null)
      })
    return () => {
      isActive = false
    }
  }, [selectedPostingId])

  const summary = useMemo(
    () => ({
      openPostings: spotSummary?.openPostingCount ?? postings.length,
      pendingApplications:
        spotSummary?.pendingApplicationCount ??
        applications.filter((item) => item.status === JobApplicationStatus.Pending).length,
      actionRequired: spotSummary?.activeAnomalyCount ?? applications.filter((item) => item.status === JobApplicationStatus.Pending).length,
    }),
    [applications, postings.length, spotSummary],
  )

  const postingsWithStatus = useMemo(
    () =>
      postings.map((item) => ({
        ...item,
        status: JobPostingStatus.Open,
        isPlanned: true,
      })),
    [postings],
  )

  const filteredPostings = useMemo(() => {
    if (postingsFilter === 'all') return postingsWithStatus
    if (postingsFilter === 'open') {
      return postingsWithStatus.filter((item) => item.status === JobPostingStatus.Open)
    }
    if (postingsFilter === 'draft' || postingsFilter === 'completed') {
      return []
    }
    return postingsWithStatus
  }, [postingsFilter, postingsWithStatus])

  const candidateGroups = useMemo(
    () => ({
      pending: applications.filter((item) => item.status === JobApplicationStatus.Pending),
      accepted: applications.filter((item) => item.status === JobApplicationStatus.Accepted),
      rejected: applications.filter((item) => item.status === JobApplicationStatus.Rejected),
    }),
    [applications],
  )

  const payoutItems = useMemo(
    () => {
      if (payoutsFromApi.length > 0) {
        return payoutsFromApi.map((item) => ({
          id: item.workerPayoutId,
          worker: item.workerName,
          amount: item.amount,
          currency: item.currency,
          status: item.status,
          isLocked: item.isLocked,
        }))
      }
      return applications.map((item) => ({
        id: item.applicationId,
        worker: `#${item.workerId}`,
        amount: selectedPosting?.wageAmount ?? 0,
        currency: selectedPosting?.wageCurrency ?? 'TRY',
        status:
          item.status === JobApplicationStatus.Accepted
            ? ('Processing' as EmployerPayoutStatus)
            : item.status === JobApplicationStatus.Pending
              ? ('Pending' as EmployerPayoutStatus)
              : ('Failed' as EmployerPayoutStatus),
      }))
    },
    [applications, payoutsFromApi, selectedPosting?.wageAmount, selectedPosting?.wageCurrency],
  )

  const receivableItems = useMemo(
    () => {
      if (receivablesFromApi.length > 0) {
        return receivablesFromApi.map((item) => ({
          id: item.id,
          period: item.period,
          total: item.totalAmount,
          status: item.status,
        }))
      }
      return postings.slice(0, 6).map((item, index) => ({
        id: item.id,
        period: item.shiftDate,
        total: item.wageAmount * item.headCount,
        status:
          index % 4 === 0
            ? ('Invoiced' as EmployerReceivableStatus)
            : index % 4 === 1
              ? ('PartiallyPaid' as EmployerReceivableStatus)
              : index % 4 === 2
                ? ('Paid' as EmployerReceivableStatus)
                : ('Overdue' as EmployerReceivableStatus),
      }))
    },
    [postings, receivablesFromApi],
  )

  const filteredPayouts = useMemo(
    () => (payoutFilter === 'all' ? payoutItems : payoutItems.filter((item) => item.status === payoutFilter)),
    [payoutFilter, payoutItems],
  )

  const badges = useMemo(() => {
    const pendingPayouts =
      spotSummary?.pendingPayoutCount ?? payoutItems.filter((item) => item.status === 'Pending').length
    const activeAnomalies =
      spotSummary?.activeAnomalyCount ?? activeAssignments.filter((item) => item.isAnomalyFlagged).length
    return { activeAnomalies, pendingPayouts }
  }, [activeAssignments, payoutItems, spotSummary])

  const runSemanticSearch = useCallback(async (queryText: string) => {
    const term = queryText.trim()
    if (!term) {
      setSemanticResults([])
      return
    }
    try {
      const response = await workersApi.semanticSearch({
        queryText: term,
        limit: 20,
        offset: 0,
      })
      setSemanticResults((response.data ?? []) as SemanticSearchedWorkerListItem[])
    } catch {
      setSemanticResults([])
    }
  }, [])

  const filteredReceivables = useMemo(
    () =>
      receivableFilter === 'all'
        ? receivableItems
        : receivableItems.filter((item) => item.status === receivableFilter),
    [receivableFilter, receivableItems],
  )

  const reportMetrics = useMemo(
    () => ({
      totalPostings: postings.length,
      acceptedApplications: applications.filter((item) => item.status === JobApplicationStatus.Accepted).length,
      pendingApplications: applications.filter((item) => item.status === JobApplicationStatus.Pending).length,
      rejectedApplications: applications.filter((item) => item.status === JobApplicationStatus.Rejected).length,
      monthlyReceivable: filteredReceivables.reduce((total, item) => total + item.total, 0),
    }),
    [applications, filteredReceivables, postings.length],
  )

  const value = useMemo<EmployerPortalValue>(
    () => ({
      loading,
      error,
      badges,
      postings,
      selectedPostingId,
      setSelectedPostingId,
      selectedPosting,
      applications,
      postingsFilter,
      setPostingsFilter,
      payoutFilter,
      setPayoutFilter,
      receivableFilter,
      setReceivableFilter,
      reportFormat,
      setReportFormat,
      summary,
      postingsWithStatus,
      filteredPostings,
      candidateGroups,
      filteredPayouts,
      filteredReceivables,
      reportMetrics,
      activeAssignments,
      assignmentHistory,
      semanticResults,
      runSemanticSearch,
      workerPortfolio,
      employerLocations,
      employerSupervisors,
      disputes,
      reloadPostings,
    }),
    [
      loading,
      error,
      badges,
      postings,
      selectedPostingId,
      selectedPosting,
      applications,
      postingsFilter,
      payoutFilter,
      receivableFilter,
      reportFormat,
      summary,
      postingsWithStatus,
      filteredPostings,
      candidateGroups,
      filteredPayouts,
      filteredReceivables,
      reportMetrics,
      activeAssignments,
      assignmentHistory,
      semanticResults,
      runSemanticSearch,
      workerPortfolio,
      employerLocations,
      employerSupervisors,
      disputes,
      reloadPostings,
    ],
  )

  return <EmployerPortalContext.Provider value={value}>{children}</EmployerPortalContext.Provider>
}
