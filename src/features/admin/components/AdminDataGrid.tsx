import { useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../../../theme/theme-context'
import { InteractiveButton } from '../../../shared/ui/ui-primitives'

export type AdminDataGridColumn<TItem> = {
  id: string
  title: string
  sortable?: boolean
  sortValue?: (item: TItem) => string | number
  align?: 'start' | 'center' | 'end'
  render: (item: TItem) => ReactNode
}

type AdminDataGridProps<TItem> = {
  columns: AdminDataGridColumn<TItem>[]
  rows: TItem[]
  getRowId: (item: TItem) => string
  pageSizeOptions?: number[]
  defaultPageSize?: number
  emptyMessage: string
  mode?: 'client' | 'server'
  serverState?: {
    page: number
    pageSize: number
    totalCount: number
    sortState: {
      columnId: string | null
      direction: SortDirection
    }
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onSortChange: (next: { columnId: string | null; direction: SortDirection }) => void
  }
}

type SortDirection = 'asc' | 'desc'

export function AdminDataGrid<TItem>({
  columns,
  rows,
  getRowId,
  pageSizeOptions = [6, 12, 24],
  defaultPageSize = 6,
  emptyMessage,
  mode = 'client',
  serverState,
}: AdminDataGridProps<TItem>) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [sortState, setSortState] = useState<{
    columnId: string | null
    direction: SortDirection
  }>({
    columnId: null,
    direction: 'asc',
  })
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [page, setPage] = useState(1)

  const sortedRows = useMemo(() => {
    if (mode === 'server') return rows
    if (!sortState.columnId) return rows
    const column = columns.find((item) => item.id === sortState.columnId)
    if (!column || !column.sortValue) return rows

    const next = [...rows].sort((a, b) => {
      const left = column.sortValue!(a)
      const right = column.sortValue!(b)
      if (left < right) return -1
      if (left > right) return 1
      return 0
    })
    return sortState.direction === 'asc' ? next : next.reverse()
  }, [columns, mode, rows, sortState.columnId, sortState.direction])

  const totalPages = Math.max(
    1,
    Math.ceil((mode === 'server' ? serverState?.totalCount ?? rows.length : sortedRows.length) / (mode === 'server' ? serverState?.pageSize ?? pageSize : pageSize)),
  )
  const safePage = Math.min(mode === 'server' ? serverState?.page ?? 1 : page, totalPages)
  const pagedRows = useMemo(() => {
    if (mode === 'server') return rows
    const start = (safePage - 1) * pageSize
    return sortedRows.slice(start, start + pageSize)
  }, [mode, pageSize, rows, safePage, sortedRows])

  function handleSort(column: AdminDataGridColumn<TItem>) {
    if (!column.sortable) return
    if (mode === 'server' && serverState) {
      const current = serverState.sortState
      const next =
        current.columnId !== column.id
          ? { columnId: column.id, direction: 'asc' as SortDirection }
          : {
              columnId: column.id,
              direction: current.direction === 'asc' ? ('desc' as SortDirection) : ('asc' as SortDirection),
            }
      serverState.onSortChange(next)
      serverState.onPageChange(1)
      return
    }
    setPage(1)
    setSortState((prev) =>
      prev.columnId !== column.id
        ? { columnId: column.id, direction: 'asc' }
        : { columnId: column.id, direction: prev.direction === 'asc' ? 'desc' : 'asc' },
    )
  }

  return (
    <div className="mt-4 space-y-3">
      <div
        className={`overflow-x-auto rounded-2xl border backdrop-blur-sm ${
          theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-300/80 bg-white/90'
        }`}
      >
        <table className={`min-w-full text-sm ${theme === 'dark' ? 'text-white/90' : 'text-slate-800'}`}>
          <thead className={theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={`px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] ${
                    column.align === 'end' ? 'text-end' : column.align === 'center' ? 'text-center' : 'text-start'
                  }`}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column)}
                      className={`inline-flex items-center gap-1 ${
                        column.align === 'end'
                          ? 'w-full justify-end'
                          : column.align === 'center'
                            ? 'w-full justify-center'
                            : ''
                      }`}
                    >
                      <span>{column.title}</span>
                      {(mode === 'server' ? serverState?.sortState.columnId : sortState.columnId) === column.id ? (
                        <span>{(mode === 'server' ? serverState?.sortState.direction : sortState.direction) === 'asc' ? '▲' : '▼'}</span>
                      ) : null}
                    </button>
                  ) : (
                    column.title
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={theme === 'dark' ? 'bg-white/[0.02]' : 'bg-white'}>
            {pagedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={`px-3 py-6 text-center text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pagedRows.map((row) => (
                <tr key={getRowId(row)} className={theme === 'dark' ? 'border-t border-white/10' : 'border-t border-slate-200'}>
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={`px-3 py-2 align-top ${
                        column.align === 'end' ? 'text-end' : column.align === 'center' ? 'text-center' : 'text-start'
                      }`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className={`inline-flex items-center gap-2 text-xs ${theme === 'dark' ? 'text-white/75' : 'text-slate-600'}`}>
          <span>{t('dashboard.admin.grid.rowsPerPage')}</span>
          <select
            value={mode === 'server' ? serverState?.pageSize ?? pageSize : pageSize}
            onChange={(event) => {
              const nextSize = Number(event.target.value)
              if (mode === 'server' && serverState) {
                serverState.onPageSizeChange(nextSize)
                return
              }
              setPageSize(nextSize)
              setPage(1)
            }}
            className={`rounded-lg border px-2 py-1 text-xs ${theme === 'dark' ? 'border-white/20 bg-[#0f1f35]' : 'border-slate-300 bg-white'}`}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (mode === 'server' && serverState) {
                serverState.onPageChange(Math.max(1, safePage - 1))
                return
              }
              setPage((prev) => Math.max(1, prev - 1))
            }}
            disabled={safePage <= 1}
            className="inline-flex disabled:opacity-50"
          >
            <InteractiveButton theme={theme}>{t('dashboard.admin.grid.prev')}</InteractiveButton>
          </button>
          <span className={`text-xs ${theme === 'dark' ? 'text-white/75' : 'text-slate-600'}`}>
            {t('dashboard.admin.grid.pageLabel', { page: safePage, total: totalPages })}
          </span>
          <button
            type="button"
            onClick={() => {
              if (mode === 'server' && serverState) {
                serverState.onPageChange(Math.min(totalPages, safePage + 1))
                return
              }
              setPage((prev) => Math.min(totalPages, prev + 1))
            }}
            disabled={safePage >= totalPages}
            className="inline-flex disabled:opacity-50"
          >
            <InteractiveButton theme={theme}>{t('dashboard.admin.grid.next')}</InteractiveButton>
          </button>
        </div>
      </div>
    </div>
  )
}
