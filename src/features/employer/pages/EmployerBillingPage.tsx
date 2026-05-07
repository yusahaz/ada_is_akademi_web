import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { DashboardSurface, InteractiveButton, StatePanel } from '../../../components/dashboard/ui-primitives'
import { useTheme } from '../../../theme/theme-context'
import { WorkerSectionHeader } from '../../worker/worker-ui'
import type { EmployerPayoutStatus, EmployerReceivableStatus } from '../employer-portal-types'
import { useEmployerPortal } from '../use-employer-portal'

type FinanceView = 'workerPayouts' | 'commissionReceivables'

export function EmployerBillingPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
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
  const activeView = (searchParams.get('view') as FinanceView | null) ?? 'workerPayouts'
  const setView = (view: FinanceView) => {
    const next = new URLSearchParams(searchParams)
    next.set('view', view)
    setSearchParams(next, { replace: true })
  }

  return (
    <>
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.employerPortal.pages.billing.title')}
        subtitle={t('dashboard.employerPortal.pages.billing.subtitle')}
      />
      <DashboardSurface theme={theme}>
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ['workerPayouts', t('dashboard.employerSpot.finance.tabs.workerPayouts')],
              ['commissionReceivables', t('dashboard.employerSpot.finance.tabs.commissionReceivables')],
            ] as [FinanceView, string][]
          ).map(([key, label]) => (
            <button key={key} type="button" onClick={() => setView(key)} className={sectionButtonClass(activeView === key)}>
              <InteractiveButton theme={theme} isActive={activeView === key}>
                {label}
              </InteractiveButton>
            </button>
          ))}
        </div>

        {activeView === 'workerPayouts' ? (
          <div className="mt-4 space-y-3">
            <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t('dashboard.employerSpot.finance.workerPayouts.title')}
            </h2>
            <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.finance.workerPayouts.subtitle')}</p>

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

            {filteredPayouts.length === 0 ? (
              <StatePanel theme={theme} text={t('dashboard.employerSpot.finance.workerPayouts.empty')} />
            ) : (
              <div className="space-y-2">
                {filteredPayouts.map((item) => {
                  const isLocked = false
                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border px-3 py-2 text-xs ${
                        theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{item.worker}</p>
                          <p className={`mt-1 ${toneClass}`}>
                            {item.amount.toLocaleString()} {item.currency}
                          </p>
                          <p className={`mt-1 ${toneClass}`}>
                            {t('dashboard.employerSpot.finance.workerPayouts.status')}: {item.status}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button type="button" className={sectionButtonClass(false)} disabled={isLocked}>
                            <InteractiveButton theme={theme} className={isLocked ? 'opacity-60' : ''}>
                              {t('dashboard.employerSpot.finance.workerPayouts.actions.markProcessing')}
                            </InteractiveButton>
                          </button>
                          <button type="button" className={sectionButtonClass(false)} disabled={isLocked}>
                            <InteractiveButton theme={theme} className={isLocked ? 'opacity-60' : ''}>
                              {t('dashboard.employerSpot.finance.workerPayouts.actions.markPaid')}
                            </InteractiveButton>
                          </button>
                          <button type="button" className={sectionButtonClass(false)} disabled={isLocked}>
                            <InteractiveButton theme={theme} className={isLocked ? 'opacity-60' : ''}>
                              {t('dashboard.employerSpot.finance.workerPayouts.actions.fail')}
                            </InteractiveButton>
                          </button>
                          <button type="button" className={sectionButtonClass(false)} disabled={isLocked}>
                            <InteractiveButton theme={theme} className={isLocked ? 'opacity-60' : ''}>
                              {t('dashboard.employerSpot.finance.workerPayouts.actions.retry')}
                            </InteractiveButton>
                          </button>
                        </div>
                      </div>

                      {isLocked ? (
                        <p className={`mt-2 text-[11px] ${toneClass}`}>{t('dashboard.employerSpot.finance.workerPayouts.locked')}</p>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )}
            <p className={`text-xs ${toneClass}`}>{t('dashboard.employerSpot.finance.workerPayouts.hint')}</p>
          </div>
        ) : null}

        {activeView === 'commissionReceivables' ? (
          <div className="mt-4 space-y-3">
            <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t('dashboard.employerSpot.finance.commissions.title')}
            </h2>
            <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.finance.commissions.subtitle')}</p>

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

            {filteredReceivables.length === 0 ? (
              <StatePanel theme={theme} text={t('dashboard.employerSpot.finance.commissions.empty')} />
            ) : (
              <div className="space-y-2">
                {filteredReceivables.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border px-3 py-2 text-xs ${
                      theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                          {t('dashboard.employer.billing.period')}: {item.period}
                        </p>
                        <p className={toneClass}>
                          {t('dashboard.employer.billing.total')}: {item.total.toLocaleString()} TRY
                        </p>
                        <p className={toneClass}>
                          {t('dashboard.employerSpot.finance.commissions.status')}: {t(`dashboard.employer.billing.receivableStatus.${item.status}`)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" className={sectionButtonClass(false)}>
                          <InteractiveButton theme={theme}>{t('dashboard.employerSpot.finance.commissions.downloadPdf')}</InteractiveButton>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className={`text-xs ${toneClass}`}>{t('dashboard.employerSpot.finance.commissions.hint')}</p>
          </div>
        ) : null}

        <p className={`mt-4 text-xs ${toneClass}`}>{t('dashboard.employer.fallback.noBillingApi')}</p>
      </DashboardSurface>
    </>
  )
}
