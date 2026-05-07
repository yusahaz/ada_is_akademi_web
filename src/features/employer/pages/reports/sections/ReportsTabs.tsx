import { InteractiveButton } from '../../../../../shared/ui/ui-primitives'

type SettingsView = 'geofence' | 'teamRBAC'

export function ReportsTabs({
  theme,
  activeView,
  setView,
  t,
}: {
  theme: 'dark' | 'light'
  activeView: SettingsView
  setView: (view: SettingsView) => void
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  const sectionButtonClass = (isActiveButton: boolean) => `inline-flex ${isActiveButton ? 'is-active' : ''}`
  return (
    <div className="flex flex-wrap items-center gap-2">
      {(
        [
          ['geofence', t('dashboard.employerSpot.settings.tabs.geofence')],
          ['teamRBAC', t('dashboard.employerSpot.settings.tabs.teamRBAC')],
        ] as [SettingsView, string][]
      ).map(([key, label]) => (
        <button key={key} type="button" onClick={() => setView(key)} className={sectionButtonClass(activeView === key)}>
          <InteractiveButton theme={theme} isActive={activeView === key}>{label}</InteractiveButton>
        </button>
      ))}
    </div>
  )
}
