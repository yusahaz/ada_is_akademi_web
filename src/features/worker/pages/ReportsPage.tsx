import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { WorkerReportCard } from '../../../api/worker-portal'
import { workerPortalApi } from '../../../api/worker-portal'
import { useTheme } from '../../../theme/theme-context'
import { DashboardSurface, StatePanel } from '../../../components/dashboard/ui-primitives'
import { WorkerSectionHeader } from '../worker-ui'
import { useWorkerAsyncData } from '../hooks/useWorkerAsyncData'

export type ReportsPageProps = {
  embedded?: boolean
}

export function ReportsPage({ embedded = false }: ReportsPageProps = {}) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const query = useCallback(() => workerPortalApi.getReportCards(), [])
  const { loading, error, data: cards } = useWorkerAsyncData<WorkerReportCard[]>(
    [],
    ['worker', 'report-cards'],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
  )

  const renderHeader = () =>
    embedded ? null : (
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.workerPortal.pages.reports.title')}
        subtitle={t('dashboard.workerPortal.pages.reports.subtitle')}
      />
    )

  if (loading) {
    return (
      <div className="space-y-4">
        {renderHeader()}
        <StatePanel text={t('dashboard.workerPortal.states.loading')} theme={theme} />
      </div>
    )
  }
  if (error) {
    return (
      <div className="space-y-4">
        {renderHeader()}
        <StatePanel text={error} theme={theme} isError />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {renderHeader()}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, index) => (
          <DashboardSurface key={card.key} theme={theme} className={index === 0 ? 'sm:col-span-2' : ''}>
            <p className={`text-xs ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>{t(`dashboard.workerPortal.overview.${card.key}`)}</p>
            <p className={`mt-3 font-display text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{card.value}</p>
          </DashboardSurface>
        ))}
      </div>
    </div>
  )
}
