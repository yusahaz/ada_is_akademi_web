import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CircleAlert } from 'lucide-react'

import type { WorkerApplicationItem } from '../../../../api/worker/worker-portal'
import { workerPortalApi } from '../../../../api/worker/worker-portal'
import { useTheme } from '../../../../theme/theme-context'
import { StatePanel } from '../../../../shared/ui/ui-primitives'
import { WorkerSectionHeader } from '../../worker-ui'
import { useWorkerAsyncData } from '../../hooks/useWorkerAsyncData'
import { filterAndSortApplications } from '../jobs/job-browse-utils'
import { useJobsBrowseFilters } from '../jobs/jobs-browse-filters-context'
import { WorkerPostingListItem } from '../jobs/components/WorkerPostingListItem'
import { formatShiftDateLong, formatTimeShort } from '../jobs/posting-detail-lines'

export type ApplicationsPageProps = {
  embedded?: boolean
}

export function ApplicationsPage({ embedded = false }: ApplicationsPageProps = {}) {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const query = useCallback(() => workerPortalApi.listApplications(), [])
  const { loading, error, data: items } = useWorkerAsyncData<WorkerApplicationItem[]>(
    [],
    ['worker', 'applications'],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
  )
  const { searchQuery, postingSort, applicationStatus } = useJobsBrowseFilters()
  const visibleItems = useMemo(
    () =>
      filterAndSortApplications(items, {
        searchQuery,
        sort: postingSort,
        status: applicationStatus,
      }),
    [items, searchQuery, postingSort, applicationStatus],
  )

  const renderHeader = () =>
    embedded ? null : (
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.workerPortal.pages.applications.title')}
        subtitle={t('dashboard.workerPortal.pages.applications.subtitle')}
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
          (() => {
            const parts = item.shiftRange.split('-')
            const start = formatTimeShort(parts[0]?.trim() ?? '')
            const end = formatTimeShort(parts[1]?.trim() ?? '')
            const dateText = formatShiftDateLong(item.shiftDate, i18n.language)
            const scheduleText = end ? `${dateText} • ${start} - ${end}` : `${dateText} • ${start}`
            return (
          <WorkerPostingListItem
            key={item.id}
            theme={theme}
            postingId={item.jobPostingId}
            title={item.title}
            scheduleText={scheduleText}
            wageText={
              item.wageAmount != null && item.wageCurrency
                ? `${item.wageAmount} ${item.wageCurrency}`
                : undefined
            }
            trailingBadgeText={t(`dashboard.workerPortal.applications.status.${item.status}`)}
            trailingBadgeEmphasis={applicationBadgeEmphasis(item.status)}
            leading={
              item.status === 'rejected' && item.rejectionReason ? (
                <div
                  className={
                    theme === 'dark'
                      ? 'rounded-xl border border-rose-300/30 bg-rose-500/10 p-2.5 text-[11px] text-rose-100'
                      : 'rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-[11px] text-rose-900'
                  }
                >
                  <p className="inline-flex items-center gap-1.5 font-semibold">
                    <CircleAlert className="h-3.5 w-3.5" />
                    {t('dashboard.workerPortal.applications.rejectionReasonLabel')}
                  </p>
                  <p className="mt-1 leading-relaxed">{item.rejectionReason}</p>
                </div>
              ) : null
            }
          />
            )
          })()
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
