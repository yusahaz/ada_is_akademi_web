import type { JobApplicationListItem } from '../../../../../api/jobs/job-applications'
import { JobApplicationStatus } from '../../../../../api/core/enums'
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {t('dashboard.employerSpot.operations.applications.title')}
          </h2>
          <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.operations.applications.subtitle')}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
            theme === 'dark' ? 'bg-cyan-300/15 text-cyan-100' : 'bg-sky-100 text-sky-700'
          }`}
        >
          {applications.length}
        </span>
      </div>
      {applications.length === 0 ? (
        <StatePanel theme={theme} text={t('dashboard.employerSpot.operations.applications.empty')} />
      ) : (
        <div className="space-y-2.5">
          {applications.slice(0, 10).map((item) => (
            <div key={item.applicationId} className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {t('dashboard.employerSpot.common.candidate')} {item.workerId}
                </p>
                <p className={`mt-1 text-xs ${toneClass}`}>#{item.applicationId}</p>
              </div>
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${theme === 'dark' ? 'bg-sky-500/15 text-sky-100' : 'bg-sky-100 text-sky-700'}`}>
                {tApplicationStatus(t, item.status)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function tApplicationStatus(
  t: (key: string, options?: Record<string, unknown>) => string,
  rawStatus: number | string,
): string {
  const numeric = Number(rawStatus)
  if (numeric === JobApplicationStatus.Accepted) return t('dashboard.workerPortal.applications.status.accepted')
  if (numeric === JobApplicationStatus.Rejected) return t('dashboard.workerPortal.applications.status.rejected')
  if (numeric === JobApplicationStatus.Withdrawn) return t('dashboard.workerPortal.applications.status.withdrawn')
  if (numeric === JobApplicationStatus.Expired) return t('dashboard.workerPortal.applications.status.expired')

  const text = String(rawStatus ?? '').toLowerCase()
  if (text.includes('accept')) return t('dashboard.workerPortal.applications.status.accepted')
  if (text.includes('reject')) return t('dashboard.workerPortal.applications.status.rejected')
  if (text.includes('withdraw')) return t('dashboard.workerPortal.applications.status.withdrawn')
  if (text.includes('expire')) return t('dashboard.workerPortal.applications.status.expired')
  return t('dashboard.workerPortal.applications.status.pending')
}
