import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { JobPostingSummary } from '../../../api/job-postings'
import { workerPortalApi } from '../../../api/worker-portal'
import { useActionToasts } from '../../../notifications/use-action-toasts'
import { useTheme } from '../../../theme/theme-context'
import { DashboardSurface, StatePanel } from '../../../components/dashboard/ui-primitives'
import { WorkerPrimaryButton, WorkerSectionHeader } from '../worker-ui'
import { useWorkerAsyncData } from '../hooks/useWorkerAsyncData'

export type ShiftsPageProps = {
  embedded?: boolean
}

export function ShiftsPage({ embedded = false }: ShiftsPageProps = {}) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { runWithToast } = useActionToasts()
  const query = useCallback(() => workerPortalApi.listOpenShifts(), [])
  const { loading, error, data: items, reload } = useWorkerAsyncData<JobPostingSummary[]>(
    [],
    ['worker', 'open-shifts'],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
  )
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submittingId, setSubmittingId] = useState<number | null>(null)

  const renderHeader = () =>
    embedded ? null : (
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.workerPortal.pages.shifts.title')}
        subtitle={t('dashboard.workerPortal.pages.shifts.subtitle')}
      />
    )

  const applyShift = async (id: number) => {
    setSubmittingId(id)
    try {
      await runWithToast(workerPortalApi.submitApplication(id), {
        success: { messageKey: 'dashboard.workerPortal.shifts.submitSuccess' },
        error: { messageKey: 'dashboard.workerPortal.shifts.submitError' },
      })
      setSubmitError(null)
      await reload()
    } catch {
      setSubmitError(t('dashboard.workerPortal.shifts.submitError'))
    } finally {
      setSubmittingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {renderHeader()}
        <StatePanel text={t('dashboard.workerPortal.states.loading')} theme={theme} />
      </div>
    )
  }
  if (error && items.length === 0) {
    return (
      <div className="space-y-4">
        {renderHeader()}
        <StatePanel text={error} theme={theme} isError />
      </div>
    )
  }
  if (items.length === 0) {
    return (
      <div className="space-y-4">
        {renderHeader()}
        <StatePanel text={t('dashboard.workerPortal.states.empty')} theme={theme} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {renderHeader()}
      {submitError ? <StatePanel text={submitError} theme={theme} isError /> : null}
      {items.map((item) => (
        <DashboardSurface key={item.id} theme={theme} className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.title}</h2>
              <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-white/65' : 'text-slate-600'}`}>
                {t('dashboard.workerPortal.overview.employerPrefix', { id: item.employerId })}
              </p>
              <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-white/75' : 'text-slate-700'}`}>
                {t('dashboard.workerPortal.shifts.wageLabel')}: {item.wageAmount} {item.wageCurrency}
              </p>
              <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
                {item.shiftDate} - {item.shiftStartTime} / {item.shiftEndTime}
              </p>
            </div>
            <WorkerPrimaryButton
              tone={theme}
              onClick={() => applyShift(item.id)}
              disabled={submittingId === item.id}
            >
              {submittingId === item.id ? t('dashboard.workerPortal.shifts.submitting') : t('dashboard.workerPortal.shifts.submit')}
            </WorkerPrimaryButton>
          </div>
        </DashboardSurface>
      ))}
    </div>
  )
}
