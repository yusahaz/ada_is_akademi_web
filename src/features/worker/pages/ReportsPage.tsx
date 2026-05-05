import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { WorkerReportCard } from '../../../api/worker-portal'
import { workerPortalApi } from '../../../api/worker-portal'
import { useTheme } from '../../../theme/theme-context'
import { DashboardSurface, StatePanel } from '../../../components/dashboard/ui-primitives'

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

  if (loading) return <StatePanel text={t('dashboard.workerPortal.states.loading')} theme={theme} />
  if (error) return <StatePanel text={error} theme={theme} isError />

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <DashboardSurface key={card.key} theme={theme}>
          <p className={`text-xs ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>{t(`dashboard.workerPortal.overview.${card.key}`)}</p>
          <p className={`mt-3 font-display text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{card.value}</p>
        </DashboardSurface>
      ))}
    </div>
  )
}
