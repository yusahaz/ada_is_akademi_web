import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Ban, PauseCircle, PlayCircle, UserRound } from 'lucide-react'

import { DashboardHero, DashboardSurface, StatePanel } from '../../../shared/ui/ui-primitives'
import { cn } from '../../../shared/lib/cn'
import { useTheme } from '../../../theme/theme-context'
import { useNotification } from '../../../notifications/notification-context'
import { adminManagementApi } from '../../../api/admin/admin-management'
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog'
import { AccountStatus, SystemUserType } from '../../../api/core/enums'
import type { SystemUserMe } from '../../../api/system/system-users'

type AccountActionType = 'suspend' | 'reactivate' | 'ban'

function parseAccountStatusValue(value: unknown): AccountStatus | null {
  if (typeof value === 'number') return value as AccountStatus
  if (typeof value === 'string') {
    if (/^\d+$/.test(value)) return Number(value) as AccountStatus
    const normalized = value.trim().toLowerCase()
    if (normalized === 'pending') return AccountStatus.Pending
    if (normalized === 'active') return AccountStatus.Active
    if (normalized === 'suspended') return AccountStatus.Suspended
    if (normalized === 'banned') return AccountStatus.Banned
  }
  return null
}

function parseSystemUserTypeValue(value: unknown): SystemUserType | null {
  if (typeof value === 'number') return value as SystemUserType
  if (typeof value === 'string') {
    if (/^\d+$/.test(value)) return Number(value) as SystemUserType
    const normalized = value.trim().toLowerCase()
    if (normalized === 'admin') return SystemUserType.Admin
    if (normalized === 'employer') return SystemUserType.Employer
    if (normalized === 'supervisor') return SystemUserType.Supervisor
    if (normalized === 'worker') return SystemUserType.Worker
  }
  return null
}

export function AdminUserDetailPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const { success, error: notifyError } = useNotification()
  const params = useParams<{ entityId?: string }>()
  const userId = Number(params.entityId ?? '')
  const [detail, setDetail] = useState<SystemUserMe | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionBusy, setActionBusy] = useState(false)
  const [actionType, setActionType] = useState<AccountActionType | null>(null)
  const hasValidId = Number.isFinite(userId) && userId > 0

  useEffect(() => {
    if (!hasValidId) {
      setDetail(null)
      setLoadError('Kullanıcı ID geçersiz.')
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    setLoadError(null)
    void adminManagementApi
      .getSystemUserById(userId)
      .then((result) => {
        if (!active) return
        setDetail(result)
      })
      .catch(() => {
        if (!active) return
        setDetail(null)
        setLoadError('Kullanıcı detayı yüklenemedi.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [hasValidId, userId])

  const actionMeta = useMemo(() => {
    if (actionType === 'suspend') {
      return {
        title: 'Hesabı askıya al',
        confirm: 'Evet, askıya al',
        context: 'Kullanıcı',
      }
    }
    if (actionType === 'reactivate') {
      return {
        title: 'Hesabı yeniden aktifleştir',
        confirm: 'Evet, aktifleştir',
        context: 'Kullanıcı',
      }
    }
    if (actionType === 'ban') {
      return {
        title: 'Hesabı yasakla',
        confirm: 'Evet, yasakla',
        context: 'Kullanıcı',
      }
    }
    return null
  }, [actionType])

  const confirmAction = async () => {
    if (!hasValidId || !actionType) return
    setActionBusy(true)
    try {
      if (actionType === 'suspend') {
        await adminManagementApi.suspendSystemUser({ systemUserId: userId })
      } else if (actionType === 'reactivate') {
        await adminManagementApi.reactivateSystemUser({ systemUserId: userId })
      } else {
        await adminManagementApi.banSystemUser({ systemUserId: userId })
      }
      success('İşlem başarılı')
      setActionType(null)
      const refreshed = await adminManagementApi.getSystemUserById(userId)
      setDetail(refreshed)
    } catch {
      notifyError('İşlem sırasında bir hata oluştu')
    } finally {
      setActionBusy(false)
    }
  }

  const statusLabel = useMemo(() => {
    const status = parseAccountStatusValue(detail?.accountStatus)
    if (status === AccountStatus.Active) return 'Aktif'
    if (status === AccountStatus.Pending) return 'Beklemede'
    if (status === AccountStatus.Suspended) return 'Askıda'
    if (status === AccountStatus.Banned) return 'Yasaklı'
    return '—'
  }, [detail?.accountStatus])

  const typeLabel = useMemo(() => {
    const type = parseSystemUserTypeValue(detail?.systemUserType)
    if (type === SystemUserType.Admin) return 'Admin'
    if (type === SystemUserType.Employer) return 'İşveren'
    if (type === SystemUserType.Supervisor) return 'Supervisor'
    if (type === SystemUserType.Worker) return 'Aday'
    return '—'
  }, [detail?.systemUserType])

  const fullName = useMemo(() => {
    const fn = String(detail?.firstName ?? '').trim()
    const ln = String(detail?.lastName ?? '').trim()
    return `${fn} ${ln}`.trim() || '—'
  }, [detail?.firstName, detail?.lastName])

  return (
    <>
      <button
        type="button"
        onClick={() => navigate('/admin/users')}
        className={cn(
          'mb-2 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition',
          theme === 'dark' ? 'border-white/15 text-white hover:bg-white/10' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
        )}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Listeye dön
      </button>

      <DashboardHero
        theme={theme}
        title={t('dashboard.admin.users.detail.title', { email: detail?.email ?? 'Kullanıcı', id: Number.isFinite(userId) ? userId : '—' })}
        description="Kullanıcı detaylarını bu ekrandan yönetebilirsiniz."
      />

      {loadError ? <StatePanel theme={theme} text={loadError} isError /> : null}
      {loading ? (
        <StatePanel theme={theme} text={t('dashboard.admin.summary.loading')} />
      ) : (
        <DashboardSurface theme={theme} className="space-y-3">
          <div className="flex items-center gap-2">
            <UserRound className={cn('h-4 w-4', theme === 'dark' ? 'text-cyan-200' : 'text-sky-700')} />
            <p className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>Kullanıcı Detayı</p>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <p className={cn(theme === 'dark' ? 'text-white/75' : 'text-slate-700')}>Kullanıcı ID: {Number.isFinite(userId) ? userId : '—'}</p>
            <p className={cn(theme === 'dark' ? 'text-white/75' : 'text-slate-700')}>E-posta: {detail?.email ?? '—'}</p>
            <p className={cn(theme === 'dark' ? 'text-white/75' : 'text-slate-700')}>Ad Soyad: {fullName}</p>
            <p className={cn(theme === 'dark' ? 'text-white/75' : 'text-slate-700')}>Telefon: {detail?.phone ?? '—'}</p>
            <p className={cn(theme === 'dark' ? 'text-white/75' : 'text-slate-700')}>Tip: {typeLabel}</p>
            <p className={cn(theme === 'dark' ? 'text-white/75' : 'text-slate-700')}>Durum: {statusLabel}</p>
          </div>
        </DashboardSurface>
      )}

      <DashboardSurface theme={theme} className="space-y-3">
        <p className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
          Hesap durumu aksiyonları
        </p>
        <p className={cn('text-xs', theme === 'dark' ? 'text-white/60' : 'text-slate-600')}>
          Aksiyonlar onay dialogundan sonra uygulanır.
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            disabled={!hasValidId || actionBusy}
            onClick={() => setActionType('suspend')}
            className={cn(
              'inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition disabled:opacity-50',
              theme === 'dark'
                ? 'border-amber-400/45 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25'
                : 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100',
            )}
          >
            <PauseCircle className="h-4 w-4" aria-hidden />
            Askıya Al
          </button>
          <button
            type="button"
            disabled={!hasValidId || actionBusy}
            onClick={() => setActionType('reactivate')}
            className={cn(
              'inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition disabled:opacity-50',
              theme === 'dark'
                ? 'border-emerald-400/45 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25'
                : 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100',
            )}
          >
            <PlayCircle className="h-4 w-4" aria-hidden />
            Yeniden Aktifleştir
          </button>
          <button
            type="button"
            disabled={!hasValidId || actionBusy}
            onClick={() => setActionType('ban')}
            className={cn(
              'inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition disabled:opacity-50',
              theme === 'dark'
                ? 'border-rose-400/55 bg-rose-600/90 text-white hover:bg-rose-600'
                : 'border-rose-500 bg-rose-600 text-white hover:bg-rose-700',
            )}
          >
            <Ban className="h-4 w-4" aria-hidden />
            Yasakla
          </button>
        </div>
      </DashboardSurface>

      <ConfirmDeleteDialog
        open={actionType != null}
        theme={theme}
        busy={actionBusy}
        entityName={hasValidId ? `#${userId}` : null}
        titleText={actionMeta?.title}
        contextPrefixText={actionMeta?.context}
        confirmText={actionMeta?.confirm}
        onClose={() => !actionBusy && setActionType(null)}
        onConfirm={() => void confirmAction()}
      />
    </>
  )
}
