import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ApiError,
  EmployerStatus,
  employersApi,
  normalizePageableList,
} from '../../../../api/core/index'
import { useActionToasts } from '../../../../notifications/use-action-toasts'
import type { EmployerDetail, EmployerListItem, EmployersListResult } from '../../../../api/employer/employers'
import { AdminDataGrid, type AdminDataGridColumn } from '../../components/AdminDataGrid'
import { useTheme } from '../../../../theme/theme-context'
import { IconCheck, IconShield, IconSpark, IconUsers } from '../../../landing/components/icons'
import { AdminEntityDetail } from '../../components/AdminEntityDetail'
import { AdminFilterInput, AdminFilterSelect } from '../../components/AdminFilterField'

type ViewMode = 'list' | 'detail'

type EmployersSectionProps = {
  isActive: boolean
  detailId?: number | null
  onOpenDetail?: (id: number) => void
  onCloseDetail?: () => void
}

function normalizeEmployerStatus(value: unknown): EmployerStatus | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value as EmployerStatus
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (trimmed.length === 0) return null

  const numeric = Number(trimmed)
  if (Number.isFinite(numeric)) return numeric as EmployerStatus

  const lowered = trimmed.toLocaleLowerCase()
  if (lowered === 'pending') return EmployerStatus.Pending
  if (lowered === 'active') return EmployerStatus.Active
  if (lowered === 'suspended') return EmployerStatus.Suspended
  if (lowered === 'banned') return EmployerStatus.Banned
  return null
}

export function EmployersSection({ isActive, detailId, onOpenDetail, onCloseDetail }: EmployersSectionProps) {
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
  const [listRow, setListRow] = useState<EmployerListItem | null>(null)
  const [employerDetail, setEmployerDetail] = useState<EmployerDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailPending, setDetailPending] = useState(false)
  const [detailSuccess, setDetailSuccess] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [targetStatus, setTargetStatus] = useState<EmployerStatus>(EmployerStatus.Pending)

  const [queryPending, setQueryPending] = useState(false)
  const [filterSearch, setFilterSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | string>('all')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [appliedStatus, setAppliedStatus] = useState<'all' | string>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [totalCount, setTotalCount] = useState(0)
  const [sortState, setSortState] = useState<{
    columnId: string | null
    direction: 'asc' | 'desc'
  }>({ columnId: null, direction: 'asc' })
  const [rows, setRows] = useState<EmployerListItem[]>([])
  const [listSuccess, setListSuccess] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  const employerIdForDetail = listRow ? Number(listRow.employerId) : NaN

  const fetchEmployers = useCallback(
    async (
      searchText: string,
      status: string,
      nextPage: number,
      nextPageSize: number,
    ) => {
      setQueryPending(true)
      setListError(null)
      setListSuccess(null)
      try {
        const listResponse: EmployersListResult = await employersApi.list({
          searchText: searchText.length > 0 ? searchText : null,
          status: status === 'all' ? null : (Number(status) as EmployerStatus),
          commissionRateMin: null,
          commissionRateMax: null,
          limit: nextPageSize,
          offset: (nextPage - 1) * nextPageSize,
        })
        const { rows: rawRows, totalCount: tc } = normalizePageableList(listResponse)
        const sorted = [...rawRows]
        if (sortState.columnId) {
          sorted.sort((a, b) => {
            const left =
              sortState.columnId === 'employerId'
                ? Number(a.employerId)
                : sortState.columnId === 'name'
                  ? a.name.toLocaleLowerCase(i18n.language)
                  : sortState.columnId === 'taxNo'
                    ? a.taxNumber
                    : sortState.columnId === 'status'
                    ? Number(normalizeEmployerStatus(a.status) ?? EmployerStatus.Pending)
                      : Number(a.commissionRate)
            const right =
              sortState.columnId === 'employerId'
                ? Number(b.employerId)
                : sortState.columnId === 'name'
                  ? b.name.toLocaleLowerCase(i18n.language)
                  : sortState.columnId === 'taxNo'
                    ? b.taxNumber
                    : sortState.columnId === 'status'
                      ? Number(normalizeEmployerStatus(b.status) ?? EmployerStatus.Pending)
                      : Number(b.commissionRate)
            if (left < right) return sortState.direction === 'asc' ? -1 : 1
            if (left > right) return sortState.direction === 'asc' ? 1 : -1
            return 0
          })
        }
        setRows(sorted)
        setTotalCount(tc)
        setListSuccess(t('dashboard.admin.employers.list.fetchSuccess', { count: tc }))
      } catch (error) {
        setListError(mapApiError('dashboard.admin.employers.list.fetchError', error))
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
    void fetchEmployers('', 'all', 1, pageSize)
  }, [fetchEmployers, isActive, pageSize])

  useEffect(() => {
    if (mode !== 'detail' || !Number.isFinite(employerIdForDetail) || employerIdForDetail <= 0) return
    let active = true
    void employersApi
      .getById({ employerId: employerIdForDetail })
      .then((detail) => {
        if (!active) return
        setEmployerDetail(detail)
        setTargetStatus(normalizeEmployerStatus(detail.status) ?? EmployerStatus.Pending)
      })
      .catch((error) => {
        if (!active) return
        setEmployerDetail(null)
        setDetailError(mapApiError('dashboard.admin.employers.detail.loadError', error))
      })
      .finally(() => {
        if (!active) return
        setDetailLoading(false)
      })
    return () => {
      active = false
    }
  }, [employerIdForDetail, mapApiError, mode, t])

  async function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (queryPending) return
    const nextSearch = filterSearch.trim()
    const nextStatus = filterStatus
    setAppliedSearch(nextSearch)
    setAppliedStatus(nextStatus)
    setPage(1)
    await fetchEmployers(nextSearch, nextStatus, 1, pageSize)
  }

  const summaryItems = useMemo(() => {
    const activeCount = rows.filter((item) => normalizeEmployerStatus(item.status) === EmployerStatus.Active).length
    const pendingCount = rows.filter((item) => normalizeEmployerStatus(item.status) === EmployerStatus.Pending).length
    const suspendedOrBannedCount = rows.filter((item) => {
      const status = normalizeEmployerStatus(item.status)
      return status === EmployerStatus.Suspended || status === EmployerStatus.Banned
    }).length

    return [
      {
        key: 'total',
        label: t('dashboard.admin.cards.totalLabel'),
        value: totalCount,
        icon: <IconUsers className="h-4 w-4" />,
      },
      {
        key: 'active',
        label: t('dashboard.admin.employers.status.20'),
        value: activeCount,
        icon: <IconCheck className="h-4 w-4" />,
      },
      {
        key: 'pending',
        label: t('dashboard.admin.employers.status.10'),
        value: pendingCount,
        icon: <IconSpark className="h-4 w-4" />,
      },
      {
        key: 'risk',
        label: t('dashboard.admin.employers.status.30'),
        value: suspendedOrBannedCount,
        icon: <IconShield className="h-4 w-4" />,
      },
    ]
  }, [rows, t, totalCount])

  const closeDetail = useCallback(() => {
    setMode('list')
    setListRow(null)
    setEmployerDetail(null)
    setDetailSuccess(null)
    setDetailError(null)
    onCloseDetail?.()
  }, [onCloseDetail])

  const refreshList = useCallback(async () => {
    await fetchEmployers(appliedSearch, appliedStatus, page, pageSize)
  }, [appliedSearch, appliedStatus, fetchEmployers, page, pageSize])

  const handleListDelete = useCallback(
    async (item: EmployerListItem) => {
      const confirmed = window.confirm(t('dashboard.admin.detail.feedback.deleteConfirm'))
      if (!confirmed) return
      const employerId = Number(item.employerId)
      if (!Number.isFinite(employerId) || employerId <= 0) return
      setQueryPending(true)
      setListError(null)
      try {
        await runWithToast(employersApi.ban({ employerId }), {
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

  const openDetail = useCallback((item: EmployerListItem) => {
    setDetailLoading(true)
    setListRow(item)
    setMode('detail')
    setDetailSuccess(null)
    setDetailError(null)
    setTargetStatus(normalizeEmployerStatus(item.status) ?? EmployerStatus.Pending)
    onOpenDetail?.(Number(item.employerId))
  }, [onOpenDetail])

  const handleDetailSave = useCallback(async () => {
    if (!employerDetail || !listRow) return
    const employerId = Number(listRow.employerId)
    if (!Number.isFinite(employerId) || employerId <= 0) return
    const current = normalizeEmployerStatus(employerDetail.status) ?? EmployerStatus.Pending
    const target = Number(targetStatus) as EmployerStatus

    if (target === EmployerStatus.Pending && current !== EmployerStatus.Pending) {
      setDetailError(t('dashboard.admin.employers.detail.pendingNotSupported'))
      return
    }

    setDetailPending(true)
    setDetailError(null)
    setDetailSuccess(null)
    try {
      if (target !== current) {
        if (target === EmployerStatus.Pending) {
          setDetailError(t('dashboard.admin.employers.detail.pendingNotSupported'))
          setDetailPending(false)
          return
        }
        await runWithToast(
          (async () => {
            if (target === EmployerStatus.Active) {
              await employersApi.activate({ employerId })
            } else if (target === EmployerStatus.Suspended) {
              await employersApi.suspend({ employerId })
            } else if (target === EmployerStatus.Banned) {
              await employersApi.ban({ employerId })
            }
          })(),
          {
            success: { messageKey: 'dashboard.admin.detail.feedback.saveSuccess' },
            error: { messageKey: 'dashboard.admin.detail.feedback.saveError' },
          },
        )
      }
      setDetailSuccess(t('dashboard.admin.detail.feedback.saveSuccess'))
      const next = await employersApi.getById({ employerId })
      setEmployerDetail(next)
      setTargetStatus(normalizeEmployerStatus(next.status) ?? EmployerStatus.Pending)
      await refreshList()
    } catch (error) {
      setDetailError(mapApiError('dashboard.admin.detail.feedback.saveError', error))
    } finally {
      setDetailPending(false)
    }
  }, [employerDetail, listRow, mapApiError, refreshList, runWithToast, targetStatus, t])

  const handleDetailDelete = useCallback(async () => {
    if (!listRow) return
    const employerId = Number(listRow.employerId)
    if (!Number.isFinite(employerId) || employerId <= 0) return
    setDetailPending(true)
    setDetailError(null)
    setDetailSuccess(null)
    try {
      await runWithToast(employersApi.ban({ employerId }), {
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

  const gridColumns = useMemo<AdminDataGridColumn<EmployerListItem>[]>(
    () => [
      {
        id: 'employerId',
        title: t('dashboard.admin.employers.columns.id'),
        sortable: true,
        sortValue: (item) => Number(item.employerId),
        render: (item) => `#${item.employerId}`,
      },
      {
        id: 'name',
        title: t('dashboard.admin.grid.columns.employerName'),
        sortable: true,
        sortValue: (item) => item.name,
        render: (item) => item.name,
      },
      {
        id: 'taxNo',
        title: t('dashboard.admin.grid.columns.taxNo'),
        sortable: true,
        sortValue: (item) => item.taxNumber,
        render: (item) => item.taxNumber,
      },
      {
        id: 'status',
        title: t('dashboard.admin.grid.columns.status'),
        sortable: true,
        sortValue: (item) => Number(normalizeEmployerStatus(item.status) ?? EmployerStatus.Pending),
        render: (item) => {
          const normalized = normalizeEmployerStatus(item.status)
          if (normalized === null) return String(item.status)
          return t(`dashboard.admin.employers.status.${normalized}`)
        },
      },
      {
        id: 'commission',
        title: t('dashboard.admin.employers.columns.commission'),
        sortable: true,
        sortValue: (item) => Number(item.commissionRate),
        render: (item) => String(item.commissionRate),
      },
      {
        id: 'actions',
        title: t('dashboard.admin.grid.columns.actions'),
        align: 'end',
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
    [handleListDelete, openDetail, queryPending, t, theme],
  )

  if (mode === 'detail' && listRow) {
    const detailTitle = t('dashboard.admin.employers.detail.title', {
      id: listRow.employerId,
      name: listRow.name,
    })
    return (
      <AdminEntityDetail
        title={detailTitle}
        segments={[
          {
            key: 'employers',
            label: t('dashboard.admin.sidebar.employers'),
            onClick: closeDetail,
          },
          { key: 'current', label: `#${listRow.employerId}` },
        ]}
        onBack={closeDetail}
        onClose={closeDetail}
        onSave={handleDetailSave}
        onDelete={handleDetailDelete}
        pending={detailPending}
        successMessage={detailSuccess}
        errorMessage={detailError}
      >
        {detailLoading ? (
          <p className={theme === 'dark' ? 'text-sm text-white/70' : 'text-sm text-slate-600'}>
            {t('dashboard.admin.summary.loading')}
          </p>
        ) : null}
        {employerDetail ? (
          <div
            className={`grid gap-3 rounded-xl border p-4 text-sm ${
              theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <p className={theme === 'dark' ? 'text-white/90' : 'text-slate-900'}>{employerDetail.name}</p>
            <p className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>
              {t('dashboard.admin.grid.columns.taxNo')}: {employerDetail.taxNumber}
            </p>
            <p className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>
              {t('dashboard.admin.grid.columns.status')}:{' '}
              {(() => {
                const normalized = normalizeEmployerStatus(employerDetail.status)
                if (normalized === null) return String(employerDetail.status)
                return t(`dashboard.admin.employers.status.${normalized}`)
              })()}
            </p>
            {employerDetail.description ? (
              <p className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>{employerDetail.description}</p>
            ) : null}
            {employerDetail.contact ? (
              <p className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>
                {employerDetail.contact.firstName} {employerDetail.contact.lastName} ·{' '}
                {employerDetail.contact.email} · {employerDetail.contact.phone}
              </p>
            ) : null}
          </div>
        ) : null}

        <label className={`block space-y-1.5 text-sm ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
          <span>{t('dashboard.admin.employers.detail.targetStatus')}</span>
          <AdminFilterSelect
            value={String(targetStatus)}
            onChange={(e) => {
              setTargetStatus(Number(e.target.value) as EmployerStatus)
            }}
          >
            <option value={String(EmployerStatus.Pending)}>{t('dashboard.admin.employers.status.10')}</option>
            <option value={String(EmployerStatus.Active)}>{t('dashboard.admin.employers.status.20')}</option>
            <option value={String(EmployerStatus.Suspended)}>{t('dashboard.admin.employers.status.30')}</option>
            <option value={String(EmployerStatus.Banned)}>{t('dashboard.admin.employers.status.90')}</option>
          </AdminFilterSelect>
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
                  theme === 'dark' ? 'bg-sky-400/15 text-sky-200' : 'bg-sky-100 text-sky-700'
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

      <form className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" onSubmit={handleSearchSubmit}>
        <AdminFilterInput
          type="text"
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          placeholder={t('dashboard.admin.employers.filters.searchText')}
          className="sm:col-span-2"
        />
        <AdminFilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">{t('dashboard.admin.employers.filters.allStatuses')}</option>
          <option value={String(EmployerStatus.Pending)}>{t('dashboard.admin.employers.status.10')}</option>
          <option value={String(EmployerStatus.Active)}>{t('dashboard.admin.employers.status.20')}</option>
          <option value={String(EmployerStatus.Suspended)}>{t('dashboard.admin.employers.status.30')}</option>
          <option value={String(EmployerStatus.Banned)}>{t('dashboard.admin.employers.status.90')}</option>
        </AdminFilterSelect>
        <button
          type="submit"
          disabled={queryPending}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-60"
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
        getRowId={(item) => String(item.employerId)}
        emptyMessage={t('dashboard.admin.employers.list.empty')}
        mode="server"
        serverState={{
          page,
          pageSize,
          totalCount,
          sortState,
          onPageChange: (nextPage) => {
            setPage(nextPage)
            void fetchEmployers(appliedSearch, appliedStatus, nextPage, pageSize)
          },
          onPageSizeChange: (nextPageSize) => {
            setPageSize(nextPageSize)
            setPage(1)
            void fetchEmployers(appliedSearch, appliedStatus, 1, nextPageSize)
          },
          onSortChange: (nextSort) => {
            setSortState(nextSort)
            setPage(1)
            void fetchEmployers(appliedSearch, appliedStatus, 1, pageSize)
          },
        }}
      />
    </>
  )
}
