import type { ReactNode } from 'react'

import { useTheme } from '../../theme/theme-context'

type DashboardCardProps = {
  title: string
  value: string
  hint?: string
  icon: ReactNode
}

export function DashboardCard({ title, value, hint, icon }: DashboardCardProps) {
  const { theme } = useTheme()

  return (
    <article
      className={`h-full rounded-3xl border p-4 backdrop-blur-xl sm:p-6 ${
        theme === 'dark'
          ? 'border-white/10 bg-white/[0.04]'
          : 'border-slate-300/80 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h2
          className={`text-sm font-medium ${
            theme === 'dark' ? 'text-white/70' : 'text-slate-600'
          }`}
        >
          {title}
        </h2>
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
            theme === 'dark'
              ? 'bg-[#14f1d9]/12 text-[#14f1d9]'
              : 'bg-sky-100 text-sky-700'
          }`}
        >
          {icon}
        </span>
      </div>
      <p
        className={`font-display mt-5 text-2xl font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-slate-900'
        }`}
      >
        {value}
      </p>
      {hint ? (
        <p
          className={`mt-2 text-sm ${
            theme === 'dark' ? 'text-white/60' : 'text-slate-600'
          }`}
        >
          {hint}
        </p>
      ) : null}
    </article>
  )
}
