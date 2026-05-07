import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { workerPortalApi } from '../../../../api/worker/worker-portal'
import { useTheme } from '../../../../theme/theme-context'
import { DashboardSurface, StatePanel } from '../../../../shared/ui/ui-primitives'
import { WorkerSectionHeader } from '../../worker-ui'
import { useWorkerAsyncData } from '../../hooks/useWorkerAsyncData'
import { useActionToasts } from '../../../../notifications/use-action-toasts'
import type { ExperienceEditorDraft, WorkerProfileData, WorkerProfileSectionItem } from './types'
import {
  AccountControlSection,
  AvailabilitySection,
  BasicInfoSection,
  CertificatesSection,
  ExperiencesOverviewCard,
  ExperiencesSection,
  PasswordSection,
  ProfileSectionMenu,
  ReferencesSection,
  SkillsSection,
  getProfileSectionLabelKey,
  toExperienceEditorDraft,
} from './sections'

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
  const [experienceItems, setExperienceItems] = useState<WorkerProfileSectionItem[]>(profile?.experiences ?? [])
  const [experienceEditorDraft, setExperienceEditorDraft] = useState<ExperienceEditorDraft | null>(null)
  const [showExperienceEditor, setShowExperienceEditor] = useState(false)

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
            <p className={theme === 'dark' ? 'text-sm font-semibold text-white' : 'text-sm font-semibold text-slate-900'}>{t(sectionLabelKey)}</p>
            <p className={theme === 'dark' ? 'mt-1 text-xs text-white/75' : 'mt-1 text-xs text-slate-600'}>{t('dashboard.workerPortal.profile.menuComingSoon')}</p>
          </div>
        ) : null}
        {isBasicSection ? <BasicInfoSection profile={currentProfile} theme={theme} t={t} runWithToast={runWithToast} /> : null}
        {isExperiencesSection && showExperienceEditor ? (
          <ExperiencesSection
            key={experienceEditorDraft?.id ?? 'new'}
            items={experienceItems}
            setItems={setExperienceItems}
            externalDraft={experienceEditorDraft}
            theme={theme}
            t={t}
            runWithToast={runWithToast}
          />
        ) : null}
        {isSkillsSection ? <SkillsSection workerId={currentProfile.workerId} initialSkills={currentProfile.skills} /> : null}
        {isCertificatesSection ? <CertificatesSection profile={currentProfile} theme={theme} t={t} runWithToast={runWithToast} /> : null}
        {isReferencesSection ? <ReferencesSection profile={currentProfile} theme={theme} t={t} runWithToast={runWithToast} /> : null}
        {isAvailabilitySection ? <AvailabilitySection /> : null}
        {isPasswordSection ? <PasswordSection profile={currentProfile} theme={theme} t={t} runWithToast={runWithToast} /> : null}
        {isAccountControlSection ? <AccountControlSection profile={currentProfile} theme={theme} t={t} runWithToast={runWithToast} /> : null}
      </DashboardSurface>
    </div>
  )
}
