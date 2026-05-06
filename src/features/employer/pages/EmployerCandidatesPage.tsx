import { useTranslation } from 'react-i18next'

import type { JobApplicationListItem } from '../../../api/job-applications'
import { DashboardSurface } from '../../../components/dashboard/ui-primitives'
import { useTheme } from '../../../theme/theme-context'
import { WorkerSectionHeader } from '../../worker/worker-ui'
import { useEmployerPortal } from '../use-employer-portal'

export function EmployerCandidatesPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { candidateGroups } = useEmployerPortal()
  const toneClass = theme === 'dark' ? 'text-white/70' : 'text-slate-600'

  return (
    <>
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.employerPortal.pages.candidates.title')}
        subtitle={t('dashboard.employerPortal.pages.candidates.subtitle')}
      />
      <DashboardSurface theme={theme}>
        <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          {t('dashboard.employer.candidates.title')}
        </h2>
        <p className={`mt-1 text-sm ${toneClass}`}>{t('dashboard.employer.candidates.subtitle')}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {(
            [
              ['pending', candidateGroups.pending],
              ['accepted', candidateGroups.accepted],
              ['rejected', candidateGroups.rejected],
            ] as ['pending' | 'accepted' | 'rejected', JobApplicationListItem[]][]
          ).map(([key, items]) => (
            <div
              key={key}
              className={`rounded-xl border p-3 ${
                theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <p className={`text-xs font-semibold uppercase tracking-wide ${toneClass}`}>
                {t(`dashboard.employer.candidates.columns.${key}`)}
              </p>
              <div className="mt-2 space-y-2">
                {items.slice(0, 5).map((item, index) => (
                  <div
                    key={item.applicationId}
                    className={`rounded-lg border px-2 py-2 text-xs ${
                      theme === 'dark' ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <p className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Worker {item.workerId}</p>
                    <p className={`mt-1 ${toneClass}`}>
                      {t('dashboard.employer.candidates.score')}: {Math.max(90 - index * 4, 65)}%
                    </p>
                  </div>
                ))}
                {items.length === 0 ? <p className={`text-xs ${toneClass}`}>{t('dashboard.employer.candidates.empty')}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </DashboardSurface>
    </>
  )
}
