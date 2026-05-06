import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import {
  JobApplicationStatus,
  JobPostingStatus,
  jobApplicationsApi,
  jobPostingsApi,
} from '../../api'
import type { JobApplicationListItem } from '../../api/job-applications'
import type { JobPostingDetail, JobPostingSummary } from '../../api/job-postings'
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
      openPostings: postings.length,
      pendingApplications: applications.filter((item) => item.status === JobApplicationStatus.Pending).length,
      actionRequired: applications.filter((item) => item.status === JobApplicationStatus.Pending).length,
    }),
    [applications, postings.length],
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
    () =>
      applications.map((item) => ({
        id: item.applicationId,
        worker: `Worker #${item.workerId}`,
        amount: selectedPosting?.wageAmount ?? 0,
        currency: selectedPosting?.wageCurrency ?? 'TRY',
        status:
          item.status === JobApplicationStatus.Accepted
            ? ('Processing' as EmployerPayoutStatus)
            : item.status === JobApplicationStatus.Pending
              ? ('Pending' as EmployerPayoutStatus)
              : item.status === JobApplicationStatus.Rejected
                ? ('Failed' as EmployerPayoutStatus)
                : ('Failed' as EmployerPayoutStatus),
      })),
    [applications, selectedPosting?.wageAmount, selectedPosting?.wageCurrency],
  )

  const receivableItems = useMemo(
    () =>
      postings.slice(0, 6).map((item, index) => ({
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
      })),
    [postings],
  )

  const filteredPayouts = useMemo(
    () => (payoutFilter === 'all' ? payoutItems : payoutItems.filter((item) => item.status === payoutFilter)),
    [payoutFilter, payoutItems],
  )

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
    }),
    [
      loading,
      error,
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
    ],
  )

  return <EmployerPortalContext.Provider value={value}>{children}</EmployerPortalContext.Provider>
}
