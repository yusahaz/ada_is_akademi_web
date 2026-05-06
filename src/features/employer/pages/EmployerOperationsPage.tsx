import { useTranslation } from 'react-i18next'

import { DashboardSurface } from '../../../components/dashboard/ui-primitives'
import { useTheme } from '../../../theme/theme-context'
import { WorkerSectionHeader } from '../../worker/worker-ui'

export function EmployerOperationsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const toneClass = theme === 'dark' ? 'text-white/70' : 'text-slate-600'

  return (
    <>
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.employerPortal.pages.operations.title')}
        subtitle={t('dashboard.employerPortal.pages.operations.subtitle')}
      />
      <DashboardSurface theme={theme}>
        <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          {t('dashboard.employer.operations.title')}
        </h2>
        <p className={`mt-1 text-sm ${toneClass}`}>{t('dashboard.employer.operations.subtitle')}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            t('dashboard.employer.operations.cards.token'),
            t('dashboard.employer.operations.cards.checkin'),
            t('dashboard.employer.operations.cards.anomaly'),
            t('dashboard.employer.operations.cards.supervisor'),
          ].map((label) => (
            <div
              key={label}
              className={`rounded-xl border p-3 ${
                theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{label}</p>
              <p className={`mt-1 text-xs ${toneClass}`}>{t('dashboard.employer.operations.readOnly')}</p>
            </div>
          ))}
        </div>
      </DashboardSurface>
    </>
  )
}
