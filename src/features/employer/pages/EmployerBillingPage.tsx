import { useTranslation } from 'react-i18next'

import { DashboardSurface, InteractiveButton } from '../../../components/dashboard/ui-primitives'
import { useTheme } from '../../../theme/theme-context'
import { WorkerSectionHeader } from '../../worker/worker-ui'
import type { EmployerPayoutStatus, EmployerReceivableStatus } from '../employer-portal-types'
import { useEmployerPortal } from '../use-employer-portal'

export function EmployerBillingPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const {
    receivableFilter,
    setReceivableFilter,
    filteredReceivables,
    payoutFilter,
    setPayoutFilter,
    filteredPayouts,
  } = useEmployerPortal()
  const toneClass = theme === 'dark' ? 'text-white/70' : 'text-slate-600'
  const sectionButtonClass = (isActiveButton: boolean) => `inline-flex ${isActiveButton ? 'is-active' : ''}`

  return (
    <>
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.employerPortal.pages.billing.title')}
        subtitle={t('dashboard.employerPortal.pages.billing.subtitle')}
      />
      <DashboardSurface theme={theme}>
        <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          {t('dashboard.employer.billing.title')}
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              {(['all', 'Invoiced', 'PartiallyPaid', 'Paid', 'Overdue'] as ('all' | EmployerReceivableStatus)[]).map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setReceivableFilter(status)}
                    className={sectionButtonClass(receivableFilter === status)}
                  >
                    <InteractiveButton theme={theme} isActive={receivableFilter === status}>
                      {status === 'all'
                        ? t('dashboard.employer.billing.filters.all')
                        : t(`dashboard.employer.billing.receivableStatus.${status}`)}
                    </InteractiveButton>
                  </button>
                ),
              )}
            </div>
            <div className="space-y-2">
              {filteredReceivables.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border px-3 py-2 text-xs ${
                    theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <p className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                    {t('dashboard.employer.billing.period')}: {item.period}
                  </p>
                  <p className={toneClass}>
                    {t('dashboard.employer.billing.total')}: {item.total.toLocaleString()} TRY
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              {(['all', 'Pending', 'Processing', 'Paid', 'Failed'] as ('all' | EmployerPayoutStatus)[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setPayoutFilter(status)}
                  className={sectionButtonClass(payoutFilter === status)}
                >
                  <InteractiveButton theme={theme} isActive={payoutFilter === status}>
                    {status === 'all'
                      ? t('dashboard.employer.billing.filters.all')
                      : t(`dashboard.employer.billing.payoutStatus.${status}`)}
                  </InteractiveButton>
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {filteredPayouts.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border px-3 py-2 text-xs ${
                    theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <p className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{item.worker}</p>
                  <p className={toneClass}>
                    {item.amount.toLocaleString()} {item.currency}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className={`mt-4 text-xs ${toneClass}`}>{t('dashboard.employer.fallback.noBillingApi')}</p>
      </DashboardSurface>
    </>
  )
}
