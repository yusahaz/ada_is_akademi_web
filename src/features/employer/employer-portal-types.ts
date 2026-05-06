import type { JobPostingStatus } from '../../api'
import type { JobApplicationListItem } from '../../api/job-applications'
import type { JobPostingDetail, JobPostingSummary } from '../../api/job-postings'

export type EmployerPayoutStatus = 'Pending' | 'Processing' | 'Paid' | 'Failed'
export type EmployerReceivableStatus = 'Invoiced' | 'PartiallyPaid' | 'Paid' | 'Overdue'
export type EmployerExportFormat = 'json' | 'csv' | 'pdf' | 'excel'

export type EmployerPortalValue = {
  loading: boolean
  error: string | null
  postings: JobPostingSummary[]
  selectedPostingId: number | null
  setSelectedPostingId: (id: number | null) => void
  selectedPosting: JobPostingDetail | null
  applications: JobApplicationListItem[]
  postingsFilter: 'all' | 'open' | 'draft' | 'completed'
  setPostingsFilter: (v: 'all' | 'open' | 'draft' | 'completed') => void
  payoutFilter: EmployerPayoutStatus | 'all'
  setPayoutFilter: (v: EmployerPayoutStatus | 'all') => void
  receivableFilter: EmployerReceivableStatus | 'all'
  setReceivableFilter: (v: EmployerReceivableStatus | 'all') => void
  reportFormat: EmployerExportFormat
  setReportFormat: (v: EmployerExportFormat) => void
  summary: {
    openPostings: number
    pendingApplications: number
    actionRequired: number
  }
  postingsWithStatus: Array<
    JobPostingSummary & { status: (typeof JobPostingStatus)[keyof typeof JobPostingStatus]; isPlanned: boolean }
  >
  filteredPostings: Array<
    JobPostingSummary & { status: (typeof JobPostingStatus)[keyof typeof JobPostingStatus]; isPlanned: boolean }
  >
  candidateGroups: {
    pending: JobApplicationListItem[]
    accepted: JobApplicationListItem[]
    rejected: JobApplicationListItem[]
  }
  filteredPayouts: Array<{
    id: number
    worker: string
    amount: number
    currency: string
    status: EmployerPayoutStatus
  }>
  filteredReceivables: Array<{
    id: number
    period: string
    total: number
    status: EmployerReceivableStatus
  }>
  reportMetrics: {
    totalPostings: number
    acceptedApplications: number
    pendingApplications: number
    rejectedApplications: number
    monthlyReceivable: number
  }
}
