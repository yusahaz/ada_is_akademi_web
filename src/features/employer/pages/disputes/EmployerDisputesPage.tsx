import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { DashboardSurface, StatePanel } from '../../../../shared/ui/ui-primitives'
import { useTheme } from '../../../../theme/theme-context'
import { WorkerSectionHeader } from '../../../worker/worker-ui'
import { useEmployerPortal } from '../../portal/use-employer-portal'
import { DisputesList } from './sections'

type DisputeItem = {
  id: number | string
  title: string
  detail: string
  severity: 'warning' | 'danger'
}

export function EmployerDisputesPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { disputes: disputesFromApi } = useEmployerPortal()
  const toneClass = theme === 'dark' ? 'text-white/70' : 'text-slate-600'

  const disputes = useMemo<DisputeItem[]>(() => {
    if (disputesFromApi.length === 0) {
      return []
    }
    return disputesFromApi.map((item) => ({
      id: item.disputeId,
      title: item.reasonText || item.reasonCode,
      detail: t('dashboard.employerSpot.disputes.itemDetail', {
        id: item.assignmentId,
        workerId: item.workerId,
      }),
      severity: item.isAnomalyRelated ? 'danger' : 'warning',
    }))
  }, [disputesFromApi, t])

  return (
    <div className="space-y-4">
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.employerPortal.pages.disputes.title')}
        subtitle={t('dashboard.employerPortal.pages.disputes.subtitle')}
      />

      <DashboardSurface theme={theme}>
        <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          {t('dashboard.employerSpot.disputes.title')}
        </h2>
        <p className={`mt-1 text-sm ${toneClass}`}>{t('dashboard.employerSpot.disputes.subtitle')}</p>

        {disputes.length === 0 ? (
          <div className="mt-4">
            <StatePanel theme={theme} text={t('dashboard.employerSpot.disputes.empty')} />
          </div>
        ) : <DisputesList theme={theme} disputes={disputes} />}

        <p className={`mt-4 text-xs ${toneClass}`}>{t('dashboard.employerSpot.disputes.hint')}</p>
      </DashboardSurface>
    </div>
  )
}

