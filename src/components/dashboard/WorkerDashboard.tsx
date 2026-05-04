import { useTranslation } from 'react-i18next'

import { DashboardShell } from './DashboardShell'
import { DashboardCard } from './DashboardCard'
import { IconCheck, IconSpark, IconUsers } from '../landing/icons'

export function WorkerDashboard() {
  const { t } = useTranslation()

  return (
    <DashboardShell
      titleKey="dashboard.worker.title"
      subtitleKey="dashboard.worker.subtitle"
    >
      <DashboardCard
        title={t('dashboard.worker.cards.applications.title')}
        value={t('dashboard.worker.cards.applications.value')}
        hint={t('dashboard.worker.cards.applications.hint')}
        icon={<IconCheck className="h-4 w-4" />}
      />
      <DashboardCard
        title={t('dashboard.worker.cards.shifts.title')}
        value={t('dashboard.worker.cards.shifts.value')}
        hint={t('dashboard.worker.cards.shifts.hint')}
        icon={<IconUsers className="h-4 w-4" />}
      />
      <DashboardCard
        title={t('dashboard.worker.cards.profile.title')}
        value={t('dashboard.worker.cards.profile.value')}
        hint={t('dashboard.worker.cards.profile.hint')}
        icon={<IconSpark className="h-4 w-4" />}
      />
    </DashboardShell>
  )
}
