import { useTranslation } from 'react-i18next'

import { DashboardSurface, InteractiveButton } from '../../../components/dashboard/ui-primitives'
import { useTheme } from '../../../theme/theme-context'
import { WorkerSectionHeader } from '../../worker/worker-ui'
import type { EmployerExportFormat } from '../employer-portal-types'
import { useEmployerPortal } from '../use-employer-portal'

export function EmployerReportsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { reportFormat, setReportFormat, reportMetrics } = useEmployerPortal()
  const toneClass = theme === 'dark' ? 'text-white/70' : 'text-slate-600'
  const sectionButtonClass = (isActiveButton: boolean) => `inline-flex ${isActiveButton ? 'is-active' : ''}`

  return (
    <>
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.employerPortal.pages.reports.title')}
        subtitle={t('dashboard.employerPortal.pages.reports.subtitle')}
      />
      <DashboardSurface theme={theme}>
        <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          {t('dashboard.employer.reports.title')}
        </h2>
        <p className={`mt-1 text-sm ${toneClass}`}>{t('dashboard.employer.reports.subtitle')}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            t('dashboard.employer.reports.filters.range'),
            t('dashboard.employer.reports.filters.status'),
            t('dashboard.employer.reports.filters.category'),
            t('dashboard.employer.reports.filters.location'),
          ].map((filter) => (
            <div
              key={filter}
              className={`rounded-xl border px-3 py-3 text-xs ${
                theme === 'dark'
                  ? 'border-white/10 bg-white/[0.03] text-white/80'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              {filter}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(['json', 'csv', 'pdf', 'excel'] as EmployerExportFormat[]).map((format) => (
            <button
              key={format}
              type="button"
              onClick={() => setReportFormat(format)}
              className={sectionButtonClass(reportFormat === format)}
            >
              <InteractiveButton theme={theme} isActive={reportFormat === format}>
                {format.toUpperCase()}
              </InteractiveButton>
            </button>
          ))}
          <button type="button" className={sectionButtonClass(false)}>
            <InteractiveButton theme={theme}>{t('dashboard.employer.reports.queueExport')}</InteractiveButton>
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: t('dashboard.employer.summary.openPostings'), value: reportMetrics.totalPostings },
            { label: t('dashboard.employer.candidates.columns.accepted'), value: reportMetrics.acceptedApplications },
            { label: t('dashboard.employer.candidates.columns.pending'), value: reportMetrics.pendingApplications },
            { label: t('dashboard.employer.candidates.columns.rejected'), value: reportMetrics.rejectedApplications },
            { label: t('dashboard.employer.billing.total'), value: reportMetrics.monthlyReceivable.toLocaleString() },
          ].map((metric) => (
            <div
              key={metric.label}
              className={`rounded-xl border px-3 py-3 text-xs ${
                theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-white/80' : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <p className="opacity-70">{metric.label}</p>
              <p className="mt-1 text-sm font-semibold">{metric.value}</p>
            </div>
          ))}
        </div>
        <p className={`mt-4 text-xs ${toneClass}`}>{t('dashboard.employer.reports.readOnly')}</p>
      </DashboardSurface>
    </>
  )
}
