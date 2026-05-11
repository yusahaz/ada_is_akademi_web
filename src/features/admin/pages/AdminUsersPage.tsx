import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { type SystemUserListItem } from '../../../api/system/system-users'
import { adminManagementApi } from '../../../api/admin/admin-management'
import { AccountStatus, SystemUserType } from '../../../api/core/enums'
import { normalizePageableList } from '../../../api/core/pagination'
import { DashboardHero, DashboardSurface, StatePanel } from '../../../shared/ui/ui-primitives'
import { cn } from '../../../shared/lib/cn'
import { useTheme } from '../../../theme/theme-context'
import { useNotification } from '../../../notifications/notification-context'
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog'

const PAGE_SIZES = [10, 20, 50] as const

/** Search is sent to the API only when the trimmed query has at least this many characters. */
const USER_SEARCH_MIN_CHARS = 3
const USER_SEARCH_DEBOUNCE_MS = 280

function effectiveSearchEmail(raw: string): string {
  const trimmed = raw.trim()
  return trimmed.length >= USER_SEARCH_MIN_CHARS ? trimmed : ''
}

function parseAccountStatusValue(value: unknown): AccountStatus | null {
  const n = Number(value)
  if (Number.isFinite(n)) {
    if (n === AccountStatus.Pending || n === AccountStatus.Active || n === AccountStatus.Suspended || n === AccountStatus.Banned) {
      return n as AccountStatus
    }
  }
  const s = String(value ?? '').trim().toLowerCase()
  if (!s) return null
  if (s === 'pending') return AccountStatus.Pending
  if (s === 'active') return AccountStatus.Active
  if (s === 'suspended') return AccountStatus.Suspended
  if (s === 'banned') return AccountStatus.Banned
  return null
}

function parseSystemUserTypeValue(value: unknown): SystemUserType | null {
  const n = Number(value)
  if (Number.isFinite(n)) {
    if (n === SystemUserType.Admin || n === SystemUserType.Employer || n === SystemUserType.Supervisor || n === SystemUserType.Worker) {
      return n as SystemUserType
    }
  }
  const s = String(value ?? '').trim().toLowerCase()
  if (!s) return null
  if (s === 'admin') return SystemUserType.Admin
  if (s === 'employer') return SystemUserType.Employer
  if (s === 'supervisor') return SystemUserType.Supervisor
  if (s === 'worker' || s === 'candidate') return SystemUserType.Worker
  return null
}

function userTypeLabel(value: unknown, t: (key: string) => string): string {
  const safe = (key: string) => {
    const translated = t(key)
    return translated.startsWith('dashboard.') ? '—' : translated
  }
  const parsed = parseSystemUserTypeValue(value)
  switch (parsed) {
    case SystemUserType.Admin:
      return safe('dashboard.admin.users.type.10')
    case SystemUserType.Employer:
      return safe('dashboard.admin.users.type.20')
    case SystemUserType.Supervisor:
      return safe('dashboard.admin.users.type.25')
    case SystemUserType.Worker:
      return safe('dashboard.admin.users.type.30')
    default:
      return '—'
  }
}

function userStatusLabel(value: unknown, t: (key: string) => string): string {
  const safe = (key: string) => {
    const translated = t(key)
    return translated.startsWith('dashboard.') ? '—' : translated
  }
  const parsed = parseAccountStatusValue(value)
  switch (parsed) {
    case AccountStatus.Pending:
      return safe('dashboard.admin.users.status.0')
    case AccountStatus.Active:
      return safe('dashboard.admin.users.status.10')
    case AccountStatus.Suspended:
      return safe('dashboard.admin.users.status.20')
    case AccountStatus.Banned:
      return safe('dashboard.admin.users.status.30')
    default:
      return '—'
  }
}

function statusBadgeClasses(theme: 'light' | 'dark', status: unknown): string {
  const s = parseAccountStatusValue(status)
  if (theme === 'dark') {
    switch (s) {
      case AccountStatus.Active:
        return 'border-emerald-400/35 bg-emerald-400/15 text-emerald-100'
      case AccountStatus.Pending:
        return 'border-amber-400/35 bg-amber-400/15 text-amber-100'
      case AccountStatus.Suspended:
        return 'border-orange-400/35 bg-orange-400/15 text-orange-100'
      case AccountStatus.Banned:
      default:
        return 'border-rose-400/35 bg-rose-400/15 text-rose-100'
    }
  }
  switch (s) {
    case AccountStatus.Active:
      return 'border-emerald-200 bg-emerald-50 text-emerald-900'
    case AccountStatus.Pending:
      return 'border-amber-200 bg-amber-50 text-amber-900'
    case AccountStatus.Suspended:
      return 'border-orange-200 bg-orange-50 text-orange-950'
    case AccountStatus.Banned:
    default:
      return 'border-rose-200 bg-rose-50 text-rose-950'
  }
}

const UsersFiltersCard = memo(function UsersFiltersCard({
  theme,
  email,
  onEmailChange,
  type,
  onTypeChange,
  status,
  onStatusChange,
  busy,
}: {
  theme: 'light' | 'dark'
  email: string
  onEmailChange: (next: string) => void
  type: SystemUserType | null
  onTypeChange: (next: SystemUserType | null) => void
  status: AccountStatus | null
  onStatusChange: (next: AccountStatus | null) => void
  busy: boolean
}) {
  const { t } = useTranslation()

  const inputClass = cn(
    'h-11 w-full rounded-xl border px-3 text-sm font-medium outline-none transition sm:h-10',
    'focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2',
    theme === 'dark'
      ? 'border-white/15 bg-[#0f172a] text-white placeholder:text-white/40 ring-offset-[#0b0e14]'
      : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm ring-offset-white',
  )

  const selectClass = cn(inputClass, 'appearance-none pr-9', busy ? 'opacity-70' : '')

  return (
    <DashboardSurface theme={theme} className="space-y-4">
      <div>
        <p className={cn('text-xs font-semibold uppercase tracking-wide', theme === 'dark' ? 'text-white/55' : 'text-slate-600')}>
          {t('dashboard.admin.details.users.title')}
        </p>
        <p className={cn('mt-1 text-sm', theme === 'dark' ? 'text-white/80' : 'text-slate-700')}>
          {t('dashboard.admin.details.users.body')}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-6">
        <label className="sm:col-span-3">
          <span className={cn('mb-1.5 block text-xs font-semibold uppercase tracking-wide', theme === 'dark' ? 'text-white/55' : 'text-slate-600')}>
            {t('dashboard.admin.users.filters.searchEmail')}
          </span>
          <input
            className={inputClass}
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="ornek@mail.com"
            autoComplete="off"
            inputMode="email"
          />
        </label>

        <label className="sm:col-span-2">
          <span className={cn('mb-1.5 block text-xs font-semibold uppercase tracking-wide', theme === 'dark' ? 'text-white/55' : 'text-slate-600')}>
            {t('dashboard.admin.users.columns.type')}
          </span>
          <div className="relative">
            <select
              className={selectClass}
              value={type ?? ''}
              disabled={busy}
              onChange={(e) => {
                const v = e.target.value
                onTypeChange(v === '' ? null : (Number(v) as SystemUserType))
              }}
              aria-label={t('dashboard.admin.users.columns.type')}
            >
              <option value="">{t('dashboard.admin.users.filters.typeAll')}</option>
              <option value={SystemUserType.Admin}>{t('dashboard.admin.users.type.10')}</option>
              <option value={SystemUserType.Employer}>{t('dashboard.admin.users.type.20')}</option>
              <option value={SystemUserType.Worker}>{t('dashboard.admin.users.type.30')}</option>
            </select>
            <span className={cn('pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs', theme === 'dark' ? 'text-white/55' : 'text-slate-500')} aria-hidden>
              ▾
            </span>
          </div>
        </label>

        <label className="sm:col-span-1">
          <span className={cn('mb-1.5 block text-xs font-semibold uppercase tracking-wide', theme === 'dark' ? 'text-white/55' : 'text-slate-600')}>
            {t('dashboard.admin.users.columns.status')}
          </span>
          <div className="relative">
            <select
              className={selectClass}
              value={status ?? ''}
              disabled={busy}
              onChange={(e) => {
                const v = e.target.value
                onStatusChange(v === '' ? null : (Number(v) as AccountStatus))
              }}
              aria-label={t('dashboard.admin.users.columns.status')}
            >
              <option value="">{t('dashboard.admin.users.filters.statusAll')}</option>
              <option value={AccountStatus.Pending}>{t('dashboard.admin.users.status.0')}</option>
              <option value={AccountStatus.Active}>{t('dashboard.admin.users.status.10')}</option>
              <option value={AccountStatus.Suspended}>{t('dashboard.admin.users.status.20')}</option>
              <option value={AccountStatus.Banned}>{t('dashboard.admin.users.status.30')}</option>
            </select>
            <span className={cn('pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs', theme === 'dark' ? 'text-white/55' : 'text-slate-500')} aria-hidden>
              ▾
            </span>
          </div>
        </label>
      </div>
    </DashboardSurface>
  )
})

export function AdminUsersPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { success, error: notifyError } = useNotification()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [type, setType] = useState<SystemUserType | null>(null)
  const [status, setStatus] = useState<AccountStatus | null>(null)

  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(20)
  const [pageOffset, setPageOffset] = useState(0)

  const [rows, setRows] = useState<SystemUserListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  const refreshTimer = useRef<number | null>(null)

  const query = useMemo(() => {
    return {
      accountStatus: status,
      type,
      searchEmail: effectiveSearchEmail(email) || null,
      limit: pageSize,
      offset: pageOffset,
    }
  }, [email, pageOffset, pageSize, status, type])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await adminManagementApi.listSystemUsers(query)
      const normalized = normalizePageableList(result)
      setRows(normalized.rows)
      setTotalCount(normalized.totalCount)
      success(t('dashboard.admin.users.list.fetchSuccess', { count: normalized.rows.length }))
    } catch {
      setRows([])
      setTotalCount(0)
      setError(t('dashboard.admin.users.list.fetchError'))
    } finally {
      setLoading(false)
    }
  }, [query, success, t])

  useEffect(() => {
    if (refreshTimer.current) {
      window.clearTimeout(refreshTimer.current)
    }
    refreshTimer.current = window.setTimeout(() => {
      void load()
    }, USER_SEARCH_DEBOUNCE_MS)

    return () => {
      if (refreshTimer.current) {
        window.clearTimeout(refreshTimer.current)
      }
    }
  }, [load])

  const toneMuted = theme === 'dark' ? 'text-white/65' : 'text-slate-600'
  const gridBusy = loading

  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize))
  const currentPage = Math.floor(pageOffset / pageSize) + 1

  const adminCountOnPage = useMemo(
    () => rows.filter((r) => parseSystemUserTypeValue(r.type) === SystemUserType.Admin).length,
    [rows],
  )

  const onEdit = (systemUserId: number) => navigate(`/admin/users/${systemUserId}`)

  const confirmDelete = async () => {
    if (deleteTargetId == null) return
    setDeleteBusy(true)
    try {
      await adminManagementApi.banSystemUser({ systemUserId: deleteTargetId })
      success('İşlem başarılı')
      setDeleteTargetId(null)
      await load()
    } catch {
      notifyError('İşlem sırasında bir hata oluştu')
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <>
      <DashboardHero theme={theme} title={t('dashboard.admin.details.users.title')} description={t('dashboard.admin.details.users.body')} />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate('/admin/users/new')}
          className={cn(
            'inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/55 focus-visible:ring-offset-2',
            theme === 'dark'
              ? 'border-cyan-300/40 bg-cyan-400/20 text-cyan-50 hover:bg-cyan-400/28 focus-visible:ring-offset-[#0b0e14]'
              : 'border-sky-400 bg-sky-600 text-white shadow-[0_2px_10px_rgba(2,132,199,0.35)] hover:bg-sky-700 focus-visible:ring-offset-white',
          )}
        >
          Yeni Kullanıcı Oluştur
        </button>
      </div>

      {error ? <StatePanel theme={theme} text={error} isError /> : null}

      <UsersFiltersCard
        theme={theme}
        email={email}
        onEmailChange={(next) => {
          setEmail(next)
          setPageOffset(0)
        }}
        type={type}
        onTypeChange={(next) => {
          setType(next)
          setPageOffset(0)
        }}
        status={status}
        onStatusChange={(next) => {
          setStatus(next)
          setPageOffset(0)
        }}
        busy={gridBusy}
      />

      <DashboardSurface theme={theme} className="overflow-hidden p-0 sm:p-0">
        <div className="relative overflow-x-auto" aria-busy={gridBusy}>
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr
                className={cn(
                  'border-b text-xs uppercase tracking-wide',
                  theme === 'dark' ? 'border-white/10 bg-white/[0.04] text-white/65' : 'border-slate-200 bg-slate-50 text-slate-600',
                )}
              >
                <th scope="col" className="px-4 py-3 font-semibold sm:px-5">
                  {t('dashboard.admin.users.columns.id')}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold sm:px-5">
                  {t('dashboard.admin.users.columns.email')}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold sm:px-5">
                  {t('dashboard.admin.users.columns.type')}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold sm:px-5">
                  {t('dashboard.admin.users.columns.status')}
                </th>
                <th scope="col" className="px-4 py-3 text-end font-semibold sm:px-5">
                  {t('dashboard.admin.employers.columns.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className={`px-5 py-10 text-center ${toneMuted}`}>
                    {t('dashboard.admin.summary.loading')}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`px-5 py-10 text-center ${toneMuted}`}>
                    {t('dashboard.admin.users.list.empty')}
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const id = Number(row.id)
                  return (
                    <tr
                      key={String(row.id)}
                      className={cn(
                        'border-b last:border-b-0',
                        theme === 'dark' ? 'border-white/[0.07] hover:bg-white/[0.03]' : 'border-slate-100 hover:bg-sky-50/50',
                      )}
                    >
                      <td className={`px-4 py-3 font-mono text-xs sm:px-5 ${theme === 'dark' ? 'text-white/75' : 'text-slate-700'}`}>
                        {row.id}
                      </td>
                      <td className={`px-4 py-3 sm:px-5 ${theme === 'dark' ? 'text-white/90' : 'text-slate-800'}`}>{row.email}</td>
                      <td className={`px-4 py-3 sm:px-5 ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                        {userTypeLabel(row.type, t)}
                      </td>
                      <td className="px-4 py-3 sm:px-5">
                        <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold', statusBadgeClasses(theme, row.accountStatus))}>
                          {userStatusLabel(row.accountStatus, t)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-end sm:px-5">
                        <div className="inline-flex flex-wrap items-center justify-end gap-1">
                          <button
                            type="button"
                            disabled={id <= 0}
                            onClick={() => onEdit(id)}
                            className={cn(
                              'inline-flex h-9 items-center justify-center rounded-lg border px-3 text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/55 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40',
                              theme === 'dark'
                                ? 'border-sky-400/45 bg-sky-400/16 text-sky-50 shadow-sky-950/30 hover:border-sky-400/65 hover:bg-sky-400/26 focus-visible:ring-offset-[#0b0e14]'
                                : 'border-sky-400 bg-sky-100 text-sky-900 shadow-sky-900/10 hover:border-sky-500 hover:bg-sky-200 focus-visible:ring-offset-white',
                            )}
                            aria-label="Düzenle"
                          >
                            Düzenle
                          </button>
                          <button
                            type="button"
                            disabled={id <= 0}
                            onClick={() => setDeleteTargetId(id)}
                            className={cn(
                              'inline-flex h-9 items-center justify-center rounded-lg border px-3 text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/65 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40',
                              theme === 'dark'
                                ? 'border-rose-400/55 bg-rose-600/90 text-white shadow-rose-950/35 hover:border-rose-300/70 hover:bg-rose-600 focus-visible:ring-offset-[#0b0e14]'
                                : 'border-rose-500 bg-rose-600 text-white shadow-[0_2px_10px_rgba(225,29,72,0.35)] hover:border-rose-600 hover:bg-rose-700 focus-visible:ring-offset-white',
                            )}
                            aria-label="Sil"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div
          className={cn(
            'flex min-w-0 flex-nowrap items-center gap-2 overflow-x-auto border-t px-4 py-3 sm:gap-3 sm:px-5',
            theme === 'dark' ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50/60',
          )}
        >
          <div className="flex shrink-0 items-center gap-2">
            <span className={cn('whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide sm:text-[11px]', theme === 'dark' ? 'text-white/45' : 'text-slate-500')}>
              {t('dashboard.admin.grid.rowsPerPage')}
            </span>
            <select
              value={pageSize}
              disabled={gridBusy}
              onChange={(e) => {
                const next = Number(e.target.value) as (typeof PAGE_SIZES)[number]
                setPageSize(next)
                setPageOffset(0)
              }}
              className={cn(
                'h-9 min-w-[4.75rem] cursor-pointer appearance-none rounded-xl border py-1.5 pl-2.5 pr-8 text-xs font-semibold tabular-nums outline-none transition sm:h-10 sm:min-w-[5.5rem] sm:pl-3 sm:pr-9 sm:text-sm',
                'focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55',
                theme === 'dark'
                  ? 'border-white/15 bg-[#0f172a] text-white ring-offset-[#0b0e14] hover:border-cyan-400/35'
                  : 'border-slate-200 bg-white text-slate-800 shadow-sm ring-offset-white hover:border-sky-300',
              )}
              aria-label={t('dashboard.admin.grid.rowsPerPage')}
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-x-4 gap-y-1">
            <div className={cn('flex items-center gap-3 text-xs font-medium', theme === 'dark' ? 'text-white/55' : 'text-slate-600')}>
              <span>
                {t('dashboard.admin.users.summary.adminRows')}: <span className={theme === 'dark' ? 'text-white/80' : 'text-slate-900'}>{adminCountOnPage}</span>
              </span>
              <span>
                {t('dashboard.admin.users.summary.pageRows')}: <span className={theme === 'dark' ? 'text-white/80' : 'text-slate-900'}>{rows.length}</span>
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className={cn('whitespace-nowrap text-xs font-medium', theme === 'dark' ? 'text-white/60' : 'text-slate-600')}>
                {currentPage} / {pageCount}
              </span>
              <button
                type="button"
                disabled={gridBusy || pageOffset <= 0}
                onClick={() => setPageOffset(Math.max(0, pageOffset - pageSize))}
                className={cn(
                  'inline-flex h-9 items-center justify-center rounded-xl border px-3 text-xs font-semibold transition disabled:opacity-50',
                  theme === 'dark'
                    ? 'border-white/15 bg-white/[0.04] text-white/80 hover:bg-white/[0.07]'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                )}
              >
                {t('dashboard.admin.grid.prev')}
              </button>
              <button
                type="button"
                disabled={gridBusy || pageOffset + pageSize >= totalCount}
                onClick={() => setPageOffset(pageOffset + pageSize)}
                className={cn(
                  'inline-flex h-9 items-center justify-center rounded-xl border px-3 text-xs font-semibold transition disabled:opacity-50',
                  theme === 'dark'
                    ? 'border-white/15 bg-white/[0.04] text-white/80 hover:bg-white/[0.07]'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                )}
              >
                {t('dashboard.admin.grid.next')}
              </button>
            </div>
          </div>
        </div>
      </DashboardSurface>

      <ConfirmDeleteDialog
        open={deleteTargetId != null}
        theme={theme}
        busy={deleteBusy}
        entityName={deleteTargetId != null ? `#${deleteTargetId}` : null}
        titleText="Kullanıcıyı sil"
        contextPrefixText="Kullanıcı"
        onClose={() => !deleteBusy && setDeleteTargetId(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  )
}

