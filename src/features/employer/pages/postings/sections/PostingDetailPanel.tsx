import type { JobPostingDetail } from '../../../../../api/jobs/job-postings'

export function PostingDetailPanel({
  theme,
  toneClass,
  selectedPosting,
  t,
}: {
  theme: 'dark' | 'light'
  toneClass: string
  selectedPosting: JobPostingDetail | null
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  if (!selectedPosting) {
    return <p className={`mt-4 text-xs ${toneClass}`}>{t('dashboard.employer.fallback.readOnlyData')}</p>
  }
  return (
    <div className={`mt-4 rounded-xl border p-3 ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
      <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
        {t('dashboard.employer.postings.detailTitle')}
      </p>
      <p className={`mt-2 text-xs ${toneClass}`}>{selectedPosting.description}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <span className={toneClass}>{t('dashboard.employer.postings.detail.pending')}: {selectedPosting.pendingApplications}</span>
        <span className={toneClass}>{t('dashboard.employer.postings.detail.accepted')}: {selectedPosting.acceptedApplications}</span>
        <span className={toneClass}>{t('dashboard.employer.postings.detail.headCount')}: {selectedPosting.headCount}</span>
        <span className={toneClass}>{t('dashboard.employer.postings.detail.status')}: {selectedPosting.status}</span>
      </div>
    </div>
  )
}
