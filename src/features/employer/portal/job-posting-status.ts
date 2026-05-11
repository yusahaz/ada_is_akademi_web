import { JobPostingStatus } from '../../../api/core/index'
import type { JobPostingSummary } from '../../../api/jobs/job-postings'

/** Normalizes API enum (string from JsonStringEnumConverter or numeric value). */
export function normalizeJobPostingStatus(raw: JobPostingSummary['status']): JobPostingStatus {
  if (raw === undefined || raw === null) {
    return JobPostingStatus.Open
  }
  if (typeof raw === 'number') {
    return raw as JobPostingStatus
  }
  if (typeof raw === 'string') {
    const byName = (JobPostingStatus as Record<string, number>)[raw]
    if (typeof byName === 'number') {
      return byName as JobPostingStatus
    }
  }
  return JobPostingStatus.Draft
}

/** True when shift date is today or in the future (YYYY-MM-DD or ISO). */
export function isPostingShiftUpcoming(shiftDate: string): boolean {
  const day = shiftDate.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return true
  }
  return day >= new Date().toISOString().slice(0, 10)
}
