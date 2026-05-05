import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { JobPostingSummary } from '../../../api/job-postings'
import { workerPortalApi } from '../../../api/worker-portal'
import { useTheme } from '../../../theme/theme-context'

export function ShiftsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<JobPostingSummary[]>([])
  const [submittingId, setSubmittingId] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    void workerPortalApi
      .listOpenShifts()
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

  const applyShift = async (id: number) => {
    setSubmittingId(id)
    try {
      await workerPortalApi.submitApplication(id)
      setError(null)
    } catch {
      setError(t('dashboard.workerPortal.shifts.submitError'))
    } finally {
      setSubmittingId(null)
    }
  }

  if (loading) return <State text={t('dashboard.workerPortal.states.loading')} theme={theme} />
  if (error && items.length === 0) return <State text={error} theme={theme} isError />
  if (items.length === 0) return <State text={t('dashboard.workerPortal.states.empty')} theme={theme} />

  return (
    <div className="space-y-3">
      {error ? <State text={error} theme={theme} isError /> : null}
      {items.map((item) => (
        <article key={item.id} className={`rounded-xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-slate-300/80 bg-white'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.title}</h2>
              <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
                {item.shiftDate} - {item.shiftStartTime} / {item.shiftEndTime}
              </p>
            </div>
            <button
              type="button"
              onClick={() => applyShift(item.id)}
              disabled={submittingId === item.id}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                theme === 'dark' ? 'bg-[#14f1d9]/20 text-[#14f1d9] disabled:opacity-50' : 'bg-sky-100 text-sky-700 disabled:opacity-50'
              }`}
            >
              {submittingId === item.id
                ? t('dashboard.workerPortal.shifts.submitting')
                : t('dashboard.workerPortal.shifts.submit')}
            </button>
          </div>
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
