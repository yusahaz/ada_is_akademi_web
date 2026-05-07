import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { jobPostingsApi } from '../../../api'
import type { CreateJobPostingCommand } from '../../../api/job-postings'
import { DashboardSurface, InteractiveButton, StatePanel } from '../../../components/dashboard/ui-primitives'
import { useActionToasts } from '../../../notifications/use-action-toasts'
import { useTheme } from '../../../theme/theme-context'
import { WorkerSectionHeader } from '../../worker/worker-ui'
import { useEmployerPortal } from '../use-employer-portal'

export function EmployerCreatePostingPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const { runWithToast } = useActionToasts()
  const { postings, employerLocations, reloadPostings } = useEmployerPortal()
  const toneClass = theme === 'dark' ? 'text-white/70' : 'text-slate-600'
  const inputClass = `h-11 w-full rounded-xl border px-3 text-sm ${
    theme === 'dark'
      ? 'border-white/15 bg-white/[0.04] text-white placeholder:text-white/40'
      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400'
  }`

  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [jobCategoryOptions, setJobCategoryOptions] = useState<number[]>([])
  const [createForm, setCreateForm] = useState<CreateJobPostingCommand>({
    title: '',
    description: '',
    employerLocationId: 0,
    jobCategoryId: 0,
    shiftDate: '',
    shiftStartTime: '00:00',
    shiftEndTime: '00:00',
    headCount: 1,
    wageAmount: 0,
    wageCurrency: 'TRY',
  })

  useEffect(() => {
    let isActive = true
    const postingIds = postings.slice(0, 20).map((posting) => posting.id)
    if (postingIds.length === 0) {
      void Promise.resolve().then(() => {
        if (isActive) setJobCategoryOptions([])
      })
      return () => {
        isActive = false
      }
    }

    void Promise.allSettled(postingIds.map((jobPostingId) => jobPostingsApi.getById({ jobPostingId }))).then((results) => {
      if (!isActive) return
      const unique = new Set<number>()
      results.forEach((result) => {
        if (result.status === 'fulfilled' && Number(result.value.jobCategoryId) > 0) {
          unique.add(Number(result.value.jobCategoryId))
        }
      })
      setJobCategoryOptions(Array.from(unique).sort((a, b) => a - b))
    })

    return () => {
      isActive = false
    }
  }, [postings])

  const handleCreatePosting = async () => {
    if (!createForm.title.trim() || !createForm.description.trim()) {
      setFormError(t('dashboard.employerSpot.operations.createPosting.validation.requiredText'))
      return
    }
    if (
      createForm.employerLocationId <= 0 ||
      createForm.jobCategoryId <= 0 ||
      !createForm.shiftDate ||
      !createForm.shiftStartTime ||
      !createForm.shiftEndTime ||
      createForm.headCount <= 0 ||
      createForm.wageAmount <= 0 ||
      !createForm.wageCurrency.trim()
    ) {
      setFormError(t('dashboard.employerSpot.operations.createPosting.validation.requiredFields'))
      return
    }

    setFormError(null)
    setSubmitting(true)
    try {
      await runWithToast(jobPostingsApi.create(createForm), {
        success: { messageKey: 'dashboard.employerSpot.operations.createPosting.submitSuccess' },
        error: { messageKey: 'dashboard.employerSpot.operations.createPosting.submitError' },
      })
      await reloadPostings()
      navigate('/employer/postings')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.employerSpot.operations.createPosting.title')}
        subtitle={t('dashboard.employerSpot.operations.createPosting.subtitle')}
      />
      <DashboardSurface theme={theme}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="w-full space-y-1">
            <span className={`text-xs font-medium ${toneClass}`}>{t('dashboard.employerSpot.operations.createPosting.fields.title')}</span>
            <input className={inputClass} value={createForm.title} onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))} />
          </label>
          <label className="w-full space-y-1">
            <span className={`text-xs font-medium ${toneClass}`}>{t('dashboard.employerSpot.operations.createPosting.fields.employerLocationId')}</span>
            <select className={inputClass} value={createForm.employerLocationId} onChange={(e) => setCreateForm((prev) => ({ ...prev, employerLocationId: Number(e.target.value) }))}>
              <option value={0}>{t('dashboard.employerSpot.operations.createPosting.fields.selectLocation')}</option>
              {employerLocations.map((loc) => (
                <option key={loc.locationId} value={loc.locationId}>
                  {loc.name}
                </option>
              ))}
            </select>
          </label>
          <label className="w-full space-y-1">
            <span className={`text-xs font-medium ${toneClass}`}>{t('dashboard.employerSpot.operations.createPosting.fields.jobCategoryId')}</span>
            <select className={inputClass} value={createForm.jobCategoryId} onChange={(e) => setCreateForm((prev) => ({ ...prev, jobCategoryId: Number(e.target.value) }))}>
              <option value={0}>{t('dashboard.employerSpot.operations.createPosting.fields.selectCategory')}</option>
              {jobCategoryOptions.map((categoryId) => (
                <option key={categoryId} value={categoryId}>
                  {t('dashboard.employerSpot.operations.createPosting.fields.categoryOption', { id: categoryId })}
                </option>
              ))}
            </select>
          </label>
          <label className="w-full space-y-1">
            <span className={`text-xs font-medium ${toneClass}`}>{t('dashboard.employerSpot.operations.createPosting.fields.shiftDate')}</span>
            <input className={inputClass} type="date" value={createForm.shiftDate} onChange={(e) => setCreateForm((prev) => ({ ...prev, shiftDate: e.target.value }))} />
          </label>
          <label className="w-full space-y-1">
            <span className={`text-xs font-medium ${toneClass}`}>{t('dashboard.employerSpot.operations.createPosting.fields.shiftStartTime')}</span>
            <input className={inputClass} type="time" value={createForm.shiftStartTime} onChange={(e) => setCreateForm((prev) => ({ ...prev, shiftStartTime: e.target.value }))} />
          </label>
          <label className="w-full space-y-1">
            <span className={`text-xs font-medium ${toneClass}`}>{t('dashboard.employerSpot.operations.createPosting.fields.shiftEndTime')}</span>
            <input className={inputClass} type="time" value={createForm.shiftEndTime} onChange={(e) => setCreateForm((prev) => ({ ...prev, shiftEndTime: e.target.value }))} />
          </label>
          <label className="w-full space-y-1">
            <span className={`text-xs font-medium ${toneClass}`}>{t('dashboard.employerSpot.operations.createPosting.fields.headCount')}</span>
            <input className={inputClass} type="number" min={1} value={createForm.headCount} onChange={(e) => setCreateForm((prev) => ({ ...prev, headCount: Number(e.target.value) }))} />
          </label>
          <label className="w-full space-y-1">
            <span className={`text-xs font-medium ${toneClass}`}>{t('dashboard.employerSpot.operations.createPosting.fields.wageAmount')}</span>
            <input className={inputClass} type="number" min={0} step="0.01" value={createForm.wageAmount} onChange={(e) => setCreateForm((prev) => ({ ...prev, wageAmount: Number(e.target.value) }))} />
          </label>
          <label className="w-full space-y-1">
            <span className={`text-xs font-medium ${toneClass}`}>{t('dashboard.employerSpot.operations.createPosting.fields.wageCurrency')}</span>
            <input className={inputClass} value={createForm.wageCurrency} onChange={(e) => setCreateForm((prev) => ({ ...prev, wageCurrency: e.target.value.toUpperCase() }))} />
          </label>
          <label className="w-full space-y-1 md:col-span-2">
            <span className={`text-xs font-medium ${toneClass}`}>{t('dashboard.employerSpot.operations.createPosting.fields.description')}</span>
            <textarea className={`${inputClass} h-28 py-2`} value={createForm.description} onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))} />
          </label>
        </div>
        {formError ? <StatePanel theme={theme} text={formError} /> : null}
        <div className="mt-4">
          <button type="button" onClick={() => void handleCreatePosting()} disabled={submitting}>
            <InteractiveButton theme={theme} className={submitting ? 'opacity-70' : ''}>
              {submitting ? t('dashboard.employerSpot.operations.createPosting.submitting') : t('dashboard.employerSpot.operations.createPosting.submit')}
            </InteractiveButton>
          </button>
        </div>
      </DashboardSurface>
    </>
  )
}
