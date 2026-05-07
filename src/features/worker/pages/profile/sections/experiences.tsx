import { useState, type Dispatch, type SetStateAction } from 'react'

import { workerPortalApi } from '../../../../../api/worker/worker-portal'
import { useActionToasts } from '../../../../../notifications/use-action-toasts'

import type { ExperienceEditorDraft, WorkerProfileSectionItem } from '../types'
import {
  EditableListSection,
  ProfileInput,
} from './common'
import { dateInputClass, formatExperienceDate, type TFn, type WorkerTone } from './helpers'
import { WorkerPrimaryButton } from '../../../worker-ui'

export function ExperiencesSection({
  items,
  setItems,
  externalDraft,
  theme,
  t,
  runWithToast,
}: {
  items: WorkerProfileSectionItem[]
  setItems: Dispatch<SetStateAction<WorkerProfileSectionItem[]>>
  externalDraft: ExperienceEditorDraft | null
  theme: WorkerTone
  t: TFn
  runWithToast: ReturnType<typeof useActionToasts>['runWithToast']
}) {
  const [companyName, setCompanyName] = useState(externalDraft?.companyName ?? '')
  const [position, setPosition] = useState(externalDraft?.position ?? '')
  const [startDate, setStartDate] = useState(externalDraft?.startDate ?? '')
  const [endDate, setEndDate] = useState(externalDraft?.endDate ?? '')
  const [editingId, setEditingId] = useState<string | null>(externalDraft?.id ?? null)

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
        label: `${companyName} - ${position}`,
        value: `${formatExperienceDate(startDate)} - ${formatExperienceDate(endDate) || '...'}`,
      }
      setItems((prev) =>
        editingId
          ? [...prev.filter((item) => item.id !== editingId), nextItem]
          : [...prev, nextItem],
      )
      setCompanyName('')
      setPosition('')
      setStartDate('')
      setEndDate('')
      setEditingId(null)
    } catch {
      // toast already handled
    }
  }

  const removeItem = async (id: string) => {
    const numeric = Number(id)
    if (!Number.isFinite(numeric) || numeric <= 0) return
    try {
      await runWithToast(workerPortalApi.removeExperience(numeric), {
        success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
        error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
      })
      setItems((prev) => prev.filter((x) => x.id !== id))
      if (editingId === id) {
        setEditingId(null)
        setCompanyName('')
        setPosition('')
        setStartDate('')
        setEndDate('')
      }
    } catch {
      // toast already handled
    }
  }

  return (
    <EditableListSection
      title={t('dashboard.workerPortal.profile.experiences')}
      items={items}
      theme={theme}
      onRemove={removeItem}
      form={
        <div className="grid gap-2 sm:grid-cols-2">
          <ProfileInput
            theme={theme}
            label={t('dashboard.workerPortal.profile.fields.university')}
            value={companyName}
            onChange={setCompanyName}
          />
          <ProfileInput
            theme={theme}
            label={t('dashboard.workerPortal.profile.experiences')}
            value={position}
            onChange={setPosition}
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={dateInputClass(theme)}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={dateInputClass(theme)}
          />
          <WorkerPrimaryButton tone={theme} onClick={() => void addItem()} className="sm:col-span-2">
            {t('dashboard.workerPortal.profile.actions.save')}
          </WorkerPrimaryButton>
        </div>
      }
    />
  )
}
