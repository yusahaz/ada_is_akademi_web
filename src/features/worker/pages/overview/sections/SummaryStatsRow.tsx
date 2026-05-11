import { CalendarClock, ScanLine, ShieldCheck } from 'lucide-react'

import type { WorkerReliabilityScore, WorkerShiftHistoryItem } from '../../../../../api/worker/worker-portal'
import { DashboardSurface } from '../../../../../shared/ui/ui-primitives'
import { cn } from '../../../../../shared/lib/cn'
import { WorkerPillBadge, WorkerPrimaryButton } from '../../../worker-ui'

export function SummaryStatsRow({
  theme,
  upcomingShifts,
  reliability,
  reliabilityEmphasis,
  activeShift,
  onGoActiveShift,
  t,
}: {
  theme: 'dark' | 'light'
  upcomingShifts: WorkerShiftHistoryItem[]
  reliability: WorkerReliabilityScore | null
  reliabilityEmphasis: 'neutral' | 'success' | 'info' | 'warning' | 'danger'
  activeShift: WorkerShiftHistoryItem | null
  onGoActiveShift: () => void
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <DashboardSurface theme={theme}>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white/90' : 'text-slate-800')}>
              {t('dashboard.workerPortal.overview.upcomingShifts')}
            </p>
            <span
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-lg border',
                theme === 'dark' ? 'border-cyan-400/25 bg-cyan-500/10 text-cyan-200' : 'border-sky-200 bg-sky-50 text-sky-700',
              )}
            >
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <div className="space-y-1">
            <p className={cn('font-display text-3xl font-semibold leading-none', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
              {upcomingShifts.length}
            </p>
            <p className={cn('text-xs', theme === 'dark' ? 'text-white/60' : 'text-slate-500')}>
              {upcomingShifts.length > 0 ? t('dashboard.workerPortal.overview.upcomingShifts') : t('dashboard.workerPortal.overview.upcomingShiftsEmpty')}
            </p>
          </div>
          {upcomingShifts.length > 0 ? (
            <div
              className={cn(
                'rounded-xl border px-3 py-2 text-xs',
                theme === 'dark' ? 'border-white/12 bg-white/[0.03] text-white/75' : 'border-slate-200 bg-slate-50 text-slate-600',
              )}
            >
              {t('dashboard.workerPortal.overview.upcomingShiftsHint', {
                date: upcomingShifts[0].shiftDate,
                range: `${upcomingShifts[0].shiftStartTime} - ${upcomingShifts[0].shiftEndTime}`,
              })}
            </div>
          ) : null}
        </div>
      </DashboardSurface>

      <DashboardSurface theme={theme}>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white/90' : 'text-slate-800')}>
              {t('dashboard.workerPortal.overview.reliabilityScore')}
            </p>
            <span
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-lg border',
                theme === 'dark' ? 'border-cyan-400/25 bg-cyan-500/10 text-cyan-200' : 'border-sky-200 bg-sky-50 text-sky-700',
              )}
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn('font-display text-3xl font-semibold leading-none', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
              {reliability?.hasData && reliability.value !== null ? `${reliability.value}%` : '—'}
            </p>
            <div className="min-w-0">
              <WorkerPillBadge tone={theme} emphasis={reliabilityEmphasis}>
                {reliability?.hasData
                  ? t('dashboard.workerPortal.overview.reliabilitySamples', { count: reliability.sampleSize })
                  : t('dashboard.workerPortal.overview.reliabilityNoData')}
              </WorkerPillBadge>
            </div>
          </div>
          <p className={cn('text-xs leading-relaxed', theme === 'dark' ? 'text-white/70' : 'text-slate-600')}>
            {t('dashboard.workerPortal.overview.reliabilityHint')}
          </p>
        </div>
      </DashboardSurface>

      <DashboardSurface theme={theme}>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white/90' : 'text-slate-800')}>
              {t('dashboard.workerPortal.overview.quickCheckInTitle')}
            </p>
            <span
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-lg border',
                theme === 'dark' ? 'border-cyan-400/25 bg-cyan-500/10 text-cyan-200' : 'border-sky-200 bg-sky-50 text-sky-700',
              )}
            >
              <ScanLine className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          {activeShift ? (
            <div className="space-y-2">
              <div
                className={cn(
                  'rounded-xl border px-3 py-2 text-xs sm:text-sm',
                  theme === 'dark' ? 'border-white/12 bg-white/[0.03] text-white/80' : 'border-slate-200 bg-slate-50 text-slate-700',
                )}
              >
                <p className="font-semibold">
                  {activeShift.shiftDate} • {activeShift.shiftStartTime} - {activeShift.shiftEndTime}
                </p>
                <p className="mt-1 text-xs">{t(`dashboard.workerPortal.shiftHistory.status.${activeShift.status}`)}</p>
              </div>
              <WorkerPrimaryButton tone={theme} onClick={onGoActiveShift} className="h-10 w-full justify-center md:w-auto">
                {t('dashboard.workerPortal.overview.quickCheckInCta')}
              </WorkerPrimaryButton>
            </div>
          ) : (
            <p className={cn('text-xs leading-relaxed', theme === 'dark' ? 'text-white/60' : 'text-slate-500')}>
              {t('dashboard.workerPortal.overview.quickCheckInEmpty')}
            </p>
          )}
        </div>
      </DashboardSurface>
    </div>
  )
}
