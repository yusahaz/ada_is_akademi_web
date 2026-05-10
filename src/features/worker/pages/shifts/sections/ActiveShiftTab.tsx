import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { workerPortalApi, type WorkerShiftHistoryItem } from '../../../../../api/worker/worker-portal'
import { DashboardSurface, StatePanel } from '../../../../../shared/ui/ui-primitives'
import { useTheme } from '../../../../../theme/theme-context'
import { useWorkerAsyncData } from '../../../hooks/useWorkerAsyncData'
import { WorkerPillBadge } from '../../../worker-ui'
import { ShiftRow } from './ShiftRow'
import { shiftStatusEmphasis } from './shift-utils'

export function ActiveShiftTab() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const query = useCallback(
    () =>
      Promise.all([workerPortalApi.getActiveShiftAssignment(), workerPortalApi.getUpcomingShiftAssignments(5)]).then(
        ([active, upcoming]) => ({ active, upcoming }),
      ),
    [],
  )
  const { loading, error, data } = useWorkerAsyncData<{ active: WorkerShiftHistoryItem | null; upcoming: WorkerShiftHistoryItem[] }>(
    { active: null, upcoming: [] },
    ['worker', 'shifts', 'active'],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
  )

  if (loading) return <StatePanel text={t('dashboard.workerPortal.states.loading')} theme={theme} />
  if (error) return <StatePanel text={error} theme={theme} isError />

  return (
    <div className="space-y-4">
      <DashboardSurface theme={theme}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-xs font-semibold uppercase tracking-[0.08em] ${theme === 'dark' ? 'text-white/65' : 'text-slate-500'}`}>
              {t('dashboard.workerPortal.tabs.myShifts.activeAssignment')}
            </p>
            {data.active ? (
              <>
                <p className={`mt-1 text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {data.active.shiftDate} • {data.active.shiftStartTime} - {data.active.shiftEndTime}
                </p>
                <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-white/65' : 'text-slate-600'}`}>
                  {t('dashboard.workerPortal.overview.employerPrefix', { id: data.active.jobPostingId })}
                </p>
              </>
            ) : (
              <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-white/65' : 'text-slate-600'}`}>
                {t('dashboard.workerPortal.tabs.myShifts.noActive')}
              </p>
            )}
          </div>
          {data.active ? (
            <WorkerPillBadge tone={theme} emphasis={shiftStatusEmphasis(data.active.status)}>
              {t(`dashboard.workerPortal.shiftHistory.status.${data.active.status}`)}
            </WorkerPillBadge>
          ) : null}
        </div>
      </DashboardSurface>
      {data.upcoming.length > 0 ? (
        <DashboardSurface theme={theme}>
          <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {t('dashboard.workerPortal.tabs.myShifts.upcoming')}
          </p>
          <ul className="mt-3 space-y-2">
            {data.upcoming.map((item) => (
              <li key={item.assignmentId}>
                <ShiftRow item={item} theme={theme} t={t} />
              </li>
            ))}
          </ul>
        </DashboardSurface>
      ) : null}
    </div>
  )
}
