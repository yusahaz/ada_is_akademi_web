import { InteractiveButton, StatePanel } from '../../../../../shared/ui/ui-primitives'
import { useTranslation } from 'react-i18next'
import { tPayoutStatus } from '../../../i18n/employer-enum-i18n'
import type { EmployerPayoutStatus } from '../../../portal/employer-portal-types'

export function WorkerPayoutsView({
  theme,
  toneClass,
  payoutFilter,
  setPayoutFilter,
  filteredPayouts,
}: {
  theme: 'dark' | 'light'
  toneClass: string
  payoutFilter: EmployerPayoutStatus | 'all'
  setPayoutFilter: (v: EmployerPayoutStatus | 'all') => void
  filteredPayouts: Array<{ id: number; worker: string; amount: number; currency: string; status: EmployerPayoutStatus; isLocked?: boolean }>
}) {
  const { t } = useTranslation()
  const sectionButtonClass = (isActiveButton: boolean) => `inline-flex ${isActiveButton ? 'is-active' : ''}`
  return (
    <div className="mt-4 space-y-3">
      <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('dashboard.employerSpot.finance.workerPayouts.title')}</h2>
      <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.finance.workerPayouts.subtitle')}</p>
      <div className="mb-2 flex flex-wrap gap-2">
        {(['all', 'Pending', 'Processing', 'Paid', 'Failed'] as ('all' | EmployerPayoutStatus)[]).map((status) => (
          <button key={status} type="button" onClick={() => setPayoutFilter(status)} className={sectionButtonClass(payoutFilter === status)}>
            <InteractiveButton theme={theme} isActive={payoutFilter === status}>
              {status === 'all' ? t('dashboard.employer.billing.filters.all') : t(`dashboard.employer.billing.payoutStatus.${status}`)}
            </InteractiveButton>
          </button>
        ))}
      </div>
      {filteredPayouts.length === 0 ? (
        <StatePanel theme={theme} text={t('dashboard.employerSpot.finance.workerPayouts.empty')} />
      ) : (
        <div className="space-y-2">
          {filteredPayouts.map((item) => {
            const isLocked = item.isLocked === true
            return (
              <div key={item.id} className={`rounded-xl border px-3 py-2 text-xs ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                      {item.worker.startsWith('#') ? `${t('dashboard.employerSpot.common.candidate')} ${item.worker.replace('#', '')}` : item.worker}
                    </p>
                    <p className={`mt-1 ${toneClass}`}>{item.amount.toLocaleString()} {item.currency}</p>
                    <p className={`mt-1 ${toneClass}`}>{t('dashboard.employerSpot.finance.workerPayouts.status')}: {tPayoutStatus(t, item.status)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {['markProcessing', 'markPaid', 'fail', 'retry'].map((action) => (
                      <button key={action} type="button" className={sectionButtonClass(false)} disabled={isLocked}>
                        <InteractiveButton theme={theme} className={isLocked ? 'opacity-60' : ''}>
                          {t(`dashboard.employerSpot.finance.workerPayouts.actions.${action}`)}
                        </InteractiveButton>
                      </button>
                    ))}
                  </div>
                </div>
                {isLocked ? <p className={`mt-2 text-[11px] ${toneClass}`}>{t('dashboard.employerSpot.finance.workerPayouts.locked')}</p> : null}
              </div>
            )
          })}
        </div>
      )}
      <p className={`text-xs ${toneClass}`}>{t('dashboard.employerSpot.finance.workerPayouts.hint')}</p>
    </div>
  )
}
