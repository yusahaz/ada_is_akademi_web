import { useMemo, useState } from 'react'

import { workerPortalApi } from '../../../../../api/worker/worker-portal'
import { useActionToasts } from '../../../../../notifications/use-action-toasts'

import type { WorkerProfileData } from '../types'
import {
  ProfileInput,
  ProfileReadOnlyField,
} from './common'
import {
  type TFn,
  type WorkerProfileDraft,
  type WorkerTone,
  handleCancelEdit,
  handleStartEdit,
  normalizeValue,
  resolveMuted,
  resolveTitle,
} from './helpers'
import { WorkerGhostButton, WorkerPrimaryButton } from '../../../worker-ui'

export function BasicInfoSection({
  profile,
  theme,
  t,
  runWithToast,
}: {
  profile: WorkerProfileData
  theme: WorkerTone
  t: TFn
  runWithToast: ReturnType<typeof useActionToasts>['runWithToast']
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<WorkerProfileDraft | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'success' | 'validation-error'>('idle')
  const [savedProfilePatch, setSavedProfilePatch] = useState<Partial<WorkerProfileData>>({})

  const sectionProfile = useMemo<WorkerProfileData>(
    () => ({ ...profile, ...savedProfilePatch }),
    [profile, savedProfilePatch],
  )

  const currentProfile = useMemo<WorkerProfileData>(() => {
    if (!isEditing || !draft) return sectionProfile
    return {
      ...sectionProfile,
      fullName: draft.fullName,
      nationality: draft.nationality,
      university: draft.university,
    }
  }, [draft, isEditing, sectionProfile])

  const handleSaveProfile = async () => {
    if (!draft) return
    const fullName = draft.fullName.trim()
    if (fullName.length < 2) {
      setSaveState('validation-error')
      return
    }
    const [firstName, ...rest] = fullName.split(' ')
    const lastName = rest.join(' ').trim()
    try {
      await runWithToast(
        workerPortalApi.updateBasicProfile({
          firstName: firstName || null,
          lastName: lastName || null,
          nationality: draft.nationality.trim() || null,
          university: draft.university.trim() || null,
        }),
        {
          success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
          error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
        },
      )
      setSavedProfilePatch((prev) => ({
        ...prev,
        fullName,
        nationality: draft.nationality.trim() || sectionProfile.nationality,
        university: draft.university.trim() || sectionProfile.university,
      }))
      setSaveState('success')
      setDraft(null)
      setIsEditing(false)
    } catch {
      // toast handled
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={`text-sm font-semibold ${resolveTitle(theme)}`}>
          {t('dashboard.workerPortal.profile.basic')}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {isEditing ? (
            <>
              <WorkerGhostButton
                tone={theme}
                onClick={() => handleCancelEdit(setDraft, setIsEditing, setSaveState)}
              >
                {t('dashboard.workerPortal.profile.actions.cancel')}
              </WorkerGhostButton>
              <WorkerPrimaryButton tone={theme} onClick={() => void handleSaveProfile()}>
                {t('dashboard.workerPortal.profile.actions.save')}
              </WorkerPrimaryButton>
            </>
          ) : (
            <WorkerGhostButton
              tone={theme}
              onClick={() =>
                handleStartEdit(currentProfile, setDraft, setIsEditing, setSaveState)
              }
            >
              {t('dashboard.workerPortal.profile.actions.edit')}
            </WorkerGhostButton>
          )}
        </div>
      </div>
      {saveState === 'validation-error' ? (
        <p className="mt-3 rounded-xl border border-rose-300/50 bg-rose-50/80 px-3 py-2 text-sm text-rose-800 dark:border-rose-300/30 dark:bg-rose-400/10 dark:text-rose-100">
          {t('dashboard.workerPortal.profile.messages.validationError')}
        </p>
      ) : null}
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {isEditing && draft ? (
          <>
            <ProfileInput
              theme={theme}
              label={t('dashboard.workerPortal.profile.fields.fullName')}
              value={draft.fullName}
              onChange={(value) =>
                setDraft((prev) => (prev ? { ...prev, fullName: value } : prev))
              }
            />
            <ProfileInput
              theme={theme}
              label={t('dashboard.workerPortal.profile.fields.nationality')}
              value={draft.nationality}
              onChange={(value) =>
                setDraft((prev) => (prev ? { ...prev, nationality: value } : prev))
              }
            />
            <ProfileInput
              theme={theme}
              label={t('dashboard.workerPortal.profile.fields.university')}
              value={draft.university}
              onChange={(value) =>
                setDraft((prev) => (prev ? { ...prev, university: value } : prev))
              }
            />
            <ProfileReadOnlyField
              theme={theme}
              label={t('dashboard.workerPortal.profile.fields.email')}
              value={normalizeValue(currentProfile.email, t)}
            />
            <ProfileReadOnlyField
              theme={theme}
              label={t('dashboard.workerPortal.profile.fields.phone')}
              value={normalizeValue(currentProfile.phone, t)}
            />
          </>
        ) : (
          [
            {
              key: 'fullName',
              label: t('dashboard.workerPortal.profile.fields.fullName'),
              value: normalizeValue(currentProfile.fullName, t),
            },
            {
              key: 'email',
              label: t('dashboard.workerPortal.profile.fields.email'),
              value: normalizeValue(currentProfile.email, t),
            },
            {
              key: 'phone',
              label: t('dashboard.workerPortal.profile.fields.phone'),
              value: normalizeValue(currentProfile.phone, t),
            },
            {
              key: 'nationality',
              label: t('dashboard.workerPortal.profile.fields.nationality'),
              value: normalizeValue(currentProfile.nationality, t),
            },
            {
              key: 'university',
              label: t('dashboard.workerPortal.profile.fields.university'),
              value: normalizeValue(currentProfile.university, t),
            },
          ].map((row) => (
            <div
              key={row.key}
              className={`grid grid-cols-[120px_minmax(0,1fr)] items-start gap-2 rounded-xl px-3 py-2 text-sm ${theme === 'dark' ? 'bg-transparent text-white/80' : 'bg-transparent text-slate-700'}`}
            >
              <span className={resolveMuted(theme)}>{row.label}</span>
              <span className={resolveTitle(theme)}>{row.value}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
