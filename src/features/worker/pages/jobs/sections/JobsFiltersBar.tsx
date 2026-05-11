import { Filter, Search } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { DashboardSurface } from '../../../../../shared/ui/ui-primitives'
import { useTheme } from '../../../../../theme/theme-context'
import {
  defaultApplicationSort,
  isApplicationFilterActive,
  isPostingFilterActive,
  type DatePreset,
  type PostingSort,
  type ApplicationStatusFilter,
} from '../job-browse-utils'
import { useJobsBrowseFilters, type JobsBrowseTabId } from '../jobs-browse-filters-context'

type JobsFiltersBarProps = {
  activeTab: JobsBrowseTabId
}

const datePresets: DatePreset[] = ['all', 'today', 'week', 'month']

const applicationStatuses: Array<Exclude<ApplicationStatusFilter, 'all'>> = [
  'pending',
  'accepted',
  'rejected',
  'withdrawn',
  'expired',
]

export function JobsFiltersBar({ activeTab }: JobsFiltersBarProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const filters = useJobsBrowseFilters()
  const {
    searchQuery,
    setSearchQuery,
    datePreset,
    setDatePreset,
    postingSort,
    setPostingSort,
    applicationStatus,
    setApplicationStatus,
    resetForTab,
  } = filters

  useEffect(() => {
    if (activeTab === 'recommendations') return
    if (postingSort !== 'matchDesc') return
    if (activeTab === 'open' || activeTab === 'map') {
      setPostingSort('dateAsc')
    }
    if (activeTab === 'applications') {
      setPostingSort(defaultApplicationSort)
    }
  }, [activeTab, postingSort, setPostingSort])

  const isPostingTab = activeTab === 'recommendations' || activeTab === 'open' || activeTab === 'map'
  const showMatchSort = activeTab === 'recommendations'
  const postingDefaultsTab: 'recommendations' | 'open' | 'map' =
    activeTab === 'recommendations' ? 'recommendations' : activeTab === 'map' ? 'map' : 'open'

  const canClear = isPostingTab
    ? isPostingFilterActive(postingDefaultsTab, searchQuery, datePreset, postingSort)
    : isApplicationFilterActive(searchQuery, applicationStatus, postingSort)

  const inputCls =
    theme === 'dark'
      ? 'w-full rounded-xl border border-white/15 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-cyan-400/50'
      : 'w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-400'

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

  const clearBtnCls =
    theme === 'dark'
      ? 'text-xs font-medium text-cyan-200 underline-offset-2 hover:underline'
      : 'text-xs font-medium text-sky-700 underline-offset-2 hover:underline'

  const labelCls = theme === 'dark' ? 'text-[11px] font-medium uppercase tracking-wide text-white/50' : 'text-[11px] font-medium uppercase tracking-wide text-slate-500'

  const selectCls =
    theme === 'dark'
      ? 'min-w-[10rem] flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50 sm:flex-none sm:min-w-[12rem]'
      : 'min-w-[10rem] flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 sm:flex-none sm:min-w-[12rem]'

  return (
    <DashboardSurface theme={theme} className="!p-3 sm:!p-4">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search
            className={`pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
              theme === 'dark' ? 'text-white/40' : 'text-slate-400'
            }`}
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('dashboard.workerPortal.tabs.jobs.filters.searchPlaceholder')}
            className={inputCls}
            autoComplete="off"
            enterKeyHint="search"
            aria-label={t('dashboard.workerPortal.tabs.jobs.filters.searchPlaceholder')}
          />
        </div>

        {isPostingTab ? (
          <div className="flex flex-col gap-2">
            <p className={labelCls}>{t('dashboard.workerPortal.tabs.jobs.filters.dateLabel')}</p>
            <div className="flex flex-wrap gap-2">
              {datePresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`${chipBase} ${datePreset === preset ? chipOn : chipOff}`}
                  onClick={() => setDatePreset(preset)}
                >
                  {t(`dashboard.workerPortal.tabs.jobs.filters.date.${preset}`)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className={labelCls}>{t('dashboard.workerPortal.tabs.jobs.filters.statusLabel')}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`${chipBase} ${applicationStatus === 'all' ? chipOn : chipOff}`}
                onClick={() => setApplicationStatus('all')}
              >
                {t('dashboard.workerPortal.tabs.jobs.filters.statusAll')}
              </button>
              {applicationStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`${chipBase} ${applicationStatus === status ? chipOn : chipOff}`}
                  onClick={() => setApplicationStatus(status)}
                >
                  {t(`dashboard.workerPortal.applications.status.${status}`)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-1 flex-col gap-1.5 sm:max-w-md">
            <label htmlFor="jobs-browse-sort" className={labelCls}>
              {t('dashboard.workerPortal.tabs.jobs.filters.sortLabel')}
            </label>
            <div className="flex items-center gap-2">
              <Filter className={`h-4 w-4 shrink-0 ${theme === 'dark' ? 'text-white/45' : 'text-slate-400'}`} aria-hidden />
              <select
                id="jobs-browse-sort"
                value={postingSort}
                onChange={(e) => setPostingSort(e.target.value as PostingSort)}
                className={selectCls}
              >
                {showMatchSort ? (
                  <option value="matchDesc">{t('dashboard.workerPortal.tabs.jobs.filters.sort.matchDesc')}</option>
                ) : null}
                <option value="dateAsc">{t('dashboard.workerPortal.tabs.jobs.filters.sort.dateAsc')}</option>
                <option value="dateDesc">{t('dashboard.workerPortal.tabs.jobs.filters.sort.dateDesc')}</option>
                <option value="titleAsc">{t('dashboard.workerPortal.tabs.jobs.filters.sort.titleAsc')}</option>
              </select>
            </div>
          </div>
          {canClear ? (
            <button type="button" onClick={() => resetForTab(activeTab)} className={`${clearBtnCls} mt-1 shrink-0 self-start sm:self-center`}>
              {t('dashboard.workerPortal.tabs.jobs.filters.clear')}
            </button>
          ) : null}
        </div>
      </div>
    </DashboardSurface>
  )
}
