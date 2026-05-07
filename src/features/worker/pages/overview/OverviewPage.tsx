import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { JobPostingSummary } from '../../../../api/jobs/job-postings'
import { workerPortalApi, type WorkerReliabilityScore, type WorkerShiftHistoryItem } from '../../../../api/worker/worker-portal'
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

type EarningsPeriod = 'monthly' | 'quarterly' | 'semiAnnual' | 'yearly'

const earningsPeriodOrder: EarningsPeriod[] = ['monthly', 'quarterly', 'semiAnnual', 'yearly']

const earningsChartByPeriod: Record<EarningsPeriod, { mainPath: string; secondaryPath: string; mainDotY: number; secondaryDotY: number }> = {
  monthly: {
    mainPath: 'M8 116 C45 90,70 96,96 76 S150 64,184 52 S242 60,312 18',
    secondaryPath: 'M8 118 C40 104,70 96,102 86 S152 74,184 62 S250 72,312 58',
    mainDotY: 18,
    secondaryDotY: 58,
  },
  quarterly: {
    mainPath: 'M8 112 C40 96,70 90,104 72 S154 58,190 46 S252 42,312 26',
    secondaryPath: 'M8 120 C44 112,76 100,110 90 S164 74,196 64 S252 66,312 48',
    mainDotY: 26,
    secondaryDotY: 48,
  },
  semiAnnual: {
    mainPath: 'M8 118 C44 110,76 96,108 80 S164 60,202 44 S260 36,312 22',
    secondaryPath: 'M8 122 C48 116,82 108,118 96 S176 84,214 72 S266 68,312 54',
    mainDotY: 22,
    secondaryDotY: 54,
  },
  yearly: {
    mainPath: 'M8 120 C46 116,86 104,122 88 S184 56,228 40 S274 32,312 16',
    secondaryPath: 'M8 124 C52 120,94 114,132 100 S190 86,234 70 S280 62,312 44',
    mainDotY: 16,
    secondaryDotY: 44,
  },
}

export function OverviewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEarningsPeriod, setSelectedEarningsPeriod] = useState<EarningsPeriod>('monthly')
  const [matches, setMatches] = useState<JobPostingSummary[]>([])
  const [cards, setCards] = useState<{ key: string; value: string }[]>([])
  const [reliability, setReliability] = useState<WorkerReliabilityScore | null>(null)
  const [upcomingShifts, setUpcomingShifts] = useState<WorkerShiftHistoryItem[]>([])
  const [activeShift, setActiveShift] = useState<WorkerShiftHistoryItem | null>(null)
  const {
    setTheme,
    setTimeline,
  } = useWorkerDashboardStore()

  useEffect(() => {
    setTheme(theme)
  }, [setTheme, theme])

  useEffect(() => {
    let active = true
    void workerPortalApi
      .getOverviewData()
      .then(({ reportCards, openShifts }) => {
        if (!active) return
        setCards(reportCards)
        const topMatches = openShifts.slice(0, 6)
        setMatches(topMatches)
        setTimeline(
          topMatches.slice(0, 4).map((item, index) => {
            const status: ShiftStatus[] = ['confirmed', 'active', 'completed', 'disputed']
            const anomaly: ShiftAnomaly[] = ['none', 'none', 'expiredToken', 'locationMismatch']
            return {
              id: `${item.id}`,
              employerName: `Employer #${item.employerId}`,
              category: item.title,
              day: item.shiftDate,
              timeRange: `${item.shiftStartTime} - ${item.shiftEndTime}`,
              status: status[index % status.length],
              anomaly: anomaly[index % anomaly.length],
            } satisfies WorkerShiftTimelineItem
          }),
        )
        setError(null)
      })
      .catch(() => {
        if (!active) return
        setError(t('dashboard.workerPortal.states.fetchError'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    void workerPortalApi.getReliabilityScore().then((score) => {
      if (!active) return
      setReliability(score)
    })

    void workerPortalApi.getUpcomingShiftAssignments(4).then((shifts) => {
      if (!active) return
      setUpcomingShifts(shifts)
    })

    void workerPortalApi.getActiveShiftAssignment().then((shift) => {
      if (!active) return
      setActiveShift(shift)
    })

    return () => {
      active = false
    }
  }, [setTimeline, t])

  const monthlyEarningsRaw = cards.find((c) => c.key === 'monthlyEarnings')?.value ?? '0'
  const monthlyEarningsNumeric = useMemo(() => Number(monthlyEarningsRaw.replace(/[^\d.-]/g, '')) || 0, [monthlyEarningsRaw])
  const monthlyCurrency = useMemo(() => monthlyEarningsRaw.replace(/[\d\s.,-]/g, '').trim() || 'TRY', [monthlyEarningsRaw])
  const periodMultipliers: Record<EarningsPeriod, number> = {
    monthly: 1,
    quarterly: 3,
    semiAnnual: 6,
    yearly: 12,
  }
  const selectedEarningsValue = monthlyEarningsNumeric * periodMultipliers[selectedEarningsPeriod]
  const selectedChart = earningsChartByPeriod[selectedEarningsPeriod]

  const periodLabelKeyMap: Record<EarningsPeriod, string> = {
    monthly: 'dashboard.workerPortal.overview.periodMonthly',
    quarterly: 'dashboard.workerPortal.overview.periodQuarterly',
    semiAnnual: 'dashboard.workerPortal.overview.periodSemiAnnual',
    yearly: 'dashboard.workerPortal.overview.periodYearly',
  }

  const selectedPeriodLabel = t(periodLabelKeyMap[selectedEarningsPeriod])
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
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {matches.slice(0, 4).map((item, index) => {
                    const score = Math.max(68, 92 - index * 8)
                    return (
                      <article
                        key={item.id}
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
                              {t('dashboard.workerPortal.overview.employerPrefix', { id: item.employerId })}
                            </p>
                          </div>
                          <div className="text-end">
                            <p className={cn('text-3xl font-semibold leading-none', theme === 'dark' ? 'text-cyan-300' : 'text-sky-700')}>
                              {score}%
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
              </DashboardSurface>

              <DashboardSurface theme={theme}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className={cn('text-lg font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                    {t('dashboard.workerPortal.overview.completedShiftsTitle')}
                  </h3>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {matches.slice(0, 4).map((item) => (
                    <article
                      key={`completed-${item.id}`}
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
                            {t('dashboard.workerPortal.overview.employerPrefix', { id: item.employerId })}
                          </p>
                        </div>
                        <div className="text-end">
                          <p className={cn('text-xl font-semibold leading-none', theme === 'dark' ? 'text-cyan-300' : 'text-sky-700')}>
                            {item.wageAmount} {item.wageCurrency}
                          </p>
                          <p className={cn('mt-1 text-xs', theme === 'dark' ? 'text-white/60' : 'text-slate-600')}>
                            {t('dashboard.workerPortal.overview.shiftEarningLabel')}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </DashboardSurface>
            </div>

            <DashboardSurface theme={theme}>
              <h3 className={cn('text-lg font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                {t('dashboard.workerPortal.widgets.earnings.title')}
              </h3>
              <div className={cn('mt-3 rounded-2xl border p-4', theme === 'dark' ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50')}>
                <div className="flex items-start justify-between">
                  <p className={cn('text-4xl font-semibold leading-none', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                    {selectedEarningsValue} {monthlyCurrency}
                  </p>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {earningsPeriodOrder.map((period) => {
                      const isActive = selectedEarningsPeriod === period
                      return (
                        <button
                          key={period}
                          type="button"
                          onClick={() => setSelectedEarningsPeriod(period)}
                          className={cn(
                            'rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors',
                            isActive
                              ? theme === 'dark'
                                ? 'bg-cyan-500/20 text-cyan-300'
                                : 'bg-sky-100 text-sky-700'
                              : theme === 'dark'
                                ? 'bg-white/10 text-white/65 hover:bg-white/15'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300',
                          )}
                        >
                          {t(periodLabelKeyMap[period])}
                        </button>
                      )
                    })}
                  </div>
                </div>
                {selectedEarningsValue > 0 ? (
                  <svg viewBox="0 0 320 130" className="mt-4 h-36 w-full">
                    <defs>
                      <linearGradient id="lineA" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#2dd4bf" />
                      </linearGradient>
                      <linearGradient id="lineB" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#a78bfa" />
                      </linearGradient>
                    </defs>
                    <path d={selectedChart.mainPath} fill="none" stroke="url(#lineA)" strokeWidth="4" />
                    <path d={selectedChart.secondaryPath} fill="none" stroke="url(#lineB)" strokeWidth="3" />
                    <circle cx="312" cy={selectedChart.mainDotY} r="5" fill="#22d3ee" />
                    <circle cx="312" cy={selectedChart.secondaryDotY} r="4" fill="#a78bfa" />
                  </svg>
                ) : (
                  <p className={cn('mt-4 text-sm', theme === 'dark' ? 'text-white/65' : 'text-slate-600')}>
                    {t('dashboard.workerPortal.widgets.earnings.empty')}
                  </p>
                )}
                {selectedEarningsValue > 0 ? (
                  <p className={cn('mt-2 text-xs', theme === 'dark' ? 'text-white/60' : 'text-slate-600')}>
                    {t('dashboard.workerPortal.overview.periodSelectedPrefix', { period: selectedPeriodLabel })}
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
