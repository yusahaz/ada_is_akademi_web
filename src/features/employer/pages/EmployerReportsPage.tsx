import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { DashboardSurface, InteractiveButton, StatePanel } from '../../../components/dashboard/ui-primitives'
import { useTheme } from '../../../theme/theme-context'
import { WorkerSectionHeader } from '../../worker/worker-ui'
import { useEmployerPortal } from '../use-employer-portal'

type SettingsView = 'geofence' | 'teamRBAC'

export function EmployerReportsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const { employerLocations, employerSupervisors } = useEmployerPortal()
  const toneClass = theme === 'dark' ? 'text-white/70' : 'text-slate-600'
  const sectionButtonClass = (isActiveButton: boolean) => `inline-flex ${isActiveButton ? 'is-active' : ''}`
  const activeView = (searchParams.get('view') as SettingsView | null) ?? 'geofence'
  const setView = (view: SettingsView) => {
    const next = new URLSearchParams(searchParams)
    next.set('view', view)
    setSearchParams(next, { replace: true })
  }

  return (
    <>
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.employerPortal.pages.reports.title')}
        subtitle={t('dashboard.employerPortal.pages.reports.subtitle')}
      />
      <DashboardSurface theme={theme}>
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ['geofence', t('dashboard.employerSpot.settings.tabs.geofence')],
              ['teamRBAC', t('dashboard.employerSpot.settings.tabs.teamRBAC')],
            ] as [SettingsView, string][]
          ).map(([key, label]) => (
            <button key={key} type="button" onClick={() => setView(key)} className={sectionButtonClass(activeView === key)}>
              <InteractiveButton theme={theme} isActive={activeView === key}>
                {label}
              </InteractiveButton>
            </button>
          ))}
        </div>

        {activeView === 'geofence' ? (
          <div className="mt-4 space-y-3">
            <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t('dashboard.employerSpot.settings.geofence.title')}
            </h2>
            <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.settings.geofence.subtitle')}</p>
            <div className="grid gap-3 md:grid-cols-2">
              {(employerLocations.length > 0
                ? employerLocations.map((item) => `${item.name} • ${item.city} • r:${item.geofenceRadiusMetres}`)
                : [
                    t('dashboard.employerSpot.settings.geofence.fields.locationName'),
                    t('dashboard.employerSpot.settings.geofence.fields.city'),
                    t('dashboard.employerSpot.settings.geofence.fields.latitude'),
                    t('dashboard.employerSpot.settings.geofence.fields.longitude'),
                    t('dashboard.employerSpot.settings.geofence.fields.radius'),
                  ]
              ).map((label) => (
                <div
                  key={label}
                  className={`rounded-xl border px-3 py-3 text-xs ${
                    theme === 'dark'
                      ? 'border-white/10 bg-white/[0.03] text-white/80'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
            <StatePanel theme={theme} text={t('dashboard.employerSpot.common.comingSoon')} />
            <p className={`text-xs ${toneClass}`}>{t('dashboard.employerSpot.settings.geofence.hint')}</p>
          </div>
        ) : null}

        {activeView === 'teamRBAC' ? (
          <div className="mt-4 space-y-3">
            <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t('dashboard.employerSpot.settings.teamRBAC.title')}
            </h2>
            <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.settings.teamRBAC.subtitle')}</p>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                t('dashboard.employerSpot.settings.teamRBAC.cards.supervisors'),
                t('dashboard.employerSpot.settings.teamRBAC.cards.groups'),
              ].map((label) => (
                <div
                  key={label}
                  className={`rounded-xl border p-3 ${
                    theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{label}</p>
                  <p className={`mt-1 text-xs ${toneClass}`}>
                    {employerSupervisors.length > 0
                      ? `${t('dashboard.employerSpot.operations.tabs.activeAssignments')}: ${employerSupervisors.length}`
                      : t('dashboard.employerSpot.common.comingSoon')}
                  </p>
                </div>
              ))}
            </div>
            <p className={`text-xs ${toneClass}`}>{t('dashboard.employerSpot.settings.teamRBAC.hint')}</p>
          </div>
        ) : null}
      </DashboardSurface>
    </>
  )
}
