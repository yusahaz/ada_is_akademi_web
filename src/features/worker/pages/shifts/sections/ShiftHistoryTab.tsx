import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { workerPortalApi, type WorkerShiftHistoryItem } from '../../../../../api/worker/worker-portal'
import { DashboardSurface, StatePanel } from '../../../../../shared/ui/ui-primitives'
import { useTheme } from '../../../../../theme/theme-context'
import { useWorkerAsyncData } from '../../../hooks/useWorkerAsyncData'
import { ShiftRow } from './ShiftRow'

export function ShiftHistoryTab() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const query = useCallback(() => workerPortalApi.listShiftHistory(20, 0), [])
  const { loading, error, data: items } = useWorkerAsyncData<WorkerShiftHistoryItem[]>(
    [],
    ['worker', 'shifts', 'history'],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
  )

  if (loading) return <StatePanel text={t('dashboard.workerPortal.states.loading')} theme={theme} />
  if (error) return <StatePanel text={error} theme={theme} isError />
  if (items.length === 0) return <StatePanel text={t('dashboard.workerPortal.shiftHistory.empty')} theme={theme} />

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {items.map((item) => (
        <DashboardSurface key={item.assignmentId} theme={theme}>
          <ShiftRow item={item} theme={theme} t={t} locale={i18n.language} />
        </DashboardSurface>
      ))}
    </div>
  )
}
