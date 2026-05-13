import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyRound, UserRound } from 'lucide-react'

import { systemUsersApi, type SystemUserMe } from '../../../api/system/system-users'
import { AccountStatus, SystemUserType } from '../../../api/core/enums'
import { ApiError } from '../../../api/core/client'
import { DashboardHero, DashboardSurface, StatePanel } from '../../../shared/ui/ui-primitives'
import { cn } from '../../../shared/lib/cn'
import { useTheme } from '../../../theme/theme-context'
import { useAuth } from '../../auth/auth-context'
import { useNotification } from '../../../notifications/notification-context'

function parseAccountStatus(value: SystemUserMe['accountStatus']): AccountStatus | null {
  const n = Number(value)
  if (n === AccountStatus.Active || n === AccountStatus.Pending || n === AccountStatus.Suspended || n === AccountStatus.Banned) {
    return n as AccountStatus
  }
  return null
}

function parseUserType(value: SystemUserMe['systemUserType']): SystemUserType | null {
  const n = Number(value)
  if (
    n === SystemUserType.Admin ||
    n === SystemUserType.Employer ||
    n === SystemUserType.Supervisor ||
    n === SystemUserType.Worker
  ) {
    return n as SystemUserType
  }
  return null
}

export function AdminProfilePage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { session } = useAuth()
  const { success } = useNotification()

  const [me, setMe] = useState<SystemUserMe | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadingMe, setLoadingMe] = useState(true)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [passwordFormError, setPasswordFormError] = useState<string | null>(null)

  const inputClass = cn(
    'w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 min-w-0',
    theme === 'dark'
      ? 'border-white/20 bg-white/[0.03] text-white placeholder:text-white/40'
      : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400',
  )

  const toneMuted = theme === 'dark' ? 'text-white/65' : 'text-slate-600'
  const toneTitle = theme === 'dark' ? 'text-white' : 'text-slate-900'

  const loadMe = useCallback(async () => {
    setLoadingMe(true)
    setLoadError(null)
    try {
      const data = await systemUsersApi.me({})
      setMe(data)
    } catch (e) {
      setMe(null)
      const msg = e instanceof ApiError ? e.message : t('dashboard.admin.profile.loadError')
      setLoadError(msg)
    } finally {
      setLoadingMe(false)
    }
  }, [t])

  useEffect(() => {
    void loadMe()
  }, [loadMe])

  const systemUserId = me ? Number(me.systemUserId) : Number(session?.systemUserId)
  const minLen = 6
  const passwordOk = newPassword.trim().length >= minLen && newPassword.trim() === confirmPassword.trim()
  const mismatch =
    confirmPassword.length > 0 && newPassword.trim().length > 0 && newPassword.trim() !== confirmPassword.trim()

  const accountStatus = me ? parseAccountStatus(me.accountStatus) : null
  const userType = me ? parseUserType(me.systemUserType) : null

  const accountStatusLabel =
    accountStatus === AccountStatus.Active
      ? t('dashboard.admin.profile.accountStatus.active')
      : accountStatus === AccountStatus.Pending
        ? t('dashboard.admin.profile.accountStatus.pending')
        : accountStatus === AccountStatus.Suspended
          ? t('dashboard.admin.profile.accountStatus.suspended')
          : accountStatus === AccountStatus.Banned
            ? t('dashboard.admin.profile.accountStatus.banned')
            : '—'

  const userTypeLabel =
    userType === SystemUserType.Admin
      ? t('dashboard.admin.profile.userType.admin')
      : userType === SystemUserType.Employer
        ? t('dashboard.admin.profile.userType.employer')
        : userType === SystemUserType.Supervisor
          ? t('dashboard.admin.profile.userType.supervisor')
          : userType === SystemUserType.Worker
            ? t('dashboard.admin.profile.userType.worker')
            : '—'

  const onPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setPasswordFormError(null)
    if (!Number.isFinite(systemUserId) || systemUserId <= 0) {
      setPasswordFormError(t('dashboard.admin.profile.password.invalidSession'))
      return
    }
    if (newPassword.trim().length < minLen) {
      setPasswordFormError(t('dashboard.admin.profile.password.tooShort', { min: minLen }))
      return
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      setPasswordFormError(t('dashboard.admin.profile.password.mismatch'))
      return
    }

    setPasswordBusy(true)
    try {
      await systemUsersApi.changePassword({ systemUserId, password: newPassword.trim() })
      setNewPassword('')
      setConfirmPassword('')
      success(t('dashboard.admin.profile.password.success'))
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : t('dashboard.admin.profile.password.apiError')
      setPasswordFormError(msg)
    } finally {
      setPasswordBusy(false)
    }
  }

  const displayEmail = me?.email ?? session?.email ?? '—'
  const fullName =
    [me?.firstName, me?.lastName]
      .map((x) => (typeof x === 'string' ? x.trim() : ''))
      .filter(Boolean)
      .join(' ') || null

  return (
    <>
      <DashboardHero
        theme={theme}
        title={t('dashboard.admin.profile.title')}
        description={t('dashboard.admin.profile.subtitle')}
      />

      <DashboardSurface theme={theme}>
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
              theme === 'dark' ? 'border-white/15 bg-white/[0.06] text-cyan-200/90' : 'border-sky-200/70 bg-sky-50 text-sky-700',
            )}
            aria-hidden
          >
            <UserRound className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className={cn('text-base font-semibold sm:text-lg', toneTitle)}>{t('dashboard.admin.profile.cardTitle')}</h2>
            <p className={cn('text-xs sm:text-sm', toneMuted)}>{t('dashboard.admin.profile.cardHint')}</p>
          </div>
        </div>

        {loadingMe ? (
          <p className={cn('mt-4 text-sm', toneMuted)}>{t('dashboard.admin.summary.loading')}</p>
        ) : loadError ? (
          <div className="mt-4 space-y-3">
            <StatePanel theme={theme} text={loadError} isError />
            <button
              type="button"
              onClick={() => void loadMe()}
              className={cn(
                'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                theme === 'dark' ? 'border-white/20 text-white hover:bg-white/10' : 'border-slate-200 text-slate-800 hover:bg-slate-50',
              )}
            >
              {t('dashboard.admin.profile.retry')}
            </button>
          </div>
        ) : (
          <dl className={cn('mt-4 grid gap-3 text-sm sm:grid-cols-2', toneMuted)}>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide">{t('dashboard.admin.profile.fields.email')}</dt>
              <dd className={cn('mt-1 font-medium', toneTitle)}>{displayEmail}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide">{t('dashboard.admin.profile.fields.fullName')}</dt>
              <dd className={cn('mt-1 font-medium', toneTitle)}>{fullName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide">{t('dashboard.admin.profile.fields.phone')}</dt>
              <dd className={cn('mt-1 font-medium', toneTitle)}>{me?.phone?.trim() ? me.phone : '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide">{t('dashboard.admin.profile.fields.userType')}</dt>
              <dd className={cn('mt-1 font-medium', toneTitle)}>{userTypeLabel}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide">{t('dashboard.admin.profile.fields.accountStatus')}</dt>
              <dd className={cn('mt-1 font-medium', toneTitle)}>{accountStatusLabel}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide">{t('dashboard.admin.profile.fields.systemUserId')}</dt>
              <dd className={cn('mt-1 font-medium', toneTitle)}>{Number.isFinite(systemUserId) ? systemUserId : '—'}</dd>
            </div>
            {me?.isLocked ? (
              <div className="sm:col-span-2">
                <StatePanel theme={theme} text={t('dashboard.admin.profile.lockedWarning')} isError />
              </div>
            ) : null}
          </dl>
        )}
      </DashboardSurface>

      <DashboardSurface theme={theme}>
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
              theme === 'dark' ? 'border-white/15 bg-white/[0.06] text-cyan-200/90' : 'border-sky-200/70 bg-sky-50 text-sky-700',
            )}
            aria-hidden
          >
            <KeyRound className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className={cn('text-base font-semibold sm:text-lg', toneTitle)}>{t('dashboard.admin.profile.password.sectionTitle')}</h2>
            <p className={cn('text-xs sm:text-sm', toneMuted)}>{t('dashboard.admin.profile.password.sectionHint')}</p>
          </div>
        </div>

        <form onSubmit={(e) => void onPasswordSubmit(e)} className="mt-4 space-y-4">
          {passwordFormError ? <StatePanel theme={theme} text={passwordFormError} isError /> : null}

          <label className="block">
            <span className={cn('mb-1.5 block text-xs font-semibold uppercase tracking-wide', toneMuted)}>
              {t('dashboard.admin.profile.password.new')}
            </span>
            <input
              className={inputClass}
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(ev) => setNewPassword(ev.target.value)}
              disabled={passwordBusy || !Number.isFinite(systemUserId) || systemUserId <= 0}
            />
          </label>

          <label className="block">
            <span className={cn('mb-1.5 block text-xs font-semibold uppercase tracking-wide', toneMuted)}>
              {t('dashboard.admin.profile.password.confirm')}
            </span>
            <input
              className={inputClass}
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(ev) => setConfirmPassword(ev.target.value)}
              disabled={passwordBusy || !Number.isFinite(systemUserId) || systemUserId <= 0}
            />
          </label>

          {mismatch ? <p className={cn('text-xs', toneMuted)}>{t('dashboard.admin.profile.password.mismatch')}</p> : null}

          <button
            type="submit"
            disabled={passwordBusy || !passwordOk || !Number.isFinite(systemUserId) || systemUserId <= 0}
            className={cn(
              'inline-flex min-h-10 items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 disabled:cursor-not-allowed disabled:opacity-60',
              theme === 'dark'
                ? 'border-cyan-300/45 bg-cyan-300/12 text-cyan-50 hover:bg-cyan-300/18'
                : 'border-sky-300 bg-sky-600 text-white hover:bg-sky-700',
            )}
          >
            {passwordBusy ? t('dashboard.admin.summary.loading') : t('dashboard.admin.profile.password.submit')}
          </button>
        </form>
      </DashboardSurface>
    </>
  )
}
