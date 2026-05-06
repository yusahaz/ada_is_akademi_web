import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { workerPortalApi } from '../../../api/worker-portal'
import { useTheme } from '../../../theme/theme-context'
import { DashboardSurface, StatePanel } from '../../../components/dashboard/ui-primitives'
import { WorkerGhostButton, WorkerPrimaryButton, WorkerSectionHeader } from '../worker-ui'
import { useWorkerAsyncData } from '../hooks/useWorkerAsyncData'

type WorkerProfileSectionItem = {
  id: string
  label: string
  value: string
}

type WorkerProfileData = {
  fullName: string
  email: string
  nationality: string
  university: string
  studentNumber: string
  skills: string[]
  educations: WorkerProfileSectionItem[]
  experiences: WorkerProfileSectionItem[]
  certificates: WorkerProfileSectionItem[]
  references: WorkerProfileSectionItem[]
  languages: WorkerProfileSectionItem[]
}

export function ProfilePage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [searchParams] = useSearchParams()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<WorkerProfileDraft | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'success' | 'validation-error'>('idle')
  const activeSection = searchParams.get('section') ?? 'basic'
  const isBasicSection = activeSection === 'basic'
  const sectionLabelKey = getProfileSectionLabelKey(activeSection)
  const query = useCallback(() => workerPortalApi.getProfile(), [])
  const { loading, error, data: profile } = useWorkerAsyncData<WorkerProfileData | null>(
    null,
    ['worker', 'profile'],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
  )

  const currentProfile = useMemo(
    () => (isEditing && draft ? mergeProfileDraft(profile, draft) : profile),
    [draft, isEditing, profile],
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <WorkerSectionHeader tone={theme} title={t('dashboard.workerPortal.pages.profile.title')} subtitle={t('dashboard.workerPortal.pages.profile.subtitle')} />
        <StatePanel text={t('dashboard.workerPortal.states.loading')} theme={theme} />
      </div>
    )
  }
  if (error) {
    return (
      <div className="space-y-4">
        <WorkerSectionHeader tone={theme} title={t('dashboard.workerPortal.pages.profile.title')} subtitle={t('dashboard.workerPortal.pages.profile.subtitle')} />
        <StatePanel text={error} theme={theme} isError />
      </div>
    )
  }
  if (!currentProfile) {
    return (
      <div className="space-y-4">
        <WorkerSectionHeader tone={theme} title={t('dashboard.workerPortal.pages.profile.title')} subtitle={t('dashboard.workerPortal.pages.profile.subtitle')} />
        <StatePanel text={t('dashboard.workerPortal.states.empty')} theme={theme} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <WorkerSectionHeader tone={theme} title={t('dashboard.workerPortal.pages.profile.title')} subtitle={t('dashboard.workerPortal.pages.profile.subtitle')} />
      <DashboardSurface theme={theme}>
        {!isBasicSection ? (
          <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/80">
            <p className={`text-sm font-semibold ${resolveTitle(theme)}`}>{t(sectionLabelKey)}</p>
            <p className={`mt-1 text-xs ${resolveMuted(theme)}`}>{t('dashboard.workerPortal.profile.menuComingSoon')}</p>
          </div>
        ) : null}
        <div className={isBasicSection ? 'block' : 'hidden'}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className={`text-sm font-semibold ${resolveTitle(theme)}`}>{t('dashboard.workerPortal.profile.basic')}</h2>
            <div className="flex flex-wrap items-center gap-2">
              {isEditing ? (
                <>
                  <WorkerGhostButton tone={theme} onClick={() => handleCancelEdit(setDraft, setIsEditing, setSaveState)}>
                    {t('dashboard.workerPortal.profile.actions.cancel')}
                  </WorkerGhostButton>
                  <WorkerPrimaryButton tone={theme} onClick={() => handleSaveEdit(draft, setIsEditing, setSaveState)}>
                    {t('dashboard.workerPortal.profile.actions.save')}
                  </WorkerPrimaryButton>
                </>
              ) : (
                <WorkerGhostButton tone={theme} onClick={() => handleStartEdit(currentProfile, setDraft, setIsEditing, setSaveState)}>
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
          {saveState === 'success' ? (
            <p className="mt-3 rounded-xl border border-emerald-300/50 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-300/30 dark:bg-emerald-400/10 dark:text-emerald-100">
              {t('dashboard.workerPortal.profile.messages.savedLocal')}
            </p>
          ) : null}

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {isEditing && draft ? (
              <>
                <ProfileInput
                  theme={theme}
                  label={t('dashboard.workerPortal.profile.fields.fullName')}
                  value={draft.fullName}
                  onChange={(value) => setDraft((prev) => (prev ? { ...prev, fullName: value } : prev))}
                />
                <ProfileInput
                  theme={theme}
                  label={t('dashboard.workerPortal.profile.fields.nationality')}
                  value={draft.nationality}
                  onChange={(value) => setDraft((prev) => (prev ? { ...prev, nationality: value } : prev))}
                />
                <ProfileInput
                  theme={theme}
                  label={t('dashboard.workerPortal.profile.fields.university')}
                  value={draft.university}
                  onChange={(value) => setDraft((prev) => (prev ? { ...prev, university: value } : prev))}
                />
                <ProfileReadOnlyField
                  theme={theme}
                  label={t('dashboard.workerPortal.profile.fields.email')}
                  value={normalizeValue(currentProfile.email, t)}
                />
                <ProfileReadOnlyField
                  theme={theme}
                  label={t('dashboard.workerPortal.profile.fields.studentNumber')}
                  value={normalizeValue(currentProfile.studentNumber, t)}
                />
              </>
            ) : (
              [
                t('dashboard.workerPortal.profile.fullName', { value: normalizeValue(currentProfile.fullName, t) }),
                t('dashboard.workerPortal.profile.email', { value: normalizeValue(currentProfile.email, t) }),
                t('dashboard.workerPortal.profile.nationality', { value: normalizeValue(currentProfile.nationality, t) }),
                t('dashboard.workerPortal.profile.university', { value: normalizeValue(currentProfile.university, t) }),
                t('dashboard.workerPortal.profile.studentNumber', { value: normalizeValue(currentProfile.studentNumber, t) }),
              ].map((row) => (
                <p
                  key={row}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-white/80' : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  {row}
                </p>
              ))
            )}
          </div>
        </div>
      </DashboardSurface>

      {isBasicSection ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            key: 'skills',
            label: t('dashboard.workerPortal.profile.skills'),
            value: currentProfile.skills.length.toString(),
          },
          {
            key: 'educations',
            label: t('dashboard.workerPortal.profile.educations'),
            value: currentProfile.educations.length.toString(),
          },
          {
            key: 'experiences',
            label: t('dashboard.workerPortal.profile.experiences'),
            value: currentProfile.experiences.length.toString(),
          },
          {
            key: 'completion',
            label: t('dashboard.workerPortal.profile.completion'),
            value: `${calculateCompletion(currentProfile)}%`,
          },
        ].map((item) => (
          <DashboardSurface key={item.key} theme={theme}>
            <p className={`text-xs ${resolveMuted(theme)}`}>{item.label}</p>
            <p className={`mt-2 text-2xl font-semibold ${resolveTitle(theme)}`}>{item.value}</p>
          </DashboardSurface>
        ))}
        </div>
      ) : null}

      {isBasicSection ? (
        <div className="grid gap-3 lg:grid-cols-2">
        {[
          { key: 'educations', title: t('dashboard.workerPortal.profile.educations'), items: currentProfile.educations },
          { key: 'experiences', title: t('dashboard.workerPortal.profile.experiences'), items: currentProfile.experiences },
          { key: 'certificates', title: t('dashboard.workerPortal.profile.certificates'), items: currentProfile.certificates },
          { key: 'languages', title: t('dashboard.workerPortal.profile.languages'), items: currentProfile.languages },
        ].map((group) => (
          <DashboardSurface key={group.key} theme={theme}>
            <h3 className={`text-sm font-semibold ${resolveTitle(theme)}`}>{group.title}</h3>
            <div className="mt-3 space-y-2">
              {group.items.length === 0 ? (
                <StatePanel text={t('dashboard.workerPortal.states.empty')} theme={theme} />
              ) : (
                group.items.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-white/80' : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <p className={resolveTitle(theme)}>{normalizeValue(item.label, t)}</p>
                    <p className={`mt-1 text-xs ${resolveMuted(theme)}`}>{normalizeValue(item.value, t)}</p>
                  </div>
                ))
              )}
            </div>
          </DashboardSurface>
        ))}
        </div>
      ) : null}
      {isBasicSection ? (
        <DashboardSurface theme={theme}>
        <h2 className={`text-sm font-semibold ${resolveTitle(theme)}`}>{t('dashboard.workerPortal.profile.references')}</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {currentProfile.references.length === 0 ? (
            <StatePanel text={t('dashboard.workerPortal.states.empty')} theme={theme} />
          ) : (
            currentProfile.references.slice(0, 6).map((reference) => (
              <div
                key={reference.id}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-white/80' : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <p className={resolveTitle(theme)}>{normalizeValue(reference.label, t)}</p>
                <p className={`mt-1 text-xs ${resolveMuted(theme)}`}>{normalizeValue(reference.value, t)}</p>
              </div>
            ))
          )}
        </div>
        </DashboardSurface>
      ) : null}
    </div>
  )
}

function getProfileSectionLabelKey(section: string) {
  if (section === 'contact') return 'dashboard.workerPortal.profile.menu.contact'
  if (section === 'password') return 'dashboard.workerPortal.profile.menu.password'
  if (section === 'emailNotifications') return 'dashboard.workerPortal.profile.menu.emailNotifications'
  if (section === 'smsNotifications') return 'dashboard.workerPortal.profile.menu.smsNotifications'
  if (section === 'adVisibility') return 'dashboard.workerPortal.profile.menu.adVisibility'
  if (section === 'accountControl') return 'dashboard.workerPortal.profile.menu.accountControl'
  return 'dashboard.workerPortal.profile.menu.basic'
}

type WorkerProfileDraft = Pick<WorkerProfileData, 'fullName' | 'nationality' | 'university'>

function toDraft(profile: WorkerProfileData): WorkerProfileDraft {
  return {
    fullName: profile.fullName ?? '',
    nationality: profile.nationality ?? '',
    university: profile.university ?? '',
  }
}

function mergeProfileDraft(
  profile: WorkerProfileData | null,
  draft: WorkerProfileDraft | null,
): WorkerProfileData | null {
  if (!profile || !draft) return profile
  return {
    ...profile,
    fullName: draft.fullName,
    nationality: draft.nationality,
    university: draft.university,
  }
}

function handleStartEdit(
  profile: WorkerProfileData,
  setDraft: Dispatch<SetStateAction<WorkerProfileDraft | null>>,
  setIsEditing: Dispatch<SetStateAction<boolean>>,
  setSaveState: Dispatch<SetStateAction<'idle' | 'success' | 'validation-error'>>,
) {
  setDraft(toDraft(profile))
  setSaveState('idle')
  setIsEditing(true)
}

function handleCancelEdit(
  setDraft: Dispatch<SetStateAction<WorkerProfileDraft | null>>,
  setIsEditing: Dispatch<SetStateAction<boolean>>,
  setSaveState: Dispatch<SetStateAction<'idle' | 'success' | 'validation-error'>>,
) {
  setDraft(null)
  setSaveState('idle')
  setIsEditing(false)
}

function handleSaveEdit(
  draft: WorkerProfileDraft | null,
  setIsEditing: Dispatch<SetStateAction<boolean>>,
  setSaveState: Dispatch<SetStateAction<'idle' | 'success' | 'validation-error'>>,
) {
  if (!draft) return

  const fullName = draft.fullName.trim()
  if (fullName.length < 2) {
    setSaveState('validation-error')
    return
  }

  setSaveState('success')
  setIsEditing(false)
}

function ProfileInput({
  theme,
  label,
  value,
  onChange,
}: {
  theme: 'dark' | 'light'
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className={resolveMuted(theme)}>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 ${
          theme === 'dark'
            ? 'border-white/20 bg-white/[0.03] text-white placeholder:text-white/40'
            : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
        }`}
      />
    </label>
  )
}

function ProfileReadOnlyField({
  theme,
  label,
  value,
}: {
  theme: 'dark' | 'light'
  label: string
  value: string
}) {
  return (
    <div className="space-y-1 text-sm">
      <p className={resolveMuted(theme)}>{label}</p>
      <p
        className={`rounded-xl border px-3 py-2 ${
          theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-white/80' : 'border-slate-200 bg-slate-50 text-slate-700'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function resolveTitle(theme: 'light' | 'dark') {
  return theme === 'dark' ? 'text-white' : 'text-slate-900'
}

function resolveMuted(theme: 'light' | 'dark') {
  return theme === 'dark' ? 'text-white/75' : 'text-slate-600'
}

function normalizeValue(value: string | null | undefined, t: (key: string, options?: Record<string, unknown>) => string) {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (!normalized || normalized === 'N/A') {
    return t('dashboard.workerPortal.states.empty')
  }
  return normalized
}

function calculateCompletion(profile: WorkerProfileData) {
  const checks = [
    profile.fullName.trim().length > 0,
    profile.email.trim().length > 0,
    profile.nationality.trim().length > 0 && profile.nationality !== 'N/A',
    profile.university.trim().length > 0 && profile.university !== 'N/A',
    profile.skills.length > 0,
    profile.educations.length > 0,
    profile.experiences.length > 0,
    profile.languages.length > 0,
  ]
  const completed = checks.filter(Boolean).length
  return Math.round((completed / checks.length) * 100)
}
