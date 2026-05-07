import { InteractiveButton } from '../../../../../shared/ui/ui-primitives'

type FinanceView = 'workerPayouts' | 'commissionReceivables'

export function BillingTabs({
  theme,
  activeView,
  setView,
  t,
}: {
  theme: 'dark' | 'light'
  activeView: FinanceView
  setView: (view: FinanceView) => void
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  const sectionButtonClass = (isActiveButton: boolean) => `inline-flex ${isActiveButton ? 'is-active' : ''}`
  return (
    <div className="flex flex-wrap items-center gap-2">
      {(
        [
          ['workerPayouts', t('dashboard.employerSpot.finance.tabs.workerPayouts')],
          ['commissionReceivables', t('dashboard.employerSpot.finance.tabs.commissionReceivables')],
        ] as [FinanceView, string][]
      ).map(([key, label]) => (
        <button key={key} type="button" onClick={() => setView(key)} className={sectionButtonClass(activeView === key)}>
          <InteractiveButton theme={theme} isActive={activeView === key}>{label}</InteractiveButton>
        </button>
      ))}
    </div>
  )
}
