import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { jobPostingsApi, type JobPostingSummary, semanticSimilarityToPercent } from '../../../../api/jobs/job-postings'
import {
  workerPortalApi,
  type WorkerReliabilityScore,
  type WorkerShiftHistoryItem,
} from '../../../../api/worker/worker-portal'
import { useTheme } from '../../../../theme/theme-context'
import { DashboardSurface, StatePanel } from '../../../../shared/ui/ui-primitives'
import {
  useWorkerDashboardStore,
  type ShiftAnomaly,
  type ShiftStatus,
  type WorkerShiftTimelineItem,
} from '../../store/worker-dashboard-store'
import { cn } from '../../../../shared/lib/cn'
import { SummaryStatsRow } from './sections'

function buildPostingLookup(postings: JobPostingSummary[]): Map<number, JobPostingSummary> {
  const map = new Map<number, JobPostingSummary>()
  postings.forEach((p) => map.set(p.id, p))
  return map
}

function mapTimelineShiftStatus(assignment: WorkerShiftHistoryItem): ShiftStatus {
  if (assignment.isAnomalyFlagged) return 'disputed'
  if (assignment.status === 'checkedOut') return 'completed'
  if (assignment.status === 'checkedIn' || assignment.status === 'awaitingMutualQr') return 'active'
  return 'confirmed'
}

function mapTimelineAnomaly(assignment: WorkerShiftHistoryItem): ShiftAnomaly {
  if (!assignment.isAnomalyFlagged) return 'none'
  const c = (assignment.anomalyCode ?? '').toLowerCase()
  if (c.includes('location') || c.includes('geo')) return 'locationMismatch'
  if (c.includes('token') || c.includes('expired') || c.includes('qr')) return 'expiredToken'
  return 'none'
}

function mapAssignmentToTimelineItem(
  assignment: WorkerShiftHistoryItem,
  postingById: Map<number, JobPostingSummary>,
  t: (key: string, options?: Record<string, unknown>) => string,
): WorkerShiftTimelineItem {
  const posting = postingById.get(assignment.jobPostingId)
  const label =
    posting?.title ??
    t('dashboard.workerPortal.overview.jobPostingRef', { id: assignment.jobPostingId })
  return {
    id: String(assignment.assignmentId),
    employerName: label,
    category: label,
    day: assignment.shiftDate,
    timeRange: `${assignment.shiftStartTime} - ${assignment.shiftEndTime}`,
    status: mapTimelineShiftStatus(assignment),
    anomaly: mapTimelineAnomaly(assignment),
  }
}

export function OverviewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cards, setCards] = useState<{ key: string; value: string }[]>([])
  const [semanticMatches, setSemanticMatches] = useState<Awaited<ReturnType<typeof jobPostingsApi.listSemanticMatched>>>([])
  const [completedAssignments, setCompletedAssignments] = useState<WorkerShiftHistoryItem[]>([])
  const [reliability, setReliability] = useState<WorkerReliabilityScore | null>(null)
  const [upcomingShifts, setUpcomingShifts] = useState<WorkerShiftHistoryItem[]>([])
  const [activeShift, setActiveShift] = useState<WorkerShiftHistoryItem | null>(null)
  const { setTheme, setTimeline } = useWorkerDashboardStore()

  useEffect(() => {
    setTheme(theme)
  }, [setTheme, theme])

  useEffect(() => {
    let active = true
    setLoading(true)

    void Promise.all([
      workerPortalApi.getOverviewData(),
      jobPostingsApi.listSemanticMatched({ limit: 8 }),
      workerPortalApi.listShiftHistory(24),
      workerPortalApi.getReliabilityScore(),
      workerPortalApi.getUpcomingShiftAssignments(4),
      workerPortalApi.getActiveShiftAssignment(),
    ])
      .then(([overview, semantic, history, reliabilityScore, upcoming, activeA]) => {
        if (!active) return
        setCards(overview.reportCards)
        setSemanticMatches(semantic)
        const postingById = buildPostingLookup(overview.openShifts)
        setCompletedAssignments(history.filter((h) => h.status === 'checkedOut').slice(0, 4))
        setTimeline(history.slice(0, 8).map((a) => mapAssignmentToTimelineItem(a, postingById, t)))
        setReliability(reliabilityScore)
        setUpcomingShifts(upcoming)
        setActiveShift(activeA)
        setError(null)
      })
      .catch(() => {
        if (!active) return
        setError(t('dashboard.workerPortal.states.fetchError'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [setTimeline, t])

  const monthlyEarningsRaw = cards.find((c) => c.key === 'monthlyEarnings')?.value ?? '0'
  const monthlyEarningsNumeric = useMemo(() => Number(monthlyEarningsRaw.replace(/[^\d.-]/g, '')) || 0, [monthlyEarningsRaw])
  const monthlyCurrency = useMemo(() => monthlyEarningsRaw.replace(/[\d\s.,-]/g, '').trim() || 'TRY', [monthlyEarningsRaw])
  const paidPayoutsRaw = cards.find((c) => c.key === 'paidPayouts')?.value ?? '0'
  const completedShiftsCountRaw = cards.find((c) => c.key === 'completedShifts')?.value ?? '0'

  const reliabilityEmphasis = (() => {
    if (!reliability?.hasData || reliability.value === null) return 'neutral' as const
    if (reliability.value >= 80) return 'success' as const
    if (reliability.value >= 60) return 'info' as const
    if (reliability.value >= 40) return 'warning' as const
    return 'danger' as const
  })()

  return (
    <div className="space-y-4">
      {!loading && !error ? (
        <>
          <SummaryStatsRow
            theme={theme}
            upcomingShifts={upcomingShifts}
            reliability={reliability}
            reliabilityEmphasis={reliabilityEmphasis}
            activeShift={activeShift}
            onGoActiveShift={() => navigate('/worker/shifts?tab=active')}
            t={t}
          />

          <div className="grid gap-3 xl:grid-cols-[1.55fr_1fr]">
            <div className="space-y-3">
              <DashboardSurface theme={theme}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className={cn('text-lg font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                    {t('dashboard.workerPortal.overview.bestMatchesTitle')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigate('/worker/jobs?tab=recommendations')}
                    className={cn(
                      'inline-flex items-center gap-1 text-xs font-semibold',
                      theme === 'dark' ? 'text-cyan-500' : 'text-sky-700',
                    )}
                  >
                    {t('dashboard.workerPortal.widgets.timeline.viewAll')}
                    <ChevronRight size={14} />
                  </button>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {semanticMatches.slice(0, 4).map((item) => {
                    const pct = semanticSimilarityToPercent(item.similarityScore)
                    return (
                      <article
                        key={item.jobPostingId}
                        className={cn(
                          'rounded-2xl border px-3 py-3',
                          theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50',
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                              {item.title}
                            </p>
                            <p className={cn('mt-0.5 text-xs', theme === 'dark' ? 'text-white/65' : 'text-slate-600')}>
                              {t('dashboard.workerPortal.overview.semanticMatchSchedule', {
                                date: item.shiftDate,
                                start: item.shiftStartTime,
                                end: item.shiftEndTime,
                              })}
                            </p>
                          </div>
                          <div className="text-end">
                            <p className={cn('text-3xl font-semibold leading-none', theme === 'dark' ? 'text-cyan-300' : 'text-sky-700')}>
                              {pct}%
                            </p>
                            <p className={cn('mt-1 text-xs', theme === 'dark' ? 'text-white/60' : 'text-slate-600')}>
                              {t('dashboard.workerPortal.widgets.aiMatch.scoreLabel')}
                            </p>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
                {semanticMatches.length === 0 ? (
                  <p className={cn('mt-3 text-sm', theme === 'dark' ? 'text-white/65' : 'text-slate-600')}>
                    {t('dashboard.workerPortal.overview.bestMatchesEmpty')}
                  </p>
                ) : null}
              </DashboardSurface>

              <DashboardSurface theme={theme}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className={cn('text-lg font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                    {t('dashboard.workerPortal.overview.completedShiftsTitle')}
                  </h3>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {completedAssignments.map((assignment) => {
                    return (
                      <CompletedShiftCard
                        key={assignment.assignmentId}
                        theme={theme}
                        assignment={assignment}
                        t={t}
                      />
                    )
                  })}
                </div>
                {completedAssignments.length === 0 ? (
                  <p className={cn('mt-3 text-sm', theme === 'dark' ? 'text-white/65' : 'text-slate-600')}>
                    {t('dashboard.workerPortal.states.empty')}
                  </p>
                ) : null}
              </DashboardSurface>
            </div>

            <DashboardSurface theme={theme}>
              <h3 className={cn('text-lg font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                {t('dashboard.workerPortal.widgets.earnings.title')}
              </h3>
              <div className={cn('mt-3 space-y-3 rounded-2xl border p-4', theme === 'dark' ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50')}>
                <div>
                  <p className={cn('text-xs font-semibold uppercase tracking-wide', theme === 'dark' ? 'text-white/55' : 'text-slate-500')}>
                    {t('dashboard.workerPortal.overview.monthlyEarnings')}
                  </p>
                  <p className={cn('mt-1 text-3xl font-semibold leading-none', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                    {monthlyEarningsNumeric > 0 ? `${monthlyEarningsNumeric.toLocaleString('tr-TR')} ${monthlyCurrency}` : '—'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 border-t border-slate-200/80 pt-3 text-sm dark:border-white/10">
                  <div>
                    <p className={cn('text-xs', theme === 'dark' ? 'text-white/55' : 'text-slate-500')}>
                      {t('dashboard.workerPortal.overview.paidPayouts')}
                    </p>
                    <p className={cn('font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>{paidPayoutsRaw}</p>
                  </div>
                  <div>
                    <p className={cn('text-xs', theme === 'dark' ? 'text-white/55' : 'text-slate-500')}>
                      {t('dashboard.workerPortal.overview.completedShifts')}
                    </p>
                    <p className={cn('font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                      {completedShiftsCountRaw}
                    </p>
                  </div>
                </div>
                {monthlyEarningsNumeric <= 0 ? (
                  <p className={cn('text-sm', theme === 'dark' ? 'text-white/65' : 'text-slate-600')}>
                    {t('dashboard.workerPortal.widgets.earnings.empty')}
                  </p>
                ) : null}
              </div>
            </DashboardSurface>
          </div>
        </>
      ) : null}

      {loading ? <StatePanel text={t('dashboard.workerPortal.states.loading')} theme={theme} /> : null}
      {error ? <StatePanel text={error} theme={theme} isError /> : null}
    </div>
  )
}

function CompletedShiftCard({
  theme,
  assignment,
  t,
}: {
  theme: 'dark' | 'light'
  assignment: WorkerShiftHistoryItem
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  const [posting, setPosting] = useState<JobPostingSummary | null>(null)

  useEffect(() => {
    let on = true
    void jobPostingsApi
      .getById({ jobPostingId: assignment.jobPostingId })
      .then((detail) => {
        if (!on) return
        setPosting({
          id: detail.id,
          title: detail.title,
          shiftDate: detail.shiftDate,
          shiftStartTime: detail.shiftStartTime,
          shiftEndTime: detail.shiftEndTime,
          wageAmount: detail.wageAmount,
          wageCurrency: detail.wageCurrency,
          employerId: detail.employerId,
          headCount: detail.headCount,
        })
      })
      .catch(() => {
        if (!on) return
        setPosting(null)
      })
    return () => {
      on = false
    }
  }, [assignment.jobPostingId])

  const title = posting?.title ?? t('dashboard.workerPortal.overview.jobPostingRef', { id: assignment.jobPostingId })

  return (
    <article
      className={cn(
        'rounded-2xl border px-3 py-3',
        theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>{title}</p>
          <p className={cn('mt-0.5 text-xs', theme === 'dark' ? 'text-white/65' : 'text-slate-600')}>
            {t('dashboard.workerPortal.overview.semanticMatchSchedule', {
              date: assignment.shiftDate,
              start: assignment.shiftStartTime,
              end: assignment.shiftEndTime,
            })}
          </p>
          {posting ? (
            <p className={cn('mt-0.5 text-xs', theme === 'dark' ? 'text-white/65' : 'text-slate-600')}>
              {t('dashboard.workerPortal.overview.employerPrefix', { id: posting.employerId })}
            </p>
          ) : null}
        </div>
        <div className="text-end">
          <p className={cn('text-xl font-semibold leading-none', theme === 'dark' ? 'text-cyan-300' : 'text-sky-700')}>
            {posting ? `${posting.wageAmount} ${posting.wageCurrency}` : '—'}
          </p>
          <p className={cn('mt-1 text-xs', theme === 'dark' ? 'text-white/60' : 'text-slate-600')}>
            {t('dashboard.workerPortal.overview.shiftEarningLabel')}
          </p>
        </div>
      </div>
    </article>
  )
}
