import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ApiError,
  AccountStatus,
  normalizePageableList,
  systemUsersApi,
  SystemUserType,
} from '../../../api'
import { useActionToasts } from '../../../notifications/use-action-toasts'
import type { SystemUserListItem, SystemUsersListResult } from '../../../api/system-users'
import { AdminDataGrid, type AdminDataGridColumn } from '../AdminDataGrid'
import { useTheme } from '../../../theme/theme-context'
import { IconCheck, IconShield, IconSpark, IconUsers } from '../../landing/icons'
import { AdminEntityDetail } from './AdminEntityDetail'
import { AdminFilterInput, AdminFilterSelect } from './AdminFilterField'

type ViewMode = 'list' | 'detail'

type UsersSectionProps = {
  isActive: boolean
  detailId?: number | null
  onOpenDetail?: (id: number) => void
  onCloseDetail?: () => void
}

export function UsersSection({ isActive, detailId, onOpenDetail, onCloseDetail }: UsersSectionProps) {
  void detailId
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const { runWithToast } = useActionToasts()
  const mapApiError = useCallback(
    (fallbackKey: string, error: unknown) => {
      const base = t(fallbackKey)
      if (error instanceof ApiError && error.code) {
        return `${base} (${error.code})`
      }
      return base
    },
    [t],
  )
  const hasLoadedRef = useRef(false)
  const [mode, setMode] = useState<ViewMode>('list')
  const [listRow, setListRow] = useState<SystemUserListItem | null>(null)
  const [detailPending, setDetailPending] = useState(false)
  const [detailSuccess, setDetailSuccess] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [lifecycleAction, setLifecycleAction] = useState<'ban' | 'reactivate' | 'suspend' | ''>('')
  const [passwordDraft, setPasswordDraft] = useState('')

  const [queryPending, setQueryPending] = useState(false)
  const [filterEmail, setFilterEmail] = useState('')
  const [filterType, setFilterType] = useState<'all' | string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | string>('all')
  const [appliedEmail, setAppliedEmail] = useState('')
  const [appliedType, setAppliedType] = useState<'all' | string>('all')
  const [appliedStatus, setAppliedStatus] = useState<'all' | string>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [totalCount, setTotalCount] = useState(0)
  const [sortState, setSortState] = useState<{
    columnId: string | null
    direction: 'asc' | 'desc'
  }>({ columnId: null, direction: 'asc' })
  const [rows, setRows] = useState<SystemUserListItem[]>([])
  const [listSuccess, setListSuccess] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  const fetchUsers = useCallback(
    async (
      searchEmail: string,
      typeFilter: string,
      statusFilter: string,
      nextPage: number,
      nextPageSize: number,
    ) => {
      setQueryPending(true)
      setListError(null)
      setListSuccess(null)
      try {
        const listResponse: SystemUsersListResult = await systemUsersApi.list({
          searchEmail: searchEmail.length > 0 ? searchEmail : null,
          type: typeFilter === 'all' ? null : (Number(typeFilter) as SystemUserType),
          accountStatus:
            statusFilter === 'all' ? null : (Number(statusFilter) as AccountStatus),
          limit: nextPageSize,
          offset: (nextPage - 1) * nextPageSize,
        })
        const { rows: rawRows, totalCount: tc } = normalizePageableList(listResponse)
        const sorted = [...rawRows]
        if (sortState.columnId) {
          sorted.sort((a, b) => {
            const left =
              sortState.columnId === 'id'
                ? Number(a.id)
                : sortState.columnId === 'email'
                  ? a.email.toLocaleLowerCase(i18n.language)
                  : sortState.columnId === 'type'
                    ? Number(a.type)
                    : Number(a.accountStatus)
            const right =
              sortState.columnId === 'id'
                ? Number(b.id)
                : sortState.columnId === 'email'
                  ? b.email.toLocaleLowerCase(i18n.language)
                  : sortState.columnId === 'type'
                    ? Number(b.type)
                    : Number(b.accountStatus)
            if (left < right) return sortState.direction === 'asc' ? -1 : 1
            if (left > right) return sortState.direction === 'asc' ? 1 : -1
            return 0
          })
        }
        setRows(sorted)
        setTotalCount(tc)
        setListSuccess(t('dashboard.admin.users.list.fetchSuccess', { count: tc }))
      } catch (error) {
        setListError(mapApiError('dashboard.admin.users.list.fetchError', error))
        setRows([])
        setTotalCount(0)
      } finally {
        setQueryPending(false)
      }
    },
    [i18n.language, mapApiError, sortState.columnId, sortState.direction, t],
  )

  useEffect(() => {
    if (!isActive) {
      hasLoadedRef.current = false
      return
    }
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true
    void fetchUsers('', 'all', 'all', 1, pageSize)
  }, [fetchUsers, isActive, pageSize])

  async function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (queryPending) return
    const nextEmail = filterEmail.trim()
    setAppliedEmail(nextEmail)
    setAppliedType(filterType)
    setAppliedStatus(filterStatus)
    setPage(1)
    await fetchUsers(nextEmail, filterType, filterStatus, 1, pageSize)
  }

  const summaryItems = useMemo(() => {
    const activeCount = rows.filter((r) => Number(r.accountStatus) === AccountStatus.Active).length
    const adminCount = rows.filter((r) => Number(r.type) === SystemUserType.Admin).length
    return [
      {
        key: 'total',
        label: t('dashboard.admin.cards.totalLabel'),
        value: totalCount,
        icon: <IconUsers className="h-4 w-4" />,
      },
      {
        key: 'active',
        label: t('dashboard.admin.candidates.status.10'),
        value: activeCount,
        icon: <IconCheck className="h-4 w-4" />,
      },
      {
        key: 'admin',
        label: t('dashboard.admin.users.summary.adminRows'),
        value: adminCount,
        icon: <IconShield className="h-4 w-4" />,
      },
      {
        key: 'page',
        label: t('dashboard.admin.users.summary.pageRows'),
        value: rows.length,
        icon: <IconSpark className="h-4 w-4" />,
      },
    ]
  }, [rows, t, totalCount])

  const closeDetail = useCallback(() => {
    setMode('list')
    setListRow(null)
    setDetailSuccess(null)
    setDetailError(null)
    setLifecycleAction('')
    setPasswordDraft('')
    onCloseDetail?.()
  }, [onCloseDetail])

  const refreshList = useCallback(async () => {
    await fetchUsers(appliedEmail, appliedType, appliedStatus, page, pageSize)
  }, [appliedEmail, appliedStatus, appliedType, fetchUsers, page, pageSize])

  const openDetail = useCallback((item: SystemUserListItem) => {
    setListRow(item)
    setMode('detail')
    setDetailSuccess(null)
    setDetailError(null)
    setLifecycleAction('')
    setPasswordDraft('')
    onOpenDetail?.(Number(item.id))
  }, [onOpenDetail])

  const handleListDelete = useCallback(
    async (item: SystemUserListItem) => {
      const confirmed = window.confirm(t('dashboard.admin.detail.feedback.deleteConfirm'))
      if (!confirmed) return
      const systemUserId = Number(item.id)
      if (!Number.isFinite(systemUserId) || systemUserId <= 0) return
      setQueryPending(true)
      setListError(null)
      try {
        await runWithToast(systemUsersApi.ban({ systemUserId }), {
          success: { messageKey: 'dashboard.admin.detail.feedback.deleteSuccess' },
          error: { messageKey: 'dashboard.admin.detail.feedback.deleteError' },
        })
        setListSuccess(t('dashboard.admin.detail.feedback.deleteSuccess'))
        await refreshList()
      } catch (error) {
        setListError(mapApiError('dashboard.admin.detail.feedback.deleteError', error))
      } finally {
        setQueryPending(false)
      }
    },
    [mapApiError, refreshList, runWithToast, t],
  )

  const handleDetailSave = useCallback(async () => {
    if (!listRow) return
    const systemUserId = Number(listRow.id)
    if (!Number.isFinite(systemUserId) || systemUserId <= 0) return
    const password = passwordDraft.trim()
    if (!lifecycleAction && password.length === 0) {
      setDetailError(t('dashboard.admin.detail.validation.nothingToSave'))
      return
    }
    if (password.length > 0 && password.length < 6) {
      setDetailError(t('dashboard.admin.actions.invalidPassword'))
      return
    }

    setDetailPending(true)
    setDetailError(null)
    setDetailSuccess(null)
    try {
      await runWithToast(
        (async () => {
          if (lifecycleAction === 'suspend') {
            await systemUsersApi.suspend({ systemUserId })
          } else if (lifecycleAction === 'reactivate') {
            await systemUsersApi.reactivate({ systemUserId })
          } else if (lifecycleAction === 'ban') {
            await systemUsersApi.ban({ systemUserId })
          }
          if (password.length >= 6) {
            await systemUsersApi.changePassword({ systemUserId, password })
          }
        })(),
        {
          success: { messageKey: 'dashboard.admin.detail.feedback.saveSuccess' },
          error: { messageKey: 'dashboard.admin.detail.feedback.saveError' },
        },
      )
      setDetailSuccess(t('dashboard.admin.detail.feedback.saveSuccess'))
      setPasswordDraft('')
      setLifecycleAction('')
      await refreshList()
    } catch (error) {
      setDetailError(mapApiError('dashboard.admin.detail.feedback.saveError', error))
    } finally {
      setDetailPending(false)
    }
  }, [lifecycleAction, listRow, mapApiError, passwordDraft, refreshList, runWithToast, t])

  const handleDetailDelete = useCallback(async () => {
    if (!listRow) return
    const systemUserId = Number(listRow.id)
    if (!Number.isFinite(systemUserId) || systemUserId <= 0) return
    setDetailPending(true)
    setDetailError(null)
    setDetailSuccess(null)
    try {
      await runWithToast(systemUsersApi.ban({ systemUserId }), {
        success: { messageKey: 'dashboard.admin.detail.feedback.deleteSuccess' },
        error: { messageKey: 'dashboard.admin.detail.feedback.deleteError' },
      })
      closeDetail()
      setListSuccess(t('dashboard.admin.detail.feedback.deleteSuccess'))
      await refreshList()
    } catch (error) {
      setDetailError(mapApiError('dashboard.admin.detail.feedback.deleteError', error))
    } finally {
      setDetailPending(false)
    }
  }, [closeDetail, listRow, mapApiError, refreshList, runWithToast, t])

  const typeLabel = useCallback(
    (type: SystemUserType | string) =>
      t(`dashboard.admin.users.type.${type}`, { defaultValue: String(type) }),
    [t],
  )

  const gridColumns = useMemo<AdminDataGridColumn<SystemUserListItem>[]>(
    () => [
      {
        id: 'id',
        title: t('dashboard.admin.users.columns.id'),
        sortable: true,
        sortValue: (item) => Number(item.id),
        render: (item) => `#${item.id}`,
      },
      {
        id: 'email',
        title: t('dashboard.admin.users.columns.email'),
        sortable: true,
        sortValue: (item) => item.email,
        render: (item) => item.email,
      },
      {
        id: 'type',
        title: t('dashboard.admin.users.columns.type'),
        sortable: true,
        sortValue: (item) => Number(item.type),
        render: (item) => typeLabel(item.type),
      },
      {
        id: 'status',
        title: t('dashboard.admin.users.columns.status'),
        sortable: true,
        sortValue: (item) => item.accountStatus,
        render: (item) =>
          t(`dashboard.admin.candidates.status.${item.accountStatus}`, {
            defaultValue: String(item.accountStatus),
          }),
      },
      {
        id: 'actions',
        title: t('dashboard.admin.grid.columns.actions'),
        render: (item) => (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => openDetail(item)}
              className={`inline-flex h-8 min-w-20 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition disabled:opacity-50 ${
                theme === 'dark'
                  ? 'border-sky-400/50 text-sky-100 hover:bg-sky-400/15'
                  : 'border-sky-500/50 text-sky-700 hover:bg-sky-100'
              }`}
              disabled={queryPending}
            >
              {t('dashboard.admin.candidates.actions.edit')}
            </button>
            <button
              type="button"
              onClick={() => void handleListDelete(item)}
              className={`inline-flex h-8 min-w-20 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition disabled:opacity-50 ${
                theme === 'dark'
                  ? 'border-rose-500/70 bg-rose-500/20 text-rose-100 hover:bg-rose-500/35'
                  : 'border-rose-500/60 bg-rose-100 text-rose-700 hover:bg-rose-200'
              }`}
              disabled={queryPending}
            >
              {t('dashboard.admin.candidates.actions.delete')}
            </button>
          </div>
        ),
      },
    ],
    [handleListDelete, openDetail, queryPending, t, theme, typeLabel],
  )

  if (mode === 'detail' && listRow) {
    const detailTitle = t('dashboard.admin.users.detail.title', {
      id: listRow.id,
      email: listRow.email,
    })
    return (
      <AdminEntityDetail
        title={detailTitle}
        segments={[
          {
            key: 'users',
            label: t('dashboard.admin.sidebar.users'),
            onClick: closeDetail,
          },
          { key: 'current', label: `#${listRow.id}` },
        ]}
        onBack={closeDetail}
        onClose={closeDetail}
        onSave={handleDetailSave}
        onDelete={handleDetailDelete}
        pending={detailPending}
        successMessage={detailSuccess}
        errorMessage={detailError}
      >
        <div
          className={`grid gap-3 rounded-xl border p-4 text-sm ${
            theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <p className={theme === 'dark' ? 'text-white/90' : 'text-slate-900'}>{listRow.email}</p>
          <p className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>
            {t('dashboard.admin.users.columns.type')}: {typeLabel(listRow.type)}
          </p>
          <p className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>
            {t('dashboard.admin.users.columns.status')}:{' '}
            {t(`dashboard.admin.candidates.status.${listRow.accountStatus}`, {
              defaultValue: String(listRow.accountStatus),
            })}
          </p>
        </div>

        <label className={`block space-y-1.5 text-sm ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
          <span>{t('dashboard.admin.candidates.detail.lifecycle')}</span>
          <AdminFilterSelect
            value={lifecycleAction}
            onChange={(e) =>
              setLifecycleAction(e.target.value as 'ban' | 'reactivate' | 'suspend' | '')
            }
          >
            <option value="">{t('dashboard.admin.candidates.detail.lifecycleNone')}</option>
            <option value="suspend">{t('dashboard.admin.actions.suspend')}</option>
            <option value="reactivate">{t('dashboard.admin.actions.reactivate')}</option>
            <option value="ban">{t('dashboard.admin.actions.ban')}</option>
          </AdminFilterSelect>
        </label>

        <label className={`block space-y-1.5 text-sm ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
          <span>{t('dashboard.admin.users.detail.passwordOptional')}</span>
          <AdminFilterInput
            type="password"
            value={passwordDraft}
            onChange={(e) => setPasswordDraft(e.target.value)}
            autoComplete="new-password"
          />
        </label>
      </AdminEntityDetail>
    )
  }

  return (
    <>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => (
          <article
            key={item.key}
            className={`rounded-xl border p-3 ${
              theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className={theme === 'dark' ? 'text-xs text-white/70' : 'text-xs text-slate-500'}>
                {item.label}
              </p>
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${
                  theme === 'dark' ? 'bg-emerald-400/15 text-emerald-200' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {item.icon}
              </span>
            </div>
            <p className={`mt-2 text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {item.value.toLocaleString(i18n.resolvedLanguage ?? i18n.language)}
            </p>
          </article>
        ))}
      </div>

      <form className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" onSubmit={handleSearchSubmit}>
        <AdminFilterInput
          type="email"
          value={filterEmail}
          onChange={(e) => setFilterEmail(e.target.value)}
          placeholder={t('dashboard.admin.users.filters.searchEmail')}
        />
        <AdminFilterSelect value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">{t('dashboard.admin.users.filters.typeAll')}</option>
          <option value={String(SystemUserType.Admin)}>{t('dashboard.admin.users.type.10')}</option>
          <option value={String(SystemUserType.Employer)}>{t('dashboard.admin.users.type.20')}</option>
          <option value={String(SystemUserType.Worker)}>{t('dashboard.admin.users.type.30')}</option>
        </AdminFilterSelect>
        <AdminFilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">{t('dashboard.admin.candidates.filters.allStatuses')}</option>
          <option value={String(AccountStatus.Pending)}>{t('dashboard.admin.candidates.status.0')}</option>
          <option value={String(AccountStatus.Active)}>{t('dashboard.admin.candidates.status.10')}</option>
          <option value={String(AccountStatus.Suspended)}>{t('dashboard.admin.candidates.status.20')}</option>
          <option value={String(AccountStatus.Banned)}>{t('dashboard.admin.candidates.status.30')}</option>
        </AdminFilterSelect>
        <button
          type="submit"
          disabled={queryPending}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {queryPending
            ? t('dashboard.admin.employers.filters.searching')
            : t('dashboard.admin.employers.filters.search')}
        </button>
      </form>

      {listError ? (
        <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
          {listError}
        </p>
      ) : null}
      {listSuccess ? (
        <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
          {listSuccess}
        </p>
      ) : null}

      <AdminDataGrid
        columns={gridColumns}
        rows={rows}
        getRowId={(item) => String(item.id)}
        emptyMessage={t('dashboard.admin.users.list.empty')}
        mode="server"
        serverState={{
          page,
          pageSize,
          totalCount,
          sortState,
          onPageChange: (nextPage) => {
            setPage(nextPage)
            void fetchUsers(appliedEmail, appliedType, appliedStatus, nextPage, pageSize)
          },
          onPageSizeChange: (nextPageSize) => {
            setPageSize(nextPageSize)
            setPage(1)
            void fetchUsers(appliedEmail, appliedType, appliedStatus, 1, nextPageSize)
          },
          onSortChange: (nextSort) => {
            setSortState(nextSort)
            setPage(1)
            void fetchUsers(appliedEmail, appliedType, appliedStatus, 1, pageSize)
          },
        }}
      />
    </>
  )
}
