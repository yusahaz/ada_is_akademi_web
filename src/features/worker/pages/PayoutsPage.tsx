import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { WorkerPayoutItem } from '../../../api/worker-portal'
import { workerPortalApi } from '../../../api/worker-portal'
import { useTheme } from '../../../theme/theme-context'
import { DashboardSurface, StatePanel } from '../../../components/dashboard/ui-primitives'

export function PayoutsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<WorkerPayoutItem[]>([])
  const [confirmedIds, setConfirmedIds] = useState<number[]>([])

  useEffect(() => {
    let active = true
    void workerPortalApi
      .listPayouts()
      .then((response) => {
        if (!active) return
        setItems(response)
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
  if (items.length === 0) return <StatePanel text={t('dashboard.workerPortal.states.empty')} theme={theme} />

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <DashboardSurface key={item.id} theme={theme}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.postingTitle}</p>
              <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>{item.amount}</p>
            </div>
            <span className={`rounded-md px-2 py-1 text-xs font-semibold ${theme === 'dark' ? 'bg-white/10 text-white/80' : 'bg-slate-100 text-slate-700'}`}>
              {t(`dashboard.workerPortal.payouts.status.${item.status}`)}
            </span>
          </div>
          {item.canConfirm ? (
            <button
              type="button"
              onClick={() => setConfirmedIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]))}
              className={`mt-3 rounded-md px-3 py-2 text-xs font-semibold ${
                theme === 'dark' ? 'bg-[#14f1d9]/20 text-[#14f1d9]' : 'bg-sky-100 text-sky-700'
              }`}
            >
              {confirmedIds.includes(item.id)
                ? t('dashboard.workerPortal.payouts.confirmed')
                : t('dashboard.workerPortal.payouts.confirm')}
            </button>
          ) : null}
        </DashboardSurface>
      ))}
    </div>
  )
}
