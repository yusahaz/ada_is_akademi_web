import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { DashboardSurface } from '../../../../shared/ui/ui-primitives'
import { useTheme } from '../../../../theme/theme-context'
import { WorkerSectionHeader } from '../../../worker/worker-ui'
import { useEmployerPortal } from '../../portal/use-employer-portal'
import { GeofenceView, ReportsTabs, TeamRbacView } from './sections'

type SettingsView = 'geofence' | 'teamRBAC'

export function EmployerReportsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const { employerLocations, employerSupervisors } = useEmployerPortal()
  const toneClass = theme === 'dark' ? 'text-white/70' : 'text-slate-600'
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
        <ReportsTabs theme={theme} activeView={activeView} setView={setView} t={t} />

        {activeView === 'geofence' ? (
          <GeofenceView theme={theme} toneClass={toneClass} employerLocations={employerLocations} t={t} />
        ) : null}

        {activeView === 'teamRBAC' ? (
          <TeamRbacView theme={theme} toneClass={toneClass} employerSupervisors={employerSupervisors} t={t} />
        ) : null}
      </DashboardSurface>
    </>
  )
}
