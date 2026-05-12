import type { JobPostingSummary } from '../../../../../api/jobs/job-postings'
import { formatShiftDateLong, formatTimeRangeShort } from '../../../../worker/pages/jobs/posting-detail-lines'
import { DashboardSurface } from '../../../../../shared/ui/ui-primitives'

export function PostingsPanel({
  theme,
  toneClass,
  loading,
  postings,
  selectedPostingId,
  setSelectedPostingId,
  t,
  locale,
}: {
  theme: 'dark' | 'light'
  toneClass: string
  loading: boolean
  postings: JobPostingSummary[]
  selectedPostingId: number | null
  setSelectedPostingId: (id: number | null) => void
  t: (key: string, options?: Record<string, unknown>) => string
  locale: string
}) {
  const visibleItems = postings.slice(0, 5)

  return (
    <DashboardSurface theme={theme}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          {t('dashboard.employer.sections.myPostings')}
        </h2>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
            theme === 'dark' ? 'bg-cyan-300/15 text-cyan-100' : 'bg-sky-100 text-sky-700'
          }`}
        >
          {postings.length}
        </span>
      </div>
      {loading ? (
        <p className={`mt-3 text-sm ${toneClass}`}>{t('dashboard.employer.sections.loading')}</p>
      ) : postings.length === 0 ? (
        <p className={`mt-3 text-sm ${toneClass}`}>{t('dashboard.employer.sections.emptyPostings')}</p>
      ) : (
        <div className="mt-3 space-y-2.5">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedPostingId(item.id)}
              className={`w-full rounded-2xl border px-3.5 py-3 text-start transition sm:px-4 sm:py-3.5 ${
                selectedPostingId === item.id
                  ? theme === 'dark'
                    ? 'border-[#14f1d9]/50 bg-[#14f1d9]/10 shadow-[0_0_0_1px_rgba(20,241,217,0.18)]'
                    : 'border-sky-300 bg-sky-50'
                  : theme === 'dark'
                    ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className={`line-clamp-2 text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {item.title}
                </p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    theme === 'dark' ? 'bg-white/10 text-white/85' : 'bg-white text-slate-700 ring-1 ring-slate-200'
                  }`}
                >
                  #{item.id}
                </span>
              </div>
              <div className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${toneClass}`}>
                <span>{formatShiftDateLong(item.shiftDate, locale)}</span>
                <span>•</span>
                <span>{formatTimeRangeShort(item.shiftStartTime, item.shiftEndTime, locale)}</span>
                <span>•</span>
                <span>
                  {item.headCount} {t('dashboard.employer.sections.headCount')}
                </span>
              </div>
              <div className={`mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${toneClass}`}>
                <span>{item.locationText?.trim() || '-'}</span>
                <span>•</span>
                <span
                  className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-cyan-200' : 'text-sky-700'
                  }`}
                >
                  {formatWage(item.wageAmount, item.wageCurrency, locale)}
                </span>
              </div>
            </button>
          ))}
          {postings.length > visibleItems.length ? (
            <p className={`px-1 text-xs ${toneClass}`}>
              +{postings.length - visibleItems.length}
            </p>
          ) : null}
        </div>
      )}
    </DashboardSurface>
  )
}

function formatWage(amount: number, currency: string, locale: string): string {
  if (!Number.isFinite(amount) || !currency) {
    return '-'
  }
  try {
    return new Intl.NumberFormat(locale || 'en', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}
