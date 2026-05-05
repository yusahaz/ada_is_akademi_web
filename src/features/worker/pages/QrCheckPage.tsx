import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../../../theme/theme-context'
import { DashboardSurface, InteractiveButton, StatePanel } from '../../../components/dashboard/ui-primitives'

export function QrCheckPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [status, setStatus] = useState<'idle' | 'validating' | 'success' | 'failed'>('idle')

  return (
    <DashboardSurface theme={theme}>
      <h2 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
        {t('dashboard.workerPortal.qr.title')}
      </h2>
      <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
        {t('dashboard.workerPortal.qr.description')}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setStatus('validating')} className="inline-flex">
          <InteractiveButton theme={theme}>{t('dashboard.workerPortal.qr.actions.validate')}</InteractiveButton>
        </button>
        <button type="button" onClick={() => setStatus('success')} className="inline-flex">
          <InteractiveButton theme={theme}>{t('dashboard.workerPortal.qr.actions.success')}</InteractiveButton>
        </button>
        <button type="button" onClick={() => setStatus('failed')} className="inline-flex">
          <InteractiveButton theme={theme}>{t('dashboard.workerPortal.qr.actions.fail')}</InteractiveButton>
        </button>
      </div>

      <div className="mt-4">
        <StatePanel theme={theme} text={t(`dashboard.workerPortal.qr.status.${status}`)} />
      </div>
    </DashboardSurface>
  )
}
