import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  JobApplicationStatus,
  JobPostingStatus,
  jobApplicationsApi,
  jobPostingsApi,
} from '../../api'
import type { JobApplicationListItem } from '../../api/job-applications'
import type { JobPostingDetail, JobPostingSummary } from '../../api/job-postings'
import { useTheme } from '../../theme/theme-context'
import { IconBolt, IconCheck, IconShield, IconUsers } from '../landing/icons'

type EmployerSection =
  | 'overview'
  | 'postings'
  | 'candidates'
  | 'operations'
  | 'billing'
  | 'reports'

type PayoutStatus = 'Pending' | 'Processing' | 'Paid' | 'Failed'
type ReceivableStatus = 'Invoiced' | 'PartiallyPaid' | 'Paid' | 'Overdue'
type ExportFormat = 'json' | 'csv' | 'pdf' | 'excel'

export function EmployerDashboard() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [activeSection, setActiveSection] = useState<EmployerSection>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [postings, setPostings] = useState<JobPostingSummary[]>([])
  const [selectedPostingId, setSelectedPostingId] = useState<number | null>(null)
  const [selectedPosting, setSelectedPosting] = useState<JobPostingDetail | null>(null)
  const [applications, setApplications] = useState<JobApplicationListItem[]>([])
  const [postingsFilter, setPostingsFilter] = useState<'all' | 'open' | 'draft' | 'completed'>('all')
  const [payoutFilter, setPayoutFilter] = useState<PayoutStatus | 'all'>('all')
  const [receivableFilter, setReceivableFilter] = useState<ReceivableStatus | 'all'>('all')
  const [reportFormat, setReportFormat] = useState<ExportFormat>('csv')

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
      postings.map((item, index) => ({
        ...item,
        status:
          index % 3 === 0
            ? JobPostingStatus.Open
            : index % 3 === 1
              ? JobPostingStatus.Draft
              : JobPostingStatus.Completed,
        isPlanned: index % 2 === 0,
      })),
    [postings],
  )

  const filteredPostings = useMemo(() => {
    if (postingsFilter === 'all') return postingsWithStatus
    if (postingsFilter === 'open') {
      return postingsWithStatus.filter((item) => item.status === JobPostingStatus.Open)
    }
    if (postingsFilter === 'draft') {
      return postingsWithStatus.filter((item) => item.status === JobPostingStatus.Draft)
    }
    return postingsWithStatus.filter((item) => item.status === JobPostingStatus.Completed)
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
    () => [
      { id: 1, worker: 'Worker #121', amount: 850, currency: 'TRY', status: 'Pending' as PayoutStatus },
      { id: 2, worker: 'Worker #344', amount: 920, currency: 'TRY', status: 'Processing' as PayoutStatus },
      { id: 3, worker: 'Worker #882', amount: 780, currency: 'TRY', status: 'Paid' as PayoutStatus },
      { id: 4, worker: 'Worker #991', amount: 810, currency: 'TRY', status: 'Failed' as PayoutStatus },
    ],
    [],
  )

  const receivableItems = useMemo(
    () => [
      { id: 11, period: '2026-04', total: 12450, status: 'Invoiced' as ReceivableStatus },
      { id: 12, period: '2026-03', total: 9870, status: 'PartiallyPaid' as ReceivableStatus },
      { id: 13, period: '2026-02', total: 11100, status: 'Paid' as ReceivableStatus },
      { id: 14, period: '2026-01', total: 9050, status: 'Overdue' as ReceivableStatus },
    ],
    [],
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

  const sectionButtonClass = (isActiveButton: boolean) =>
    `rounded-xl border px-3 py-2 text-xs font-semibold transition sm:text-sm ${
      isActiveButton
        ? theme === 'dark'
          ? 'border-[#14f1d9]/45 bg-[#14f1d9]/10 text-[#95fff2]'
          : 'border-sky-300 bg-sky-50 text-sky-700'
        : theme === 'dark'
          ? 'border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.07]'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
    }`

  const panelClass = `rounded-2xl border p-4 sm:p-5 ${
    theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-slate-300/80 bg-white'
  }`

  const toneClass = theme === 'dark' ? 'text-white/70' : 'text-slate-600'

  return (
    <section className="mx-auto w-full max-w-7xl px-3 py-4 pb-[max(env(safe-area-inset-bottom),1rem)] sm:px-5 sm:py-6 lg:px-8">
      <header className={panelClass}>
        <h1
          className={`font-display text-xl font-semibold sm:text-2xl ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}
        >
          {t('dashboard.employer.title')}
        </h1>
        <p className={`mt-2 text-sm sm:text-base ${toneClass}`}>{t('dashboard.employer.subtitle')}</p>
      </header>

      <nav className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        {(
          [
            ['overview', t('dashboard.employer.sectionsNav.overview')],
            ['postings', t('dashboard.employer.sectionsNav.postings')],
            ['candidates', t('dashboard.employer.sectionsNav.candidates')],
            ['operations', t('dashboard.employer.sectionsNav.operations')],
            ['billing', t('dashboard.employer.sectionsNav.billing')],
            ['reports', t('dashboard.employer.sectionsNav.reports')],
          ] as [EmployerSection, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveSection(key)}
            className={sectionButtonClass(activeSection === key)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          {
            title: t('dashboard.employer.summary.openPostings'),
            value: summary.openPostings,
            icon: <IconBolt className="h-4 w-4" />,
          },
          {
            title: t('dashboard.employer.summary.pendingApplications'),
            value: summary.pendingApplications,
            icon: <IconUsers className="h-4 w-4" />,
          },
          {
            title: t('dashboard.employer.summary.actionRequired'),
            value: summary.actionRequired,
            icon: <IconShield className="h-4 w-4" />,
          },
        ].map((item) => (
          <article
            key={item.title}
            className={`rounded-xl border p-4 ${
              theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-slate-300/80 bg-white'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className={`text-xs ${theme === 'dark' ? 'text-white/75' : 'text-slate-600'}`}>
                {item.title}
              </p>
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                  theme === 'dark' ? 'bg-[#14f1d9]/15 text-[#14f1d9]' : 'bg-sky-100 text-sky-700'
                }`}
              >
                {item.icon}
              </span>
            </div>
            <p
              className={`mt-3 font-display text-2xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              {item.value}
            </p>
          </article>
        ))}
      </div>

      {error ? (
        <p
          className={`mt-4 rounded-xl border px-3 py-2 text-sm ${
            theme === 'dark'
              ? 'border-amber-400/30 bg-amber-400/10 text-amber-100'
              : 'border-amber-300 bg-amber-50 text-amber-800'
          }`}
        >
          {error}
        </p>
      ) : null}

      {activeSection === 'overview' ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <article className={panelClass}>
            <h2
              className={`font-display text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              {t('dashboard.employer.sections.myPostings')}
            </h2>
            {loading ? (
              <p className={`mt-3 text-sm ${toneClass}`}>{t('dashboard.employer.sections.loading')}</p>
            ) : postings.length === 0 ? (
              <p className={`mt-3 text-sm ${toneClass}`}>{t('dashboard.employer.sections.emptyPostings')}</p>
            ) : (
              <div className="mt-3 space-y-2">
                {postings.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedPostingId(item.id)}
                    className={`w-full rounded-xl border px-3 py-2 text-start transition ${
                      selectedPostingId === item.id
                        ? theme === 'dark'
                          ? 'border-[#14f1d9]/50 bg-[#14f1d9]/10'
                          : 'border-sky-300 bg-sky-50'
                        : theme === 'dark'
                          ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {item.title}
                    </p>
                    <p className={`mt-1 text-xs ${toneClass}`}>
                      {item.shiftDate} • {item.headCount} {t('dashboard.employer.sections.headCount')}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </article>

          <article className={panelClass}>
            <h2
              className={`font-display text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              {t('dashboard.employer.sections.candidateFlow')}
            </h2>
            {selectedPostingId === null ? (
              <p className={`mt-3 text-sm ${toneClass}`}>{t('dashboard.employer.sections.selectPosting')}</p>
            ) : applications.length === 0 ? (
              <p className={`mt-3 text-sm ${toneClass}`}>{t('dashboard.employer.sections.emptyApplications')}</p>
            ) : (
              <div className="mt-3 space-y-2">
                {applications.slice(0, 6).map((item) => (
                  <div
                    key={item.applicationId}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                      theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <p className={`text-xs ${toneClass}`}>
                      #{item.applicationId} • Worker {item.workerId}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
                        theme === 'dark' ? 'bg-sky-500/15 text-sky-100' : 'bg-sky-100 text-sky-700'
                      }`}
                    >
                      <IconCheck className="h-3 w-3" />
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      ) : null}

      {activeSection === 'postings' ? (
        <article className={`mt-4 ${panelClass}`}>
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ['all', t('dashboard.employer.postings.filters.all')],
                ['open', t('dashboard.employer.postings.filters.open')],
                ['draft', t('dashboard.employer.postings.filters.draft')],
                ['completed', t('dashboard.employer.postings.filters.completed')],
              ] as ['all' | 'open' | 'draft' | 'completed', string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={sectionButtonClass(postingsFilter === key)}
                onClick={() => setPostingsFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {filteredPostings.length === 0 ? (
              <p className={`text-sm ${toneClass}`}>{t('dashboard.employer.postings.empty')}</p>
            ) : (
              filteredPostings.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedPostingId(item.id)}
                  className={`rounded-xl border px-3 py-3 text-start ${
                    theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {item.title}
                  </p>
                  <p className={`mt-1 text-xs ${toneClass}`}>
                    {item.shiftDate} • {item.shiftStartTime} - {item.shiftEndTime}
                  </p>
                  <p className={`mt-2 text-xs ${toneClass}`}>
                    {item.isPlanned
                      ? t('dashboard.employer.postings.mode.planned')
                      : t('dashboard.employer.postings.mode.instant')}
                  </p>
                </button>
              ))
            )}
          </div>
          {selectedPosting ? (
            <div
              className={`mt-4 rounded-xl border p-3 ${
                theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t('dashboard.employer.postings.detailTitle')}
              </p>
              <p className={`mt-2 text-xs ${toneClass}`}>{selectedPosting.description}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <span className={toneClass}>
                  {t('dashboard.employer.postings.detail.pending')}: {selectedPosting.pendingApplications}
                </span>
                <span className={toneClass}>
                  {t('dashboard.employer.postings.detail.accepted')}: {selectedPosting.acceptedApplications}
                </span>
                <span className={toneClass}>
                  {t('dashboard.employer.postings.detail.headCount')}: {selectedPosting.headCount}
                </span>
                <span className={toneClass}>
                  {t('dashboard.employer.postings.detail.status')}: {selectedPosting.status}
                </span>
              </div>
            </div>
          ) : (
            <p className={`mt-4 text-xs ${toneClass}`}>{t('dashboard.employer.fallback.readOnlyData')}</p>
          )}
        </article>
      ) : null}

      {activeSection === 'candidates' ? (
        <article className={`mt-4 ${panelClass}`}>
          <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {t('dashboard.employer.candidates.title')}
          </h2>
          <p className={`mt-1 text-sm ${toneClass}`}>{t('dashboard.employer.candidates.subtitle')}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {(
              [
                ['pending', candidateGroups.pending],
                ['accepted', candidateGroups.accepted],
                ['rejected', candidateGroups.rejected],
              ] as ['pending' | 'accepted' | 'rejected', JobApplicationListItem[]][]
            ).map(([key, items]) => (
              <div
                key={key}
                className={`rounded-xl border p-3 ${
                  theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <p className={`text-xs font-semibold uppercase tracking-wide ${toneClass}`}>
                  {t(`dashboard.employer.candidates.columns.${key}`)}
                </p>
                <div className="mt-2 space-y-2">
                  {items.slice(0, 5).map((item, index) => (
                    <div
                      key={item.applicationId}
                      className={`rounded-lg border px-2 py-2 text-xs ${
                        theme === 'dark' ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <p className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                        Worker {item.workerId}
                      </p>
                      <p className={`mt-1 ${toneClass}`}>
                        {t('dashboard.employer.candidates.score')}: {Math.max(90 - index * 4, 65)}%
                      </p>
                    </div>
                  ))}
                  {items.length === 0 ? (
                    <p className={`text-xs ${toneClass}`}>{t('dashboard.employer.candidates.empty')}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </article>
      ) : null}

      {activeSection === 'operations' ? (
        <article className={`mt-4 ${panelClass}`}>
          <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {t('dashboard.employer.operations.title')}
          </h2>
          <p className={`mt-1 text-sm ${toneClass}`}>{t('dashboard.employer.operations.subtitle')}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              t('dashboard.employer.operations.cards.token'),
              t('dashboard.employer.operations.cards.checkin'),
              t('dashboard.employer.operations.cards.anomaly'),
              t('dashboard.employer.operations.cards.supervisor'),
            ].map((label) => (
              <div
                key={label}
                className={`rounded-xl border p-3 ${
                  theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {label}
                </p>
                <p className={`mt-1 text-xs ${toneClass}`}>{t('dashboard.employer.operations.readOnly')}</p>
              </div>
            ))}
          </div>
        </article>
      ) : null}

      {activeSection === 'billing' ? (
        <article className={`mt-4 ${panelClass}`}>
          <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {t('dashboard.employer.billing.title')}
          </h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                {(['all', 'Invoiced', 'PartiallyPaid', 'Paid', 'Overdue'] as ('all' | ReceivableStatus)[]).map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setReceivableFilter(status)}
                      className={sectionButtonClass(receivableFilter === status)}
                    >
                      {status === 'all'
                        ? t('dashboard.employer.billing.filters.all')
                        : t(`dashboard.employer.billing.receivableStatus.${status}`)}
                    </button>
                  ),
                )}
              </div>
              <div className="space-y-2">
                {filteredReceivables.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border px-3 py-2 text-xs ${
                      theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <p className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                      {t('dashboard.employer.billing.period')}: {item.period}
                    </p>
                    <p className={toneClass}>
                      {t('dashboard.employer.billing.total')}: {item.total.toLocaleString()} TRY
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                {(['all', 'Pending', 'Processing', 'Paid', 'Failed'] as ('all' | PayoutStatus)[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setPayoutFilter(status)}
                    className={sectionButtonClass(payoutFilter === status)}
                  >
                    {status === 'all'
                      ? t('dashboard.employer.billing.filters.all')
                      : t(`dashboard.employer.billing.payoutStatus.${status}`)}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {filteredPayouts.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border px-3 py-2 text-xs ${
                      theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <p className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{item.worker}</p>
                    <p className={toneClass}>
                      {item.amount.toLocaleString()} {item.currency}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className={`mt-4 text-xs ${toneClass}`}>{t('dashboard.employer.fallback.noBillingApi')}</p>
        </article>
      ) : null}

      {activeSection === 'reports' ? (
        <article className={`mt-4 ${panelClass}`}>
          <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {t('dashboard.employer.reports.title')}
          </h2>
          <p className={`mt-1 text-sm ${toneClass}`}>{t('dashboard.employer.reports.subtitle')}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              t('dashboard.employer.reports.filters.range'),
              t('dashboard.employer.reports.filters.status'),
              t('dashboard.employer.reports.filters.category'),
              t('dashboard.employer.reports.filters.location'),
            ].map((filter) => (
              <div
                key={filter}
                className={`rounded-xl border px-3 py-3 text-xs ${
                  theme === 'dark'
                    ? 'border-white/10 bg-white/[0.03] text-white/80'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                {filter}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {(['json', 'csv', 'pdf', 'excel'] as ExportFormat[]).map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => setReportFormat(format)}
                className={sectionButtonClass(reportFormat === format)}
              >
                {format.toUpperCase()}
              </button>
            ))}
            <button type="button" className={sectionButtonClass(false)}>
              {t('dashboard.employer.reports.queueExport')}
            </button>
          </div>
          <p className={`mt-4 text-xs ${toneClass}`}>{t('dashboard.employer.reports.readOnly')}</p>
        </article>
      ) : null}
    </section>
  )
}
