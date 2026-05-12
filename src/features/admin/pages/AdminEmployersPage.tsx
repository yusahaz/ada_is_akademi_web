import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowUp, ChevronDown, Pencil, Trash2, UserPlus } from 'lucide-react'

import type { EmployerListItem } from '../../../api/employer/employers'
import { adminManagementApi } from '../../../api/admin/admin-management'
import { EmployerStatus } from '../../../api/core/enums'
import { employerStatusLocaleKey, parseEmployerStatus } from '../../../shared/lib/employer-status'
import { normalizePageableList } from '../../../api/core/pagination'
import { DashboardHero, DashboardSurface, StatePanel } from '../../../shared/ui/ui-primitives'
import { cn } from '../../../shared/lib/cn'
import { getLocalhostProtocolFallbackUrl, sanitizeObjectStorageUrl } from '../../../shared/lib/object-storage-url'
import { useTheme } from '../../../theme/theme-context'
import { useNotification } from '../../../notifications/notification-context'
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog'

const PAGE_SIZES = [10, 20, 50] as const

type SortField = 'name' | 'taxNumber' | 'status' | 'commissionRate' | 'employerId'

type EmployerListSortState = {
  field: SortField
  descending: boolean
}

/** Search is sent to the API only when the trimmed query has at least this many characters. */
const EMPLOYER_SEARCH_MIN_CHARS = 3

const EMPLOYER_SEARCH_DEBOUNCE_MS = 280

function effectiveEmployerSearchText(raw: string): string {
  const trimmed = raw.trim()
  return trimmed.length >= EMPLOYER_SEARCH_MIN_CHARS ? raw : ''
}

function employerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase()
  const one = name.trim()
  return one.length > 0 ? one.slice(0, 2).toUpperCase() : '?'
}

const EmployerLogoThumb = memo(function EmployerLogoThumb({
  logoUrl,
  name,
  theme,
}: {
  logoUrl: string | null
  name: string
  theme: 'light' | 'dark'
}) {
  const [broken, setBroken] = useState(false)
  const [resolvedLogoUrl, setResolvedLogoUrl] = useState<string | null>(sanitizeObjectStorageUrl(logoUrl))
  const [fallbackTried, setFallbackTried] = useState(false)

  useEffect(() => {
    setBroken(false)
    setResolvedLogoUrl(sanitizeObjectStorageUrl(logoUrl))
    setFallbackTried(false)
  }, [logoUrl])

  const showImg = Boolean(resolvedLogoUrl) && !broken

  return (
    <span
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border text-xs font-bold',
        theme === 'dark' ? 'border-white/15 bg-white/[0.06]' : 'border-slate-200 bg-slate-100',
      )}
    >
      {showImg ? (
        <img
          src={resolvedLogoUrl!}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => {
            if (resolvedLogoUrl && !fallbackTried) {
              const fallback = getLocalhostProtocolFallbackUrl(resolvedLogoUrl)
              if (fallback && fallback !== resolvedLogoUrl) {
                setFallbackTried(true)
                setResolvedLogoUrl(fallback)
                return
              }
            }
            setBroken(true)
          }}
        />
      ) : (
        <span className={theme === 'dark' ? 'text-cyan-200' : 'text-sky-800'}>{employerInitials(name)}</span>
      )}
    </span>
  )
})

function statusBadgeClasses(theme: 'light' | 'dark', status: unknown): string {
  const s = parseEmployerStatus(status)
  if (theme === 'dark') {
    switch (s) {
      case EmployerStatus.Active:
        return 'border-emerald-400/35 bg-emerald-400/15 text-emerald-100'
      case EmployerStatus.Pending:
        return 'border-amber-400/35 bg-amber-400/15 text-amber-100'
      case EmployerStatus.Suspended:
        return 'border-orange-400/35 bg-orange-400/15 text-orange-100'
      case EmployerStatus.Banned:
      default:
        return 'border-rose-400/35 bg-rose-400/15 text-rose-100'
    }
  }
  switch (s) {
    case EmployerStatus.Active:
      return 'border-emerald-200 bg-emerald-50 text-emerald-900'
    case EmployerStatus.Pending:
      return 'border-amber-200 bg-amber-50 text-amber-900'
    case EmployerStatus.Suspended:
      return 'border-orange-200 bg-orange-50 text-orange-950'
    case EmployerStatus.Banned:
    default:
      return 'border-rose-200 bg-rose-50 text-rose-950'
  }
}

type EmployersPageHeroProps = {
  theme: 'light' | 'dark'
  title: string
  description: string
  onAddEmployer: () => void
  addEmployerLabel: string
  addEmployerDisabled: boolean
}

const EmployersPageHero = memo(function EmployersPageHero({
  theme,
  title,
  description,
  onAddEmployer,
  addEmployerLabel,
  addEmployerDisabled,
}: EmployersPageHeroProps) {
  return (
    <DashboardHero theme={theme} title={title} description={description}>
      <button
        type="button"
        onClick={onAddEmployer}
        disabled={addEmployerDisabled}
        className={cn(
          'inline-flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 disabled:pointer-events-none disabled:opacity-55',
          theme === 'dark'
            ? 'border-cyan-300/40 bg-cyan-400/22 text-cyan-50 shadow-[0_2px_12px_rgba(34,211,238,0.15)] hover:bg-cyan-400/30'
            : 'border-sky-500 bg-sky-600 text-white shadow-[0_2px_12px_rgba(2,132,199,0.35)] hover:bg-sky-700',
        )}
      >
        <UserPlus className="h-4 w-4 shrink-0" aria-hidden />
        {addEmployerLabel}
      </button>
    </DashboardHero>
  )
})

type EmployersFiltersCardProps = {
  theme: 'light' | 'dark'
  inputClass: string
  formSearch: string
  onFormSearchChange: (value: string) => void
  formStatus: EmployerStatus | ''
  onFormStatusChange: (value: EmployerStatus | '') => void
  statusOptions: { value: EmployerStatus | ''; label: string }[]
  onApplyFilters: () => void
  filterButtonDisabled: boolean
  filterButtonShowsLoading: boolean
  searchLabel: string
  searchingLabel: string
  applyLabel: string
  statusColumnLabel: string
  error: string | null
  filterHint: string | null
}

const EmployersFiltersCard = memo(function EmployersFiltersCard({
  theme,
  inputClass,
  formSearch,
  onFormSearchChange,
  formStatus,
  onFormStatusChange,
  statusOptions,
  onApplyFilters,
  filterButtonDisabled,
  filterButtonShowsLoading,
  searchLabel,
  searchingLabel,
  applyLabel,
  statusColumnLabel,
  error,
  filterHint,
}: EmployersFiltersCardProps) {
  return (
    <DashboardSurface theme={theme} className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[12rem] flex-1 basis-[200px]">
          <span
            className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-white/55' : 'text-slate-500'}`}
          >
            {searchLabel}
          </span>
          <input
            type="search"
            value={formSearch}
            onChange={(e) => onFormSearchChange(e.target.value)}
            className={inputClass}
            autoComplete="off"
          />
        </label>

        <label className="min-w-[11rem]">
          <span
            className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-white/55' : 'text-slate-500'}`}
          >
            {statusColumnLabel}
          </span>
          <select
            value={formStatus === '' ? '' : formStatus}
            onChange={(e) =>
              onFormStatusChange(e.target.value === '' ? '' : (Number(e.target.value) as EmployerStatus))
            }
            className={inputClass}
          >
            {statusOptions.map((opt) => (
              <option key={String(opt.value)} value={opt.value === '' ? '' : opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onApplyFilters}
          disabled={filterButtonDisabled}
          className={cn(
            'inline-flex h-[42px] shrink-0 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 disabled:opacity-55 sm:ml-auto',
            theme === 'dark'
              ? 'border-cyan-300/35 bg-cyan-400/15 text-cyan-50 hover:bg-cyan-400/22'
              : 'border-sky-300 bg-sky-600 text-white hover:bg-sky-700',
          )}
        >
          {filterButtonShowsLoading ? searchingLabel : applyLabel}
        </button>
      </div>

      {error ? <StatePanel theme={theme} text={error} isError /> : null}
      {!error && filterHint ? (
        <p className={`text-xs ${theme === 'dark' ? 'text-white/55' : 'text-slate-500'}`}>{filterHint}</p>
      ) : null}
    </DashboardSurface>
  )
})

type EmployersDataGridProps = {
  theme: 'light' | 'dark'
  locale: string
  rows: EmployerListItem[]
  listLoading: boolean
  isRefreshing: boolean
  sortField: SortField
  sortDescending: boolean
  onToggleSort: (field: SortField) => void
  pageSize: (typeof PAGE_SIZES)[number]
  onPageSizeChange: (size: (typeof PAGE_SIZES)[number]) => void
  pageIndex: number
  onPageIndexChange: (updater: (p: number) => number) => void
  totalCount: number
  onEdit: (employerId: number) => void
  onDeleteRequest: (employerId: number) => void
}

const EmployersDataGrid = memo(function EmployersDataGrid({
  theme,
  locale,
  rows,
  listLoading,
  isRefreshing,
  sortField,
  sortDescending,
  onToggleSort,
  pageSize,
  onPageSizeChange,
  pageIndex,
  onPageIndexChange,
  totalCount,
  onEdit,
  onDeleteRequest,
}: EmployersDataGridProps) {
  const { t } = useTranslation()

  const commissionLabel = (value: EmployerListItem['commissionRate']) => {
    const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
    if (!Number.isFinite(n)) return String(value)
    return n.toLocaleString(locale, { maximumFractionDigits: 4 })
  }

  const rowEmployerId = (row: EmployerListItem) => {
    const id = Number(row.employerId)
    return Number.isFinite(id) ? id : 0
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize) || 1)
  const startRow = totalCount === 0 ? 0 : pageIndex * pageSize + 1
  const endRow = totalCount === 0 ? 0 : Math.min(totalCount, (pageIndex + 1) * pageSize)
  const gridBusy = listLoading || isRefreshing

  const SortHeader = ({
    field,
    children,
    className,
  }: {
    field: SortField
    children: ReactNode
    className?: string
  }) => {
    const active = sortField === field
    return (
      <th scope="col" className={cn('px-4 py-3 font-semibold sm:px-5', className)}>
        <button
          type="button"
          onClick={() => onToggleSort(field)}
          className={cn(
            'inline-flex items-center gap-1 text-start text-xs font-semibold uppercase tracking-wide transition hover:opacity-90',
            theme === 'dark' ? 'text-white/80' : 'text-slate-700',
          )}
          aria-sort={active ? (sortDescending ? 'descending' : 'ascending') : 'none'}
        >
          {children}
          {active ? (
            sortDescending ? (
              <ArrowDown className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
            ) : (
              <ArrowUp className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
            )
          ) : (
            <span className="inline-block h-3.5 w-3.5 shrink-0 opacity-30" aria-hidden>
              ·
            </span>
          )}
        </button>
      </th>
    )
  }

  return (
    <DashboardSurface theme={theme} className="overflow-hidden p-0 sm:p-0">
      <div
        className={cn(
          'relative overflow-x-auto transition-opacity duration-200',
          isRefreshing && !listLoading ? 'opacity-65' : '',
        )}
        aria-busy={gridBusy}
      >
        {isRefreshing && !listLoading ? (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-sky-500/25 dark:bg-cyan-400/20"
            role="progressbar"
            aria-hidden
          >
            <div className="h-full w-full motion-safe:animate-pulse bg-sky-600/90 dark:bg-cyan-300/80" />
          </div>
        ) : null}
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr
              className={cn(
                'border-b text-xs uppercase tracking-wide',
                theme === 'dark' ? 'border-white/10 bg-white/[0.04] text-white/65' : 'border-slate-200 bg-slate-50 text-slate-600',
              )}
            >
              <th scope="col" className="px-4 py-3 font-semibold sm:px-5">
                {t('dashboard.admin.employers.columns.logo')}
              </th>
              <SortHeader field="name">{t('dashboard.admin.grid.columns.employerName')}</SortHeader>
              <SortHeader field="taxNumber">{t('dashboard.admin.employers.taxNo')}</SortHeader>
              <SortHeader field="status">{t('dashboard.admin.grid.columns.status')}</SortHeader>
              <th scope="col" className="px-4 py-3 font-semibold sm:px-5">
                {t('dashboard.admin.employers.columns.commissionType')}
              </th>
              <SortHeader field="commissionRate">{t('dashboard.admin.employers.columns.commission')}</SortHeader>
              <th scope="col" className="px-4 py-3 text-end font-semibold sm:px-5">
                {t('dashboard.admin.employers.columns.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {listLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className={`px-5 py-10 text-center ${theme === 'dark' ? 'text-white/65' : 'text-slate-600'}`}
                >
                  {t('dashboard.admin.summary.loading')}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className={`px-5 py-10 text-center ${theme === 'dark' ? 'text-white/65' : 'text-slate-600'}`}
                >
                  {t('dashboard.admin.employers.list.empty')}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const id = rowEmployerId(row)
                const logoUrl = row.logoViewUrl?.trim() ? row.logoViewUrl : null
                return (
                  <tr
                    key={String(row.employerId)}
                    className={cn(
                      'border-b last:border-b-0',
                      theme === 'dark' ? 'border-white/[0.07] hover:bg-white/[0.03]' : 'border-slate-100 hover:bg-sky-50/50',
                    )}
                  >
                    <td className="px-4 py-3 sm:px-5">
                      <EmployerLogoThumb logoUrl={logoUrl} name={row.name} theme={theme} />
                    </td>
                    <td
                      className={`max-w-[14rem] px-4 py-3 sm:max-w-none sm:px-5 ${theme === 'dark' ? 'text-white/90' : 'text-slate-800'}`}
                    >
                      <span className="line-clamp-2 font-medium">{row.name}</span>
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 font-mono text-xs sm:px-5 ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}
                    >
                      {row.taxNumber}
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <span
                        className={cn(
                          'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                          statusBadgeClasses(theme, row.status),
                        )}
                      >
                        {t(`dashboard.admin.employers.status.${employerStatusLocaleKey(row.status)}`)}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-sm sm:px-5 ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}
                    >
                      {t('dashboard.admin.employers.commissionType.percent')}
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 tabular-nums sm:px-5 ${theme === 'dark' ? 'text-white/85' : 'text-slate-700'}`}
                    >
                      {commissionLabel(row.commissionRate)}
                    </td>
                    <td className="px-4 py-3 text-end sm:px-5">
                      <div className="inline-flex flex-wrap items-center justify-end gap-1">
                        <button
                          type="button"
                          disabled={id <= 0}
                          onClick={() => onEdit(id)}
                          className={cn(
                            'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/55 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40',
                            theme === 'dark'
                              ? 'border-sky-400/45 bg-sky-400/16 text-sky-50 shadow-sky-950/30 hover:border-sky-400/65 hover:bg-sky-400/26 focus-visible:ring-offset-[#0b0e14]'
                              : 'border-sky-400 bg-sky-100 text-sky-900 shadow-sky-900/10 hover:border-sky-500 hover:bg-sky-200 focus-visible:ring-offset-white',
                          )}
                          aria-label={t('dashboard.admin.employers.actions.edit')}
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          disabled={id <= 0}
                          onClick={() => onDeleteRequest(id)}
                          className={cn(
                            'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/65 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40',
                            theme === 'dark'
                              ? 'border-rose-400/55 bg-rose-600/90 text-white shadow-rose-950/35 hover:border-rose-300/70 hover:bg-rose-600 focus-visible:ring-offset-[#0b0e14]'
                              : 'border-rose-500 bg-rose-600 text-white shadow-[0_2px_10px_rgba(225,29,72,0.35)] hover:border-rose-600 hover:bg-rose-700 focus-visible:ring-offset-white',
                          )}
                          aria-label={t('dashboard.admin.employers.actions.delete')}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
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
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <span
            className={`whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide sm:text-[11px] ${theme === 'dark' ? 'text-white/45' : 'text-slate-500'}`}
          >
            {t('dashboard.admin.grid.rowsPerPage')}
          </span>
          <div className="relative">
            <select
              aria-label={t('dashboard.admin.grid.rowsPerPage')}
              value={pageSize}
              disabled={gridBusy}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value) as (typeof PAGE_SIZES)[number])
              }}
              className={cn(
                'h-9 min-w-[4.75rem] cursor-pointer appearance-none rounded-xl border py-1.5 pl-2.5 pr-8 text-xs font-semibold tabular-nums outline-none transition sm:h-10 sm:min-w-[5.5rem] sm:pl-3 sm:pr-9 sm:text-sm',
                'focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55',
                theme === 'dark'
                  ? 'border-white/15 bg-[#0f172a] text-white ring-offset-[#0b0e14] hover:border-cyan-400/35'
                  : 'border-slate-200 bg-white text-slate-800 shadow-sm ring-offset-white hover:border-sky-300',
              )}
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <ChevronDown
              className={cn(
                'pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 sm:right-2.5 sm:h-4 sm:w-4',
                theme === 'dark' ? 'text-cyan-200/80' : 'text-sky-600',
              )}
              aria-hidden
            />
          </div>
        </div>
        <p
          className={cn(
            'shrink-0 whitespace-nowrap text-xs font-medium',
            theme === 'dark' ? 'text-white/60' : 'text-slate-600',
          )}
        >
          {totalCount === 0
            ? t('dashboard.admin.employers.list.empty')
            : `${startRow.toLocaleString(locale)}–${endRow.toLocaleString(locale)} / ${totalCount.toLocaleString(locale)}`}
        </p>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <span
            className={cn(
              'inline-flex h-9 items-center whitespace-nowrap rounded-lg border px-2.5 text-[11px] font-semibold tabular-nums sm:h-10 sm:px-3 sm:text-xs',
              theme === 'dark' ? 'border-white/12 bg-white/[0.04] text-white/80' : 'border-slate-200 bg-white text-slate-700',
            )}
          >
            {t('dashboard.admin.grid.pageLabel', {
              page: Math.min(totalPages, pageIndex + 1),
              total: totalPages,
            })}
          </span>
          <button
            type="button"
            disabled={gridBusy || pageIndex <= 0}
            onClick={() => onPageIndexChange((p) => Math.max(0, p - 1))}
            className={cn(
              'inline-flex h-9 shrink-0 items-center justify-center rounded-xl border px-2.5 text-xs font-semibold transition disabled:pointer-events-none disabled:opacity-40 sm:h-10 sm:px-3.5',
              theme === 'dark'
                ? 'border-white/15 text-white hover:bg-white/10'
                : 'border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50',
            )}
          >
            {t('dashboard.admin.grid.prev')}
          </button>
          <button
            type="button"
            disabled={gridBusy || pageIndex >= totalPages - 1}
            onClick={() => onPageIndexChange((p) => p + 1)}
            className={cn(
              'inline-flex h-9 shrink-0 items-center justify-center rounded-xl border px-2.5 text-xs font-semibold transition disabled:pointer-events-none disabled:opacity-40 sm:h-10 sm:px-3.5',
              theme === 'dark'
                ? 'border-white/15 text-white hover:bg-white/10'
                : 'border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50',
            )}
          >
            {t('dashboard.admin.grid.next')}
          </button>
        </div>
      </div>
    </DashboardSurface>
  )
})

export function AdminEmployersPage() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const { success, error: notifyError } = useNotification()
  const locale = i18n.resolvedLanguage ?? i18n.language ?? 'tr'

  const listBootstrappedRef = useRef(false)

  const inputClass = cn(
    'w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 min-w-0',
    theme === 'dark' ? 'border-white/20 bg-white/[0.03] text-white placeholder:text-white/40' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400',
  )

  const [formSearch, setFormSearch] = useState('')
  const [formStatus, setFormStatus] = useState<EmployerStatus | ''>('')

  const [appliedSearch, setAppliedSearch] = useState('')
  const [appliedStatus, setAppliedStatus] = useState<EmployerStatus | null>(null)

  const [sort, setSort] = useState<EmployerListSortState>({ field: 'name', descending: false })

  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10)
  const [pageIndex, setPageIndex] = useState(0)
  const [rows, setRows] = useState<EmployerListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [listLoading, setListLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterHint, setFilterHint] = useState<string | null>(null)

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const deleteTargetRow = useMemo(
    () => (deleteTargetId == null ? null : rows.find((r) => Number(r.employerId) === deleteTargetId) ?? null),
    [rows, deleteTargetId],
  )

  const statusOptions = useMemo(
    () => [
      { value: '' as const, label: t('dashboard.admin.employers.filters.allStatuses') },
      { value: EmployerStatus.Pending, label: t('dashboard.admin.employers.status.10') },
      { value: EmployerStatus.Active, label: t('dashboard.admin.employers.status.20') },
      { value: EmployerStatus.Suspended, label: t('dashboard.admin.employers.status.30') },
      { value: EmployerStatus.Banned, label: t('dashboard.admin.employers.status.90') },
    ],
    [t],
  )

  const load = useCallback(async () => {
    setError(null)
    setFilterHint(null)
    const keepTable = listBootstrappedRef.current
    if (keepTable) {
      setIsRefreshing(true)
    } else {
      setListLoading(true)
    }
    try {
      const result = await adminManagementApi.listEmployers({
        offset: pageIndex * pageSize,
        limit: pageSize,
        searchText: appliedSearch.trim() ? appliedSearch.trim() : null,
        status: appliedStatus,
        sortBy: sort.field,
        sortDescending: sort.descending,
      })
      const { rows: nextRows, totalCount: total } = normalizePageableList(result)
      setTotalCount(total)
      const maxPageIdx = total === 0 ? 0 : Math.max(0, Math.ceil(total / pageSize) - 1)
      if (pageIndex > maxPageIdx) {
        setPageIndex(maxPageIdx)
        return
      }
      setRows(nextRows)
      listBootstrappedRef.current = true
      setFilterHint(t('dashboard.admin.employers.list.fetchSuccess', { count: nextRows.length }))
    } catch {
      setRows([])
      setTotalCount(0)
      setError(t('dashboard.admin.employers.list.fetchError'))
    } finally {
      setListLoading(false)
      setIsRefreshing(false)
    }
  }, [appliedSearch, appliedStatus, pageIndex, pageSize, sort.descending, sort.field, t])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(
    () => () => {
      if (searchDebounceRef.current != null) {
        clearTimeout(searchDebounceRef.current)
      }
    },
    [],
  )

  const onFormSearchChange = useCallback((value: string) => {
    setFormSearch(value)
    if (searchDebounceRef.current != null) {
      clearTimeout(searchDebounceRef.current)
    }
    searchDebounceRef.current = setTimeout(() => {
      searchDebounceRef.current = null
      const next = effectiveEmployerSearchText(value)
      setAppliedSearch((prev) => {
        if (prev === next) return prev
        setPageIndex(0)
        return next
      })
    }, EMPLOYER_SEARCH_DEBOUNCE_MS)
  }, [])

  const onApplyFilters = useCallback(() => {
    if (searchDebounceRef.current != null) {
      clearTimeout(searchDebounceRef.current)
      searchDebounceRef.current = null
    }
    setAppliedSearch(effectiveEmployerSearchText(formSearch))
    setAppliedStatus(formStatus === '' ? null : formStatus)
    setPageIndex(0)
    setError(null)
  }, [formSearch, formStatus])

  const toggleSort = useCallback((field: SortField) => {
    setSort((prev) =>
      prev.field === field ? { field, descending: !prev.descending } : { field, descending: false },
    )
    setPageIndex(0)
  }, [])

  const onPageSizeChange = useCallback((size: (typeof PAGE_SIZES)[number]) => {
    setPageSize(size)
    setPageIndex(0)
  }, [])

  const onAddEmployer = useCallback(() => {
    navigate('/admin/employers/new')
  }, [navigate])

  const confirmDelete = async () => {
    if (deleteTargetId == null) return
    setDeleteBusy(true)
    try {
      await adminManagementApi.deleteEmployer({ employerId: deleteTargetId })
      success(t('dashboard.admin.employers.delete.success'))
      setDeleteTargetId(null)
      await load()
    } catch {
      notifyError(t('dashboard.admin.employers.delete.error'))
    } finally {
      setDeleteBusy(false)
    }
  }

  const gridBusy = listLoading || isRefreshing

  return (
    <>
      <EmployersPageHero
        theme={theme}
        title={t('dashboard.admin.details.employers.title')}
        description={t('dashboard.admin.details.employers.body')}
        onAddEmployer={onAddEmployer}
        addEmployerLabel={t('dashboard.admin.employers.addNew')}
        addEmployerDisabled={gridBusy}
      />

      <EmployersFiltersCard
        theme={theme}
        inputClass={inputClass}
        formSearch={formSearch}
        onFormSearchChange={onFormSearchChange}
        formStatus={formStatus}
        onFormStatusChange={setFormStatus}
        statusOptions={statusOptions}
        onApplyFilters={onApplyFilters}
        filterButtonDisabled={gridBusy}
        filterButtonShowsLoading={listLoading && rows.length === 0}
        searchLabel={t('dashboard.admin.employers.filters.searchText')}
        searchingLabel={t('dashboard.admin.employers.filters.searching')}
        applyLabel={t('dashboard.admin.employers.filters.search')}
        statusColumnLabel={t('dashboard.admin.grid.columns.status')}
        error={error}
        filterHint={filterHint}
      />

      <EmployersDataGrid
        theme={theme}
        locale={locale}
        rows={rows}
        listLoading={listLoading}
        isRefreshing={isRefreshing}
        sortField={sort.field}
        sortDescending={sort.descending}
        onToggleSort={toggleSort}
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
        pageIndex={pageIndex}
        onPageIndexChange={(fn) => setPageIndex(fn)}
        totalCount={totalCount}
        onEdit={(id) => navigate(`/admin/employers/${id}`)}
        onDeleteRequest={setDeleteTargetId}
      />

      <ConfirmDeleteDialog
        open={deleteTargetId != null}
        theme={theme}
        busy={deleteBusy}
        entityName={deleteTargetRow?.name}
        titleText="İşvereni sil"
        contextPrefixText="İşveren"
        onClose={() => !deleteBusy && setDeleteTargetId(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  )
}
