import { useState } from 'react'

import { workerPortalApi } from '../../../../../api/worker/worker-portal'
import { useActionToasts } from '../../../../../notifications/use-action-toasts'
import { WorkerPrimaryButton } from '../../../worker-ui'
import type { WorkerProfileData } from '../types'
import { ProfileInput } from './common'
import { type TFn, type WorkerTone, resolveTitle } from './helpers'

export function PasswordSection({
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
  const [password, setPassword] = useState('')
  const submit = async () => {
    if (password.trim().length < 6 || !profile.systemUserId) return
    await runWithToast(workerPortalApi.changePassword(profile.systemUserId, password.trim()), {
      success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
      error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
    })
    setPassword('')
  }
  return (
    <div className="space-y-2">
      <p className={`text-sm font-semibold ${resolveTitle(theme)}`}>
        {t('dashboard.workerPortal.profile.menu.password')}
      </p>
      <ProfileInput
        theme={theme}
        label={t('dashboard.workerPortal.profile.menu.password')}
        value={password}
        onChange={setPassword}
      />
      <WorkerPrimaryButton tone={theme} onClick={() => void submit()}>
        {t('dashboard.workerPortal.profile.actions.save')}
      </WorkerPrimaryButton>
    </div>
  )
}
