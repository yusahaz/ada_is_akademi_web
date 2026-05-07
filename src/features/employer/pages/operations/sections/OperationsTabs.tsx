import { InteractiveButton } from '../../../../../shared/ui/ui-primitives'

type OperationsView = 'activeAssignments' | 'applications' | 'history'

export function OperationsTabs({
  theme,
  activeView,
  setView,
  t,
}: {
  theme: 'dark' | 'light'
  activeView: OperationsView
  setView: (view: OperationsView) => void
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  const sectionButtonClass = (isActiveButton: boolean) => `inline-flex ${isActiveButton ? 'is-active' : ''}`
  return (
    <div className="flex flex-wrap items-center gap-2">
      {(
        [
          ['activeAssignments', t('dashboard.employerSpot.operations.tabs.activeAssignments')],
          ['applications', t('dashboard.employerSpot.operations.tabs.applications')],
          ['history', t('dashboard.employerSpot.operations.tabs.history')],
        ] as [OperationsView, string][]
      ).map(([key, label]) => (
        <button key={key} type="button" onClick={() => setView(key)} className={sectionButtonClass(activeView === key)}>
          <InteractiveButton theme={theme} isActive={activeView === key}>
            {label}
          </InteractiveButton>
        </button>
      ))}
    </div>
  )
}
