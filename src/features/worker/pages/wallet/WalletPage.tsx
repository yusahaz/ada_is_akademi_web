import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { useTheme } from '../../../../theme/theme-context'
import { useWorkerLiveCounters } from '../../hooks/useWorkerLiveCounters'
import { WorkerSectionHeader, WorkerTabs, type WorkerTabItem } from '../../worker-ui'
import { PayoutsPage } from '../payouts/PayoutsPage'
import { ReportsPage } from '../reports/ReportsPage'

type WalletTabId = 'payouts' | 'earnings'

const tabIds: WalletTabId[] = ['payouts', 'earnings']

export function WalletPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const counters = useWorkerLiveCounters()

  const requestedTab = searchParams.get('tab') as WalletTabId | null
  const activeTab: WalletTabId = requestedTab && tabIds.includes(requestedTab) ? requestedTab : 'payouts'

  const handleTabChange = (id: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', id)
    setSearchParams(next, { replace: true })
  }

  const tabs: WorkerTabItem[] = useMemo(
    () => [
      {
        id: 'payouts',
        label: t('dashboard.workerPortal.tabs.wallet.payouts'),
        badge: counters.pendingPayouts > 0 ? counters.pendingPayouts : undefined,
      },
      {
        id: 'earnings',
        label: t('dashboard.workerPortal.tabs.wallet.earnings'),
      },
    ],
    [counters.pendingPayouts, t],
  )

  return (
    <div className="space-y-4">
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.workerPortal.pages.wallet.title')}
        subtitle={t('dashboard.workerPortal.pages.wallet.subtitle')}
      />
      <WorkerTabs
        tone={theme}
        items={tabs}
        value={activeTab}
        onChange={handleTabChange}
        ariaLabel={t('dashboard.workerPortal.pages.wallet.title')}
      />

      {activeTab === 'payouts' ? <PayoutsPage embedded /> : null}
      {activeTab === 'earnings' ? <ReportsPage embedded /> : null}
    </div>
  )
}
