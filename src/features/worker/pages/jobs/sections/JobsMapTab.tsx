import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'

import type { JobPostingSummary } from '../../../../../api/jobs/job-postings'
import { workerPortalApi } from '../../../../../api/worker/worker-portal'
import { DashboardSurface, StatePanel } from '../../../../../shared/ui/ui-primitives'
import { useTheme } from '../../../../../theme/theme-context'
import { useJobsMapGeolocation } from '../../../hooks/useJobsMapGeolocation'
import { useWorkerAsyncData } from '../../../hooks/useWorkerAsyncData'
import { filterAndSortOpenPostings } from '../job-browse-utils'
import { useJobsBrowseFilters } from '../jobs-browse-filters-context'
import { formatPostingScheduleFriendly } from '../posting-detail-lines'
import { WorkerPostingListItem } from '../components/WorkerPostingListItem'

/** Metres; API allows 100–500_000. */
const MAP_RADIUS_OPTIONS = [5_000, 10_000, 25_000, 50_000, 100_000, 200_000] as const

const DEFAULT_RADIUS_METRES = 50_000

function formatDistanceMetres(metres: number): string {
  if (!Number.isFinite(metres)) return ''
  if (metres < 1000) return `${Math.round(metres)} m`
  return `${(metres / 1000).toFixed(1)} km`
}

function formatRadiusBadge(metres: number): string {
  if (metres < 1000) return `${metres} m`
  return `${metres / 1000} km`
}

export function JobsMapTab() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const geo = useJobsMapGeolocation(true)
  const [radiusMetres, setRadiusMetres] = useState(DEFAULT_RADIUS_METRES)
  const { searchQuery, datePreset, postingSort } = useJobsBrowseFilters()

  const query = useCallback(() => {
    if (geo.phase === 'ready' && geo.latitude != null && geo.longitude != null) {
      return workerPortalApi.listOpenShifts({
        limit: 200,
        nearLatitude: geo.latitude,
        nearLongitude: geo.longitude,
        radiusMetres,
      })
    }
    return workerPortalApi.listOpenShifts({ limit: 200 })
  }, [geo.phase, geo.latitude, geo.longitude, radiusMetres])

  const { loading, error, data: items } = useWorkerAsyncData<JobPostingSummary[]>(
    [],
    ['worker', 'jobs-map', geo.phase, geo.latitude, geo.longitude, radiusMetres],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
    { enabled: geo.phase !== 'resolving' },
  )

  const filteredItems = useMemo(
    () =>
      filterAndSortOpenPostings(items, {
        searchQuery,
        datePreset,
        sort: postingSort,
      }),
    [items, searchQuery, datePreset, postingSort],
  )

  const grouped = useMemo(() => {
    return filteredItems.reduce<Record<number, JobPostingSummary[]>>((acc, item) => {
      const key = Number(item.employerId) || 0
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {})
  }, [filteredItems])

  const chipBase =
    theme === 'dark'
      ? 'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors'
      : 'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors'

  const chipOff =
    theme === 'dark'
      ? 'border-white/15 text-white/75 hover:border-white/30 hover:bg-white/5'
      : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'

  const chipOn =
    theme === 'dark'
      ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-100'
      : 'border-sky-300 bg-sky-50 text-sky-900'

  const labelCls = theme === 'dark' ? 'text-[11px] font-medium uppercase tracking-wide text-white/50' : 'text-[11px] font-medium uppercase tracking-wide text-slate-500'

  if (geo.phase === 'resolving') {
    return <StatePanel text={t('dashboard.workerPortal.tabs.jobs.mapGeoResolving')} theme={theme} />
  }

  const geoBanner =
    geo.phase === 'ready'
      ? t('dashboard.workerPortal.tabs.jobs.mapGeoNear', {
          radius: formatRadiusBadge(radiusMetres),
        })
      : t('dashboard.workerPortal.tabs.jobs.mapGeoFallback')

  const listBody = (() => {
    if (loading) {
      return <StatePanel text={t('dashboard.workerPortal.states.loading')} theme={theme} />
    }
    if (error) {
      return <StatePanel text={error} theme={theme} isError />
    }
    if (items.length === 0) {
      return <StatePanel text={t('dashboard.workerPortal.tabs.jobs.mapEmpty')} theme={theme} />
    }
    if (filteredItems.length === 0) {
      return <StatePanel text={t('dashboard.workerPortal.tabs.jobs.filters.noResults')} theme={theme} />
    }

    return (
      <div className="flex flex-col gap-3">
        {Object.entries(grouped).map(([employerId, postings]) => (
          <DashboardSurface key={employerId} theme={theme}>
            <p className={`text-xs ${theme === 'dark' ? 'text-white/65' : 'text-slate-500'}`}>
              {t('dashboard.workerPortal.overview.employerPrefix', { id: employerId })}
            </p>
            <p className={`mt-1 text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t('dashboard.workerPortal.tabs.jobs.locationCount', { count: postings.length })}
            </p>
            <ul className="mt-2 space-y-1.5">
              {postings.slice(0, 3).map((posting) => (
                <li
                  key={posting.id}
                >
                  <WorkerPostingListItem
                    theme={theme}
                    postingId={posting.id}
                    title={posting.title}
                    employerName={
                      posting.employerName?.trim()
                        ? posting.employerName
                        : t('dashboard.workerPortal.overview.employerPrefix', { id: posting.employerId })
                    }
                    locationText={posting.locationText}
                    scheduleText={formatPostingScheduleFriendly(posting, i18n.language)}
                    wageText={`${posting.wageAmount} ${posting.wageCurrency}`}
                    metaText={t('dashboard.workerPortal.tabs.jobs.mapPostingMeta', {
                      headCount: posting.headCount,
                      applicationCount: posting.applicationCount ?? 0,
                    })}
                    tags={posting.tags}
                    distanceText={
                      posting.distanceMetres != null && Number.isFinite(posting.distanceMetres)
                        ? t('dashboard.workerPortal.tabs.jobs.mapDistanceLabel', {
                            distance: formatDistanceMetres(posting.distanceMetres),
                          })
                        : null
                    }
                  />
                </li>
              ))}
            </ul>
          </DashboardSurface>
        ))}
      </div>
    )
  })()

  return (
    <div className="space-y-3">
      <DashboardSurface theme={theme} className="!p-3 sm:!p-4">
        <p className={`text-xs ${theme === 'dark' ? 'text-cyan-100/90' : 'text-sky-800'}`}>{geoBanner}</p>
        {geo.phase === 'ready' ? (
          <div className="mt-3 flex flex-col gap-2">
            <p className={labelCls}>{t('dashboard.workerPortal.tabs.jobs.mapRadiusLabel')}</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t('dashboard.workerPortal.tabs.jobs.mapRadiusLabel')}>
              {MAP_RADIUS_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`${chipBase} ${radiusMetres === m ? chipOn : chipOff}`}
                  onClick={() => setRadiusMetres(m)}
                >
                  {formatRadiusBadge(m)}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </DashboardSurface>
      <DashboardSurface theme={theme}>
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              theme === 'dark' ? 'bg-cyan-500/15 text-cyan-200' : 'bg-sky-100 text-sky-700'
            }`}
            aria-hidden="true"
          >
            <MapPin className="h-4 w-4" />
          </span>
          <div>
            <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t('dashboard.workerPortal.tabs.jobs.mapHeading')}
            </p>
            <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-white/65' : 'text-slate-600'}`}>
              {t('dashboard.workerPortal.tabs.jobs.mapHint')}
            </p>
          </div>
        </div>
      </DashboardSurface>
      {listBody}
    </div>
  )
}
