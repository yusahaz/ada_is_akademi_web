import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { workerPortalApi, type WorkerCvState } from '../../../api/worker-portal'
import { useTheme } from '../../../theme/theme-context'
import { DashboardSurface, StatePanel } from '../../../components/dashboard/ui-primitives'
import { WorkerGhostButton, WorkerPrimaryButton, WorkerSectionHeader } from '../worker-ui'
import { useWorkerAsyncData } from '../hooks/useWorkerAsyncData'

const flow: WorkerCvState[] = [
  'uploaded',
  'extracting',
  'awaitingReview',
  'confirmed',
  'failed',
]

export function CvImportPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const query = useCallback(() => workerPortalApi.getCvImportState(), [])
  const { loading, error, data } = useWorkerAsyncData<WorkerCvState>(
    'uploaded',
    ['worker', 'cv-import-state'],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
  )
  const [state, setState] = useState<WorkerCvState>('uploaded')
  const effectiveState = loading ? state : data

  return (
    <div className="space-y-4">
      <WorkerSectionHeader tone={theme} title={t('dashboard.workerPortal.pages.cvImport.title')} subtitle={t('dashboard.workerPortal.pages.cvImport.subtitle')} />
      <DashboardSurface theme={theme}>
        {loading ? <StatePanel theme={theme} text={t('dashboard.workerPortal.states.loading')} /> : null}
        {error ? <StatePanel theme={theme} text={error} isError /> : null}
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {flow.map((item) =>
            effectiveState === item ? (
              <WorkerPrimaryButton key={item} tone={theme} onClick={() => setState(item)} className="w-full">
                {t(`dashboard.workerPortal.cv.states.${item}`)}
              </WorkerPrimaryButton>
            ) : (
              <WorkerGhostButton key={item} tone={theme} onClick={() => setState(item)} className="w-full">
                {t(`dashboard.workerPortal.cv.states.${item}`)}
              </WorkerGhostButton>
            ),
          )}
        </div>

        <div className="mt-4">
          <StatePanel
            theme={theme}
            text={t('dashboard.workerPortal.cv.currentState', {
              state: t(`dashboard.workerPortal.cv.states.${effectiveState}`),
            })}
          />
        </div>
      </DashboardSurface>
    </div>
  )
}
