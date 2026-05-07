import { workerPortalApi } from '../../../../../api/worker/worker-portal'
import { useActionToasts } from '../../../../../notifications/use-action-toasts'
import { WorkerGhostButton, WorkerPrimaryButton } from '../../../worker-ui'
import type { WorkerProfileData } from '../types'
import { type TFn, type WorkerTone, resolveTitle } from './helpers'

export function AccountControlSection({
  profile,
  theme,
  t,
  runWithToast,
}: {
  profile: WorkerProfileData
  theme: WorkerTone
  t: TFn
  runWithToast: ReturnType<typeof useActionToasts>['runWithToast']
}) {
  const suspend = async () => {
    if (!profile.systemUserId) return
    await runWithToast(workerPortalApi.suspendAccount(profile.systemUserId), {
      success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
      error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
    })
  }
  const remove = async () => {
    if (!profile.workerId) return
    await runWithToast(workerPortalApi.deleteWorker(profile.workerId), {
      success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
      error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
    })
  }
  return (
    <div className="space-y-2">
      <p className={`text-sm font-semibold ${resolveTitle(theme)}`}>
        {t('dashboard.workerPortal.profile.menu.accountControl')}
      </p>
      <div className="flex flex-wrap gap-2">
        <WorkerGhostButton tone={theme} onClick={() => void suspend()}>
          {t('dashboard.workerPortal.profile.accountActions.suspend')}
        </WorkerGhostButton>
        <WorkerPrimaryButton tone={theme} onClick={() => void remove()}>
          {t('dashboard.workerPortal.profile.accountActions.delete')}
        </WorkerPrimaryButton>
      </div>
    </div>
  )
}
