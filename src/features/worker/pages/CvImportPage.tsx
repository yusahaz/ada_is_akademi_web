import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../../../theme/theme-context'

const flow: Array<'uploaded' | 'extracting' | 'awaitingReview' | 'confirmed' | 'failed'> = [
  'uploaded',
  'extracting',
  'awaitingReview',
  'confirmed',
  'failed',
]

export function CvImportPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [state, setState] = useState<'uploaded' | 'extracting' | 'awaitingReview' | 'confirmed' | 'failed'>(
    'uploaded',
  )

  return (
    <article className={`rounded-xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-slate-300/80 bg-white'}`}>
      <h2 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
        {t('dashboard.workerPortal.cv.title')}
      </h2>
      <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
        {t('dashboard.workerPortal.cv.description')}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {flow.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setState(item)}
            className={`rounded-md px-3 py-2 text-xs font-semibold ${
              state === item
                ? theme === 'dark'
                  ? 'bg-[#14f1d9]/20 text-[#14f1d9]'
                  : 'bg-sky-100 text-sky-700'
                : theme === 'dark'
                  ? 'bg-white/10 text-white/70'
                  : 'bg-slate-100 text-slate-600'
            }`}
          >
            {t(`dashboard.workerPortal.cv.states.${item}`)}
          </button>
        ))}
      </div>

      <div className={`mt-4 rounded-lg border px-3 py-2 text-sm ${theme === 'dark' ? 'border-white/10 text-white/80' : 'border-slate-200 text-slate-700'}`}>
        {t('dashboard.workerPortal.cv.currentState', {
          state: t(`dashboard.workerPortal.cv.states.${state}`),
        })}
      </div>
    </article>
  )
}
