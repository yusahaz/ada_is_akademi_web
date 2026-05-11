import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { DashboardSurface } from '../../../../shared/ui/ui-primitives'
import { useTheme } from '../../../../theme/theme-context'
import { WorkerSectionHeader } from '../../../worker/worker-ui'
import { useEmployerPortal } from '../../portal/use-employer-portal'
import { BillingTabs, CommissionReceivablesView, WorkerPayoutsView } from './sections'

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
        <BillingTabs theme={theme} activeView={activeView} setView={setView} t={t} />

        {activeView === 'workerPayouts' ? (
          <WorkerPayoutsView theme={theme} toneClass={toneClass} payoutFilter={payoutFilter} setPayoutFilter={setPayoutFilter} filteredPayouts={filteredPayouts} />
        ) : null}

        {activeView === 'commissionReceivables' ? (
          <CommissionReceivablesView theme={theme} toneClass={toneClass} receivableFilter={receivableFilter} setReceivableFilter={setReceivableFilter} filteredReceivables={filteredReceivables} />
        ) : null}
      </DashboardSurface>
    </>
  )
}
