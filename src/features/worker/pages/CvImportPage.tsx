import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../../../theme/theme-context'
import { DashboardSurface, InteractiveButton, StatePanel } from '../../../components/dashboard/ui-primitives'

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
    <DashboardSurface theme={theme}>
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
            className="inline-flex"
          >
            <InteractiveButton theme={theme} isActive={state === item}>
              {t(`dashboard.workerPortal.cv.states.${item}`)}
            </InteractiveButton>
          </button>
        ))}
      </div>

      <div className="mt-4">
        <StatePanel
          theme={theme}
          text={t('dashboard.workerPortal.cv.currentState', {
            state: t(`dashboard.workerPortal.cv.states.${state}`),
          })}
        />
      </div>
    </DashboardSurface>
  )
}
