import { useTranslation } from 'react-i18next'

import { DashboardHero } from '../../shared/ui/ui-primitives'
import { useTheme } from '../../theme/theme-context'

export type AdminPlaceholderSectionKey = 'candidates' | 'users' | 'userGroups' | 'createAdmin'

export function AdminSectionPlaceholder({ section }: { section: AdminPlaceholderSectionKey }) {
  const { t } = useTranslation()
  const { theme } = useTheme()

  const { title, description } =
    section === 'createAdmin'
      ? { title: t('dashboard.admin.register.title'), description: t('dashboard.admin.register.subtitle') }
      : section === 'candidates'
        ? { title: t('dashboard.admin.details.candidates.title'), description: t('dashboard.admin.details.candidates.body') }
        : section === 'users'
          ? { title: t('dashboard.admin.details.users.title'), description: t('dashboard.admin.details.users.body') }
          : { title: t('dashboard.admin.details.userGroups.title'), description: t('dashboard.admin.details.userGroups.body') }

  return (
    <DashboardHero theme={theme} title={title} description={description} />
  )
}
