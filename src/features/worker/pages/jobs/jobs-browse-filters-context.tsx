import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import type { DatePreset, PostingSort } from './job-browse-utils'
import { defaultApplicationSort, defaultPostingSortForTab, type ApplicationStatusFilter } from './job-browse-utils'

export type JobsBrowseTabId = 'recommendations' | 'open' | 'map' | 'applications'

type JobsBrowseFiltersValue = {
  searchQuery: string
  setSearchQuery: (value: string) => void
  datePreset: DatePreset
  setDatePreset: (value: DatePreset) => void
  postingSort: PostingSort
  setPostingSort: (value: PostingSort) => void
  applicationStatus: ApplicationStatusFilter
  setApplicationStatus: (value: ApplicationStatusFilter) => void
  resetForTab: (tab: JobsBrowseTabId) => void
}

const JobsBrowseFiltersContext = createContext<JobsBrowseFiltersValue | null>(null)

export function JobsBrowseFiltersProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [datePreset, setDatePreset] = useState<DatePreset>('all')
  const [postingSort, setPostingSort] = useState<PostingSort>(defaultPostingSortForTab('recommendations'))
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatusFilter>('all')

  const resetForTab = useCallback((tab: JobsBrowseTabId) => {
    setSearchQuery('')
    setDatePreset('all')
    if (tab === 'applications') {
      setApplicationStatus('all')
      setPostingSort(defaultApplicationSort)
      return
    }
    setPostingSort(defaultPostingSortForTab(tab))
  }, [])

  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      datePreset,
      setDatePreset,
      postingSort,
      setPostingSort,
      applicationStatus,
      setApplicationStatus,
      resetForTab,
    }),
    [searchQuery, datePreset, postingSort, applicationStatus, resetForTab],
  )

  return <JobsBrowseFiltersContext.Provider value={value}>{children}</JobsBrowseFiltersContext.Provider>
}

export function useJobsBrowseFilters(): JobsBrowseFiltersValue {
  const ctx = useContext(JobsBrowseFiltersContext)
  if (!ctx) {
    throw new Error('useJobsBrowseFilters must be used within JobsBrowseFiltersProvider')
  }
  return ctx
}
