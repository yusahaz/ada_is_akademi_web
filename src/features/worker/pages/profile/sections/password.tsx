import { useState } from 'react'
import { KeyRound, ShieldCheck } from 'lucide-react'

import { workerPortalApi } from '../../../../../api/worker/worker-portal'
import { useActionToasts } from '../../../../../notifications/use-action-toasts'
import { WorkerPrimaryButton } from '../../../worker-ui'
import type { WorkerProfileData } from '../types'
import { type TFn, type WorkerTone, resolveMuted, resolveTitle } from './helpers'

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
  const isValid = password.trim().length >= 6
  const submit = async () => {
    if (!isValid || !profile.systemUserId) return
    await runWithToast(workerPortalApi.changePassword(profile.systemUserId, password.trim()), {
      success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
      error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
    })
    setPassword('')
  }
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            theme === 'dark'
              ? 'border-white/15 bg-white/[0.06] text-cyan-200/90'
              : 'border-sky-200/70 bg-sky-50 text-sky-700'
          }`}
          aria-hidden
        >
          <KeyRound className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className={`text-base font-semibold leading-tight sm:text-lg ${resolveTitle(theme)}`}>
            {t('dashboard.workerPortal.profile.menu.password')}
          </p>
          <p className={`text-xs leading-relaxed sm:text-sm ${resolveMuted(theme)}`}>
            Minimum 6 karakterlik güçlü bir şifre belirleyin.
          </p>
        </div>
      </div>

      <label className="space-y-1.5 text-sm">
        <span className={resolveMuted(theme)}>
          {t('dashboard.workerPortal.profile.menu.password')}
        </span>
        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className={`w-full rounded-xl border px-3 py-2.5 pr-10 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 ${
              theme === 'dark'
                ? 'border-white/20 bg-white/[0.03] text-white placeholder:text-white/40'
                : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
            }`}
          />
          <ShieldCheck
            className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isValid ? (theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600') : (theme === 'dark' ? 'text-white/35' : 'text-slate-400')}`}
            aria-hidden
          />
        </div>
      </label>

      {!isValid && password.length > 0 ? (
        <p className={`text-xs ${resolveMuted(theme)}`}>Şifre en az 6 karakter olmalı.</p>
      ) : null}

      <p className={`text-xs ${resolveMuted(theme)}`}>
        Şifrenizi güncelledikten sonra güvenlik için tekrar giriş yapmanız istenebilir.
      </p>

      <WorkerPrimaryButton
        tone={theme}
        className="h-10 w-full justify-center sm:w-auto sm:min-w-[8rem]"
        onClick={() => void submit()}
        disabled={!isValid || !profile.systemUserId}
      >
        {t('dashboard.workerPortal.profile.actions.save')}
      </WorkerPrimaryButton>
    </div>
  )
}
