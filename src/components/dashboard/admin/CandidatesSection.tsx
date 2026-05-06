import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ApiError,
  AccountStatus,
  systemUsersApi,
  workersApi,
} from '../../../api'
import { useNotification } from '../../../notifications/notification-context'
import type { WorkerDetail, WorkerListItem, WorkersListResult } from '../../../api/workers'
import { AdminDataGrid, type AdminDataGridColumn } from '../AdminDataGrid'
import { useTheme } from '../../../theme/theme-context'
import { IconCheck, IconShield, IconSpark, IconUsers } from '../../landing/icons'
import { AdminEntityDetail } from './AdminEntityDetail'
import { AdminFilterInput, AdminFilterSelect } from './AdminFilterField'

function getWorkerDisplayName(item: WorkerListItem) {
  const fullName = `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim()
  return fullName.length > 0 ? fullName : '-'
}

function formatDate(value: string | null, locale: string) {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString(locale)
}

type ViewMode = 'list' | 'detail'
type DetailTab = 'overview' | 'profile' | 'actions'

type CandidatesSectionProps = {
  isActive: boolean
  detailId?: number | null
  onOpenDetail?: (id: number) => void
  onCloseDetail?: () => void
}

export function CandidatesSection({ isActive, detailId, onOpenDetail, onCloseDetail }: CandidatesSectionProps) {
  void detailId
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const notifications = useNotification()
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
  const [listRow, setListRow] = useState<WorkerListItem | null>(null)
  const [workerDetail, setWorkerDetail] = useState<WorkerDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailPending, setDetailPending] = useState(false)
  const [accountActionPending, setAccountActionPending] = useState(false)
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('overview')
  const [detailSuccess, setDetailSuccess] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [passwordDraft, setPasswordDraft] = useState('')
  const [skillTagDraft, setSkillTagDraft] = useState('')

  const [queryPending, setQueryPending] = useState(false)
  const [filterName, setFilterName] = useState('')
  const [filterEmail, setFilterEmail] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [appliedEmail, setAppliedEmail] = useState('')
  const [appliedStatus, setAppliedStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [totalCount, setTotalCount] = useState(0)
  const [sortState, setSortState] = useState<{
    columnId: string | null
    direction: 'asc' | 'desc'
  }>({ columnId: null, direction: 'asc' })
  const [rows, setRows] = useState<WorkerListItem[]>([])
  const [listSuccess, setListSuccess] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  const fetchCandidates = useCallback(
    async (
      emailFilter: string,
      statusFilter: string,
      nextPage: number,
      nextPageSize: number,
    ) => {
      setQueryPending(true)
      setListError(null)
      setListSuccess(null)
      try {
        const listResponse = await workersApi.list({
          accountStatus:
            statusFilter === 'all' ? null : (Number(statusFilter) as AccountStatus),
          limit: nextPageSize,
          offset: (nextPage - 1) * nextPageSize,
          searchEmail: emailFilter.length > 0 ? emailFilter : null,
        })
        const isLegacyEnvelope = (
          value: WorkersListResult,
        ): value is Exclude<WorkersListResult, WorkerListItem[]> => !Array.isArray(value)
        const rawRows: WorkerListItem[] = isLegacyEnvelope(listResponse)
          ? (listResponse.data ?? [])
          : listResponse
        const rawTotal = isLegacyEnvelope(listResponse)
          ? Number(listResponse.totalCount ?? rawRows.length)
          : rawRows.length
        const sorted = [...rawRows]
        if (sortState.columnId) {
          sorted.sort((a, b) => {
            const left =
              sortState.columnId === 'workerId'
                ? Number(a.workerId)
                : sortState.columnId === 'fullName'
                  ? getWorkerDisplayName(a).toLocaleLowerCase(i18n.language)
                  : sortState.columnId === 'status'
                    ? a.accountStatus
                    : a.email.toLocaleLowerCase(i18n.language)
            const right =
              sortState.columnId === 'workerId'
                ? Number(b.workerId)
                : sortState.columnId === 'fullName'
                  ? getWorkerDisplayName(b).toLocaleLowerCase(i18n.language)
                  : sortState.columnId === 'status'
                    ? b.accountStatus
                    : b.email.toLocaleLowerCase(i18n.language)
            if (left < right) return sortState.direction === 'asc' ? -1 : 1
            if (left > right) return sortState.direction === 'asc' ? 1 : -1
            return 0
          })
        }
        setRows(sorted)
        setTotalCount(Number.isFinite(rawTotal) ? rawTotal : sorted.length)
        setListSuccess(
          t('dashboard.admin.candidates.fetchSuccess', {
            count: Number.isFinite(rawTotal) ? rawTotal : sorted.length,
          }),
        )
      } catch (error) {
        setListError(mapApiError('dashboard.admin.candidates.fetchError', error))
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
    void fetchCandidates('', 'all', 1, pageSize)
  }, [fetchCandidates, isActive, pageSize])

  const workerIdForDetail = listRow ? Number(listRow.workerId) : NaN

  useEffect(() => {
    if (mode !== 'detail' || !Number.isFinite(workerIdForDetail) || workerIdForDetail <= 0) return
    let active = true
    void workersApi
      .getDetail({ workerId: workerIdForDetail })
      .then((detail) => {
        if (!active) return
        setWorkerDetail(detail)
      })
      .catch((error) => {
        if (!active) return
        setWorkerDetail(null)
        setDetailError(mapApiError('dashboard.admin.candidates.detail.loadError', error))
      })
      .finally(() => {
        if (!active) return
        setDetailLoading(false)
      })
    return () => {
      active = false
    }
  }, [mapApiError, mode, t, workerIdForDetail])

  async function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (queryPending) return
    const nextSearch = filterName.trim()
    const nextEmail = filterEmail.trim()
    const nextStatus = filterStatus
    setAppliedSearch(nextSearch)
    setAppliedEmail(nextEmail)
    setAppliedStatus(nextStatus)
    setPage(1)
    await fetchCandidates(nextEmail, nextStatus, 1, pageSize)
  }

  const filteredRows = rows.filter((item) => {
    const language = i18n.language || 'tr'
    const nameQuery = appliedSearch.trim().toLocaleLowerCase(language)
    if (nameQuery.length === 0) return true
    return getWorkerDisplayName(item).toLocaleLowerCase(language).includes(nameQuery)
  })

  const summaryItems = useMemo(() => {
    const activeCount = rows.filter((item) => Number(item.accountStatus) === AccountStatus.Active).length
    const pendingCount = rows.filter((item) => Number(item.accountStatus) === AccountStatus.Pending).length
    const suspendedOrBannedCount = rows.filter((item) => {
      const status = Number(item.accountStatus)
      return status === AccountStatus.Suspended || status === AccountStatus.Banned
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
        label: t('dashboard.admin.candidates.status.10'),
        value: activeCount,
        icon: <IconCheck className="h-4 w-4" />,
      },
      {
        key: 'pending',
        label: t('dashboard.admin.candidates.status.0'),
        value: pendingCount,
        icon: <IconSpark className="h-4 w-4" />,
      },
      {
        key: 'risk',
        label: t('dashboard.admin.candidates.status.20'),
        value: suspendedOrBannedCount,
        icon: <IconShield className="h-4 w-4" />,
      },
    ]
  }, [rows, t, totalCount])

  const handleListDelete = useCallback(
    async (item: WorkerListItem) => {
      const confirmed = window.confirm(t('dashboard.admin.candidates.actions.deleteConfirm'))
      if (!confirmed) return
      const systemUserId = Number(item.systemUserId)
      if (!Number.isFinite(systemUserId) || systemUserId <= 0) {
        setListError(t('dashboard.admin.candidates.actions.deleteError'))
        return
      }
      setListError(null)
      setListSuccess(null)
      setQueryPending(true)
      try {
        await systemUsersApi.ban({ systemUserId })
        setListSuccess(t('dashboard.admin.candidates.actions.deleteSuccess', { id: item.workerId }))
        await fetchCandidates(appliedEmail, appliedStatus, page, pageSize)
      } catch (error) {
        setListError(mapApiError('dashboard.admin.candidates.actions.deleteError', error))
      } finally {
        setQueryPending(false)
      }
    },
    [appliedEmail, appliedStatus, fetchCandidates, mapApiError, page, pageSize, t],
  )

  const openDetail = useCallback((item: WorkerListItem) => {
    setDetailLoading(true)
    setListRow(item)
    setMode('detail')
    setDetailSuccess(null)
    setDetailError(null)
    setActiveDetailTab('overview')
    setPasswordDraft('')
    setSkillTagDraft('')
    onOpenDetail?.(Number(item.workerId))
  }, [onOpenDetail])

  const closeDetail = useCallback(() => {
    setMode('list')
    setListRow(null)
    setWorkerDetail(null)
    setDetailSuccess(null)
    setDetailError(null)
    setActiveDetailTab('overview')
    setPasswordDraft('')
    setSkillTagDraft('')
    onCloseDetail?.()
  }, [onCloseDetail])

  const refreshListAfterDetail = useCallback(async () => {
    await fetchCandidates(appliedEmail, appliedStatus, page, pageSize)
  }, [appliedEmail, appliedStatus, fetchCandidates, page, pageSize])

  const handleDetailSave = useCallback(async () => {
    if (!listRow) return
    const systemUserId = Number(listRow.systemUserId)
    if (!Number.isFinite(systemUserId) || systemUserId <= 0) {
      setDetailError(t('dashboard.admin.candidates.actions.deleteError'))
      return
    }
    const password = passwordDraft.trim()
    const skill = skillTagDraft.trim()
    if (password.length === 0 && skill.length === 0) {
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
      if (password.length >= 6) {
        await systemUsersApi.changePassword({ systemUserId, password })
      }
      if (skill.length > 0) {
        const workerId = Number(listRow.workerId)
        await workersApi.addSkill({ workerId, tag: skill })
      }
      setDetailSuccess(t('dashboard.admin.detail.feedback.saveSuccess'))
      setPasswordDraft('')
      setSkillTagDraft('')
      if (Number.isFinite(workerIdForDetail) && workerIdForDetail > 0) {
        const next = await workersApi.getDetail({ workerId: workerIdForDetail })
        setWorkerDetail(next)
      }
      await refreshListAfterDetail()
    } catch (error) {
      setDetailError(mapApiError('dashboard.admin.detail.feedback.saveError', error))
    } finally {
      setDetailPending(false)
    }
  }, [
    listRow,
    mapApiError,
    passwordDraft,
    refreshListAfterDetail,
    skillTagDraft,
    t,
    workerIdForDetail,
  ])

  const handleAccountAction = useCallback(
    async (action: 'suspend' | 'reactivate' | 'ban') => {
      if (!listRow || accountActionPending) return
      const systemUserId = Number(listRow.systemUserId)
      if (!Number.isFinite(systemUserId) || systemUserId <= 0) return

      const actionLabel = t(`dashboard.admin.candidates.detail.accountActionLabels.${action}`)
      const confirmed = window.confirm(
        t('dashboard.admin.candidates.detail.accountActionConfirm', {
          candidate: getWorkerDisplayName(listRow),
          action: actionLabel,
        }),
      )
      if (!confirmed) return

      setAccountActionPending(true)
      setDetailError(null)
      try {
        if (action === 'suspend') {
          await systemUsersApi.suspend({ systemUserId })
        } else if (action === 'reactivate') {
          await systemUsersApi.reactivate({ systemUserId })
        } else {
          await systemUsersApi.ban({ systemUserId })
        }

        const nextStatus =
          action === 'reactivate'
            ? AccountStatus.Active
            : action === 'suspend'
              ? AccountStatus.Suspended
              : AccountStatus.Banned
        setListRow((prev) => (prev ? { ...prev, accountStatus: nextStatus } : prev))
        await refreshListAfterDetail()
        notifications.success(
          t('dashboard.admin.candidates.detail.accountActionSuccess', { action: actionLabel }),
        )
      } catch {
        notifications.error(
          t('dashboard.admin.candidates.detail.accountActionError', { action: actionLabel }),
        )
      } finally {
        setAccountActionPending(false)
      }
    },
    [accountActionPending, listRow, notifications, refreshListAfterDetail, t],
  )

  const handleDetailDelete = useCallback(async () => {
    if (!listRow) return
    const systemUserId = Number(listRow.systemUserId)
    if (!Number.isFinite(systemUserId) || systemUserId <= 0) {
      setDetailError(t('dashboard.admin.candidates.actions.deleteError'))
      return
    }
    setDetailPending(true)
    setDetailError(null)
    setDetailSuccess(null)
    try {
      await systemUsersApi.ban({ systemUserId })
      closeDetail()
      setListSuccess(t('dashboard.admin.detail.feedback.deleteSuccess'))
      await refreshListAfterDetail()
    } catch (error) {
      setDetailError(mapApiError('dashboard.admin.detail.feedback.deleteError', error))
    } finally {
      setDetailPending(false)
    }
  }, [closeDetail, listRow, mapApiError, refreshListAfterDetail, t])

  const gridColumns = useMemo<AdminDataGridColumn<WorkerListItem>[]>(
    () => [
      {
        id: 'workerId',
        title: t('dashboard.admin.grid.columns.workerId'),
        sortable: true,
        sortValue: (item) => Number(item.workerId),
        render: (item) => `#${item.workerId}`,
      },
      {
        id: 'fullName',
        title: t('dashboard.admin.grid.columns.fullName'),
        sortable: true,
        sortValue: (item) => getWorkerDisplayName(item).toLocaleLowerCase(i18n.language),
        render: (item) => getWorkerDisplayName(item),
      },
      {
        id: 'email',
        title: t('dashboard.admin.grid.columns.email'),
        sortable: true,
        sortValue: (item) => item.email,
        render: (item) => item.email,
      },
      {
        id: 'status',
        title: t('dashboard.admin.grid.columns.status'),
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
    [handleListDelete, i18n.language, openDetail, queryPending, t, theme],
  )

  if (mode === 'detail' && listRow) {
    const detailTitle = t('dashboard.admin.candidates.detail.title', {
      id: listRow.workerId,
      name: getWorkerDisplayName(listRow),
    })
    return (
      <AdminEntityDetail
        title={detailTitle}
        segments={[
          {
            key: 'candidates',
            label: t('dashboard.admin.sidebar.candidates'),
            onClick: closeDetail,
          },
          {
            key: 'current',
            label: `#${listRow.workerId}`,
          },
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
        <div className="inline-flex overflow-hidden rounded-full border border-slate-300/80 bg-slate-100/80 p-0.5 text-sm dark:border-white/15 dark:bg-white/5">
          {(['overview', 'profile', 'actions'] as DetailTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveDetailTab(tab)}
              className={`min-w-26 rounded-full px-4 py-2 font-medium transition ${
                activeDetailTab === tab
                  ? theme === 'dark'
                    ? 'bg-sky-500/25 text-white'
                    : 'bg-sky-200 text-slate-900'
                  : theme === 'dark'
                    ? 'text-white/70 hover:bg-white/10'
                    : 'text-slate-600 hover:bg-white'
              }`}
            >
              {t(`dashboard.admin.candidates.detail.tabs.${tab}`)}
            </button>
          ))}
        </div>

        {activeDetailTab === 'overview' ? (
          <>
            <div
              className={`grid gap-3 rounded-xl border p-4 text-sm ${
                theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <p className={theme === 'dark' ? 'text-white/80' : 'text-slate-800'}>
                {listRow.email} · {t('dashboard.admin.grid.columns.workerId')}: #{listRow.workerId}
              </p>
              {workerDetail ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <p className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>
                    {t('dashboard.admin.candidates.card.nationality', {
                      value: workerDetail.nationality ?? t('dashboard.admin.candidates.card.notAvailable'),
                    })}
                  </p>
                  <p className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>
                    {t('dashboard.admin.candidates.card.university', {
                      value: workerDetail.university ?? t('dashboard.admin.candidates.card.notAvailable'),
                    })}
                  </p>
                  <p className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>
                    {t('dashboard.admin.candidates.detail.systemUserEmail')}:{' '}
                    {workerDetail.systemUser?.email ?? listRow.email}
                  </p>
                  <p className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>
                    {t('dashboard.admin.candidates.detail.systemUserPhone')}:{' '}
                    {workerDetail.systemUser?.phone || t('dashboard.admin.candidates.card.notAvailable')}
                  </p>
                </div>
              ) : null}
            </div>
            {workerDetail ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { key: 'skillsTitle', value: workerDetail.skills.length },
                  { key: 'languagesTitle', value: workerDetail.languages.length },
                  { key: 'educationTitle', value: workerDetail.educations.length },
                  { key: 'experienceTitle', value: workerDetail.experiences.length },
                ].map((item) => (
                  <article
                    key={item.key}
                    className={`rounded-xl border p-3 ${
                      theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <p className={theme === 'dark' ? 'text-xs text-white/70' : 'text-xs text-slate-500'}>
                      {t(`dashboard.admin.candidates.detail.${item.key}`)}
                    </p>
                    <p className={`mt-1 text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {item.value}
                    </p>
                  </article>
                ))}
              </div>
            ) : null}
          </>
        ) : null}

        {activeDetailTab === 'profile' && workerDetail ? (
          <div className="grid gap-3 lg:grid-cols-2">
            <section className={`space-y-2 rounded-xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('dashboard.admin.candidates.detail.skillsTitle')}</p>
              {workerDetail.skills.length > 0 ? (
                <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>{workerDetail.skills.map((item) => <li key={String(item.id)}>{item.tag}</li>)}</ul>
              ) : <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>{t('dashboard.admin.candidates.detail.emptySkills')}</p>}
            </section>
            <section className={`space-y-2 rounded-xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('dashboard.admin.candidates.detail.languagesTitle')}</p>
              {workerDetail.languages.length > 0 ? (
                <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>{workerDetail.languages.map((item) => <li key={String(item.id)}>{(item.language && item.language.length > 0 ? item.language : '-') + ` (Lv.${item.level})`}</li>)}</ul>
              ) : <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>{t('dashboard.admin.candidates.detail.emptyLanguages')}</p>}
            </section>
            <section className={`space-y-2 rounded-xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('dashboard.admin.candidates.detail.educationTitle')}</p>
              {workerDetail.educations.length > 0 ? (
                <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>{workerDetail.educations.map((item) => <li key={String(item.id)}>{(item.school || '-') + ' - ' + (item.department || '-') + (item.startYear ? ` (${item.startYear}` : ' (') + (item.endYear ? `-${item.endYear})` : item.isOngoing ? '-...)' : ')')}</li>)}</ul>
              ) : <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>{t('dashboard.admin.candidates.detail.emptyEducations')}</p>}
            </section>
            <section className={`space-y-2 rounded-xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('dashboard.admin.candidates.detail.experienceTitle')}</p>
              {workerDetail.experiences.length > 0 ? (
                <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>{workerDetail.experiences.map((item) => <li key={String(item.id)}>{(item.companyName || '-') + ' - ' + (item.position || '-') + ' (' + formatDate(item.startDate, i18n.resolvedLanguage ?? i18n.language) + ' / ' + (item.isCurrent ? t('dashboard.admin.candidates.detail.current') : formatDate(item.endDate, i18n.resolvedLanguage ?? i18n.language)) + ')'}</li>)}</ul>
              ) : <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>{t('dashboard.admin.candidates.detail.emptyExperiences')}</p>}
            </section>
          </div>
        ) : null}

        {activeDetailTab === 'actions' ? (
          <div className="space-y-4">
            <section className={`space-y-2 rounded-xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('dashboard.admin.candidates.detail.accountActionTitle')}</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>{t('dashboard.admin.candidates.detail.accountActionHint')}</p>
              <div className={`inline-flex overflow-hidden rounded-full border ${theme === 'dark' ? 'border-white/20 bg-white/[0.02]' : 'border-slate-300 bg-white'}`}>
                {(['suspend', 'reactivate', 'ban'] as const).map((action, index) => (
                  <button
                    key={action}
                    type="button"
                    disabled={accountActionPending}
                    onClick={() => void handleAccountAction(action)}
                    className={`px-4 py-2 text-sm font-medium transition ${index > 0 ? (theme === 'dark' ? 'border-s border-white/10' : 'border-s border-slate-300') : ''} ${
                      theme === 'dark'
                        ? 'text-white/85 hover:bg-white/10 disabled:opacity-50'
                        : 'text-slate-700 hover:bg-sky-50 disabled:opacity-50'
                    }`}
                  >
                    {t(`dashboard.admin.candidates.detail.accountActionLabels.${action}`)}
                  </button>
                ))}
              </div>
            </section>

            <label className={`block space-y-1.5 text-sm ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
              <span>{t('dashboard.admin.users.detail.passwordOptional')}</span>
              <AdminFilterInput type="password" value={passwordDraft} onChange={(e) => setPasswordDraft(e.target.value)} autoComplete="new-password" />
            </label>

            <label className={`block space-y-1.5 text-sm ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
              <span>{t('dashboard.admin.candidates.detail.skillTag')}</span>
              <AdminFilterInput type="text" value={skillTagDraft} onChange={(e) => setSkillTagDraft(e.target.value)} />
            </label>
          </div>
        ) : null}
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
                  theme === 'dark' ? 'bg-cyan-400/15 text-cyan-200' : 'bg-cyan-100 text-cyan-700'
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
          placeholder={t('dashboard.admin.candidates.filters.id')}
        />
        <AdminFilterInput
          type="email"
          value={filterEmail}
          onChange={(e) => setFilterEmail(e.target.value)}
          placeholder={t('dashboard.admin.candidates.filters.email')}
        />
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
          className="inline-flex h-11 items-center justify-center rounded-xl bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-60"
        >
          {queryPending
            ? t('dashboard.admin.candidates.filters.searching')
            : t('dashboard.admin.candidates.filters.search')}
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
        rows={filteredRows}
        getRowId={(item) => `${item.workerId}-${item.systemUserId}`}
        emptyMessage={t('dashboard.admin.candidates.empty')}
        mode="server"
        serverState={{
          page,
          pageSize,
          totalCount,
          sortState,
          onPageChange: (nextPage) => {
            setPage(nextPage)
            void fetchCandidates(appliedEmail, appliedStatus, nextPage, pageSize)
          },
          onPageSizeChange: (nextPageSize) => {
            setPageSize(nextPageSize)
            setPage(1)
            void fetchCandidates(appliedEmail, appliedStatus, 1, nextPageSize)
          },
          onSortChange: (nextSort) => {
            setSortState(nextSort)
            setPage(1)
            void fetchCandidates(appliedEmail, appliedStatus, 1, pageSize)
          },
        }}
      />
    </>
  )
}
