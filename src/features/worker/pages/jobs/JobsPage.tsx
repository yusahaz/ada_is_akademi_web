import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { useTheme } from '../../../../theme/theme-context'
import { useWorkerLiveCounters } from '../../hooks/useWorkerLiveCounters'
import { WorkerSectionHeader, WorkerTabs, type WorkerTabItem } from '../../worker-ui'
import { ApplicationsPage } from '../applications/ApplicationsPage'
import { RecommendationsPage } from '../recommendations/RecommendationsPage'
import { ShiftsPage } from '../shifts-list/ShiftsPage'
import { JobsBrowseFiltersProvider, type JobsBrowseTabId } from './jobs-browse-filters-context'
import { JobsFiltersBar } from './sections/JobsFiltersBar'
import { JobsMapTab } from './sections/JobsMapTab'

const tabIds: JobsBrowseTabId[] = ['recommendations', 'open', 'map', 'applications']

function JobsPageContent() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const counters = useWorkerLiveCounters()

  const requestedTab = searchParams.get('tab') as JobsBrowseTabId | null
  const activeTab: JobsBrowseTabId = requestedTab && tabIds.includes(requestedTab) ? requestedTab : 'recommendations'

  const handleTabChange = (id: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', id)
    setSearchParams(next, { replace: true })
  }

  const tabs: WorkerTabItem[] = useMemo(
    () => [
      {
        id: 'recommendations',
        label: t('dashboard.workerPortal.tabs.jobs.recommendations'),
        badge: counters.newMatches > 0 ? counters.newMatches : undefined,
      },
      {
        id: 'open',
        label: t('dashboard.workerPortal.tabs.jobs.open'),
      },
      {
        id: 'map',
        label: t('dashboard.workerPortal.tabs.jobs.map'),
      },
      {
        id: 'applications',
        label: t('dashboard.workerPortal.tabs.jobs.applications'),
      },
    ],
    [counters.newMatches, t],
  )

  return (
    <div className="space-y-4">
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.workerPortal.pages.jobs.title')}
        subtitle={t('dashboard.workerPortal.pages.jobs.subtitle')}
      />
      <WorkerTabs
        tone={theme}
        items={tabs}
        value={activeTab}
        onChange={handleTabChange}
        ariaLabel={t('dashboard.workerPortal.pages.jobs.title')}
      />

      <JobsFiltersBar activeTab={activeTab} />

      {activeTab === 'recommendations' ? <RecommendationsPage embedded /> : null}
      {activeTab === 'open' ? <ShiftsPage embedded /> : null}
      {activeTab === 'map' ? <JobsMapTab /> : null}
      {activeTab === 'applications' ? <ApplicationsPage embedded /> : null}
    </div>
  )
}

export function JobsPage() {
  return (
    <JobsBrowseFiltersProvider>
      <JobsPageContent />
    </JobsBrowseFiltersProvider>
  )
}
