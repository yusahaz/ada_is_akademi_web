import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { workerPortalApi, type WorkerQrStatus } from '../../../api/worker-portal'
import { useTheme } from '../../../theme/theme-context'
import { DashboardSurface, StatePanel } from '../../../components/dashboard/ui-primitives'
import { WorkerGhostButton, WorkerPrimaryButton, WorkerSectionHeader } from '../worker-ui'

export function QrCheckPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [status, setStatus] = useState<WorkerQrStatus>('idle')
  const [qrPayload, setQrPayload] = useState('')

  const handleValidate = async () => {
    setStatus('validating')
    const result = await workerPortalApi.validateQrToken(qrPayload)
    setStatus(result)
  }

  return (
    <div className="space-y-4">
      <WorkerSectionHeader tone={theme} title={t('dashboard.workerPortal.pages.qrCheck.title')} subtitle={t('dashboard.workerPortal.pages.qrCheck.subtitle')} />
      <DashboardSurface theme={theme}>
        <div className="flex flex-wrap gap-2">
          <input
            value={qrPayload}
            onChange={(event) => setQrPayload(event.target.value)}
            aria-label={t('dashboard.workerPortal.qr.actions.validate')}
            className={`h-11 min-w-40 rounded-xl border px-3 text-sm ${
              theme === 'dark'
                ? 'border-white/15 bg-white/[0.04] text-white placeholder:text-white/40'
                : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400'
            }`}
          />
          <WorkerPrimaryButton tone={theme} onClick={() => void handleValidate()}>
            {t('dashboard.workerPortal.qr.actions.validate')}
          </WorkerPrimaryButton>
          <WorkerGhostButton tone={theme} onClick={() => setStatus('success')}>
            {t('dashboard.workerPortal.qr.actions.success')}
          </WorkerGhostButton>
          <WorkerGhostButton tone={theme} onClick={() => setStatus('failed')}>
            {t('dashboard.workerPortal.qr.actions.fail')}
          </WorkerGhostButton>
        </div>

        <div className="mt-4">
          <StatePanel
            theme={theme}
            text={t(`dashboard.workerPortal.qr.status.${status}`)}
            isError={status === 'failed'}
          />
        </div>
      </DashboardSurface>
    </div>
  )
}
