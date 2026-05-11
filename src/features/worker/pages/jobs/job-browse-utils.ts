import type { JobPostingSummary, SemanticMatchedJobPosting } from '../../../../api/jobs/job-postings'
import type { WorkerApplicationItem } from '../../../../api/worker/worker-portal'

export type DatePreset = 'all' | 'today' | 'week' | 'month'
export type PostingSort = 'dateAsc' | 'dateDesc' | 'titleAsc' | 'matchDesc'

function normalizeSearch(raw: string): string {
  return raw.trim().toLocaleLowerCase('tr-TR')
}

export function parseShiftDate(shiftDate: string): Date | null {
  if (!shiftDate?.trim()) return null
  const parsed = new Date(shiftDate)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function matchesDatePreset(date: Date | null, preset: DatePreset, now = new Date()): boolean {
  if (preset === 'all' || !date) return true
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (preset === 'today') {
    return (
      date.getFullYear() === startOfToday.getFullYear() &&
      date.getMonth() === startOfToday.getMonth() &&
      date.getDate() === startOfToday.getDate()
    )
  }
  if (preset === 'week') {
    const end = new Date(startOfToday)
    end.setDate(end.getDate() + 7)
    return date >= startOfToday && date < end
  }
  if (preset === 'month') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }
  return true
}

function compareDate(a: Date | null, b: Date | null): number {
  if (a && b) return a.getTime() - b.getTime()
  if (a) return -1
  if (b) return 1
  return 0
}

export function filterAndSortSemanticMatches(
  items: SemanticMatchedJobPosting[],
  options: {
    searchQuery: string
    datePreset: DatePreset
    sort: PostingSort
  },
): SemanticMatchedJobPosting[] {
  const q = normalizeSearch(options.searchQuery)
  let next = items.filter((item) => {
    if (q && !normalizeSearch(item.title).includes(q)) return false
    const d = parseShiftDate(item.shiftDate)
    return matchesDatePreset(d, options.datePreset)
  })

  const sort = options.sort
  if (sort === 'matchDesc') {
    next = [...next].sort((a, b) => b.similarityScore - a.similarityScore)
  } else if (sort === 'dateAsc') {
    next = [...next].sort((a, b) => compareDate(parseShiftDate(a.shiftDate), parseShiftDate(b.shiftDate)))
  } else if (sort === 'dateDesc') {
    next = [...next].sort((a, b) => compareDate(parseShiftDate(b.shiftDate), parseShiftDate(a.shiftDate)))
  } else {
    next = [...next].sort((a, b) => a.title.localeCompare(b.title, 'tr', { sensitivity: 'base' }))
  }
  return next
}

export function filterAndSortOpenPostings(
  items: JobPostingSummary[],
  options: {
    searchQuery: string
    datePreset: DatePreset
    sort: PostingSort
  },
): JobPostingSummary[] {
  const q = normalizeSearch(options.searchQuery)
  let next = items.filter((item) => {
    if (q) {
      const hay =
        `${item.title} ${item.wageAmount} ${item.wageCurrency} ${item.employerId}`.toLocaleLowerCase('tr-TR')
      if (!hay.includes(q)) return false
    }
    const d = parseShiftDate(item.shiftDate)
    return matchesDatePreset(d, options.datePreset)
  })

  const sort = options.sort === 'matchDesc' ? 'dateAsc' : options.sort
  if (sort === 'dateAsc') {
    next = [...next].sort((a, b) => compareDate(parseShiftDate(a.shiftDate), parseShiftDate(b.shiftDate)))
  } else if (sort === 'dateDesc') {
    next = [...next].sort((a, b) => compareDate(parseShiftDate(b.shiftDate), parseShiftDate(a.shiftDate)))
  } else {
    next = [...next].sort((a, b) => a.title.localeCompare(b.title, 'tr', { sensitivity: 'base' }))
  }
  return next
}

export type ApplicationStatusFilter = 'all' | WorkerApplicationItem['status']

export function filterAndSortApplications(
  items: WorkerApplicationItem[],
  options: {
    searchQuery: string
    status: ApplicationStatusFilter
    sort: PostingSort
  },
): WorkerApplicationItem[] {
  const q = normalizeSearch(options.searchQuery)
  let next = items.filter((item) => {
    if (options.status !== 'all' && item.status !== options.status) return false
    if (q && !normalizeSearch(item.title).includes(q)) return false
    return true
  })

  const sort = options.sort === 'matchDesc' ? 'dateAsc' : options.sort
  if (sort === 'dateAsc') {
    next = [...next].sort((a, b) => compareDate(parseShiftDate(a.shiftDate), parseShiftDate(b.shiftDate)))
  } else if (sort === 'dateDesc') {
    next = [...next].sort((a, b) => compareDate(parseShiftDate(b.shiftDate), parseShiftDate(a.shiftDate)))
  } else {
    next = [...next].sort((a, b) => a.title.localeCompare(b.title, 'tr', { sensitivity: 'base' }))
  }
  return next
}

/** Open and map tabs default to upcoming shift first; recommendations default to best semantic match. */
export function defaultPostingSortForTab(tab: 'recommendations' | 'open' | 'map'): PostingSort {
  return tab === 'recommendations' ? 'matchDesc' : 'dateAsc'
}

export const defaultApplicationSort: PostingSort = 'dateAsc'

export function isPostingFilterActive(
  tab: 'recommendations' | 'open' | 'map',
  searchQuery: string,
  datePreset: DatePreset,
  postingSort: PostingSort,
): boolean {
  return (
    Boolean(searchQuery.trim()) ||
    datePreset !== 'all' ||
    postingSort !== defaultPostingSortForTab(tab)
  )
}

export function isApplicationFilterActive(
  searchQuery: string,
  status: ApplicationStatusFilter,
  sort: PostingSort,
): boolean {
  return (
    Boolean(searchQuery.trim()) || status !== 'all' || sort !== defaultApplicationSort
  )
}
