import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../../theme/theme-context'
import { DashboardSurface, InteractiveButton } from '../../components/dashboard/ui-primitives'

const navItems = [
  { to: '/worker', key: 'overview' },
  { to: '/worker/profile', key: 'profile' },
  { to: '/worker/cv-import', key: 'cvImport' },
  { to: '/worker/shifts', key: 'shifts' },
  { to: '/worker/applications', key: 'applications' },
  { to: '/worker/qr-check', key: 'qrCheck' },
  { to: '/worker/payouts', key: 'payouts' },
  { to: '/worker/reports', key: 'reports' },
]

type WorkerShellProps = {
  children: ReactNode
}

export function WorkerShell({ children }: WorkerShellProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()

  return (
    <section className="mx-auto w-full max-w-7xl px-3 py-4 pb-[max(env(safe-area-inset-bottom),1rem)] sm:px-5 sm:py-6 lg:px-8">
      <DashboardSurface theme={theme} className="p-3 sm:p-4">
        <nav className="overflow-x-auto pb-1">
          <ul className="flex min-w-max gap-2">
          {navItems.map((item) => (
            <li key={item.key}>
              <NavLink
                to={item.to}
                end={item.to === '/worker'}
                className="inline-flex"
              >
                {({ isActive }) => (
                  <InteractiveButton theme={theme} isActive={isActive}>
                    {t(`dashboard.workerPortal.nav.${item.key}`)}
                  </InteractiveButton>
                )}
              </NavLink>
            </li>
          ))}
          </ul>
        </nav>
      </DashboardSurface>

      <div className="mt-4">{children}</div>
    </section>
  )
}
