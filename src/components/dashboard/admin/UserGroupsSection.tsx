import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import {
  normalizePageableList,
  PermissionEffect,
  systemUserGroupsApi,
} from '../../../api'
import type { SystemUserGroupListItem, SystemUserGroupsListResult } from '../../../api/system-user-groups'
import { AdminDataGrid, type AdminDataGridColumn } from '../AdminDataGrid'
import { useTheme } from '../../../theme/theme-context'
import { IconCheck, IconShield, IconSpark, IconUsers } from '../../landing/icons'
import { AdminEntityDetail } from './AdminEntityDetail'
import { AdminFilterInput, AdminFilterSelect } from './AdminFilterField'

type ViewMode = 'list' | 'detail'

type TriState = 'all' | 'no' | 'yes'

function triToBool(value: TriState): boolean | null {
  if (value === 'all') return null
  if (value === 'yes') return true
  return false
}

type UserGroupsSectionProps = {
  isActive: boolean
  detailId?: number | null
  onOpenDetail?: (id: number) => void
  onCloseDetail?: () => void
}

export function UserGroupsSection({ isActive, detailId, onOpenDetail, onCloseDetail }: UserGroupsSectionProps) {
  void detailId
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const hasLoadedRef = useRef(false)
  const [mode, setMode] = useState<ViewMode>('list')
  const [listRow, setListRow] = useState<SystemUserGroupListItem | null>(null)
  const [detailPending, setDetailPending] = useState(false)
  const [detailSuccess, setDetailSuccess] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [targetActive, setTargetActive] = useState(true)
  const [permissionIdDraft, setPermissionIdDraft] = useState('')
  const [permissionEffectDraft, setPermissionEffectDraft] = useState(String(PermissionEffect.Allow))

  const [queryPending, setQueryPending] = useState(false)
  const [filterName, setFilterName] = useState('')
  const [filterActive, setFilterActive] = useState<TriState>('all')
  const [filterSystem, setFilterSystem] = useState<TriState>('all')
  const [appliedName, setAppliedName] = useState('')
  const [appliedActive, setAppliedActive] = useState<TriState>('all')
  const [appliedSystem, setAppliedSystem] = useState<TriState>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [totalCount, setTotalCount] = useState(0)
  const [sortState, setSortState] = useState<{
    columnId: string | null
    direction: 'asc' | 'desc'
  }>({ columnId: null, direction: 'asc' })
  const [rows, setRows] = useState<SystemUserGroupListItem[]>([])
  const [listSuccess, setListSuccess] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  const fetchGroups = useCallback(
    async (
      searchName: string,
      activeTri: TriState,
      systemTri: TriState,
      nextPage: number,
      nextPageSize: number,
    ) => {
      setQueryPending(true)
      setListError(null)
      setListSuccess(null)
      try {
        const listResponse: SystemUserGroupsListResult = await systemUserGroupsApi.list({
          searchName: searchName.length > 0 ? searchName : null,
          isActive: triToBool(activeTri),
          isSystem: triToBool(systemTri),
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
                : sortState.columnId === 'name'
                  ? a.name.toLocaleLowerCase(i18n.language)
                  : sortState.columnId === 'level'
                    ? Number(a.level)
                    : sortState.columnId === 'isActive'
                      ? (a.isActive ? 1 : 0)
                      : sortState.columnId === 'isSystem'
                        ? (a.isSystem ? 1 : 0)
                        : 0
            const right =
              sortState.columnId === 'id'
                ? Number(b.id)
                : sortState.columnId === 'name'
                  ? b.name.toLocaleLowerCase(i18n.language)
                  : sortState.columnId === 'level'
                    ? Number(b.level)
                    : sortState.columnId === 'isActive'
                      ? (b.isActive ? 1 : 0)
                      : sortState.columnId === 'isSystem'
                        ? (b.isSystem ? 1 : 0)
                        : 0
            if (left < right) return sortState.direction === 'asc' ? -1 : 1
            if (left > right) return sortState.direction === 'asc' ? 1 : -1
            return 0
          })
        }
        setRows(sorted)
        setTotalCount(tc)
        setListSuccess(t('dashboard.admin.userGroups.list.fetchSuccess', { count: tc }))
      } catch {
        setListError(t('dashboard.admin.userGroups.list.fetchError'))
        setRows([])
        setTotalCount(0)
      } finally {
        setQueryPending(false)
      }
    },
    [i18n.language, sortState.columnId, sortState.direction, t],
  )

  useEffect(() => {
    if (!isActive) {
      hasLoadedRef.current = false
      return
    }
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true
    void fetchGroups('', 'all', 'all', 1, pageSize)
  }, [fetchGroups, isActive, pageSize])

  async function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (queryPending) return
    const nextName = filterName.trim()
    setAppliedName(nextName)
    setAppliedActive(filterActive)
    setAppliedSystem(filterSystem)
    setPage(1)
    await fetchGroups(nextName, filterActive, filterSystem, 1, pageSize)
  }

  const summaryItems = useMemo(() => {
    const activeCount = rows.filter((r) => r.isActive).length
    const systemCount = rows.filter((r) => r.isSystem).length
    return [
      {
        key: 'total',
        label: t('dashboard.admin.cards.totalLabel'),
        value: totalCount,
        icon: <IconUsers className="h-4 w-4" />,
      },
      {
        key: 'active',
        label: t('dashboard.admin.userGroups.summary.activeRows'),
        value: activeCount,
        icon: <IconCheck className="h-4 w-4" />,
      },
      {
        key: 'system',
        label: t('dashboard.admin.userGroups.summary.systemRows'),
        value: systemCount,
        icon: <IconShield className="h-4 w-4" />,
      },
      {
        key: 'page',
        label: t('dashboard.admin.userGroups.summary.pageRows'),
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
    setPermissionIdDraft('')
    setPermissionEffectDraft(String(PermissionEffect.Allow))
    onCloseDetail?.()
  }, [onCloseDetail])

  const refreshList = useCallback(async () => {
    await fetchGroups(appliedName, appliedActive, appliedSystem, page, pageSize)
  }, [appliedActive, appliedName, appliedSystem, fetchGroups, page, pageSize])

  const openDetail = useCallback((item: SystemUserGroupListItem) => {
    setListRow(item)
    setTargetActive(item.isActive)
    setMode('detail')
    setDetailSuccess(null)
    setDetailError(null)
    setPermissionIdDraft('')
    setPermissionEffectDraft(String(PermissionEffect.Allow))
    onOpenDetail?.(Number(item.id))
  }, [onOpenDetail])

  const handleListDelete = useCallback(
    async (item: SystemUserGroupListItem) => {
      const confirmed = window.confirm(t('dashboard.admin.detail.feedback.deleteConfirm'))
      if (!confirmed) return
      const systemUserGroupId = Number(item.id)
      if (!Number.isFinite(systemUserGroupId) || systemUserGroupId <= 0) return
      setQueryPending(true)
      setListError(null)
      try {
        await systemUserGroupsApi.deactivate({ systemUserGroupId })
        setListSuccess(t('dashboard.admin.detail.feedback.deleteSuccess'))
        await refreshList()
      } catch {
        setListError(t('dashboard.admin.detail.feedback.deleteError'))
      } finally {
        setQueryPending(false)
      }
    },
    [refreshList, t],
  )

  const handleDetailSave = useCallback(async () => {
    if (!listRow) return
    const systemUserGroupId = Number(listRow.id)
    if (!Number.isFinite(systemUserGroupId) || systemUserGroupId <= 0) return

    const permRaw = permissionIdDraft.trim()
    const permId = permRaw.length > 0 ? Number(permRaw) : NaN
    const wantsPermission = permRaw.length > 0
    if (wantsPermission && (!Number.isFinite(permId) || permId <= 0)) {
      setDetailError(t('dashboard.admin.userGroups.detail.invalidPermissionId'))
      return
    }

    const activeChanged = targetActive !== listRow.isActive
    if (!activeChanged && !wantsPermission) {
      setDetailError(t('dashboard.admin.detail.validation.nothingToSave'))
      return
    }

    setDetailPending(true)
    setDetailError(null)
    setDetailSuccess(null)
    try {
      if (activeChanged) {
        if (targetActive) {
          await systemUserGroupsApi.activate({ systemUserGroupId })
        } else {
          await systemUserGroupsApi.deactivate({ systemUserGroupId })
        }
      }
      if (wantsPermission) {
        await systemUserGroupsApi.addPermission({
          systemUserGroupId,
          permissionId: permId,
          effect: Number(permissionEffectDraft),
        })
      }
      setDetailSuccess(t('dashboard.admin.detail.feedback.saveSuccess'))
      setPermissionIdDraft('')
      setListRow((prev) =>
        prev
          ? {
              ...prev,
              isActive: targetActive,
            }
          : prev,
      )
      await refreshList()
    } catch {
      setDetailError(t('dashboard.admin.detail.feedback.saveError'))
    } finally {
      setDetailPending(false)
    }
  }, [
    listRow,
    permissionEffectDraft,
    permissionIdDraft,
    refreshList,
    targetActive,
    t,
  ])

  const handleDetailDelete = useCallback(async () => {
    if (!listRow) return
    const systemUserGroupId = Number(listRow.id)
    if (!Number.isFinite(systemUserGroupId) || systemUserGroupId <= 0) return
    setDetailPending(true)
    setDetailError(null)
    setDetailSuccess(null)
    try {
      await systemUserGroupsApi.deactivate({ systemUserGroupId })
      closeDetail()
      setListSuccess(t('dashboard.admin.detail.feedback.deleteSuccess'))
      await refreshList()
    } catch {
      setDetailError(t('dashboard.admin.detail.feedback.deleteError'))
    } finally {
      setDetailPending(false)
    }
  }, [closeDetail, listRow, refreshList, t])

  const gridColumns = useMemo<AdminDataGridColumn<SystemUserGroupListItem>[]>(
    () => [
      {
        id: 'id',
        title: t('dashboard.admin.userGroups.columns.id'),
        sortable: true,
        sortValue: (item) => Number(item.id),
        render: (item) => `#${item.id}`,
      },
      {
        id: 'name',
        title: t('dashboard.admin.userGroups.columns.name'),
        sortable: true,
        sortValue: (item) => item.name,
        render: (item) => item.name,
      },
      {
        id: 'level',
        title: t('dashboard.admin.userGroups.columns.level'),
        sortable: true,
        sortValue: (item) => Number(item.level),
        render: (item) => String(item.level),
      },
      {
        id: 'isActive',
        title: t('dashboard.admin.userGroups.columns.isActive'),
        sortable: true,
        sortValue: (item) => (item.isActive ? 1 : 0),
        render: (item) =>
          item.isActive ? t('dashboard.admin.userGroups.bool.yes') : t('dashboard.admin.userGroups.bool.no'),
      },
      {
        id: 'isSystem',
        title: t('dashboard.admin.userGroups.columns.isSystem'),
        sortable: true,
        sortValue: (item) => (item.isSystem ? 1 : 0),
        render: (item) =>
          item.isSystem ? t('dashboard.admin.userGroups.bool.yes') : t('dashboard.admin.userGroups.bool.no'),
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
    [handleListDelete, openDetail, queryPending, t, theme],
  )

  if (mode === 'detail' && listRow) {
    const detailTitle = t('dashboard.admin.userGroups.detail.title', {
      id: listRow.id,
      name: listRow.name,
    })
    return (
      <AdminEntityDetail
        title={detailTitle}
        segments={[
          {
            key: 'groups',
            label: t('dashboard.admin.sidebar.userGroups'),
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
          <p className={theme === 'dark' ? 'text-white/90' : 'text-slate-900'}>{listRow.name}</p>
          <p className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>
            {t('dashboard.admin.userGroups.columns.level')}: {listRow.level}
          </p>
          <p className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>
            {t('dashboard.admin.userGroups.columns.isSystem')}:{' '}
            {listRow.isSystem ? t('dashboard.admin.userGroups.bool.yes') : t('dashboard.admin.userGroups.bool.no')}
          </p>
        </div>

        <fieldset className={`space-y-2 text-sm ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
          <legend className="mb-1 font-medium">{t('dashboard.admin.userGroups.detail.activeState')}</legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="ug-active"
              checked={targetActive === true}
              onChange={() => setTargetActive(true)}
              className="h-4 w-4"
            />
            <span>{t('dashboard.admin.userGroups.bool.yes')}</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="ug-active"
              checked={targetActive === false}
              onChange={() => setTargetActive(false)}
              className="h-4 w-4"
            />
            <span>{t('dashboard.admin.userGroups.bool.no')}</span>
          </label>
        </fieldset>

        <div
          className={`space-y-3 rounded-xl border p-4 ${
            theme === 'dark' ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white'
          }`}
        >
          <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {t('dashboard.admin.userGroups.detail.permissions.title')}
          </p>
          <label className={`block space-y-1.5 text-sm ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
            <span>{t('dashboard.admin.userGroups.detail.permissions.permissionId')}</span>
            <AdminFilterInput
              type="number"
              min={1}
              value={permissionIdDraft}
              onChange={(e) => setPermissionIdDraft(e.target.value)}
            />
          </label>
          <label className={`block space-y-1.5 text-sm ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
            <span>{t('dashboard.admin.userGroups.detail.permissions.effect')}</span>
            <AdminFilterSelect
              value={permissionEffectDraft}
              onChange={(e) => setPermissionEffectDraft(e.target.value)}
            >
              <option value={String(PermissionEffect.Allow)}>{t('dashboard.admin.userGroups.effect.allow')}</option>
              <option value={String(PermissionEffect.Deny)}>{t('dashboard.admin.userGroups.effect.deny')}</option>
            </AdminFilterSelect>
          </label>
        </div>
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
                  theme === 'dark' ? 'bg-indigo-400/15 text-indigo-200' : 'bg-indigo-100 text-indigo-700'
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
          type="text"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          placeholder={t('dashboard.admin.userGroups.filters.searchName')}
        />
        <AdminFilterSelect value={filterActive} onChange={(e) => setFilterActive(e.target.value as TriState)}>
          <option value="all">{t('dashboard.admin.userGroups.filters.activeAll')}</option>
          <option value="yes">{t('dashboard.admin.userGroups.bool.yes')}</option>
          <option value="no">{t('dashboard.admin.userGroups.bool.no')}</option>
        </AdminFilterSelect>
        <AdminFilterSelect value={filterSystem} onChange={(e) => setFilterSystem(e.target.value as TriState)}>
          <option value="all">{t('dashboard.admin.userGroups.filters.systemAll')}</option>
          <option value="yes">{t('dashboard.admin.userGroups.bool.yes')}</option>
          <option value="no">{t('dashboard.admin.userGroups.bool.no')}</option>
        </AdminFilterSelect>
        <button
          type="submit"
          disabled={queryPending}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
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
        emptyMessage={t('dashboard.admin.userGroups.list.empty')}
        mode="server"
        serverState={{
          page,
          pageSize,
          totalCount,
          sortState,
          onPageChange: (nextPage) => {
            setPage(nextPage)
            void fetchGroups(appliedName, appliedActive, appliedSystem, nextPage, pageSize)
          },
          onPageSizeChange: (nextPageSize) => {
            setPageSize(nextPageSize)
            setPage(1)
            void fetchGroups(appliedName, appliedActive, appliedSystem, 1, nextPageSize)
          },
          onSortChange: (nextSort) => {
            setSortState(nextSort)
            setPage(1)
            void fetchGroups(appliedName, appliedActive, appliedSystem, 1, pageSize)
          },
        }}
      />
    </>
  )
}
