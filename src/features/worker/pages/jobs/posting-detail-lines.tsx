import type { TFunction } from 'i18next'

import type { JobPostingSummary } from '../../../../api/jobs/job-postings'

/** Çalışma satırı — overview ile aynı çeviri anahtarı. */
export function postingShiftScheduleText(
  t: TFunction,
  posting: Pick<JobPostingSummary, 'shiftDate' | 'shiftStartTime' | 'shiftEndTime'>,
  locale: string,
): string {
  return t('dashboard.workerPortal.overview.semanticMatchSchedule', {
    date: formatShiftDateLong(posting.shiftDate, locale),
    start: formatTimeShort(posting.shiftStartTime, locale),
    end: formatTimeShort(posting.shiftEndTime, locale),
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

function parseTime(time: string): { hour: number; minute: number; second: number } | null {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  const second = Number(match[3] ?? '0')
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) return null
  return { hour, minute, second }
}

/** "09:00:00" -> locale-friendly "9:00 AM" / "09:00" */
export function formatTimeShort(time: string, locale: string): string {
  const parsed = parseTime(time)
  if (!parsed) return time
  const date = new Date(2000, 0, 1, parsed.hour, parsed.minute, parsed.second)
  try {
    return new Intl.DateTimeFormat(locale || 'en', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  } catch {
    return `${String(parsed.hour).padStart(2, '0')}:${String(parsed.minute).padStart(2, '0')}`
  }
}

export function formatTimeRangeShort(startTime: string, endTime: string, locale: string): string {
  return `${formatTimeShort(startTime, locale)} - ${formatTimeShort(endTime, locale)}`
}

export function formatPostingScheduleFriendly(
  posting: Pick<JobPostingSummary, 'shiftDate' | 'shiftStartTime' | 'shiftEndTime'>,
  locale: string,
): string {
  const dateText = formatShiftDateLong(posting.shiftDate, locale)
  const range = formatTimeRangeShort(posting.shiftStartTime, posting.shiftEndTime, locale)
  return `${dateText} • ${range}`
}

export function formatRawShiftRange(range: string, locale: string): string {
  const parts = range.split('-')
  const start = parts[0]?.trim() ?? ''
  const end = parts[1]?.trim() ?? ''
  if (!start) return range
  if (!end) return formatTimeShort(start, locale)
  return formatTimeRangeShort(start, end, locale)
}

export function truncatePostingDescription(text: string, maxChars: number): string {
  const s = text.trim().replace(/\s+/g, ' ')
  if (s.length <= maxChars) {
    return s
  }
  return `${s.slice(0, maxChars).trimEnd()}…`
}
