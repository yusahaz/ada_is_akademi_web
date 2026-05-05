import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuth } from '../../auth/auth-context'
import { useTheme } from '../../theme/theme-context'
import { DashboardSurface, GlowBadge } from './ui-primitives'

type DashboardShellProps = {
  titleKey: string
  subtitleKey: string
  children: ReactNode
}

export function DashboardShell({
  titleKey,
  subtitleKey,
  children,
}: DashboardShellProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { session } = useAuth()

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <DashboardSurface theme={theme} className="sm:p-7">
        <GlowBadge theme={theme}>
          {t('dashboard.common.welcome', {
            email: session?.email ?? 'unknown',
          })}
        </GlowBadge>
        <h1
          className={`font-display mt-3 text-2xl font-semibold sm:text-3xl ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}
        >
          {t(titleKey)}
        </h1>
        <p
          className={`mt-2 max-w-2xl text-sm sm:text-base ${
            theme === 'dark' ? 'text-white/65' : 'text-slate-600'
          }`}
        >
          {t(subtitleKey)}
        </p>
      </DashboardSurface>

      <div className="mt-5 grid gap-4 sm:mt-6 md:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  )
}
