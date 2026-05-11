import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  semanticSimilarityToPercent,
  type SemanticMatchedJobPosting,
} from '../../../../api/jobs/job-postings'
import { workerPortalApi } from '../../../../api/worker/worker-portal'
import { StatePanel } from '../../../../shared/ui/ui-primitives'
import { useTheme } from '../../../../theme/theme-context'
import { useWorkerAsyncData } from '../../hooks/useWorkerAsyncData'
import { WorkerSectionHeader } from '../../worker-ui'
import { WorkerPostingListItem } from '../jobs/components/WorkerPostingListItem'
import { filterAndSortSemanticMatches } from '../jobs/job-browse-utils'
import { useJobsBrowseFilters } from '../jobs/jobs-browse-filters-context'
import { formatPostingScheduleFriendly } from '../jobs/posting-detail-lines'

export type RecommendationsPageProps = {
  embedded?: boolean
}

export function RecommendationsPage({ embedded = false }: RecommendationsPageProps = {}) {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const query = useCallback(() => workerPortalApi.listSemanticMatchedShifts(), [])
  const { loading, error, data: items } = useWorkerAsyncData<SemanticMatchedJobPosting[]>(
    [],
    ['worker', 'semantic-matched-shifts'],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
  )
  const { searchQuery, datePreset, postingSort } = useJobsBrowseFilters()

  const visibleItems = useMemo(
    () =>
      filterAndSortSemanticMatches(items, {
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
        title={t('dashboard.workerPortal.pages.recommendations.title')}
        subtitle={t('dashboard.workerPortal.pages.recommendations.subtitle')}
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
        <StatePanel text={t('dashboard.workerPortal.overview.bestMatchesEmpty')} theme={theme} />
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
            key={item.jobPostingId}
            theme={theme}
            postingId={item.jobPostingId}
            title={item.title}
            scheduleText={formatPostingScheduleFriendly(item, i18n.language)}
            trailingBadgeText={`${semanticSimilarityToPercent(item.similarityScore)}%`}
            trailingBadgeEmphasis="info"
            metaText={t('dashboard.workerPortal.widgets.aiMatch.scoreLabel')}
          />
        ))}
      </div>
    </div>
  )
}
