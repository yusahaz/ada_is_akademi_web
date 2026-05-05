import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../../../theme/theme-context'

export function QrCheckPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [status, setStatus] = useState<'idle' | 'validating' | 'success' | 'failed'>('idle')

  return (
    <article className={`rounded-xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-slate-300/80 bg-white'}`}>
      <h2 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
        {t('dashboard.workerPortal.qr.title')}
      </h2>
      <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
        {t('dashboard.workerPortal.qr.description')}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setStatus('validating')} className={buttonClass(theme)}>
          {t('dashboard.workerPortal.qr.actions.validate')}
        </button>
        <button type="button" onClick={() => setStatus('success')} className={buttonClass(theme)}>
          {t('dashboard.workerPortal.qr.actions.success')}
        </button>
        <button type="button" onClick={() => setStatus('failed')} className={buttonClass(theme)}>
          {t('dashboard.workerPortal.qr.actions.fail')}
        </button>
      </div>

      <p className={`mt-4 rounded-lg border px-3 py-2 text-sm ${theme === 'dark' ? 'border-white/10 text-white/80' : 'border-slate-200 text-slate-700'}`}>
        {t(`dashboard.workerPortal.qr.status.${status}`)}
      </p>
    </article>
  )
}

function buttonClass(theme: 'light' | 'dark') {
  return `rounded-md px-3 py-2 text-xs font-semibold ${
    theme === 'dark' ? 'bg-[#14f1d9]/20 text-[#14f1d9]' : 'bg-sky-100 text-sky-700'
  }`
}
