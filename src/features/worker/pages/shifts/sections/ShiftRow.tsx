import type { WorkerShiftHistoryItem } from '../../../../../api/worker/worker-portal'
import { WorkerPillBadge } from '../../../worker-ui'
import { shiftStatusEmphasis } from './shift-utils'

export function ShiftRow({
  item,
  theme,
  t,
}: {
  item: WorkerShiftHistoryItem
  theme: 'dark' | 'light'
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          {item.shiftDate} • {item.shiftStartTime} - {item.shiftEndTime}
        </p>
        <p className={`mt-0.5 text-xs ${theme === 'dark' ? 'text-white/65' : 'text-slate-600'}`}>
          {t('dashboard.workerPortal.overview.employerPrefix', { id: item.jobPostingId })}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <WorkerPillBadge tone={theme} emphasis={shiftStatusEmphasis(item.status)}>
          {t(`dashboard.workerPortal.shiftHistory.status.${item.status}`)}
        </WorkerPillBadge>
        {item.isAnomalyFlagged ? (
          <WorkerPillBadge tone={theme} emphasis="warning">
            {t('dashboard.workerPortal.shiftHistory.anomaly')}
          </WorkerPillBadge>
        ) : null}
      </div>
    </div>
  )
}
