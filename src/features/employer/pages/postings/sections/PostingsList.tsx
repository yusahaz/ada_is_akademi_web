import type { JobPostingSummary } from '../../../../../api/jobs/job-postings'
import type { JobPostingStatus } from '../../../../../api/core/index'

type FilteredPostingItem = JobPostingSummary & {
  status: (typeof JobPostingStatus)[keyof typeof JobPostingStatus]
  isPlanned: boolean
}

export function PostingsList({
  theme,
  toneClass,
  filteredPostings,
  setSelectedPostingId,
  t,
}: {
  theme: 'dark' | 'light'
  toneClass: string
  filteredPostings: FilteredPostingItem[]
  setSelectedPostingId: (id: number | null) => void
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  return (
    <div className="mt-4 grid gap-3 lg:grid-cols-2">
      {filteredPostings.length === 0 ? (
        <p className={`text-sm ${toneClass}`}>{t('dashboard.employer.postings.empty')}</p>
      ) : (
        filteredPostings.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedPostingId(item.id)}
            className={`rounded-2xl border px-3 py-3 text-start transition hover:-translate-y-0.5 ${
              theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.title}</p>
            <p className={`mt-1 text-xs ${toneClass}`}>
              {item.shiftDate} • {item.shiftStartTime} - {item.shiftEndTime}
            </p>
            <p className={`mt-2 text-xs ${toneClass}`}>
              {item.isPlanned ? t('dashboard.employer.postings.mode.planned') : t('dashboard.employer.postings.mode.instant')}
            </p>
          </button>
        ))
      )}
    </div>
  )
}
