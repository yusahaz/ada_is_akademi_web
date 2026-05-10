import type { TFunction } from 'i18next'

import type { JobPostingSummary } from '../../../../api/jobs/job-postings'

/** Çalışma satırı — overview ile aynı çeviri anahtarı. */
export function postingShiftScheduleText(
  t: TFunction,
  posting: Pick<JobPostingSummary, 'shiftDate' | 'shiftStartTime' | 'shiftEndTime'>,
): string {
  return t('dashboard.workerPortal.overview.semanticMatchSchedule', {
    date: posting.shiftDate,
    start: posting.shiftStartTime,
    end: posting.shiftEndTime,
  })
}

/** İnsan okunur uzun tarih (ör. "Çarşamba, 7 Mayıs 2026"). */
export function formatShiftDateLong(shiftDate: string, locale: string): string {
  const d = new Date(shiftDate)
  if (Number.isNaN(d.getTime())) {
    return shiftDate
  }
  const loc = locale.startsWith('tr') ? 'tr-TR' : locale.includes('-') ? locale : 'en-GB'
  return d.toLocaleDateString(loc, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** "09:00:00" → "09:00" */
export function formatTimeShort(time: string): string {
  const parts = time.split(':')
  if (parts.length >= 2) {
    const h = parts[0]?.padStart(2, '0') ?? '00'
    const m = parts[1] ?? '00'
    return `${h}:${m}`
  }
  return time
}

export function formatPostingScheduleFriendly(
  posting: Pick<JobPostingSummary, 'shiftDate' | 'shiftStartTime' | 'shiftEndTime'>,
  locale: string,
): string {
  const dateText = formatShiftDateLong(posting.shiftDate, locale)
  const start = formatTimeShort(posting.shiftStartTime)
  const end = formatTimeShort(posting.shiftEndTime)
  return `${dateText} • ${start} - ${end}`
}

export function truncatePostingDescription(text: string, maxChars: number): string {
  const s = text.trim().replace(/\s+/g, ' ')
  if (s.length <= maxChars) {
    return s
  }
  return `${s.slice(0, maxChars).trimEnd()}…`
}
