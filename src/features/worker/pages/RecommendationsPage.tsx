import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { JobPostingSummary } from '../../../api/job-postings'
import { workerPortalApi } from '../../../api/worker-portal'
import { DashboardSurface, StatePanel } from '../../../components/dashboard/ui-primitives'
import { useTheme } from '../../../theme/theme-context'
import { useWorkerAsyncData } from '../hooks/useWorkerAsyncData'
import { WorkerSectionHeader } from '../worker-ui'

export function RecommendationsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const query = useCallback(() => workerPortalApi.listSemanticMatchedShifts(), [])
  const { loading, error, data: items } = useWorkerAsyncData<JobPostingSummary[]>(
    [],
    ['worker', 'semantic-matched-shifts'],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <WorkerSectionHeader
          tone={theme}
          title={t('dashboard.workerPortal.pages.recommendations.title')}
          subtitle={t('dashboard.workerPortal.pages.recommendations.subtitle')}
        />
        <StatePanel text={t('dashboard.workerPortal.states.loading')} theme={theme} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <WorkerSectionHeader
          tone={theme}
          title={t('dashboard.workerPortal.pages.recommendations.title')}
          subtitle={t('dashboard.workerPortal.pages.recommendations.subtitle')}
        />
        <StatePanel text={error} theme={theme} isError />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <WorkerSectionHeader
          tone={theme}
          title={t('dashboard.workerPortal.pages.recommendations.title')}
          subtitle={t('dashboard.workerPortal.pages.recommendations.subtitle')}
        />
        <StatePanel text={t('dashboard.workerPortal.overview.bestMatchesEmpty')} theme={theme} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.workerPortal.pages.recommendations.title')}
        subtitle={t('dashboard.workerPortal.pages.recommendations.subtitle')}
      />
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <DashboardSurface key={item.id} theme={theme}>
            <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {item.title}
            </p>
            <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
              {item.shiftDate} • {item.shiftStartTime} - {item.shiftEndTime}
            </p>
            <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-cyan-200' : 'text-cyan-700'}`}>
              {item.wageAmount} {item.wageCurrency}
            </p>
          </DashboardSurface>
        ))}
      </div>
    </div>
  )
}
