import { useTranslation } from 'react-i18next'

import { IconBolt, IconShield, IconUsers } from '../landing/icons'
import { DashboardCard } from './DashboardCard'
import { DashboardShell } from './DashboardShell'

export function EmployerDashboard() {
  const { t } = useTranslation()

  return (
    <DashboardShell
      titleKey="dashboard.employer.title"
      subtitleKey="dashboard.employer.subtitle"
    >
      <DashboardCard
        title={t('dashboard.employer.cards.postings.title')}
        value={t('dashboard.employer.cards.postings.value')}
        hint={t('dashboard.employer.cards.postings.hint')}
        icon={<IconBolt className="h-4 w-4" />}
      />
      <DashboardCard
        title={t('dashboard.employer.cards.candidates.title')}
        value={t('dashboard.employer.cards.candidates.value')}
        hint={t('dashboard.employer.cards.candidates.hint')}
        icon={<IconUsers className="h-4 w-4" />}
      />
      <DashboardCard
        title={t('dashboard.employer.cards.compliance.title')}
        value={t('dashboard.employer.cards.compliance.value')}
        hint={t('dashboard.employer.cards.compliance.hint')}
        icon={<IconShield className="h-4 w-4" />}
      />
    </DashboardShell>
  )
}
