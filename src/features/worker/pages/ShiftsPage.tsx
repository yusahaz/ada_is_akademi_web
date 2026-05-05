import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { JobPostingSummary } from '../../../api/job-postings'
import { workerPortalApi } from '../../../api/worker-portal'
import { useTheme } from '../../../theme/theme-context'
import { DashboardSurface, StatePanel } from '../../../components/dashboard/ui-primitives'

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

  if (loading) return <StatePanel text={t('dashboard.workerPortal.states.loading')} theme={theme} />
  if (error && items.length === 0) return <StatePanel text={error} theme={theme} isError />
  if (items.length === 0) return <StatePanel text={t('dashboard.workerPortal.states.empty')} theme={theme} />

  return (
    <div className="space-y-3">
      {error ? <StatePanel text={error} theme={theme} isError /> : null}
      {items.map((item) => (
        <DashboardSurface key={item.id} theme={theme}>
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
        </DashboardSurface>
      ))}
    </div>
  )
}
