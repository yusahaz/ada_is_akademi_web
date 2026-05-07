import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { useTheme } from '../../../../theme/theme-context'
import { useWorkerLiveCounters } from '../../hooks/useWorkerLiveCounters'
import {
  WorkerSectionHeader,
  WorkerTabs,
  type WorkerTabItem,
} from '../../worker-ui'
import { ActiveShiftTab, ShiftHistoryTab } from './sections'

type MyShiftsTabId = 'active' | 'history'

const tabIds: MyShiftsTabId[] = ['active', 'history']

export function MyShiftsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const counters = useWorkerLiveCounters()

  const requestedTab = searchParams.get('tab') as MyShiftsTabId | null
  const activeTab: MyShiftsTabId = requestedTab && tabIds.includes(requestedTab) ? requestedTab : 'active'

  const handleTabChange = (id: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', id)
    setSearchParams(next, { replace: true })
  }

  const tabs: WorkerTabItem[] = useMemo(
    () => [
      {
        id: 'active',
        label: t('dashboard.workerPortal.tabs.myShifts.active'),
        badge: counters.upcomingShifts > 0 ? counters.upcomingShifts : undefined,
      },
      {
        id: 'history',
        label: t('dashboard.workerPortal.tabs.myShifts.history'),
      },
    ],
    [counters.upcomingShifts, t],
  )

  return (
    <div className="space-y-4">
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.workerPortal.pages.myShifts.title')}
        subtitle={t('dashboard.workerPortal.pages.myShifts.subtitle')}
      />
      <WorkerTabs
        tone={theme}
        items={tabs}
        value={activeTab}
        onChange={handleTabChange}
        ariaLabel={t('dashboard.workerPortal.pages.myShifts.title')}
      />

      {activeTab === 'active' ? <ActiveShiftTab /> : null}
      {activeTab === 'history' ? <ShiftHistoryTab /> : null}
    </div>
  )
}
