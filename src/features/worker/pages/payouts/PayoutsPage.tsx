import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { WorkerPayoutItem } from '../../../../api/worker/worker-portal'
import { workerPortalApi } from '../../../../api/worker/worker-portal'
import { useTheme } from '../../../../theme/theme-context'
import { DashboardSurface, StatePanel } from '../../../../shared/ui/ui-primitives'
import { WorkerPillBadge, WorkerPrimaryButton, WorkerSectionHeader } from '../../worker-ui'
import { useWorkerAsyncData } from '../../hooks/useWorkerAsyncData'

export type PayoutsPageProps = {
  embedded?: boolean
}

export function PayoutsPage({ embedded = false }: PayoutsPageProps = {}) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const query = useCallback(() => workerPortalApi.listPayouts(), [])
  const { loading, error, data: items } = useWorkerAsyncData<WorkerPayoutItem[]>(
    [],
    ['worker', 'payouts'],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
  )
  const [confirmedIds, setConfirmedIds] = useState<number[]>([])

  const renderHeader = () =>
    embedded ? null : (
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.workerPortal.pages.payouts.title')}
        subtitle={t('dashboard.workerPortal.pages.payouts.subtitle')}
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
  if (items.length === 0) {
    return (
      <div className="space-y-4">
        {renderHeader()}
        <StatePanel text={t('dashboard.workerPortal.states.empty')} theme={theme} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {renderHeader()}
      <div className="grid gap-3 lg:grid-cols-2">
        {items.map((item) => (
          <DashboardSurface key={item.id} theme={theme}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.postingTitle}</p>
                <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>{item.amount}</p>
              </div>
              <WorkerPillBadge tone={theme} emphasis={payoutBadgeEmphasis(item.status)}>
                {t(`dashboard.workerPortal.payouts.status.${item.status}`)}
              </WorkerPillBadge>
            </div>
            {item.canConfirm ? (
              <WorkerPrimaryButton
                tone={theme}
                disabled={confirmedIds.includes(item.id)}
                onClick={() => setConfirmedIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]))}
                className="mt-3 w-full sm:w-auto"
              >
                {confirmedIds.includes(item.id)
                  ? t('dashboard.workerPortal.payouts.confirmed')
                  : t('dashboard.workerPortal.payouts.confirm')}
              </WorkerPrimaryButton>
            ) : null}
          </DashboardSurface>
        ))}
      </div>
    </div>
  )
}

function payoutBadgeEmphasis(status: WorkerPayoutItem['status']): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (status === 'paid') return 'success'
  if (status === 'failed') return 'danger'
  if (status === 'pending') return 'warning'
  if (status === 'processing') return 'info'
  return 'neutral'
}
