import { InteractiveButton, StatePanel } from '../../../../../shared/ui/ui-primitives'
import { useTranslation } from 'react-i18next'
import { tReceivableStatus } from '../../../i18n/employer-enum-i18n'
import type { EmployerReceivableStatus } from '../../../portal/employer-portal-types'

export function CommissionReceivablesView({
  theme,
  toneClass,
  receivableFilter,
  setReceivableFilter,
  filteredReceivables,
}: {
  theme: 'dark' | 'light'
  toneClass: string
  receivableFilter: EmployerReceivableStatus | 'all'
  setReceivableFilter: (v: EmployerReceivableStatus | 'all') => void
  filteredReceivables: Array<{ id: number; period: string; total: number; status: EmployerReceivableStatus }>
}) {
  const { t } = useTranslation()
  const sectionButtonClass = (isActiveButton: boolean) => `inline-flex ${isActiveButton ? 'is-active' : ''}`
  return (
    <div className="mt-4 space-y-3">
      <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('dashboard.employerSpot.finance.commissions.title')}</h2>
      <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.finance.commissions.subtitle')}</p>
      <div className="mb-2 flex flex-wrap gap-2">
        {(['all', 'Invoiced', 'PartiallyPaid', 'Paid', 'Overdue'] as ('all' | EmployerReceivableStatus)[]).map((status) => (
          <button key={status} type="button" onClick={() => setReceivableFilter(status)} className={sectionButtonClass(receivableFilter === status)}>
            <InteractiveButton theme={theme} isActive={receivableFilter === status}>
              {status === 'all' ? t('dashboard.employer.billing.filters.all') : t(`dashboard.employer.billing.receivableStatus.${status}`)}
            </InteractiveButton>
          </button>
        ))}
      </div>
      {filteredReceivables.length === 0 ? (
        <StatePanel theme={theme} text={t('dashboard.employerSpot.finance.commissions.empty')} />
      ) : (
        <div className="space-y-2">
          {filteredReceivables.map((item) => (
            <div key={item.id} className={`rounded-xl border px-3 py-2 text-xs ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{t('dashboard.employer.billing.period')}: {item.period}</p>
                  <p className={toneClass}>{t('dashboard.employer.billing.total')}: {item.total.toLocaleString()} TRY</p>
                  <p className={toneClass}>{t('dashboard.employerSpot.finance.commissions.status')}: {tReceivableStatus(t, item.status)}</p>
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
  )
}
