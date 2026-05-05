import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { WorkerReportCard } from '../../../api/worker-portal'
import { workerPortalApi } from '../../../api/worker-portal'
import { useTheme } from '../../../theme/theme-context'

export function ReportsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cards, setCards] = useState<WorkerReportCard[]>([])

  useEffect(() => {
    let active = true
    void workerPortalApi
      .getReportCards()
      .then((response) => {
        if (!active) return
        setCards(response)
        setError(null)
      })
      .catch(() => {
        if (!active) return
        setError(t('dashboard.workerPortal.states.fetchError'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [t])

  if (loading) return <State text={t('dashboard.workerPortal.states.loading')} theme={theme} />
  if (error) return <State text={error} theme={theme} isError />

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <article key={card.key} className={`rounded-xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-slate-300/80 bg-white'}`}>
          <p className={`text-xs ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>{t(`dashboard.workerPortal.overview.${card.key}`)}</p>
          <p className={`mt-3 font-display text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{card.value}</p>
        </article>
      ))}
    </div>
  )
}

function State({
  text,
  theme,
  isError = false,
}: {
  text: string
  theme: 'light' | 'dark'
  isError?: boolean
}) {
  return (
    <p
      className={`rounded-xl border px-3 py-2 text-sm ${
        isError
          ? theme === 'dark'
            ? 'border-amber-400/30 bg-amber-500/10 text-amber-100'
            : 'border-amber-300 bg-amber-50 text-amber-800'
          : theme === 'dark'
            ? 'border-white/10 bg-white/[0.04] text-white/75'
            : 'border-slate-300/80 bg-white text-slate-700'
      }`}
    >
      {text}
    </p>
  )
}
