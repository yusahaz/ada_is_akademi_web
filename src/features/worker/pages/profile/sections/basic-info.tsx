import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Flag, GraduationCap, Mail, Phone, UserCircle2, Users } from 'lucide-react'

import { workerPortalApi } from '../../../../../api/worker/worker-portal'
import { WorkerGender } from '../../../../../api/core/enums'
import { useActionToasts } from '../../../../../notifications/use-action-toasts'
import { getNationalitySelectOptions } from '../../../../../shared/lib/nationality-options'

import type { WorkerProfileData } from '../types'
import {
  ProfileInput,
  ProfileReadOnlyField,
  ProfileSelect,
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

const COUNTRY_CODE_OPTIONS = ['+90', '+1', '+44', '+49', '+39', '+34', '+33', '+7', '+971'] as const

function formatPhoneMasked(digitsRaw: string): string {
  const digits = digitsRaw.replace(/\D/g, '').slice(0, 10)
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)].filter(Boolean)
  return parts.join(' ')
}

function formatGenderLabel(gender: WorkerGender, t: TFn): string {
  switch (gender) {
    case WorkerGender.Male:
      return t('dashboard.workerPortal.profile.gender.male')
    case WorkerGender.Female:
      return t('dashboard.workerPortal.profile.gender.female')
    default:
      return t('dashboard.workerPortal.profile.gender.unspecified')
  }
}

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
  const { i18n } = useTranslation()

  const nationalityOptions = useMemo(
    () => getNationalitySelectOptions(i18n.language, draft?.nationality),
    [i18n.language, draft?.nationality],
  )

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
      gender: draft.gender,
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
          gender: draft.gender,
          phone: draft.phoneNumber ? `${draft.phoneCountryCode}${draft.phoneNumber.replace(/\D/g, '')}` : null,
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
        gender: draft.gender,
        university: draft.university.trim() || sectionProfile.university,
        phone: draft.phoneNumber
          ? `${draft.phoneCountryCode} ${formatPhoneMasked(draft.phoneNumber)}`
          : sectionProfile.phone,
      }))
      setSaveState('success')
      setDraft(null)
      setIsEditing(false)
    } catch {
      // toast handled
    }
  }

  const readOnlyRows = [
    {
      key: 'fullName',
      label: t('dashboard.workerPortal.profile.fields.fullName'),
      rawValue: currentProfile.fullName,
      icon: UserCircle2,
    },
    {
      key: 'email',
      label: t('dashboard.workerPortal.profile.fields.email'),
      rawValue: currentProfile.email,
      icon: Mail,
    },
    {
      key: 'phone',
      label: t('dashboard.workerPortal.profile.fields.phone'),
      rawValue: currentProfile.phone,
      icon: Phone,
    },
    {
      key: 'nationality',
      label: t('dashboard.workerPortal.profile.fields.nationality'),
      rawValue: currentProfile.nationality,
      icon: Flag,
    },
    {
      key: 'gender',
      label: t('dashboard.workerPortal.profile.fields.gender'),
      rawValue: formatGenderLabel(currentProfile.gender, t),
      icon: Users,
    },
    {
      key: 'university',
      label: t('dashboard.workerPortal.profile.fields.university'),
      rawValue: currentProfile.university,
      icon: GraduationCap,
    },
  ] as const

  const completedFields = readOnlyRows.reduce((acc, row) => {
    const raw = typeof row.rawValue === 'string' ? row.rawValue.trim() : ''
    if (raw && raw !== 'N/A') return acc + 1
    return acc
  }, 0)

  return (
    <div className="space-y-4">
      <div
        className={`rounded-2xl border p-3 sm:p-4 ${
          theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50/80'
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h2 className={`text-base font-semibold leading-tight sm:text-lg ${resolveTitle(theme)}`}>
              {t('dashboard.workerPortal.profile.basic')}
            </h2>
            <p className={`text-xs leading-relaxed sm:text-sm ${resolveMuted(theme)}`}>
              {t('dashboard.workerPortal.profile.basicSection.subtitle')}
            </p>
            <p
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                theme === 'dark' ? 'bg-cyan-500/15 text-cyan-100' : 'bg-cyan-100 text-cyan-800'
              }`}
            >
              {t('dashboard.workerPortal.profile.basicSection.completion', {
                completed: completedFields,
                total: readOnlyRows.length,
              })}
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            {isEditing ? (
              <>
                <WorkerGhostButton
                  tone={theme}
                  className="h-10 w-full justify-center sm:w-auto sm:min-w-[7.5rem]"
                  onClick={() => handleCancelEdit(setDraft, setIsEditing, setSaveState)}
                >
                  {t('dashboard.workerPortal.profile.actions.cancel')}
                </WorkerGhostButton>
                <WorkerPrimaryButton tone={theme} className="h-10 w-full justify-center sm:w-auto sm:min-w-[7.5rem]" onClick={() => void handleSaveProfile()}>
                  {t('dashboard.workerPortal.profile.actions.save')}
                </WorkerPrimaryButton>
              </>
            ) : (
              <WorkerGhostButton
                tone={theme}
                className="h-10 w-full justify-center sm:w-auto sm:min-w-[8.5rem]"
                onClick={() =>
                  handleStartEdit(currentProfile, setDraft, setIsEditing, setSaveState)
                }
              >
                {t('dashboard.workerPortal.profile.actions.edit')}
              </WorkerGhostButton>
            )}
          </div>
        </div>
      </div>
      {saveState === 'validation-error' ? (
        <p className="mt-3 rounded-xl border border-rose-300/50 bg-rose-50/80 px-3 py-2 text-sm text-rose-800 dark:border-rose-300/30 dark:bg-rose-400/10 dark:text-rose-100">
          {t('dashboard.workerPortal.profile.messages.validationError')}
        </p>
      ) : null}
      <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <ProfileSelect
              theme={theme}
              label={t('dashboard.workerPortal.profile.fields.nationality')}
              value={draft.nationality}
              onChange={(value) =>
                setDraft((prev) => (prev ? { ...prev, nationality: value } : prev))
              }
              options={nationalityOptions}
              placeholder={t('dashboard.workerPortal.profile.fields.nationalityPlaceholder')}
            />
            <label className="space-y-1 text-sm">
              <span className={resolveMuted(theme)}>{t('dashboard.workerPortal.profile.fields.gender')}</span>
              <select
                value={String(draft.gender)}
                onChange={(event) =>
                  setDraft((prev) =>
                    prev ? { ...prev, gender: Number(event.target.value) as WorkerGender } : prev,
                  )
                }
                className={`min-w-0 w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 ${
                  theme === 'dark'
                    ? 'border-white/20 bg-white/[0.03] text-white'
                    : 'border-slate-200 bg-white text-slate-900'
                }`}
              >
                <option value={String(WorkerGender.Unspecified)}>
                  {t('dashboard.workerPortal.profile.gender.unspecified')}
                </option>
                <option value={String(WorkerGender.Male)}>{t('dashboard.workerPortal.profile.gender.male')}</option>
                <option value={String(WorkerGender.Female)}>{t('dashboard.workerPortal.profile.gender.female')}</option>
              </select>
            </label>
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
            <label className="space-y-1 text-sm sm:col-span-2">
              <span className={resolveMuted(theme)}>{t('dashboard.workerPortal.profile.fields.phone')}</span>
              <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-2">
                <select
                  value={draft.phoneCountryCode}
                  onChange={(event) =>
                    setDraft((prev) => (prev ? { ...prev, phoneCountryCode: event.target.value } : prev))
                  }
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 ${
                    theme === 'dark'
                      ? 'border-white/20 bg-white/[0.03] text-white'
                      : 'border-slate-200 bg-white text-slate-900'
                  }`}
                >
                  {COUNTRY_CODE_OPTIONS.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
                <input
                  value={formatPhoneMasked(draft.phoneNumber)}
                  onChange={(event) =>
                    setDraft((prev) =>
                      prev
                        ? {
                            ...prev,
                            phoneNumber: event.target.value.replace(/\D/g, '').slice(0, 10),
                          }
                        : prev,
                    )
                  }
                  placeholder="5xx xxx xx xx"
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 ${
                    theme === 'dark'
                      ? 'border-white/20 bg-white/[0.03] text-white placeholder:text-white/40'
                      : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>
            </label>
          </>
        ) : (
          readOnlyRows.map((row) => {
            const raw = typeof row.rawValue === 'string' ? row.rawValue.trim() : ''
            const isMissing = !raw || raw === 'N/A'
            const Icon = row.icon
            return (
              <div
                key={row.key}
                className={`rounded-2xl border px-3 py-3 text-sm sm:px-4 ${
                  theme === 'dark'
                    ? 'border-white/12 bg-white/[0.05] shadow-[0_10px_26px_rgba(0,0,0,0.28)]'
                    : 'border-slate-200/90 bg-white shadow-[0_8px_20px_rgba(15,23,42,0.06)]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`text-[11px] font-semibold tracking-wide ${resolveMuted(theme)}`}>
                      {row.label}
                    </p>
                  </div>
                  <span
                    className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                      theme === 'dark'
                        ? 'border-white/15 bg-white/[0.03] text-cyan-200'
                        : 'border-slate-200 bg-slate-50 text-cyan-700'
                    }`}
                  >
                    <Icon size={14} />
                  </span>
                </div>
                <p
                  className={`mt-2 min-w-0 text-sm leading-snug [overflow-wrap:anywhere] ${
                    isMissing
                      ? theme === 'dark'
                        ? 'italic text-white/55'
                        : 'italic text-slate-500'
                      : resolveTitle(theme)
                  }`}
                >
                  {isMissing ? '—' : raw}
                </p>
                {isMissing ? (
                  <p className={`mt-1 text-[11px] ${resolveMuted(theme)}`}>
                    {t('dashboard.workerPortal.profile.basicSection.missingHint')}
                  </p>
                ) : null}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
