import { useTranslation } from 'react-i18next'

import { IconBolt, IconCheck, IconShield, IconUsers } from '../../../components/landing/icons'
import { DashboardSurface } from '../../../components/dashboard/ui-primitives'
import { useTheme } from '../../../theme/theme-context'
import { WorkerSectionHeader } from '../../worker/worker-ui'
import { useEmployerPortal } from '../use-employer-portal'

export function EmployerOverviewPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const {
    error,
    loading,
    summary,
    postings,
    selectedPostingId,
    setSelectedPostingId,
    applications,
  } = useEmployerPortal()
  const toneClass = theme === 'dark' ? 'text-white/70' : 'text-slate-600'

  return (
    <>
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.employerPortal.pages.overview.title')}
        subtitle={t('dashboard.employerPortal.pages.overview.subtitle')}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            title: t('dashboard.employer.summary.openPostings'),
            value: summary.openPostings,
            icon: <IconBolt className="h-4 w-4" />,
          },
          {
            title: t('dashboard.employer.summary.pendingApplications'),
            value: summary.pendingApplications,
            icon: <IconUsers className="h-4 w-4" />,
          },
          {
            title: t('dashboard.employer.summary.actionRequired'),
            value: summary.actionRequired,
            icon: <IconShield className="h-4 w-4" />,
          },
        ].map((item) => (
          <DashboardSurface key={item.title} theme={theme} className="relative">
            <div className="flex items-center justify-between gap-3">
              <p className={`text-xs ${theme === 'dark' ? 'text-white/75' : 'text-slate-600'}`}>{item.title}</p>
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                  theme === 'dark' ? 'bg-[#14f1d9]/15 text-[#14f1d9]' : 'bg-sky-100 text-sky-700'
                }`}
              >
                {item.icon}
              </span>
            </div>
            <p
              className={`mt-3 font-display text-2xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              {item.value}
            </p>
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-x-4 bottom-2 h-px ${theme === 'dark' ? 'bg-cyan-300/20' : 'bg-sky-200'}`}
            />
          </DashboardSurface>
        ))}
      </div>

      {error ? (
        <p
          className={`rounded-xl border px-3 py-2 text-sm ${
            theme === 'dark'
              ? 'border-amber-400/30 bg-amber-400/10 text-amber-100'
              : 'border-amber-300 bg-amber-50 text-amber-800'
          }`}
        >
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
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
                  <p className={`text-xs ${toneClass}`}>#{item.applicationId} • Worker {item.workerId}</p>
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
      </div>
    </>
  )
}
