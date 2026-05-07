import { useCallback, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'

import { workerPortalApi, type WorkerAvailabilitySlot } from '../../../api/worker-portal'
import { useTheme } from '../../../theme/theme-context'
import { DashboardSurface, StatePanel } from '../../../components/dashboard/ui-primitives'
import { WorkerGhostButton, WorkerPrimaryButton, WorkerSectionHeader } from '../worker-ui'
import { useWorkerAsyncData } from '../hooks/useWorkerAsyncData'
import { useActionToasts } from '../../../notifications/use-action-toasts'

type WorkerProfileSectionItem = {
  id: string
  label: string
  value: string
}

type ExperienceEditorDraft = {
  id: string
  companyName: string
  position: string
  startDate: string
  endDate: string
}

type WorkerProfileData = {
  workerId: number
  systemUserId: number
  fullName: string
  email: string
  nationality: string
  university: string
  studentNumber: string
  skills: Array<{ id: number; tag: string }>
  educations: WorkerProfileSectionItem[]
  experiences: WorkerProfileSectionItem[]
  certificates: WorkerProfileSectionItem[]
  references: WorkerProfileSectionItem[]
  languages: WorkerProfileSectionItem[]
}

export function ProfilePage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { runWithToast } = useActionToasts()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeSection = searchParams.get('section') ?? 'basic'
  const isBasicSection = activeSection === 'basic'
  const isExperiencesSection = activeSection === 'experiences'
  const isSkillsSection = activeSection === 'skills'
  const isCertificatesSection = activeSection === 'certificates'
  const isReferencesSection = activeSection === 'references'
  const isAvailabilitySection = activeSection === 'availability'
  const isPasswordSection = activeSection === 'password'
  const isAccountControlSection = activeSection === 'accountControl'
  const isComingSoonSection =
    !isBasicSection &&
    !isExperiencesSection &&
    !isSkillsSection &&
    !isCertificatesSection &&
    !isReferencesSection &&
    !isAvailabilitySection &&
    !isPasswordSection &&
    !isAccountControlSection
  const sectionLabelKey = getProfileSectionLabelKey(activeSection)
  const query = useCallback(() => workerPortalApi.getProfile(), [])
  const { loading, error, data: profile } = useWorkerAsyncData<WorkerProfileData | null>(
    null,
    ['worker', 'profile'],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
  )

  const currentProfile = useMemo(() => profile, [profile])
  const [experienceItems, setExperienceItems] = useState<WorkerProfileSectionItem[]>(
    currentProfile?.experiences ?? [],
  )
  const [experienceEditorDraft, setExperienceEditorDraft] = useState<ExperienceEditorDraft | null>(null)
  const [showExperienceEditor, setShowExperienceEditor] = useState(false)

  useEffect(() => {
    setExperienceItems(currentProfile?.experiences ?? [])
  }, [currentProfile])

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
      <ProfileSectionMenu theme={theme} t={t} active={activeSection} onChange={(next) => setSearchParams({ section: next })} />
      {isExperiencesSection ? (
        <ExperiencesOverviewCard
          items={experienceItems}
          theme={theme}
          t={t}
          onAdd={() => setShowExperienceEditor(true)}
          onDelete={async (id) => {
            const numericId = Number(id)
            if (!Number.isFinite(numericId) || numericId <= 0) return
            try {
              await runWithToast(workerPortalApi.removeExperience(numericId), {
                success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
                error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
              })
              setExperienceItems((prev) => prev.filter((item) => item.id !== id))
            } catch {
              // toast already handled
            }
          }}
          onEdit={(item) => {
            setExperienceEditorDraft(toExperienceEditorDraft(item))
            setShowExperienceEditor(true)
          }}
        />
      ) : null}
      <DashboardSurface theme={theme}>
        {isComingSoonSection ? (
          <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/80">
            <p className={`text-sm font-semibold ${resolveTitle(theme)}`}>{t(sectionLabelKey)}</p>
            <p className={`mt-1 text-xs ${resolveMuted(theme)}`}>{t('dashboard.workerPortal.profile.menuComingSoon')}</p>
          </div>
        ) : null}
        {isBasicSection ? (
          <BasicInfoSection
            profile={currentProfile}
            theme={theme}
            t={t}
            runWithToast={runWithToast}
          />
        ) : null}
        {isExperiencesSection && showExperienceEditor ? (
          <ExperiencesSection
            items={experienceItems}
            setItems={setExperienceItems}
            externalDraft={experienceEditorDraft}
            clearExternalDraft={() => setExperienceEditorDraft(null)}
            theme={theme}
            t={t}
            runWithToast={runWithToast}
          />
        ) : null}
        {isSkillsSection ? (
          <SkillsSection workerId={currentProfile.workerId} initialSkills={currentProfile.skills} />
        ) : null}
        {isCertificatesSection ? (
          <CertificatesSection profile={currentProfile} theme={theme} t={t} runWithToast={runWithToast} />
        ) : null}
        {isReferencesSection ? (
          <ReferencesSection profile={currentProfile} theme={theme} t={t} runWithToast={runWithToast} />
        ) : null}
        {isAvailabilitySection ? <AvailabilitySection /> : null}
        {isPasswordSection ? (
          <PasswordSection profile={currentProfile} theme={theme} t={t} runWithToast={runWithToast} />
        ) : null}
        {isAccountControlSection ? (
          <AccountControlSection profile={currentProfile} theme={theme} t={t} runWithToast={runWithToast} />
        ) : null}
      </DashboardSurface>

    </div>
  )
}

function ProfileSectionMenu({
  theme,
  t,
  active,
  onChange,
}: {
  theme: 'dark' | 'light'
  t: (key: string, options?: Record<string, unknown>) => string
  active: string
  onChange: (next: string) => void
}) {
  const items = [
    { id: 'basic', label: t('dashboard.workerPortal.profile.menu.basic') },
    { id: 'experiences', label: t('dashboard.workerPortal.profile.menu.experiences') },
    { id: 'skills', label: t('dashboard.workerPortal.profile.menu.skills') },
    { id: 'certificates', label: t('dashboard.workerPortal.profile.menu.certificates') },
    { id: 'references', label: t('dashboard.workerPortal.profile.menu.references') },
    { id: 'availability', label: t('dashboard.workerPortal.profile.menu.availability') },
    { id: 'password', label: t('dashboard.workerPortal.profile.menu.password') },
    { id: 'accountControl', label: t('dashboard.workerPortal.profile.menu.accountControl') },
  ]
  return (
    <div
      role="tablist"
      aria-label={t('dashboard.workerPortal.profile.settingsMenu')}
      className="-mx-1 flex flex-wrap items-center gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {items.map((item) => {
        const isActive = item.id === active
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={[
              'inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 sm:text-sm',
              isActive
                ? theme === 'dark'
                  ? 'bg-cyan-500/20 text-cyan-100 ring-1 ring-inset ring-cyan-300/40'
                  : 'bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-300/70'
                : theme === 'dark'
                  ? 'text-white/65 hover:bg-white/[0.06] hover:text-white/85'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-800',
            ].join(' ')}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

function getProfileSectionLabelKey(section: string) {
  if (section === 'skills') return 'dashboard.workerPortal.profile.menu.skills'
  if (section === 'experiences') return 'dashboard.workerPortal.profile.menu.experiences'
  if (section === 'certificates') return 'dashboard.workerPortal.profile.menu.certificates'
  if (section === 'references') return 'dashboard.workerPortal.profile.menu.references'
  if (section === 'password') return 'dashboard.workerPortal.profile.menu.password'
  if (section === 'accountControl') return 'dashboard.workerPortal.profile.menu.accountControl'
  if (section === 'availability') return 'dashboard.workerPortal.profile.menu.availability'
  return 'dashboard.workerPortal.profile.menu.basic'
}

function BasicInfoSection({
  profile,
  theme,
  t,
  runWithToast,
}: {
  profile: WorkerProfileData
  theme: 'dark' | 'light'
  t: (key: string, options?: Record<string, unknown>) => string
  runWithToast: ReturnType<typeof useActionToasts>['runWithToast']
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<WorkerProfileDraft | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'success' | 'validation-error'>('idle')
  const currentProfile = useMemo<WorkerProfileData>(() => {
    if (!isEditing || !draft) return profile
    return {
      ...profile,
      fullName: draft.fullName,
      nationality: draft.nationality,
      university: draft.university,
    }
  }, [draft, isEditing, profile])

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
      setSaveState('success')
      setIsEditing(false)
    } catch {
      // toast handled
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={`text-sm font-semibold ${resolveTitle(theme)}`}>{t('dashboard.workerPortal.profile.basic')}</h2>
        <div className="flex flex-wrap items-center gap-2">
          {isEditing ? (
            <>
              <WorkerGhostButton tone={theme} onClick={() => handleCancelEdit(setDraft, setIsEditing, setSaveState)}>
                {t('dashboard.workerPortal.profile.actions.cancel')}
              </WorkerGhostButton>
              <WorkerPrimaryButton tone={theme} onClick={() => void handleSaveProfile()}>
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
      <div className="mt-3 grid gap-2">
        {isEditing && draft ? (
          <>
            <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.fields.fullName')} value={draft.fullName} onChange={(value) => setDraft((prev) => (prev ? { ...prev, fullName: value } : prev))} />
            <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.fields.nationality')} value={draft.nationality} onChange={(value) => setDraft((prev) => (prev ? { ...prev, nationality: value } : prev))} />
            <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.fields.university')} value={draft.university} onChange={(value) => setDraft((prev) => (prev ? { ...prev, university: value } : prev))} />
            <ProfileReadOnlyField theme={theme} label={t('dashboard.workerPortal.profile.fields.email')} value={normalizeValue(currentProfile.email, t)} />
          </>
        ) : (
          [
            t('dashboard.workerPortal.profile.fullName', { value: normalizeValue(currentProfile.fullName, t) }),
            t('dashboard.workerPortal.profile.email', { value: normalizeValue(currentProfile.email, t) }),
            t('dashboard.workerPortal.profile.nationality', { value: normalizeValue(currentProfile.nationality, t) }),
            t('dashboard.workerPortal.profile.university', { value: normalizeValue(currentProfile.university, t) }),
          ].map((row) => (
            <p key={row} className={`rounded-xl border px-3 py-2 text-sm ${theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-white/80' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
              {row}
            </p>
          ))
        )}
      </div>
    </div>
  )
}

function ExperiencesSection({
  items,
  setItems,
  externalDraft,
  clearExternalDraft,
  theme,
  t,
  runWithToast,
}: {
  items: WorkerProfileSectionItem[]
  setItems: Dispatch<SetStateAction<WorkerProfileSectionItem[]>>
  externalDraft: ExperienceEditorDraft | null
  clearExternalDraft: () => void
  theme: 'dark' | 'light'
  t: (key: string, options?: Record<string, unknown>) => string
  runWithToast: ReturnType<typeof useActionToasts>['runWithToast']
}) {
  const [companyName, setCompanyName] = useState('')
  const [position, setPosition] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (!externalDraft) return
    setEditingId(externalDraft.id)
    setCompanyName(externalDraft.companyName)
    setPosition(externalDraft.position)
    setStartDate(externalDraft.startDate)
    setEndDate(externalDraft.endDate)
    clearExternalDraft()
  }, [clearExternalDraft, externalDraft])

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
        { success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' }, error: { messageKey: 'dashboard.workerPortal.states.fetchError' } },
      )
      const nextItem = { id: String(id), label: `${companyName} - ${position}`, value: `${formatExperienceDate(startDate)} - ${formatExperienceDate(endDate) || '...'}` }
      setItems((prev) => (editingId ? [...prev.filter((item) => item.id !== editingId), nextItem] : [...prev, nextItem]))
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
          <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.fields.university')} value={companyName} onChange={setCompanyName} />
          <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.experiences')} value={position} onChange={setPosition} />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={dateInputClass(theme)} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={dateInputClass(theme)} />
          <WorkerPrimaryButton tone={theme} onClick={() => void addItem()} className="sm:col-span-2">
            {t('dashboard.workerPortal.profile.actions.save')}
          </WorkerPrimaryButton>
        </div>
      }
    />
  )
}

function ExperiencesOverviewCard({
  items,
  theme,
  t,
  onAdd,
  onEdit,
  onDelete,
}: {
  items: WorkerProfileSectionItem[]
  theme: 'dark' | 'light'
  t: (key: string, options?: Record<string, unknown>) => string
  onAdd: () => void
  onEdit: (item: WorkerProfileSectionItem) => void
  onDelete: (id: string) => Promise<void> | void
}) {
  return (
    <DashboardSurface theme={theme}>
      <div className="flex items-center justify-between gap-2">
        <h3 className={`text-sm font-semibold ${resolveTitle(theme)}`}>
          {t('dashboard.workerPortal.profile.experiences')}
        </h3>
        <WorkerGhostButton tone={theme} onClick={onAdd}>
          {t('dashboard.workerPortal.profile.actions.add')}
        </WorkerGhostButton>
      </div>
      <div className="mt-3 grid gap-2">
        {items.length === 0 ? (
          <StatePanel text={t('dashboard.workerPortal.states.empty')} theme={theme} />
        ) : (
          items.map((item) => (
            <div
              key={`experience-overview-${item.id}`}
              className={`rounded-xl border px-3 py-2 text-sm ${
                theme === 'dark'
                  ? 'border-white/10 bg-white/[0.03] text-white/80'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={resolveTitle(theme)}>{normalizeValue(item.label, t)}</p>
                  <p className={`mt-1 text-xs ${resolveMuted(theme)}`}>{normalizeValue(item.value, t)}</p>
                </div>
                <div className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    aria-label={t('dashboard.workerPortal.profile.actions.edit')}
                    className={`rounded-lg p-1.5 transition ${
                      theme === 'dark'
                        ? 'text-cyan-200 hover:bg-cyan-400/20'
                        : 'text-sky-700 hover:bg-sky-100'
                    }`}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDelete(item.id)}
                    aria-label={t('dashboard.workerPortal.availability.deleteAction')}
                    className={`rounded-lg p-1.5 transition ${
                      theme === 'dark'
                        ? 'text-rose-200 hover:bg-rose-400/20'
                        : 'text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardSurface>
  )
}

function CertificatesSection({
  profile,
  theme,
  t,
  runWithToast,
}: {
  profile: WorkerProfileData
  theme: 'dark' | 'light'
  t: (key: string, options?: Record<string, unknown>) => string
  runWithToast: ReturnType<typeof useActionToasts>['runWithToast']
}) {
  const [items, setItems] = useState(profile.certificates)
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [issuedAt, setIssuedAt] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  const addItem = async () => {
    if (!name.trim() || !organization.trim() || !issuedAt) return
    try {
      const id = await runWithToast(
        workerPortalApi.addCertificate({
          name: name.trim(),
          issuingOrganization: organization.trim(),
          issuedAt,
          expiresAt: expiresAt || null,
          documentUrl: null,
        }),
        { success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' }, error: { messageKey: 'dashboard.workerPortal.states.fetchError' } },
      )
      setItems((prev) => [...prev, { id: String(id), label: name, value: `${organization} • ${issuedAt}${expiresAt ? ` - ${expiresAt}` : ''}` }])
      setName('')
      setOrganization('')
      setIssuedAt('')
      setExpiresAt('')
    } catch {
      // toast already handled
    }
  }

  const removeItem = async (id: string) => {
    const numeric = Number(id)
    if (!Number.isFinite(numeric) || numeric <= 0) return
    try {
      await runWithToast(workerPortalApi.removeCertificate(numeric), {
        success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
        error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
      })
      setItems((prev) => prev.filter((x) => x.id !== id))
    } catch {
      // toast already handled
    }
  }

  return (
    <EditableListSection
      title={t('dashboard.workerPortal.profile.certificates')}
      items={items}
      theme={theme}
      onRemove={removeItem}
      form={
        <div className="grid gap-2 sm:grid-cols-2">
          <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.certificates')} value={name} onChange={setName} />
          <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.fields.university')} value={organization} onChange={setOrganization} />
          <input type="date" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} className={dateInputClass(theme)} />
          <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={dateInputClass(theme)} />
          <WorkerPrimaryButton tone={theme} onClick={() => void addItem()} className="sm:col-span-2">
            {t('dashboard.workerPortal.profile.actions.save')}
          </WorkerPrimaryButton>
        </div>
      }
    />
  )
}

function ReferencesSection({
  profile,
  theme,
  t,
  runWithToast,
}: {
  profile: WorkerProfileData
  theme: 'dark' | 'light'
  t: (key: string, options?: Record<string, unknown>) => string
  runWithToast: ReturnType<typeof useActionToasts>['runWithToast']
}) {
  const [items, setItems] = useState(profile.references)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const [email, setEmail] = useState('')

  const addItem = async () => {
    if (!firstName.trim() || !lastName.trim() || !company.trim() || !position.trim() || !email.trim()) return
    try {
      const id = await runWithToast(
        workerPortalApi.addReference({
          company: company.trim(),
          position: position.trim(),
          contactFirstName: firstName.trim(),
          contactLastName: lastName.trim(),
          contactEmail: email.trim(),
          contactPhone: null,
        }),
        { success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' }, error: { messageKey: 'dashboard.workerPortal.states.fetchError' } },
      )
      setItems((prev) => [...prev, { id: String(id), label: `${firstName} ${lastName}`, value: `${company} • ${position} • ${email}` }])
      setFirstName('')
      setLastName('')
      setCompany('')
      setPosition('')
      setEmail('')
    } catch {
      // toast already handled
    }
  }

  const removeItem = async (id: string) => {
    const numeric = Number(id)
    if (!Number.isFinite(numeric) || numeric <= 0) return
    try {
      await runWithToast(workerPortalApi.removeReference(numeric), {
        success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
        error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
      })
      setItems((prev) => prev.filter((x) => x.id !== id))
    } catch {
      // toast already handled
    }
  }

  return (
    <EditableListSection
      title={t('dashboard.workerPortal.profile.references')}
      items={items}
      theme={theme}
      onRemove={removeItem}
      form={
        <div className="grid gap-2 sm:grid-cols-2">
          <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.fields.fullName')} value={firstName} onChange={setFirstName} />
          <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.fields.fullName')} value={lastName} onChange={setLastName} />
          <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.fields.university')} value={company} onChange={setCompany} />
          <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.experiences')} value={position} onChange={setPosition} />
          <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.fields.email')} value={email} onChange={setEmail} />
          <WorkerPrimaryButton tone={theme} onClick={() => void addItem()} className="sm:col-span-2">
            {t('dashboard.workerPortal.profile.actions.save')}
          </WorkerPrimaryButton>
        </div>
      }
    />
  )
}

function PasswordSection({
  profile,
  theme,
  t,
  runWithToast,
}: {
  profile: WorkerProfileData
  theme: 'dark' | 'light'
  t: (key: string, options?: Record<string, unknown>) => string
  runWithToast: ReturnType<typeof useActionToasts>['runWithToast']
}) {
  const [password, setPassword] = useState('')
  const submit = async () => {
    if (password.trim().length < 6 || !profile.systemUserId) return
    await runWithToast(
      workerPortalApi.changePassword(profile.systemUserId, password.trim()),
      { success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' }, error: { messageKey: 'dashboard.workerPortal.states.fetchError' } },
    )
    setPassword('')
  }
  return (
    <div className="space-y-2">
      <p className={`text-sm font-semibold ${resolveTitle(theme)}`}>{t('dashboard.workerPortal.profile.menu.password')}</p>
      <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.menu.password')} value={password} onChange={setPassword} />
      <WorkerPrimaryButton tone={theme} onClick={() => void submit()}>
        {t('dashboard.workerPortal.profile.actions.save')}
      </WorkerPrimaryButton>
    </div>
  )
}

function AccountControlSection({
  profile,
  theme,
  t,
  runWithToast,
}: {
  profile: WorkerProfileData
  theme: 'dark' | 'light'
  t: (key: string, options?: Record<string, unknown>) => string
  runWithToast: ReturnType<typeof useActionToasts>['runWithToast']
}) {
  const suspend = async () => {
    if (!profile.systemUserId) return
    await runWithToast(workerPortalApi.suspendAccount(profile.systemUserId), {
      success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
      error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
    })
  }
  const remove = async () => {
    if (!profile.workerId) return
    await runWithToast(workerPortalApi.deleteWorker(profile.workerId), {
      success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
      error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
    })
  }
  return (
    <div className="space-y-2">
      <p className={`text-sm font-semibold ${resolveTitle(theme)}`}>{t('dashboard.workerPortal.profile.menu.accountControl')}</p>
      <div className="flex flex-wrap gap-2">
        <WorkerGhostButton tone={theme} onClick={() => void suspend()}>
          {t('dashboard.workerPortal.profile.accountActions.suspend')}
        </WorkerGhostButton>
        <WorkerPrimaryButton tone={theme} onClick={() => void remove()}>
          {t('dashboard.workerPortal.profile.accountActions.delete')}
        </WorkerPrimaryButton>
      </div>
    </div>
  )
}

function EditableListSection({
  title,
  items,
  theme,
  onRemove,
  form,
}: {
  title: string
  items: WorkerProfileSectionItem[]
  theme: 'dark' | 'light'
  onRemove: (id: string) => void
  form: ReactNode
}) {
  return (
    <div className="space-y-3">
      <h3 className={`text-sm font-semibold ${resolveTitle(theme)}`}>{title}</h3>
      {form}
      <div className="grid gap-2 sm:grid-cols-2">
        {items.length === 0 ? (
          <StatePanel text="-" theme={theme} />
        ) : (
          items.map((item) => (
            <div key={item.id} className={`rounded-xl border px-3 py-2 text-sm ${theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-white/80' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
              <div className="flex items-start justify-between gap-2">
                <p className={resolveTitle(theme)}>{normalizeValue(item.label, () => '-')}</p>
                <button type="button" onClick={() => onRemove(item.id)} className={theme === 'dark' ? 'text-rose-200' : 'text-rose-700'}>
                  ×
                </button>
              </div>
              <p className={`mt-1 text-xs ${resolveMuted(theme)}`}>{item.value}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function SkillsSection({
  workerId,
  initialSkills,
}: {
  workerId: number
  initialSkills: Array<{ id: number; tag: string }>
}) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { runWithToast } = useActionToasts()
  const [skills, setSkills] = useState(initialSkills)
  const [newSkill, setNewSkill] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)

  const handleAddSkill = async () => {
    const tag = newSkill.trim()
    if (!tag || submitting || !workerId) return
    if (skills.some((item) => item.tag.toLowerCase() === tag.toLowerCase())) return
    setSubmitting(true)
    try {
      const skillId = await runWithToast(workerPortalApi.addWorkerSkill(workerId, tag), {
        success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
        error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
      })
      setSkills((prev) => [...prev, { id: Number(skillId) || Date.now(), tag }])
      setNewSkill('')
    } catch {
      // toast already handled
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveSkill = async (skillId: number) => {
    if (!skillId || removingId) return
    setRemovingId(skillId)
    try {
      await runWithToast(workerPortalApi.removeWorkerSkill(skillId), {
        success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
        error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
      })
      setSkills((prev) => prev.filter((item) => item.id !== skillId))
    } catch {
      // toast already handled
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div>
      <p className={`text-sm font-semibold ${resolveTitle(theme)}`}>
        {t('dashboard.workerPortal.profile.skillsSection.title')}
      </p>
      <p className={`mt-1 text-xs ${resolveMuted(theme)}`}>
        {t('dashboard.workerPortal.profile.skillsSection.subtitle')}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={newSkill}
          onChange={(event) => setNewSkill(event.target.value)}
          placeholder={t('dashboard.workerPortal.profile.skillsSection.inputPlaceholder')}
          className={`w-full min-w-[12rem] flex-1 rounded-xl border px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 ${
            theme === 'dark'
              ? 'border-white/20 bg-white/[0.03] text-white placeholder:text-white/40'
              : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
          }`}
        />
        <WorkerPrimaryButton tone={theme} onClick={() => void handleAddSkill()} disabled={submitting || !newSkill.trim()}>
          {t('dashboard.workerPortal.profile.skillsSection.add')}
        </WorkerPrimaryButton>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {skills.length === 0 ? (
          <StatePanel text={t('dashboard.workerPortal.profile.skillsSection.empty')} theme={theme} />
        ) : (
          skills.map((skill) => (
            <span
              key={skill.id}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs ${
                theme === 'dark'
                  ? 'border-white/15 bg-white/[0.04] text-white/85'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <span>{skill.tag}</span>
              <button
                type="button"
                onClick={() => void handleRemoveSkill(skill.id)}
                disabled={removingId === skill.id}
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold transition ${
                  theme === 'dark'
                    ? 'text-rose-200 hover:bg-rose-400/20 disabled:opacity-50'
                    : 'text-rose-700 hover:bg-rose-100 disabled:opacity-50'
                }`}
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  )
}

function AvailabilitySection() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { runWithToast } = useActionToasts()
  const query = useCallback(() => workerPortalApi.getAvailabilityCalendar(), [])
  const { loading, error, data: slots, setData: setSlots } = useWorkerAsyncData<WorkerAvailabilitySlot[]>(
    [],
    ['worker', 'availability'],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
  )
  const [isEditing, setIsEditing] = useState(false)
  const [draftByDay, setDraftByDay] = useState<Record<number, { enabled: boolean; timeFrom: string; timeTo: string }>>({})
  const [saveState, setSaveState] = useState<'idle' | 'success'>('idle')
  const [removingAvailabilityId, setRemovingAvailabilityId] = useState<string | null>(null)

  const orderedDays = useMemo(() => [1, 2, 3, 4, 5, 6, 0], [])
  const dayLabels = useMemo(
    () =>
      orderedDays.map((day) => ({
        day,
        label: t(`dashboard.workerPortal.availability.days.${day}`),
      })),
    [orderedDays, t],
  )

  const slotsByDay = useMemo(() => {
    const map = new Map<number, WorkerAvailabilitySlot[]>()
    for (const slot of slots) {
      const day = Number(slot.dayOfWeek)
      if (!Number.isFinite(day)) continue
      const list = map.get(day) ?? []
      list.push(slot)
      map.set(day, list)
    }
    return map
  }, [slots])

  const canSave = useMemo(() => {
    return Object.values(draftByDay).every((item) => {
      if (!item.enabled) return true
      if (!item.timeFrom || !item.timeTo) return false
      return item.timeFrom < item.timeTo
    })
  }, [draftByDay])

  const handleStartEdit = () => {
    const initialDraft: Record<number, { enabled: boolean; timeFrom: string; timeTo: string }> = {}
    for (let day = 0; day <= 6; day += 1) {
      const firstSlot = slotsByDay.get(day)?.[0]
      initialDraft[day] = {
        enabled: Boolean(firstSlot),
        timeFrom: firstSlot?.timeFrom || '09:00',
        timeTo: firstSlot?.timeTo || '18:00',
      }
    }
    setDraftByDay(initialDraft)
    setSaveState('idle')
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setDraftByDay({})
    setSaveState('idle')
    setIsEditing(false)
  }

  const handleSaveEdit = async () => {
    const nextSlots: WorkerAvailabilitySlot[] = []
    for (let day = 0; day <= 6; day += 1) {
      const draft = draftByDay[day]
      if (!draft?.enabled) continue
      nextSlots.push({
        id: `draft-${day}`,
        dayOfWeek: day,
        timeFrom: draft.timeFrom,
        timeTo: draft.timeTo,
      })
    }
    try {
      const savedSlots = await runWithToast(workerPortalApi.saveAvailabilityCalendar(nextSlots), {
        success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
        error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
      })
      setSlots(savedSlots)
      setSaveState('success')
      setIsEditing(false)
    } catch {
      // Toast already shown by runWithToast.
    }
  }

  const handleRemoveAvailability = async (slotId: string) => {
    const numericId = Number(slotId)
    if (!Number.isFinite(numericId) || numericId <= 0 || removingAvailabilityId) return
    setRemovingAvailabilityId(slotId)
    try {
      await runWithToast(workerPortalApi.removeAvailability(numericId), {
        success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
        error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
      })
      setSlots((prev) => prev.filter((item) => item.id !== slotId))
    } catch {
      // toast already handled
    } finally {
      setRemovingAvailabilityId(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className={`text-sm font-semibold ${resolveTitle(theme)}`}>
            {t('dashboard.workerPortal.profile.menu.availability')}
          </p>
          <p className={`mt-1 text-xs ${resolveMuted(theme)}`}>
            {t('dashboard.workerPortal.availability.description')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isEditing ? (
            <>
              <WorkerGhostButton tone={theme} onClick={handleCancelEdit}>
                {t('dashboard.workerPortal.profile.actions.cancel')}
              </WorkerGhostButton>
              <WorkerPrimaryButton tone={theme} onClick={() => void handleSaveEdit()} disabled={!canSave}>
                {t('dashboard.workerPortal.profile.actions.save')}
              </WorkerPrimaryButton>
            </>
          ) : (
            <WorkerGhostButton tone={theme} onClick={handleStartEdit}>
              {t('dashboard.workerPortal.availability.editAction')}
            </WorkerGhostButton>
          )}
        </div>
      </div>

      {loading ? (
        <div className="mt-3">
          <StatePanel theme={theme} text={t('dashboard.workerPortal.states.loading')} />
        </div>
      ) : null}
      {error ? (
        <div className="mt-3">
          <StatePanel theme={theme} text={error} isError />
        </div>
      ) : null}
      {saveState === 'success' ? (
        <p className="mt-3 rounded-xl border border-emerald-300/50 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-300/30 dark:bg-emerald-400/10 dark:text-emerald-100">
          {t('dashboard.workerPortal.profile.messages.savedLocal')}
        </p>
      ) : null}
      {!loading && !error ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {dayLabels.map(({ day, label }) => {
            const list = slotsByDay.get(day) ?? []
            const draft = draftByDay[day]
            return (
              <div
                key={label}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-white/80' : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <p className={`text-xs font-semibold ${resolveTitle(theme)}`}>{label}</p>
                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={Boolean(draft?.enabled)}
                        onChange={(event) =>
                          setDraftByDay((prev) => ({
                            ...prev,
                            [day]: {
                              enabled: event.target.checked,
                              timeFrom: prev[day]?.timeFrom ?? '09:00',
                              timeTo: prev[day]?.timeTo ?? '18:00',
                            },
                          }))
                        }
                        className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-400/45"
                      />
                      <span className={resolveMuted(theme)}>{t('dashboard.workerPortal.availability.enableDay')}</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={draft?.timeFrom ?? '09:00'}
                        onChange={(event) =>
                          setDraftByDay((prev) => ({
                            ...prev,
                            [day]: {
                              enabled: prev[day]?.enabled ?? false,
                              timeFrom: event.target.value,
                              timeTo: prev[day]?.timeTo ?? '18:00',
                            },
                          }))
                        }
                        disabled={!draft?.enabled}
                        className={`w-full rounded-xl border px-2 py-1.5 text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 ${
                          theme === 'dark'
                            ? 'border-white/20 bg-white/[0.03] text-white disabled:opacity-50'
                            : 'border-slate-200 bg-white text-slate-900 disabled:opacity-50'
                        }`}
                      />
                      <input
                        type="time"
                        value={draft?.timeTo ?? '18:00'}
                        onChange={(event) =>
                          setDraftByDay((prev) => ({
                            ...prev,
                            [day]: {
                              enabled: prev[day]?.enabled ?? false,
                              timeFrom: prev[day]?.timeFrom ?? '09:00',
                              timeTo: event.target.value,
                            },
                          }))
                        }
                        disabled={!draft?.enabled}
                        className={`w-full rounded-xl border px-2 py-1.5 text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 ${
                          theme === 'dark'
                            ? 'border-white/20 bg-white/[0.03] text-white disabled:opacity-50'
                            : 'border-slate-200 bg-white text-slate-900 disabled:opacity-50'
                        }`}
                      />
                    </div>
                  </div>
                ) : list.length === 0 ? (
                  <p className={`mt-1 text-[11px] ${resolveMuted(theme)}`}>
                    {t('dashboard.workerPortal.availability.empty')}
                  </p>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {list.map((slot) => (
                      <li key={slot.id} className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] ${resolveMuted(theme)}`}>
                          {slot.timeFrom} - {slot.timeTo}
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleRemoveAvailability(slot.id)}
                          disabled={removingAvailabilityId === slot.id}
                          className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold transition ${
                            theme === 'dark'
                              ? 'text-rose-200 hover:bg-rose-400/20 disabled:opacity-50'
                              : 'text-rose-700 hover:bg-rose-100 disabled:opacity-50'
                          }`}
                        >
                          {t('dashboard.workerPortal.availability.deleteAction')}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

type WorkerProfileDraft = Pick<WorkerProfileData, 'fullName' | 'nationality' | 'university'>

function toDraft(profile: WorkerProfileData): WorkerProfileDraft {
  return {
    fullName: profile.fullName ?? '',
    nationality: profile.nationality ?? '',
    university: profile.university ?? '',
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

function dateInputClass(theme: 'light' | 'dark') {
  return `w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 ${
    theme === 'dark'
      ? 'border-white/20 bg-white/[0.03] text-white'
      : 'border-slate-200 bg-white text-slate-900'
  }`
}

function toExperienceEditorDraft(item: WorkerProfileSectionItem): ExperienceEditorDraft {
  const [companyNameRaw = '', positionRaw = ''] = item.label.split(' - ')
  const [startRaw = '', endRaw = ''] = item.value.split(' - ')
  return {
    id: item.id,
    companyName: companyNameRaw.trim(),
    position: positionRaw.trim(),
    startDate: normalizeExperienceDateInput(startRaw),
    endDate: normalizeExperienceDateInput(endRaw),
  }
}

function normalizeExperienceDateInput(value: string): string {
  const text = value.trim()
  if (!text || text === '...') return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text
  const match = text.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (!match) return ''
  return `${match[3]}-${match[2]}-${match[1]}`
}

function formatExperienceDate(value: string): string {
  const parsed = value ? new Date(value) : null
  if (!parsed || Number.isNaN(parsed.getTime())) return ''
  return parsed.toLocaleDateString('tr-TR')
}

function normalizeValue(value: string | null | undefined, t: (key: string, options?: Record<string, unknown>) => string) {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (!normalized || normalized === 'N/A') {
    return t('dashboard.workerPortal.states.empty')
  }
  return normalized
}

