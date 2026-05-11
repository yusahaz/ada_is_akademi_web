import { AlertTriangle, Lock, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { workerPortalApi } from '../../../../../api/worker/worker-portal'
import { useActionToasts } from '../../../../../notifications/use-action-toasts'
import { WorkerGhostButton, WorkerPrimaryButton } from '../../../worker-ui'
import type { WorkerProfileData } from '../types'
import { type TFn, type WorkerTone, resolveMuted, resolveTitle } from './helpers'

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
  const [pendingAction, setPendingAction] = useState<'suspend' | 'delete' | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [confirmChecked, setConfirmChecked] = useState(false)

  const isDelete = pendingAction === 'delete'
  const expectedText = isDelete ? 'SIL' : 'DONDUR'
  const canSubmit = confirmChecked && confirmText.trim().toUpperCase() === expectedText

  const resetConfirmState = () => {
    setPendingAction(null)
    setConfirmText('')
    setConfirmChecked(false)
  }

  const suspend = async () => {
    if (!profile.systemUserId) return
    await runWithToast(workerPortalApi.suspendAccount(profile.systemUserId), {
      success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
      error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
    })
    resetConfirmState()
  }

  const remove = async () => {
    if (!profile.workerId) return
    await runWithToast(workerPortalApi.deleteWorker(profile.workerId), {
      success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
      error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
    })
    resetConfirmState()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            theme === 'dark'
              ? 'border-amber-400/25 bg-amber-500/10 text-amber-100'
              : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}
          aria-hidden
        >
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className={`text-base font-semibold leading-tight sm:text-lg ${resolveTitle(theme)}`}>
            {t('dashboard.workerPortal.profile.menu.accountControl')}
          </p>
          <p className={`text-xs leading-relaxed sm:text-sm ${resolveMuted(theme)}`}>
            Bu işlemler hesap erişimini etkiler. Devam etmeden önce dikkatlice onaylayın.
          </p>
        </div>
      </div>

      <div
        className={`rounded-2xl border px-3 py-2.5 text-xs leading-relaxed sm:text-sm ${
          theme === 'dark'
            ? 'border-amber-300/20 bg-amber-500/10 text-amber-100/90'
            : 'border-amber-200 bg-amber-50 text-amber-800'
        }`}
      >
        Dondurma işlemi geçici olarak girişinizi kısıtlar. Hesap silme işlemi geri alınamaz.
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <WorkerGhostButton
          tone={theme}
          className="h-10 w-full sm:w-auto"
          onClick={() => setPendingAction('suspend')}
        >
          <Lock className="mr-2 h-4 w-4" aria-hidden />
          {t('dashboard.workerPortal.profile.accountActions.suspend')}
        </WorkerGhostButton>
        <WorkerPrimaryButton
          tone={theme}
          className="h-10 w-full sm:w-auto"
          onClick={() => setPendingAction('delete')}
        >
          <Trash2 className="mr-2 h-4 w-4" aria-hidden />
          {t('dashboard.workerPortal.profile.accountActions.delete')}
        </WorkerPrimaryButton>
      </div>

      {pendingAction ? (
        <div
          className={`space-y-3 rounded-2xl border p-3 sm:p-4 ${
            theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50/80'
          }`}
        >
          <p className={`text-sm font-semibold ${resolveTitle(theme)}`}>
            {isDelete ? 'Hesap silme onayı' : 'Hesap dondurma onayı'}
          </p>
          <p className={`text-xs leading-relaxed sm:text-sm ${resolveMuted(theme)}`}>
            Devam etmek için kutuyu işaretleyin ve <span className="font-semibold">{expectedText}</span> yazın.
          </p>
          <label className={`flex items-start gap-2 text-xs sm:text-sm ${resolveMuted(theme)}`}>
            <input
              type="checkbox"
              checked={confirmChecked}
              onChange={(e) => setConfirmChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300"
            />
            <span>Bu işlemin sonuçlarını anladığımı onaylıyorum.</span>
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={expectedText}
            className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 ${
              theme === 'dark'
                ? 'border-white/20 bg-white/[0.03] text-white placeholder:text-white/40'
                : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
            }`}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <WorkerGhostButton tone={theme} className="h-10 w-full sm:w-auto" onClick={resetConfirmState}>
              {t('dashboard.workerPortal.profile.actions.cancel')}
            </WorkerGhostButton>
            <WorkerPrimaryButton
              tone={theme}
              className={`h-10 w-full sm:w-auto ${
                isDelete ? (theme === 'dark' ? '!bg-rose-500 !text-white' : '!bg-rose-600 !text-white') : ''
              }`}
              onClick={() => void (isDelete ? remove() : suspend())}
              disabled={!canSubmit}
            >
              {isDelete
                ? t('dashboard.workerPortal.profile.accountActions.delete')
                : t('dashboard.workerPortal.profile.accountActions.suspend')}
            </WorkerPrimaryButton>
          </div>
        </div>
      ) : null}
    </div>
  )
}
