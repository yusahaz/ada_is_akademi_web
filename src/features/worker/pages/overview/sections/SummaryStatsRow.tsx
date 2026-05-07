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
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <DashboardSurface theme={theme}>
        <div className="flex items-center justify-between gap-2">
          <p className={cn('text-xs font-semibold uppercase tracking-[0.08em]', theme === 'dark' ? 'text-white/65' : 'text-slate-500')}>
            {t('dashboard.workerPortal.overview.upcomingShifts')}
          </p>
          <CalendarClock className={cn('h-4 w-4', theme === 'dark' ? 'text-cyan-300' : 'text-sky-700')} aria-hidden="true" />
        </div>
        <p className={cn('mt-2 font-display text-3xl font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
          {upcomingShifts.length}
        </p>
        {upcomingShifts.length > 0 ? (
          <p className={cn('mt-1 text-xs', theme === 'dark' ? 'text-white/65' : 'text-slate-600')}>
            {t('dashboard.workerPortal.overview.upcomingShiftsHint', {
              date: upcomingShifts[0].shiftDate,
              range: `${upcomingShifts[0].shiftStartTime} - ${upcomingShifts[0].shiftEndTime}`,
            })}
          </p>
        ) : (
          <p className={cn('mt-1 text-xs', theme === 'dark' ? 'text-white/55' : 'text-slate-500')}>
            {t('dashboard.workerPortal.overview.upcomingShiftsEmpty')}
          </p>
        )}
      </DashboardSurface>
      <DashboardSurface theme={theme}>
        <div className="flex items-center justify-between gap-2">
          <p className={cn('text-xs font-semibold uppercase tracking-[0.08em]', theme === 'dark' ? 'text-white/65' : 'text-slate-500')}>
            {t('dashboard.workerPortal.overview.reliabilityScore')}
          </p>
          <ShieldCheck className={cn('h-4 w-4', theme === 'dark' ? 'text-cyan-300' : 'text-sky-700')} aria-hidden="true" />
        </div>
        <div className="mt-2 flex items-end gap-2">
          <p className={cn('font-display text-3xl font-semibold leading-none', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
            {reliability?.hasData && reliability.value !== null ? `${reliability.value}%` : '—'}
          </p>
          <WorkerPillBadge tone={theme} emphasis={reliabilityEmphasis}>
            {reliability?.hasData
              ? t('dashboard.workerPortal.overview.reliabilitySamples', { count: reliability.sampleSize })
              : t('dashboard.workerPortal.overview.reliabilityNoData')}
          </WorkerPillBadge>
        </div>
        <p className={cn('mt-1 text-xs', theme === 'dark' ? 'text-white/65' : 'text-slate-600')}>
          {t('dashboard.workerPortal.overview.reliabilityHint')}
        </p>
      </DashboardSurface>
      <DashboardSurface theme={theme}>
        <div className="flex items-center justify-between gap-2">
          <p className={cn('text-xs font-semibold uppercase tracking-[0.08em]', theme === 'dark' ? 'text-white/65' : 'text-slate-500')}>
            {t('dashboard.workerPortal.overview.quickCheckInTitle')}
          </p>
          <ScanLine className={cn('h-4 w-4', theme === 'dark' ? 'text-cyan-300' : 'text-sky-700')} aria-hidden="true" />
        </div>
        {activeShift ? (
          <div className="mt-2 space-y-2">
            <p className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
              {activeShift.shiftDate} • {activeShift.shiftStartTime} - {activeShift.shiftEndTime}
            </p>
            <p className={cn('text-xs', theme === 'dark' ? 'text-white/65' : 'text-slate-600')}>
              {t(`dashboard.workerPortal.shiftHistory.status.${activeShift.status}`)}
            </p>
            <WorkerPrimaryButton tone={theme} onClick={onGoActiveShift} className="w-full sm:w-auto">
              {t('dashboard.workerPortal.overview.quickCheckInCta')}
            </WorkerPrimaryButton>
          </div>
        ) : (
          <p className={cn('mt-2 text-xs', theme === 'dark' ? 'text-white/55' : 'text-slate-500')}>
            {t('dashboard.workerPortal.overview.quickCheckInEmpty')}
          </p>
        )}
      </DashboardSurface>
    </div>
  )
}
