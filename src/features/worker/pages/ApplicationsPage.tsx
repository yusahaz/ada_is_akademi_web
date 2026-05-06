import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { WorkerApplicationItem } from '../../../api/worker-portal'
import { workerPortalApi } from '../../../api/worker-portal'
import { useTheme } from '../../../theme/theme-context'
import { DashboardSurface, StatePanel } from '../../../components/dashboard/ui-primitives'
import { WorkerPillBadge, WorkerSectionHeader } from '../worker-ui'
import { useWorkerAsyncData } from '../hooks/useWorkerAsyncData'

export function ApplicationsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const query = useCallback(() => workerPortalApi.listApplications(), [])
  const { loading, error, data: items } = useWorkerAsyncData<WorkerApplicationItem[]>(
    [],
    ['worker', 'applications'],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <WorkerSectionHeader tone={theme} title={t('dashboard.workerPortal.pages.applications.title')} subtitle={t('dashboard.workerPortal.pages.applications.subtitle')} />
        <StatePanel text={t('dashboard.workerPortal.states.loading')} theme={theme} />
      </div>
    )
  }
  if (error) {
    return (
      <div className="space-y-4">
        <WorkerSectionHeader tone={theme} title={t('dashboard.workerPortal.pages.applications.title')} subtitle={t('dashboard.workerPortal.pages.applications.subtitle')} />
        <StatePanel text={error} theme={theme} isError />
      </div>
    )
  }
  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <WorkerSectionHeader tone={theme} title={t('dashboard.workerPortal.pages.applications.title')} subtitle={t('dashboard.workerPortal.pages.applications.subtitle')} />
        <StatePanel text={t('dashboard.workerPortal.states.empty')} theme={theme} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <WorkerSectionHeader tone={theme} title={t('dashboard.workerPortal.pages.applications.title')} subtitle={t('dashboard.workerPortal.pages.applications.subtitle')} />
      <div className="grid gap-3 lg:grid-cols-2">
        {items.map((item) => (
          <DashboardSurface key={item.id} theme={theme}>
            <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.title}</p>
            <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
              {item.shiftDate} - {item.shiftRange}
            </p>
            <div className="mt-3">
              <WorkerPillBadge tone={theme} emphasis={applicationBadgeEmphasis(item.status)}>
                {t(`dashboard.workerPortal.applications.status.${item.status}`)}
              </WorkerPillBadge>
            </div>
          </DashboardSurface>
        ))}
      </div>
    </div>
  )
}

function applicationBadgeEmphasis(status: WorkerApplicationItem['status']): 'success' | 'danger' | 'warning' | 'neutral' | 'info' {
  if (status === 'accepted') return 'success'
  if (status === 'rejected' || status === 'expired') return 'danger'
  if (status === 'pending') return 'warning'
  return 'neutral'
}
