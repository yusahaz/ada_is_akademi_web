import { IconCheck } from '../../../../landing/components/icons'
import type { JobApplicationListItem } from '../../../../../api/jobs/job-applications'
import { DashboardSurface } from '../../../../../shared/ui/ui-primitives'

export function CandidateFlowPanel({
  theme,
  toneClass,
  selectedPostingId,
  applications,
  t,
}: {
  theme: 'dark' | 'light'
  toneClass: string
  selectedPostingId: number | null
  applications: JobApplicationListItem[]
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  return (
    <DashboardSurface theme={theme}>
      <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
        {t('dashboard.employer.sections.candidateFlow')}
      </h2>
      {selectedPostingId === null ? (
        <p className={`mt-3 text-sm ${toneClass}`}>{t('dashboard.employer.sections.selectPosting')}</p>
      ) : applications.length === 0 ? (
        <p className={`mt-3 text-sm ${toneClass}`}>{t('dashboard.employer.sections.emptyApplications')}</p>
      ) : (
        <div className="mt-3 space-y-2">
          {applications.slice(0, 6).map((item) => (
            <div
              key={item.applicationId}
              className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <p className={`text-xs ${toneClass}`}>
                #{item.applicationId} • {t('dashboard.employerSpot.common.candidate')} {item.workerId}
              </p>
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
                  theme === 'dark' ? 'bg-sky-500/15 text-sky-100' : 'bg-sky-100 text-sky-700'
                }`}
              >
                <IconCheck className="h-3 w-3" />
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </DashboardSurface>
  )
}
