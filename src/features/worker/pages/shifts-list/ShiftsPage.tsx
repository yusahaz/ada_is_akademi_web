import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { JobPostingSummary } from '../../../../api/jobs/job-postings'
import { workerPortalApi } from '../../../../api/worker/worker-portal'
import { useTheme } from '../../../../theme/theme-context'
import { StatePanel } from '../../../../shared/ui/ui-primitives'
import { WorkerSectionHeader } from '../../worker-ui'
import { useWorkerAsyncData } from '../../hooks/useWorkerAsyncData'
import { filterAndSortOpenPostings } from '../jobs/job-browse-utils'
import { useJobsBrowseFilters } from '../jobs/jobs-browse-filters-context'
import { formatPostingScheduleFriendly } from '../jobs/posting-detail-lines'
import { WorkerPostingListItem } from '../jobs/components/WorkerPostingListItem'

export type ShiftsPageProps = {
  embedded?: boolean
}

export function ShiftsPage({ embedded = false }: ShiftsPageProps = {}) {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const query = useCallback(() => workerPortalApi.listOpenShifts(), [])
  const { loading, error, data: items } = useWorkerAsyncData<JobPostingSummary[]>(
    [],
    ['worker', 'open-shifts'],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
  )
  const { searchQuery, datePreset, postingSort } = useJobsBrowseFilters()
  const visibleItems = useMemo(
    () =>
      filterAndSortOpenPostings(items, {
        searchQuery,
        datePreset,
        sort: postingSort,
      }),
    [items, searchQuery, datePreset, postingSort],
  )

  const renderHeader = () =>
    embedded ? null : (
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.workerPortal.pages.shifts.title')}
        subtitle={t('dashboard.workerPortal.pages.shifts.subtitle')}
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
  if (error && items.length === 0) {
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

  if (visibleItems.length === 0) {
    return (
      <div className="space-y-4">
        {renderHeader()}
        <StatePanel text={t('dashboard.workerPortal.tabs.jobs.filters.noResults')} theme={theme} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {renderHeader()}
      <div className="flex flex-col gap-3">
        {visibleItems.map((item) => (
          <WorkerPostingListItem
            key={item.id}
            theme={theme}
            postingId={item.id}
            title={item.title}
            employerName={
              item.employerName?.trim()
                ? item.employerName
                : t('dashboard.workerPortal.overview.employerPrefix', { id: item.employerId })
            }
            locationText={item.locationText}
            scheduleText={formatPostingScheduleFriendly(item, i18n.language)}
            wageText={`${item.wageAmount} ${item.wageCurrency}`}
            metaText={t('dashboard.workerPortal.tabs.jobs.mapPostingMeta', {
              headCount: item.headCount,
              applicationCount: item.applicationCount ?? 0,
            })}
            tags={[...(item.requiredTags ?? []), ...(item.tags ?? [])]}
          />
        ))}
      </div>
    </div>
  )
}
