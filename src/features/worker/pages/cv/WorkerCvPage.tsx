import { Download } from 'lucide-react'
import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { workerPortalApi } from '../../../../api/worker/worker-portal'
import { StatePanel } from '../../../../shared/ui/ui-primitives'
import { useTheme } from '../../../../theme/theme-context'
import { cn } from '../../../../shared/lib/cn'
import { WorkerGhostButton, WorkerPrimaryButton } from '../../worker-ui'
import { CvTemplatePreview, parseCvTemplatePreference } from '../profile/sections/cv-templates'

export function WorkerCvPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [pendingPdf, setPendingPdf] = useState(false)
  const previewContainerRef = useRef<HTMLDivElement | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['worker-cv-page-profile'],
    queryFn: () => workerPortalApi.getProfile(),
    staleTime: 10_000,
  })
  const { data: profilePhotoUrl = null } = useQuery({
    queryKey: ['worker-cv-page-profile-photo-url', data?.workerId, data?.profilePhotoObjectKey],
    queryFn: () => workerPortalApi.getProfilePhotoViewUrl(),
    enabled: Boolean(data?.profilePhotoObjectKey),
    staleTime: 5 * 60 * 1000,
  })

  const handleDownloadPdf = async () => {
    if (!previewContainerRef.current || pendingPdf || !data) return
    setPendingPdf(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      await doc.html(previewContainerRef.current, {
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
      const safeName = (data.fullName || 'worker').trim().replace(/\s+/g, '-')
      const preference = parseCvTemplatePreference(data.cvOptions)
      doc.save(`${safeName}-${preference.templateId}-cv.pdf`)
    } finally {
      setPendingPdf(false)
    }
  }

  if (isLoading) {
    return <StatePanel theme={theme} text={t('dashboard.workerPortal.states.loading')} />
  }

  if (error || !data) {
    return <StatePanel theme={theme} text={t('dashboard.workerPortal.states.fetchError')} isError />
  }

  const selectedPreference = parseCvTemplatePreference(data.cvOptions)

  return (
    <div className="space-y-4">
      <article
        className={cn(
          'rounded-2xl border p-4',
          theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white',
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={cn('text-base font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
              {t('dashboard.workerPortal.pages.cvPreview.title')}
            </p>
            <p className={cn('text-xs', theme === 'dark' ? 'text-white/65' : 'text-slate-600')}>
              {t('dashboard.workerPortal.pages.cvPreview.metaLine', {
                template: selectedPreference.templateId,
                layout: selectedPreference.layoutVariant,
                palette: selectedPreference.palette,
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <WorkerGhostButton tone={theme} className="h-10 px-4" onClick={() => navigate('/worker/profile?section=cv')}>
              {t('dashboard.workerPortal.pages.cvPreview.goToSettings')}
            </WorkerGhostButton>
            <WorkerPrimaryButton tone={theme} className="h-10 px-4" onClick={() => void handleDownloadPdf()} disabled={pendingPdf}>
              <Download className="mr-2 h-4 w-4" aria-hidden />
              {pendingPdf
                ? t('dashboard.workerPortal.pages.cvPreview.preparingPdf')
                : t('dashboard.workerPortal.pages.cvPreview.downloadPdf')}
            </WorkerPrimaryButton>
          </div>
        </div>
      </article>

      <div
        className={cn(
          'rounded-2xl border p-0',
          theme === 'dark' ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50',
        )}
      >
        <div ref={previewContainerRef}>
          <CvTemplatePreview
            templateId={selectedPreference.templateId}
            profile={data}
            layoutVariant={selectedPreference.layoutVariant}
            palette={selectedPreference.palette}
            photoDataUrl={profilePhotoUrl}
            fullWidth
          />
        </div>
      </div>
    </div>
  )
}
