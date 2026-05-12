import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { UserRound } from 'lucide-react'

import { workerPortalApi } from '../../../../api/worker/worker-portal'
import { useTheme } from '../../../../theme/theme-context'
import { DashboardSurface, StatePanel } from '../../../../shared/ui/ui-primitives'
import { cn } from '../../../../shared/lib/cn'
import { WorkerSectionHeader } from '../../worker-ui'
import { useWorkerAsyncData } from '../../hooks/useWorkerAsyncData'
import { useActionToasts } from '../../../../notifications/use-action-toasts'
import { getLocalhostProtocolFallbackUrl, sanitizeObjectStorageUrl } from '../../../../shared/lib/object-storage-url'
import type { ExperienceEditorDraft, WorkerProfileData, WorkerProfileSectionItem } from './types'
import {
  AccountControlSection,
  AvailabilitySection,
  BasicInfoSection,
  CertificatesSection,
  CvSection,
  ExperiencesOverviewCard,
  ExperiencesSection,
  PasswordSection,
  ProfileSectionMenu,
  ReferencesSection,
  SettingsSection,
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
  const isCvSection = activeSection === 'cv'
  const isAvailabilitySection = activeSection === 'availability'
  const isSettingsSection = activeSection === 'settings'
  const isPasswordSection = activeSection === 'password'
  const isAccountControlSection = activeSection === 'accountControl'
  const isComingSoonSection =
    !isBasicSection &&
    !isExperiencesSection &&
    !isSkillsSection &&
    !isCertificatesSection &&
    !isReferencesSection &&
    !isCvSection &&
    !isAvailabilitySection &&
    !isSettingsSection &&
    !isPasswordSection &&
    !isAccountControlSection
  const sectionLabelKey = getProfileSectionLabelKey(activeSection)
  const query = useCallback(() => workerPortalApi.getProfile(), [])
  const { loading, error, data: profile, setData: setProfileData } = useWorkerAsyncData<WorkerProfileData | null>(
    null,
    ['worker', 'profile'],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
  )

  const currentProfile = useMemo(() => profile, [profile])
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)
  const [photoReloadNonce, setPhotoReloadNonce] = useState(0)
  const [photoRetryCount, setPhotoRetryCount] = useState(0)
  const [photoProtocolFallbackTried, setPhotoProtocolFallbackTried] = useState(false)
  const [experienceItems, setExperienceItems] = useState<WorkerProfileSectionItem[]>(profile?.experiences ?? [])
  const [experienceEditorDraft, setExperienceEditorDraft] = useState<ExperienceEditorDraft | null>(null)
  const [showExperienceEditor, setShowExperienceEditor] = useState(false)
  const shouldRenderSectionSurface =
    isComingSoonSection ||
    isBasicSection ||
    (isExperiencesSection && showExperienceEditor) ||
    isSkillsSection ||
    isCertificatesSection ||
    isReferencesSection ||
    isCvSection ||
    isAvailabilitySection ||
    isSettingsSection ||
    isPasswordSection ||
    isAccountControlSection

  useEffect(() => {
    if (profile) {
      setExperienceItems(profile.experiences ?? [])
    }
  }, [profile])

  useEffect(() => {
    let active = true
    if (!currentProfile?.profilePhotoObjectKey) {
      setProfilePhotoUrl(null)
      setPhotoRetryCount(0)
      setPhotoProtocolFallbackTried(false)
      return () => {
        active = false
      }
    }

    void workerPortalApi.getProfilePhotoViewUrl().then((url) => {
      if (!active) return
      setProfilePhotoUrl(sanitizeObjectStorageUrl(url))
      setPhotoProtocolFallbackTried(false)
    })

    return () => {
      active = false
    }
  }, [currentProfile?.profilePhotoObjectKey, photoReloadNonce])

  const profileHeaderActions = (
    <div
      className={cn(
        'inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border',
        theme === 'dark' ? 'border-white/20 bg-white/[0.05]' : 'border-slate-300 bg-slate-100',
      )}
      title={currentProfile?.fullName ?? t('dashboard.workerPortal.pages.profile.title')}
    >
      {profilePhotoUrl ? (
        <img
          src={profilePhotoUrl}
          alt={currentProfile?.fullName ?? 'Profile'}
          className="h-full w-full object-cover"
          onError={() => {
            if (profilePhotoUrl && !photoProtocolFallbackTried) {
              const fallbackUrl = getLocalhostProtocolFallbackUrl(profilePhotoUrl)
              if (fallbackUrl && fallbackUrl !== profilePhotoUrl) {
                setPhotoProtocolFallbackTried(true)
                setProfilePhotoUrl(fallbackUrl)
                return
              }
            }

            // Presigned URL may expire; try once more to fetch a fresh URL.
            if (photoRetryCount >= 1) {
              setProfilePhotoUrl(null)
              return
            }
            setPhotoRetryCount((prev) => prev + 1)
            setPhotoReloadNonce((prev) => prev + 1)
          }}
        />
      ) : (
        <UserRound className={cn('h-6 w-6', theme === 'dark' ? 'text-white/80' : 'text-slate-600')} aria-hidden />
      )}
    </div>
  )

  useEffect(() => {
    if (!isExperiencesSection) {
      setShowExperienceEditor(false)
      setExperienceEditorDraft(null)
    }
  }, [isExperiencesSection])

  const setExperienceItemsSynced = useCallback(
    (value: WorkerProfileSectionItem[] | ((prevState: WorkerProfileSectionItem[]) => WorkerProfileSectionItem[])) => {
      setExperienceItems((prevItems) => {
        const nextItems = typeof value === 'function' ? value(prevItems) : value
        setProfileData((prevProfile) => {
          if (!prevProfile) return prevProfile
          return {
            ...prevProfile,
            experiences: nextItems,
          }
        })
        return nextItems
      })
    },
    [setProfileData],
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
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.workerPortal.pages.profile.title')}
        subtitle={t('dashboard.workerPortal.pages.profile.subtitle')}
        actions={profileHeaderActions}
      />
      <div className="grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <DashboardSurface theme={theme}>
          <div className="space-y-3">
            <p className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
              {t('dashboard.workerPortal.profile.settingsMenu')}
            </p>
            <ProfileSectionMenu
              sidebar
              theme={theme}
              t={t}
              active={activeSection}
              onChange={(next) => setSearchParams({ section: next })}
            />
          </div>
        </DashboardSurface>

        <div className="space-y-4">
          {shouldRenderSectionSurface ? (
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
                  setItems={setExperienceItemsSynced}
                  externalDraft={experienceEditorDraft}
                  theme={theme}
                  t={t}
                  runWithToast={runWithToast}
                  onClose={() => {
                    setShowExperienceEditor(false)
                    setExperienceEditorDraft(null)
                  }}
                />
              ) : null}
              {isSkillsSection ? <SkillsSection workerId={currentProfile.workerId} initialSkills={currentProfile.skills} /> : null}
              {isCertificatesSection ? <CertificatesSection profile={currentProfile} theme={theme} t={t} runWithToast={runWithToast} /> : null}
              {isReferencesSection ? <ReferencesSection profile={currentProfile} theme={theme} t={t} runWithToast={runWithToast} /> : null}
              {isCvSection ? <CvSection theme={theme} t={t} profile={currentProfile} runWithToast={runWithToast} /> : null}
              {isAvailabilitySection ? <AvailabilitySection /> : null}
              {isSettingsSection ? <SettingsSection theme={theme} t={t} /> : null}
              {isPasswordSection ? <PasswordSection profile={currentProfile} theme={theme} t={t} runWithToast={runWithToast} /> : null}
              {isAccountControlSection ? <AccountControlSection profile={currentProfile} theme={theme} t={t} runWithToast={runWithToast} /> : null}
            </DashboardSurface>
          ) : null}

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
                  setExperienceItemsSynced((prev) => prev.filter((item) => item.id !== id))
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
        </div>
      </div>
    </div>
  )
}
