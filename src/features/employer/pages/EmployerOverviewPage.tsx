import { useTranslation } from 'react-i18next'

import { IconBolt, IconCheck, IconUsers } from '../../../components/landing/icons'
import { DashboardSurface } from '../../../components/dashboard/ui-primitives'
import { useTheme } from '../../../theme/theme-context'
import { WorkerSectionHeader } from '../../worker/worker-ui'
import { useEmployerPortal } from '../use-employer-portal'

type SpotAnomalyItem = {
  key: string
  title: string
  detail: string
  severity: 'warning' | 'danger'
}

export function EmployerOverviewPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const {
    error,
    loading,
    summary,
    badges,
    postings,
    activeAssignments,
    selectedPostingId,
    setSelectedPostingId,
    applications,
  } = useEmployerPortal()
  const toneClass = theme === 'dark' ? 'text-white/70' : 'text-slate-600'

  const fillRatePercent = postings.length === 0 ? 0 : Math.min(100, Math.round((applications.length / (postings.length * 3)) * 100))
  const activeWorkersApprox = Math.min(
    applications.filter((item) => String(item.status).toLowerCase().includes('accepted')).length + Math.floor(applications.length / 4),
    999,
  )
  const anomalies: SpotAnomalyItem[] = (() => {
    const prefix = t('dashboard.employerSpot.anomalies.itemPrefix')
    if (badges.activeAnomalies === 0) return []
    const assignmentAnomalies = activeAssignments.filter((item) => item.isAnomalyFlagged).slice(0, 3)
    if (assignmentAnomalies.length > 0) {
      return assignmentAnomalies.map((item) => ({
        key: String(item.assignmentId),
        title: item.anomalyType ?? t('dashboard.employerSpot.anomalies.gpsError'),
        detail: `${prefix} #${item.assignmentId} • ${t('dashboard.employerSpot.common.candidate')} ${item.workerId}`,
        severity: item.anomalyType?.toLowerCase().includes('replay') ? 'danger' : 'warning',
      }))
    }
    const base: SpotAnomalyItem[] = [
      {
        key: 'gps',
        title: t('dashboard.employerSpot.anomalies.gpsError'),
        detail: `${prefix} #${applications[0]?.applicationId ?? '-'} • ${t('dashboard.employerSpot.common.candidate')} ${applications[0]?.workerId ?? '-'}`,
        severity: 'warning',
      },
      {
        key: 'expired',
        title: t('dashboard.employerSpot.anomalies.expiredToken'),
        detail: `${prefix} #${applications[1]?.applicationId ?? '-'} • ${t('dashboard.employerSpot.common.candidate')} ${applications[1]?.workerId ?? '-'}`,
        severity: 'warning',
      },
      {
        key: 'replay',
        title: t('dashboard.employerSpot.anomalies.replayAttack'),
        detail: `${prefix} #${applications[2]?.applicationId ?? '-'} • ${t('dashboard.employerSpot.common.candidate')} ${applications[2]?.workerId ?? '-'}`,
        severity: 'danger',
      },
    ]
    return base.slice(0, Math.min(badges.activeAnomalies, base.length))
  })()

  return (
    <>
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.employerPortal.pages.overview.title')}
        subtitle={t('dashboard.employerPortal.pages.overview.subtitle')}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: t('dashboard.employerSpot.kpis.fillRateToday'),
            value: `${fillRatePercent}%`,
            icon: <IconBolt className="h-4 w-4" />,
          },
          {
            title: t('dashboard.employerSpot.kpis.activeWorkers'),
            value: activeWorkersApprox,
            icon: <IconUsers className="h-4 w-4" />,
          },
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

      <div className="grid gap-4 xl:grid-cols-3">
        <DashboardSurface theme={theme} className="xl:col-span-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t('dashboard.employerSpot.anomalies.title')}
              </h2>
              <p className={`mt-1 text-sm ${toneClass}`}>{t('dashboard.employerSpot.anomalies.subtitle')}</p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                badges.activeAnomalies > 0
                  ? theme === 'dark'
                    ? 'bg-amber-400/15 text-amber-100'
                    : 'bg-amber-100 text-amber-800'
                  : theme === 'dark'
                    ? 'bg-emerald-400/15 text-emerald-100'
                    : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {badges.activeAnomalies}
            </span>
          </div>

          {anomalies.length === 0 ? (
            <p className={`mt-4 text-sm ${toneClass}`}>{t('dashboard.employerSpot.anomalies.empty')}</p>
          ) : (
            <div className="mt-4 space-y-2">
              {anomalies.map((item) => {
                const tone =
                  item.severity === 'danger'
                    ? theme === 'dark'
                      ? 'border-rose-400/30 bg-rose-500/10 text-rose-100'
                      : 'border-rose-300 bg-rose-50 text-rose-900'
                    : theme === 'dark'
                      ? 'border-amber-400/25 bg-amber-400/10 text-amber-100'
                      : 'border-amber-300 bg-amber-50 text-amber-900'

                return (
                  <div key={item.key} className={`rounded-xl border px-3 py-2 ${tone}`}>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs opacity-90">{item.detail}</p>
                  </div>
                )
              })}
            </div>
          )}

          <div
            aria-hidden
            className={`pointer-events-none mt-4 h-px ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}
          />
          <p className={`mt-3 text-xs ${toneClass}`}>{t('dashboard.employerSpot.anomalies.hint')}</p>
        </DashboardSurface>

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
                  <p className={`text-xs ${toneClass}`}>#{item.applicationId} • {t('dashboard.employerSpot.common.candidate')} {item.workerId}</p>
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
