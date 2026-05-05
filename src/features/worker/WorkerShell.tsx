import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../../theme/theme-context'

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
    <section className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <header
        className={`rounded-2xl border p-4 sm:p-5 ${
          theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-slate-300/80 bg-white'
        }`}
      >
        <h1
          className={`font-display text-xl font-semibold sm:text-2xl ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}
        >
          {t('dashboard.workerPortal.title')}
        </h1>
        <p className={`mt-2 text-sm sm:text-base ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
          {t('dashboard.workerPortal.subtitle')}
        </p>
      </header>

      <nav className="mt-4 overflow-x-auto pb-1">
        <ul className="flex min-w-max gap-2">
          {navItems.map((item) => (
            <li key={item.key}>
              <NavLink
                to={item.to}
                end={item.to === '/worker'}
                className={({ isActive }) =>
                  `inline-flex rounded-xl px-3 py-2 text-xs font-semibold sm:text-sm ${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-[#14f1d9]/20 text-[#14f1d9]'
                        : 'bg-sky-100 text-sky-700'
                      : theme === 'dark'
                        ? 'bg-white/[0.04] text-white/70'
                        : 'bg-slate-100 text-slate-600'
                  }`
                }
              >
                {t(`dashboard.workerPortal.nav.${item.key}`)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-4">{children}</div>
    </section>
  )
}
