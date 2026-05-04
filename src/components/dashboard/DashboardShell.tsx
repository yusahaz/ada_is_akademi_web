import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuth } from '../../auth/auth-context'
import { useTheme } from '../../theme/theme-context'

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
      <div
        className={`rounded-3xl border p-5 sm:p-7 ${
          theme === 'dark'
            ? 'border-white/10 bg-white/[0.04]'
            : 'border-slate-300/90 bg-white'
        }`}
      >
        <p
          className={`text-xs font-semibold uppercase tracking-[0.12em] ${
            theme === 'dark' ? 'text-[#14f1d9]' : 'text-sky-700'
          }`}
        >
          {t('dashboard.common.welcome', {
            email: session?.email ?? 'unknown',
          })}
        </p>
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
      </div>

      <div className="mt-5 grid gap-4 sm:mt-6 md:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  )
}
