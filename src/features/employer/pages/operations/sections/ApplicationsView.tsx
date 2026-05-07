import type { JobApplicationListItem } from '../../../../../api/jobs/job-applications'
import { StatePanel } from '../../../../../shared/ui/ui-primitives'

export function ApplicationsView({
  theme,
  toneClass,
  applications,
  t,
}: {
  theme: 'dark' | 'light'
  toneClass: string
  applications: JobApplicationListItem[]
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  return (
    <div className="mt-4 space-y-3">
      <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
        {t('dashboard.employerSpot.operations.applications.title')}
      </h2>
      <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.operations.applications.subtitle')}</p>
      {applications.length === 0 ? (
        <StatePanel theme={theme} text={t('dashboard.employerSpot.operations.applications.empty')} />
      ) : (
        <div className="space-y-2">
          {applications.slice(0, 10).map((item, idx) => (
            <div key={item.applicationId} className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-2 ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {t('dashboard.employerSpot.common.candidate')} {item.workerId}
                </p>
                <p className={`mt-1 text-xs ${toneClass}`}>#{item.applicationId}</p>
              </div>
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${theme === 'dark' ? 'bg-sky-500/15 text-sky-100' : 'bg-sky-100 text-sky-700'}`} aria-label={t('dashboard.employerSpot.operations.applications.matchScoreAria', { score: Math.max(90 - idx * 4, 65) })}>
                {t('dashboard.employerSpot.operations.applications.matchScore', { score: Math.max(90 - idx * 4, 65) })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
