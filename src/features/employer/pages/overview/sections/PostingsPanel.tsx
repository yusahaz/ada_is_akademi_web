import type { JobPostingSummary } from '../../../../../api/jobs/job-postings'
import { DashboardSurface } from '../../../../../shared/ui/ui-primitives'

export function PostingsPanel({
  theme,
  toneClass,
  loading,
  postings,
  selectedPostingId,
  setSelectedPostingId,
  t,
}: {
  theme: 'dark' | 'light'
  toneClass: string
  loading: boolean
  postings: JobPostingSummary[]
  selectedPostingId: number | null
  setSelectedPostingId: (id: number | null) => void
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  return (
    <DashboardSurface theme={theme}>
      <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
        {t('dashboard.employer.sections.myPostings')}
      </h2>
      {loading ? (
        <p className={`mt-3 text-sm ${toneClass}`}>{t('dashboard.employer.sections.loading')}</p>
      ) : postings.length === 0 ? (
        <p className={`mt-3 text-sm ${toneClass}`}>{t('dashboard.employer.sections.emptyPostings')}</p>
      ) : (
        <div className="mt-3 space-y-2">
          {postings.slice(0, 5).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedPostingId(item.id)}
              className={`w-full rounded-xl border px-3 py-2 text-start transition ${
                selectedPostingId === item.id
                  ? theme === 'dark'
                    ? 'border-[#14f1d9]/50 bg-[#14f1d9]/10'
                    : 'border-sky-300 bg-sky-50'
                  : theme === 'dark'
                    ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.title}</p>
              <p className={`mt-1 text-xs ${toneClass}`}>
                {item.shiftDate} • {item.headCount} {t('dashboard.employer.sections.headCount')}
              </p>
            </button>
          ))}
        </div>
      )}
    </DashboardSurface>
  )
}
