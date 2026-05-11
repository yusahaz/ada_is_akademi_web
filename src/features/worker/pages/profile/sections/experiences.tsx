import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'

import { workerPortalApi } from '../../../../../api/worker/worker-portal'
import { useActionToasts } from '../../../../../notifications/use-action-toasts'

import type { ExperienceEditorDraft, WorkerProfileSectionItem } from '../types'
import { ProfileInput } from './common'
import {
  dateInputClass,
  type TFn,
  type WorkerTone,
  resolveMuted,
  resolveTitle,
} from './helpers'
import { WorkerGhostButton, WorkerPrimaryButton } from '../../../worker-ui'

function dateToMonthValue(value: string): string {
  const normalized = value.trim()
  if (!normalized) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized.slice(0, 7)
  return ''
}

function monthValueToDate(value: string): string {
  const normalized = value.trim()
  if (!normalized || !/^\d{4}-\d{2}$/.test(normalized)) return ''
  return `${normalized}-01`
}

function formatExperienceMonth(value: string): string {
  const parsed = value ? new Date(value) : null
  if (!parsed || Number.isNaN(parsed.getTime())) return ''
  return parsed.toLocaleDateString('tr-TR', { month: '2-digit', year: 'numeric' })
}

export function ExperiencesSection({
  setItems,
  externalDraft,
  theme,
  t,
  runWithToast,
  onClose,
}: {
  setItems: Dispatch<SetStateAction<WorkerProfileSectionItem[]>>
  externalDraft: ExperienceEditorDraft | null
  theme: WorkerTone
  t: TFn
  runWithToast: ReturnType<typeof useActionToasts>['runWithToast']
  onClose: () => void
}) {
  const { i18n } = useTranslation()
  const inputLocale = (i18n.resolvedLanguage || i18n.language || 'tr').toLowerCase()
  const [companyName, setCompanyName] = useState(externalDraft?.companyName ?? '')
  const [position, setPosition] = useState(externalDraft?.position ?? '')
  const [startDate, setStartDate] = useState(externalDraft?.startDate ?? '')
  const [endDate, setEndDate] = useState(externalDraft?.endDate ?? '')
  const [startMonth, setStartMonth] = useState(dateToMonthValue(externalDraft?.startDate ?? ''))
  const [endMonth, setEndMonth] = useState(dateToMonthValue(externalDraft?.endDate ?? ''))
  const [editingId, setEditingId] = useState<string | null>(externalDraft?.id ?? null)

  useEffect(() => {
    setCompanyName(externalDraft?.companyName ?? '')
    setPosition(externalDraft?.position ?? '')
    setStartDate(externalDraft?.startDate ?? '')
    setEndDate(externalDraft?.endDate ?? '')
    setStartMonth(dateToMonthValue(externalDraft?.startDate ?? ''))
    setEndMonth(dateToMonthValue(externalDraft?.endDate ?? ''))
    setEditingId(externalDraft?.id ?? null)
  }, [externalDraft])

  const isEdit = Boolean(editingId)
  const tk = (k: string) => t(`dashboard.workerPortal.profile.experienceSection.${k}`)

  const addItem = async () => {
    if (!companyName.trim() || !position.trim() || !startDate) return
    try {
      if (editingId) {
        const editingNumericId = Number(editingId)
        if (Number.isFinite(editingNumericId) && editingNumericId > 0) {
          await workerPortalApi.removeExperience(editingNumericId)
        }
      }
      const id = await runWithToast(
        workerPortalApi.addExperience({
          companyName: companyName.trim(),
          position: position.trim(),
          startDate,
          endDate: endDate || null,
          description: null,
        }),
        {
          success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
          error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
        },
      )
      const nextItem = {
        id: String(id),
        label: `${companyName.trim()} - ${position.trim()}`,
        value: `${formatExperienceMonth(startDate)} - ${formatExperienceMonth(endDate) || '...'}`,
      }
      setItems((prev) =>
        editingId ? [...prev.filter((item) => item.id !== editingId), nextItem] : [...prev, nextItem],
      )
      onClose()
    } catch {
      // toast already handled
    }
  }

  return (
    <div className={`space-y-4 border-t pt-4 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200/80'}`}>
      <div className="space-y-1">
        <h3 className={`text-base font-semibold leading-tight sm:text-lg ${resolveTitle(theme)}`}>
          {isEdit ? tk('formEditTitle') : tk('formAddTitle')}
        </h3>
        <p className={`text-xs leading-relaxed sm:text-sm ${resolveMuted(theme)}`}>{tk('formSubtitle')}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ProfileInput theme={theme} label={tk('company')} value={companyName} onChange={setCompanyName} />
        <ProfileInput theme={theme} label={tk('position')} value={position} onChange={setPosition} />
        <div className="grid grid-cols-2 gap-3 sm:col-span-2">
          <label className="space-y-1 text-sm min-w-0">
            <span className={resolveMuted(theme)}>{tk('startDate')}</span>
            <input
              type="month"
              lang={inputLocale}
              value={startMonth}
              onChange={(e) => {
                const next = e.target.value
                setStartMonth(next)
                setStartDate(monthValueToDate(next))
              }}
              className={dateInputClass(theme)}
            />
          </label>
          <div className="space-y-1 text-sm min-w-0">
            <label className="flex flex-col gap-1">
              <span className={resolveMuted(theme)}>{tk('endDate')}</span>
              <input
                type="month"
                lang={inputLocale}
                value={endMonth}
                onChange={(e) => {
                  const next = e.target.value
                  setEndMonth(next)
                  setEndDate(monthValueToDate(next))
                }}
                className={dateInputClass(theme)}
              />
            </label>
            <p className={`text-[11px] leading-snug sm:text-xs ${resolveMuted(theme)}`}>{tk('endDateHint')}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end sm:gap-3">
        <WorkerGhostButton tone={theme} className="h-10 w-full justify-center sm:w-auto sm:min-w-[7.5rem]" onClick={onClose}>
          {t('dashboard.workerPortal.profile.actions.cancel')}
        </WorkerGhostButton>
        <WorkerPrimaryButton
          tone={theme}
          className="h-10 w-full justify-center sm:w-auto sm:min-w-[7.5rem]"
          onClick={() => void addItem()}
          disabled={!companyName.trim() || !position.trim() || !startDate}
        >
          {t('dashboard.workerPortal.profile.actions.save')}
        </WorkerPrimaryButton>
      </div>
    </div>
  )
}
