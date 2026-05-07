import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'

import type { JobPostingSummary } from '../../../../../api/jobs/job-postings'
import { workerPortalApi } from '../../../../../api/worker/worker-portal'
import { DashboardSurface, StatePanel } from '../../../../../shared/ui/ui-primitives'
import { useTheme } from '../../../../../theme/theme-context'
import { useWorkerAsyncData } from '../../../hooks/useWorkerAsyncData'

export function JobsMapTab() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const query = useCallback(() => workerPortalApi.listOpenShifts(), [])
  const { loading, error, data: items } = useWorkerAsyncData<JobPostingSummary[]>(
    [],
    ['worker', 'jobs-map'],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
  )

  if (loading) return <StatePanel text={t('dashboard.workerPortal.states.loading')} theme={theme} />
  if (error) return <StatePanel text={error} theme={theme} isError />
  if (items.length === 0) return <StatePanel text={t('dashboard.workerPortal.tabs.jobs.mapEmpty')} theme={theme} />

  const grouped = items.reduce<Record<number, JobPostingSummary[]>>((acc, item) => {
    const key = Number(item.employerId) || 0
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-3">
      <DashboardSurface theme={theme}>
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              theme === 'dark' ? 'bg-cyan-500/15 text-cyan-200' : 'bg-sky-100 text-sky-700'
            }`}
            aria-hidden="true"
          >
            <MapPin className="h-4 w-4" />
          </span>
          <div>
            <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t('dashboard.workerPortal.tabs.jobs.mapHeading')}
            </p>
            <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-white/65' : 'text-slate-600'}`}>
              {t('dashboard.workerPortal.tabs.jobs.mapHint')}
            </p>
          </div>
        </div>
      </DashboardSurface>
      <div className="grid gap-3 md:grid-cols-2">
        {Object.entries(grouped).map(([employerId, postings]) => (
          <DashboardSurface key={employerId} theme={theme}>
            <p className={`text-xs ${theme === 'dark' ? 'text-white/65' : 'text-slate-500'}`}>
              {t('dashboard.workerPortal.overview.employerPrefix', { id: employerId })}
            </p>
            <p className={`mt-1 text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t('dashboard.workerPortal.tabs.jobs.locationCount', { count: postings.length })}
            </p>
            <ul className="mt-2 space-y-1.5">
              {postings.slice(0, 3).map((posting) => (
                <li
                  key={posting.id}
                  className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-xs ${
                    theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-white/75' : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="truncate">{posting.title}</span>
                  <span className={`shrink-0 font-semibold ${theme === 'dark' ? 'text-cyan-200' : 'text-cyan-700'}`}>
                    {posting.wageAmount} {posting.wageCurrency}
                  </span>
                </li>
              ))}
            </ul>
          </DashboardSurface>
        ))}
      </div>
    </div>
  )
}
