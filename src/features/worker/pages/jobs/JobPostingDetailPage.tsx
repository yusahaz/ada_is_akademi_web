import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { jobPostingsApi, type JobPostingDetail } from '../../../../api/jobs/job-postings'
import { workerPortalApi } from '../../../../api/worker/worker-portal'
import { useActionToasts } from '../../../../notifications/use-action-toasts'
import { StatePanel } from '../../../../shared/ui/ui-primitives'
import { useTheme } from '../../../../theme/theme-context'
import { useWorkerAsyncData } from '../../hooks/useWorkerAsyncData'
import { WorkerGhostButton, WorkerPrimaryButton, WorkerSectionHeader } from '../../worker-ui'
import { postingShiftScheduleText } from './posting-detail-lines'

function parsePostingId(value: string | undefined): number | null {
  if (!value) return null
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function JobPostingDetailPage() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const { runWithToast } = useActionToasts()
  const params = useParams<{ postingId: string }>()
  const postingId = parsePostingId(params.postingId)
  const [submitting, setSubmitting] = useState(false)

  const query = useCallback(() => {
    if (postingId == null) {
      return Promise.reject(new Error('invalid-posting-id'))
    }
    return jobPostingsApi.getById({ jobPostingId: postingId })
  }, [postingId])

  const { loading, error, data } = useWorkerAsyncData<JobPostingDetail | null>(
    null,
    ['worker', 'posting-detail', postingId],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
    { enabled: postingId != null },
  )

  if (postingId == null) {
    return <StatePanel text={t('dashboard.workerPortal.states.fetchError')} theme={theme} isError />
  }

  if (loading) {
    return <StatePanel text={t('dashboard.workerPortal.states.loading')} theme={theme} />
  }

  if (error || !data) {
    return <StatePanel text={error ?? t('dashboard.workerPortal.states.fetchError')} theme={theme} isError />
  }

  const requiredSkills = data.skills.filter((s) => s.isRequired).map((s) => s.tag)
  const optionalSkills = data.skills.filter((s) => !s.isRequired).map((s) => s.tag)
  const chipCls =
    theme === 'dark'
      ? 'rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-0.5 text-xs text-white/80'
      : 'rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-700'
  const handleApply = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      await runWithToast(workerPortalApi.submitApplication(data.id), {
        success: { messageKey: 'dashboard.workerPortal.shifts.submitSuccess' },
        error: { messageKey: 'dashboard.workerPortal.shifts.submitError' },
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <WorkerSectionHeader
        tone={theme}
        title={data.title}
        subtitle={t('dashboard.workerPortal.shifts.card.postingRef', { id: data.id })}
        actions={<WorkerGhostButton tone={theme} onClick={() => navigate('/worker/jobs')}>{t('dashboard.workerPortal.tabs.jobs.actions.backToJobs')}</WorkerGhostButton>}
      />

      <article className={theme === 'dark' ? 'space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4' : 'space-y-4 rounded-2xl border border-slate-200 bg-white p-4'}>
        <p className={theme === 'dark' ? 'text-sm text-white/75' : 'text-sm text-slate-700'}>
          {postingShiftScheduleText(t, data, i18n.language)}
        </p>
        <p className={theme === 'dark' ? 'text-sm text-white/75' : 'text-sm text-slate-700'}>
          {t('dashboard.workerPortal.shifts.card.vacancy')}: {data.headCount}
        </p>
        <p className={theme === 'dark' ? 'text-sm font-semibold text-cyan-200' : 'text-sm font-semibold text-cyan-700'}>
          {data.wageAmount} {data.wageCurrency}
        </p>
        <p className={theme === 'dark' ? 'text-sm leading-relaxed text-white/85' : 'text-sm leading-relaxed text-slate-700'}>
          {data.description}
        </p>
        {requiredSkills.length > 0 ? (
          <div className="space-y-2">
            <p className={theme === 'dark' ? 'text-xs font-semibold uppercase tracking-wide text-white/50' : 'text-xs font-semibold uppercase tracking-wide text-slate-500'}>
              {t('dashboard.workerPortal.shifts.card.requiredSkills')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {requiredSkills.map((tag) => (
                <span key={`req-${tag}`} className={chipCls}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {optionalSkills.length > 0 ? (
          <div className="space-y-2">
            <p className={theme === 'dark' ? 'text-xs font-semibold uppercase tracking-wide text-white/50' : 'text-xs font-semibold uppercase tracking-wide text-slate-500'}>
              {t('dashboard.workerPortal.shifts.card.skills')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {optionalSkills.map((tag) => (
                <span key={`opt-${tag}`} className={chipCls}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        <div className="pt-2">
          <WorkerPrimaryButton tone={theme} className="w-full sm:w-auto sm:min-w-[12rem]" disabled={submitting} onClick={handleApply}>
            {submitting
              ? t('dashboard.workerPortal.shifts.submitting')
              : t('dashboard.workerPortal.shifts.submit')}
          </WorkerPrimaryButton>
        </div>
      </article>
    </div>
  )
}
