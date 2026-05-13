import { CheckCircle2, CircleDashed, FileText, Loader2, Upload, WandSparkles, XCircle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { useActionToasts } from '../../../../../notifications/use-action-toasts'
import { workerPortalApi, type WorkerCvState } from '../../../../../api/worker/worker-portal'
import { cn } from '../../../../../shared/lib/cn'
import type { WorkerProfileData } from '../types'
import {
  CvTemplatePreview,
  type CvColorPalette,
  type CvLayoutVariant,
  type CvTemplateId,
  getCvTemplateOptionMeta,
  parseCvTemplatePreference,
  serializeCvTemplatePreference,
} from './cv-templates'

import { WorkerGhostButton, WorkerPillBadge, WorkerPrimaryButton } from '../../../worker-ui'
import { type TFn, type WorkerTone, resolveMuted, resolveTitle } from './helpers'

export function CvSection({
  theme,
  t,
  profile,
  runWithToast,
}: {
  theme: WorkerTone
  t: TFn
  profile: WorkerProfileData
  runWithToast: ReturnType<typeof useActionToasts>['runWithToast']
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [forcedState, setForcedState] = useState<WorkerCvState | null>(null)
  const [pendingCreate, setPendingCreate] = useState(false)
  const [pendingPdf, setPendingPdf] = useState(false)
  const [pendingUpload, setPendingUpload] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const initialPreference = parseCvTemplatePreference(profile.cvOptions)
  const [selectedTemplate, setSelectedTemplate] = useState<CvTemplateId>(initialPreference.templateId)
  const [layoutVariant, setLayoutVariant] = useState<CvLayoutVariant>(initialPreference.layoutVariant)
  const [palette, setPalette] = useState<CvColorPalette>(initialPreference.palette)
  const previewContainerRef = useRef<HTMLDivElement | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(
    () => workerPortalApi.getCvUploadSnapshot()?.fileName ?? null,
  )
  const [uploadedAt, setUploadedAt] = useState<string | null>(
    () => workerPortalApi.getCvUploadSnapshot()?.uploadedAt ?? null,
  )

  const {
    data: apiState = 'extracting',
    isFetching: refreshingState,
    refetch: refetchCvState,
  } = useQuery({
    queryKey: ['worker-cv-state', profile.workerId, uploadedAt],
    queryFn: () => workerPortalApi.getCvImportState(),
    staleTime: 5_000,
  })
  const { data: profilePhotoUrl = null } = useQuery({
    queryKey: ['worker-cv-profile-photo-url', profile.workerId, profile.profilePhotoObjectKey],
    queryFn: () => workerPortalApi.getProfilePhotoViewUrl(),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(profile.profilePhotoObjectKey),
  })
  const state = forcedState ?? apiState

  const statusMeta = useMemo(() => {
    if (state === 'confirmed') {
      return { emphasis: 'success' as const, icon: CheckCircle2, label: t('dashboard.workerPortal.cv.states.confirmed') }
    }
    if (state === 'awaitingReview') {
      return { emphasis: 'info' as const, icon: CircleDashed, label: t('dashboard.workerPortal.cv.states.awaitingReview') }
    }
    if (state === 'failed') {
      return { emphasis: 'danger' as const, icon: XCircle, label: t('dashboard.workerPortal.cv.states.failed') }
    }
    if (state === 'uploaded') {
      return { emphasis: 'neutral' as const, icon: Upload, label: t('dashboard.workerPortal.cv.states.uploaded') }
    }
    return { emphasis: 'warning' as const, icon: Loader2, label: t('dashboard.workerPortal.cv.states.extracting') }
  }, [state, t])
  const templateOptions = useMemo(() => getCvTemplateOptionMeta(t), [t])

  const handleCreateDraft = async () => {
    if (pendingCreate) return
    setPendingCreate(true)
    try {
      setIsPreviewOpen(true)
    } finally {
      setPendingCreate(false)
    }
  }

  const handleExportPdf = async () => {
    if (pendingPdf || !previewContainerRef.current) return
    setPendingPdf(true)
    try {
      await runWithToast(
        (async () => {
          const { jsPDF } = await import('jspdf')
          const doc = new jsPDF({ unit: 'pt', format: 'a4' })
          await doc.html(previewContainerRef.current!, {
            margin: [18, 18, 18, 18],
            autoPaging: 'text',
            width: 560,
            windowWidth: 840,
            html2canvas: {
              scale: 0.6,
              useCORS: true,
              backgroundColor: '#ffffff',
            },
          })

          const safeName = (profile.fullName || 'worker').trim().replace(/\s+/g, '-')
          doc.save(`${safeName}-${selectedTemplate}-cv.pdf`)
        })(),
        {
          success: { messageKey: 'dashboard.workerPortal.profile.cvSection.messages.pdfExported' },
          error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
        },
      )
    } finally {
      setPendingPdf(false)
    }
  }

  const handlePickFile = () => {
    if (pendingUpload) return
    fileInputRef.current?.click()
  }

  const handleUploadFile = async (file: File) => {
    if (pendingUpload) return
    setPendingUpload(true)
    try {
      const snapshot = await runWithToast(workerPortalApi.uploadCvFile(file), {
        success: { messageKey: 'dashboard.workerPortal.profile.cvSection.messages.uploaded' },
        error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
      })
      setUploadedFileName(snapshot.fileName)
      setUploadedAt(snapshot.uploadedAt)
      setForcedState('uploaded')
      setTimeout(() => {
        setForcedState(null)
        void refetchCvState()
      }, 1200)
    } finally {
      setPendingUpload(false)
    }
  }

  const cardClass =
    theme === 'dark'
      ? 'rounded-2xl border border-white/10 bg-white/[0.03] p-4'
      : 'rounded-2xl border border-slate-200 bg-slate-50 p-4'

  const iconClass =
    theme === 'dark'
      ? 'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-400/10 text-cyan-100'
      : 'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-700'

  useEffect(() => {
    const preference = parseCvTemplatePreference(profile.cvOptions)
    setSelectedTemplate(preference.templateId)
    setLayoutVariant(preference.layoutVariant)
    setPalette(preference.palette)
  }, [profile.cvOptions])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const payload = serializeCvTemplatePreference({
        templateId: selectedTemplate,
        layoutVariant,
        palette,
      })
      void workerPortalApi.updateCvTemplatePreference(payload).catch(() => undefined)
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [selectedTemplate, layoutVariant, palette])

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className={`text-base font-semibold leading-tight sm:text-lg ${resolveTitle(theme)}`}>
          {t('dashboard.workerPortal.profile.cvSection.title')}
        </p>
        <p className={`text-xs leading-relaxed sm:text-sm ${resolveMuted(theme)}`}>
          {t('dashboard.workerPortal.profile.cvSection.subtitle')}
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <article className={cardClass}>
          <div className="flex items-start gap-3">
            <span className={iconClass}>
              <WandSparkles className="h-4 w-4" aria-hidden />
            </span>
            <div className="space-y-1">
              <p className={`text-sm font-semibold ${resolveTitle(theme)}`}>
                {t('dashboard.workerPortal.profile.cvSection.createTitle')}
              </p>
              <p className={`text-xs leading-relaxed ${resolveMuted(theme)}`}>
                {t('dashboard.workerPortal.profile.cvSection.createDesc')}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <WorkerPrimaryButton
              tone={theme}
              className="h-10 w-full justify-center sm:w-auto sm:min-w-[11rem]"
              onClick={() => void handleCreateDraft()}
              disabled={pendingCreate}
            >
              <FileText className="mr-2 h-4 w-4" aria-hidden />
              {pendingCreate
                ? t('dashboard.workerPortal.profile.cvSection.creatingAction')
                : t('dashboard.workerPortal.profile.cvSection.createAction')}
            </WorkerPrimaryButton>
          </div>
        </article>

        <article className={cardClass}>
          <div className="flex items-start gap-3">
            <span className={iconClass}>
              <Upload className="h-4 w-4" aria-hidden />
            </span>
            <div className="space-y-1">
              <p className={`text-sm font-semibold ${resolveTitle(theme)}`}>
                {t('dashboard.workerPortal.profile.cvSection.importTitle')}
              </p>
              <p className={`text-xs leading-relaxed ${resolveMuted(theme)}`}>
                {t('dashboard.workerPortal.profile.cvSection.importDesc')}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <WorkerGhostButton
              tone={theme}
              className="h-10 w-full justify-center sm:w-auto sm:min-w-[11rem]"
              onClick={handlePickFile}
              disabled={pendingUpload}
            >
              <Upload className="mr-2 h-4 w-4" aria-hidden />
              {pendingUpload
                ? t('dashboard.workerPortal.profile.cvSection.uploadingAction')
                : t('dashboard.workerPortal.profile.cvSection.importAction')}
            </WorkerGhostButton>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                void handleUploadFile(file)
                event.target.value = ''
              }}
            />
          </div>
        </article>
      </div>

      <article className={cardClass}>
        <p className={`text-sm font-semibold ${resolveTitle(theme)}`}>{t('dashboard.workerPortal.profile.cvSection.templateSelectionTitle')}</p>
        <p className={`mt-1 text-xs ${resolveMuted(theme)}`}>{t('dashboard.workerPortal.profile.cvSection.templateSelectionSubtitle')}</p>
        {(() => {
          const selectedOption = templateOptions.find((option) => option.id === selectedTemplate) ?? templateOptions[0]
          return (
            <div
              className={cn(
                'mt-3 rounded-xl border px-3 py-2',
                theme === 'dark' ? 'border-cyan-300/25 bg-cyan-300/8' : 'border-sky-200 bg-sky-50',
              )}
            >
              <p className={cn('text-sm font-semibold', resolveTitle(theme))}>{selectedOption?.title}</p>
              <p className={cn('mt-0.5 text-xs', resolveMuted(theme))}>{selectedOption?.description}</p>
            </div>
          )
        })()}
        <div className="mt-2">
          <WorkerGhostButton
            tone={theme}
            className="h-9 w-full justify-center text-xs sm:w-auto"
            onClick={() => setIsLibraryOpen(true)}
          >
            {t('dashboard.workerPortal.profile.cvSection.openTemplateLibrary')}
          </WorkerGhostButton>
        </div>
      </article>

      <article className={cardClass}>
        <p className={`text-sm font-semibold ${resolveTitle(theme)}`}>{t('dashboard.workerPortal.profile.cvSection.templateSettingsTitle')}</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${resolveMuted(theme)}`}>{t('dashboard.workerPortal.profile.cvSection.layoutTitle')}</p>
            <div className="mt-2 flex gap-2">
              {(['single', 'double'] as const).map((variant) => (
                <button
                  key={variant}
                  type="button"
                  onClick={() => setLayoutVariant(variant)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-semibold',
                    layoutVariant === variant
                      ? theme === 'dark'
                        ? 'border-cyan-300/45 bg-cyan-300/12 text-cyan-100'
                        : 'border-sky-300 bg-sky-50 text-sky-700'
                      : theme === 'dark'
                        ? 'border-white/15 bg-white/[0.03] text-white/80'
                        : 'border-slate-200 bg-white text-slate-700',
                  )}
                >
                  {variant === 'single'
                    ? t('dashboard.workerPortal.profile.cvSection.layoutSingle')
                    : t('dashboard.workerPortal.profile.cvSection.layoutDouble')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${resolveMuted(theme)}`}>{t('dashboard.workerPortal.profile.cvSection.paletteTitle')}</p>
            <div className="mt-2 flex gap-2">
              {(['slate', 'indigo', 'emerald'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPalette(item)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize',
                    palette === item
                      ? theme === 'dark'
                        ? 'border-cyan-300/45 bg-cyan-300/12 text-cyan-100'
                        : 'border-sky-300 bg-sky-50 text-sky-700'
                      : theme === 'dark'
                        ? 'border-white/15 bg-white/[0.03] text-white/80'
                        : 'border-slate-200 bg-white text-slate-700',
                  )}
                >
                  {t(`dashboard.workerPortal.profile.cvSection.palette.${item}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </article>

      <article className={cardClass}>
        <div className="flex items-start gap-2">
          <statusMeta.icon
            className={`mt-0.5 h-4 w-4 shrink-0 ${
              state === 'failed'
                ? theme === 'dark'
                  ? 'text-rose-300'
                  : 'text-rose-600'
                : theme === 'dark'
                  ? 'text-emerald-300'
                  : 'text-emerald-600'
            }`}
            aria-hidden
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className={`text-sm font-semibold ${resolveTitle(theme)}`}>
                {t('dashboard.workerPortal.profile.cvSection.statusTitle')}
              </p>
              <WorkerPillBadge tone={theme} emphasis={statusMeta.emphasis}>
                {statusMeta.label}
              </WorkerPillBadge>
            </div>
            <p className={`text-xs ${resolveMuted(theme)}`}>
              {t('dashboard.workerPortal.profile.cvSection.statusDesc')}
            </p>
            {uploadedFileName ? (
              <p className={`text-xs ${resolveMuted(theme)}`}>
                {t('dashboard.workerPortal.profile.cvSection.lastFile', { fileName: uploadedFileName })}
              </p>
            ) : null}
            {uploadedAt ? (
              <p className={`text-xs ${resolveMuted(theme)}`}>
                {t('dashboard.workerPortal.profile.cvSection.lastUpdated', {
                  value: new Date(uploadedAt).toLocaleString(),
                })}
              </p>
            ) : null}
            <div className="pt-1">
              <WorkerGhostButton
                tone={theme}
                className="h-9 w-full justify-center text-xs sm:w-auto"
                onClick={() => void refetchCvState()}
                disabled={refreshingState}
              >
                {refreshingState
                  ? t('dashboard.workerPortal.profile.cvSection.refreshingAction')
                  : t('dashboard.workerPortal.profile.cvSection.refreshAction')}
              </WorkerGhostButton>
            </div>
          </div>
        </div>
      </article>

      {isPreviewOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/45 p-3 sm:items-center sm:p-6">
          <article
            className={cn(
              'w-full max-w-3xl overflow-hidden rounded-2xl border shadow-2xl',
              theme === 'dark' ? 'border-white/10 bg-[#0b0e14]' : 'border-slate-200 bg-white',
            )}
          >
            <div
              className={cn(
                'flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3',
                theme === 'dark' ? 'border-white/10' : 'border-slate-200',
              )}
            >
              <div>
                <p className={cn('text-sm font-semibold', resolveTitle(theme))}>
                  {t('dashboard.workerPortal.profile.cvSection.previewTitle')}
                </p>
                <p className={cn('text-xs', resolveMuted(theme))}>
                  {t('dashboard.workerPortal.profile.cvSection.previewSubtitle')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold',
                  theme === 'dark' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700',
                )}
              >
                {t('dashboard.workerPortal.profile.cvSection.previewClose')}
              </button>
            </div>

            <div
              className={cn(
                'max-h-[70vh] overflow-auto bg-slate-100 px-4 py-4',
                theme === 'dark' ? 'bg-slate-950/40' : 'bg-slate-100',
              )}
            >
              <div ref={previewContainerRef}>
                <CvTemplatePreview
                  templateId={selectedTemplate}
                  profile={profile}
                  layoutVariant={layoutVariant}
                  palette={palette}
                  photoDataUrl={profilePhotoUrl}
                />
              </div>
            </div>

            <div
              className={cn(
                'flex flex-wrap items-center justify-end gap-2 border-t px-4 py-3',
                theme === 'dark' ? 'border-white/10' : 'border-slate-200',
              )}
            >
              <WorkerGhostButton tone={theme} className="h-10 px-4" onClick={() => setIsPreviewOpen(false)}>
                {t('dashboard.workerPortal.profile.cvSection.previewClose')}
              </WorkerGhostButton>
              <WorkerPrimaryButton
                tone={theme}
                className="h-10 px-4"
                onClick={() => void handleExportPdf()}
                disabled={pendingPdf}
              >
                {pendingPdf
                  ? t('dashboard.workerPortal.profile.cvSection.previewExportingPdf')
                  : t('dashboard.workerPortal.profile.cvSection.previewExportPdf')}
              </WorkerPrimaryButton>
            </div>
          </article>
        </div>
      ) : null}

      {isLibraryOpen ? (
            <div
              className="fixed inset-y-0 end-0 z-[60] flex items-center justify-center bg-slate-950/75 p-3 sm:p-6"
              style={{ insetInlineStart: 'var(--worker-content-inset, 0px)' }}
            >
              <article
                className={cn(
                  'w-full max-h-[90vh] overflow-hidden rounded-2xl border shadow-2xl sm:max-w-4xl',
                  theme === 'dark' ? 'border-white/10 bg-[#0b0e14]' : 'border-slate-200 bg-white',
                )}
              >
                <div
                  className={cn(
                    'sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3 backdrop-blur',
                    theme === 'dark' ? 'border-white/10' : 'border-slate-200',
                  )}
                >
                  <div>
                    <p className={cn('text-sm font-semibold', resolveTitle(theme))}>{t('dashboard.workerPortal.profile.cvSection.templateLibraryTitle')}</p>
                    <p className={cn('text-xs', resolveMuted(theme))}>{t('dashboard.workerPortal.profile.cvSection.templateLibrarySubtitle')}</p>
                  </div>
                  <WorkerGhostButton tone={theme} className="h-9 px-3 text-xs" onClick={() => setIsLibraryOpen(false)}>
                    {t('dashboard.workerPortal.profile.cvSection.previewClose')}
                  </WorkerGhostButton>
                </div>
                <div className={cn('max-h-[78vh] overflow-auto p-3 sm:p-4', theme === 'dark' ? 'bg-slate-950/30' : 'bg-slate-50')}>
                  <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
                    {templateOptions.map((option) => {
                      const active = selectedTemplate === option.id
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setSelectedTemplate(option.id)
                            setIsLibraryOpen(false)
                          }}
                          className={cn(
                            'group rounded-2xl border p-3 text-left transition-all duration-200',
                            active
                              ? theme === 'dark'
                                ? 'border-cyan-300/60 bg-cyan-300/10 shadow-[0_0_0_1px_rgba(34,211,238,0.25)]'
                                : 'border-sky-300 bg-sky-50'
                              : theme === 'dark'
                                ? 'border-white/15 bg-[#0e162c] hover:border-cyan-300/35 hover:bg-[#13203d]'
                                : 'border-slate-200 bg-white hover:bg-slate-100',
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn('text-sm font-semibold', resolveTitle(theme))}>{option.title}</p>
                            {active ? (
                              <span className={cn('text-xs font-semibold', theme === 'dark' ? 'text-cyan-200' : 'text-sky-700')}>
                                {t('dashboard.workerPortal.profile.cvSection.selectedTemplate')}
                              </span>
                            ) : null}
                          </div>
                          <p className={cn('mt-1 text-xs', resolveMuted(theme))}>{option.description}</p>
                          <div
                            className={cn(
                              'mt-3 rounded-xl border p-2',
                              theme === 'dark' ? 'border-white/10 bg-[#0a1328]' : 'border-slate-200 bg-white',
                            )}
                          >
                            <div className="flex h-64 items-start justify-center overflow-hidden rounded-lg">
                              <div className="w-[820px] origin-top scale-[0.33] pointer-events-none">
                                <CvTemplatePreview
                                  templateId={option.id}
                                  profile={profile}
                                  layoutVariant="double"
                                  palette={palette}
                                  photoDataUrl={profilePhotoUrl}
                                />
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </article>
            </div>
      ) : null}
    </div>
  )
}

