import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { WorkerApplicationItem } from '../../../api/worker-portal'
import { workerPortalApi } from '../../../api/worker-portal'
import { useTheme } from '../../../theme/theme-context'

export function ApplicationsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<WorkerApplicationItem[]>([])

  useEffect(() => {
    let active = true
    void workerPortalApi
      .listApplications()
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

  if (loading) return <State text={t('dashboard.workerPortal.states.loading')} theme={theme} />
  if (error) return <State text={error} theme={theme} isError />
  if (items.length === 0) return <State text={t('dashboard.workerPortal.states.empty')} theme={theme} />

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article key={item.id} className={`rounded-xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-slate-300/80 bg-white'}`}>
          <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.title}</p>
          <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
            {item.shiftDate} - {item.shiftRange}
          </p>
          <span
            className={`mt-3 inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
              theme === 'dark' ? 'bg-white/10 text-white/80' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {t(`dashboard.workerPortal.applications.status.${item.status}`)}
          </span>
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
