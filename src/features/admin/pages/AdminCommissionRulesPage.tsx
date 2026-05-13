import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Percent } from 'lucide-react'

import {
  adminCommissionRulesApi,
  type EmployerCommissionSummaryItem,
} from '../../../api/admin/admin-commission-rules'
import { EmployerStatus } from '../../../api/core/enums'
import { employerStatusLocaleKey, parseEmployerStatus } from '../../../shared/lib/employer-status'
import { DashboardHero, DashboardSurface, StatePanel } from '../../../shared/ui/ui-primitives'
import { cn } from '../../../shared/lib/cn'
import { useTheme } from '../../../theme/theme-context'

function pickNum(...vals: unknown[]): number {
  for (const v of vals) {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return 0
}

function pickStr(...vals: unknown[]): string {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

export type CommissionSummaryRow = {
  employerId: number
  employerName: string
  employerStatus: EmployerStatus
  commissionRate: number
  acceptedApplicationCount: number
  estimatedGrossTransactionVolume: number
  estimatedCommissionAmount: number
}

function normalizeRow(raw: EmployerCommissionSummaryItem): CommissionSummaryRow {
  const r = raw as Record<string, unknown>
  const statusNum = pickNum(raw.employerStatus, r.EmployerStatus)
  const status =
    statusNum === EmployerStatus.Active ||
    statusNum === EmployerStatus.Pending ||
    statusNum === EmployerStatus.Suspended ||
    statusNum === EmployerStatus.Banned
      ? (statusNum as EmployerStatus)
      : EmployerStatus.Pending

  return {
    employerId: pickNum(raw.employerId, r.EmployerId),
    employerName: pickStr(raw.employerName, r.EmployerName) || '—',
    employerStatus: status,
    commissionRate: pickNum(raw.commissionRate, r.CommissionRate),
    acceptedApplicationCount: pickNum(raw.acceptedApplicationCount, r.AcceptedApplicationCount),
    estimatedGrossTransactionVolume: pickNum(raw.estimatedGrossTransactionVolume, r.EstimatedGrossTransactionVolume),
    estimatedCommissionAmount: pickNum(raw.estimatedCommissionAmount, r.EstimatedCommissionAmount),
  }
}

function statusBadge(theme: 'light' | 'dark', status: EmployerStatus): string {
  if (theme === 'dark') {
    switch (status) {
      case EmployerStatus.Active:
        return 'border-emerald-400/35 bg-emerald-400/15 text-emerald-100'
      case EmployerStatus.Pending:
        return 'border-amber-400/35 bg-amber-400/15 text-amber-100'
      case EmployerStatus.Suspended:
        return 'border-orange-400/35 bg-orange-400/15 text-orange-100'
      default:
        return 'border-rose-400/35 bg-rose-400/15 text-rose-100'
    }
  }
  switch (status) {
    case EmployerStatus.Active:
      return 'border-emerald-200 bg-emerald-50 text-emerald-900'
    case EmployerStatus.Pending:
      return 'border-amber-200 bg-amber-50 text-amber-900'
    case EmployerStatus.Suspended:
      return 'border-orange-200 bg-orange-50 text-orange-950'
    default:
      return 'border-rose-200 bg-rose-50 text-rose-950'
  }
}

export function AdminCommissionRulesPage() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const locale = i18n.resolvedLanguage ?? i18n.language ?? 'tr'

  const [rows, setRows] = useState<CommissionSummaryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminCommissionRulesApi.listSummaries(100)
      const list = Array.isArray(data) ? data : []
      setRows(list.map((item) => normalizeRow(item)))
    } catch {
      setRows([])
      setError(t('dashboard.admin.commissionRules.list.fetchError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  const toneMuted = theme === 'dark' ? 'text-white/65' : 'text-slate-600'
  const toneStrong = theme === 'dark' ? 'text-white' : 'text-slate-900'
  const headCell = cn('px-3 py-2 text-start text-xs font-semibold uppercase tracking-wide', toneMuted)

  const fmtMoney = useMemo(
    () => (n: number) =>
      n.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale],
  )

  const fmtPct = (rate: number) => `${(rate * 100).toLocaleString(locale, { maximumFractionDigits: 2 })}%`

  return (
    <>
      <DashboardHero
        theme={theme}
        title={t('dashboard.admin.commissionRules.list.title')}
        description={t('dashboard.admin.commissionRules.list.subtitle')}
      />

      <DashboardSurface theme={theme}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-xl border',
                theme === 'dark' ? 'border-white/15 bg-white/[0.06] text-cyan-200' : 'border-sky-200 bg-sky-50 text-sky-700',
              )}
            >
              <Percent className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <h2 className={cn('text-base font-semibold sm:text-lg', toneStrong)}>{t('dashboard.admin.commissionRules.list.tableTitle')}</h2>
              <p className={cn('text-xs sm:text-sm', toneMuted)}>{t('dashboard.admin.commissionRules.list.tableHint')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className={cn(
              'rounded-xl border px-3 py-2 text-xs font-semibold sm:text-sm',
              theme === 'dark' ? 'border-white/20 text-white hover:bg-white/10' : 'border-slate-200 text-slate-800 hover:bg-slate-50',
            )}
          >
            {t('dashboard.admin.commissionRules.list.refresh')}
          </button>
        </div>

        {loading ? (
          <p className={cn('py-8 text-center text-sm', toneMuted)}>{t('dashboard.admin.summary.loading')}</p>
        ) : error ? (
          <StatePanel theme={theme} text={error} isError />
        ) : rows.length === 0 ? (
          <StatePanel theme={theme} text={t('dashboard.admin.commissionRules.list.empty')} />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10 dark:border-white/10">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className={theme === 'dark' ? 'border-b border-white/10 bg-white/[0.04]' : 'border-b border-slate-200 bg-slate-50/80'}>
                  <th className={headCell}>{t('dashboard.admin.commissionRules.columns.employer')}</th>
                  <th className={headCell}>{t('dashboard.admin.commissionRules.columns.status')}</th>
                  <th className={headCell}>{t('dashboard.admin.commissionRules.columns.rate')}</th>
                  <th className={headCell}>{t('dashboard.admin.commissionRules.columns.accepted')}</th>
                  <th className={headCell}>{t('dashboard.admin.commissionRules.columns.gross')}</th>
                  <th className={headCell}>{t('dashboard.admin.commissionRules.columns.commission')}</th>
                  <th className={cn(headCell, 'w-10')} aria-hidden />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.employerId}
                    className={cn(
                      'cursor-pointer border-b transition last:border-b-0',
                      theme === 'dark' ? 'border-white/10 hover:bg-white/[0.06]' : 'border-slate-100 hover:bg-sky-50/50',
                    )}
                    onClick={() => navigate(`/admin/commission-rules/${row.employerId}`)}
                  >
                    <td className={cn('px-3 py-2.5 font-medium', toneStrong)}>
                      <span className="block max-w-[14rem] truncate">{row.employerName}</span>
                      <span className={cn('text-xs font-normal', toneMuted)}>ID {row.employerId}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold', statusBadge(theme, parseEmployerStatus(row.employerStatus)))}>
                        {t(employerStatusLocaleKey(parseEmployerStatus(row.employerStatus)))}
                      </span>
                    </td>
                    <td className={cn('px-3 py-2.5 tabular-nums', toneStrong)}>{fmtPct(row.commissionRate)}</td>
                    <td className={cn('px-3 py-2.5 tabular-nums', toneMuted)}>{row.acceptedApplicationCount.toLocaleString(locale)}</td>
                    <td className={cn('px-3 py-2.5 tabular-nums', toneMuted)}>{fmtMoney(row.estimatedGrossTransactionVolume)}</td>
                    <td className={cn('px-3 py-2.5 tabular-nums font-semibold', toneStrong)}>{fmtMoney(row.estimatedCommissionAmount)}</td>
                    <td className="px-2 py-2.5 text-end text-slate-400" aria-hidden>
                      <ChevronRight className="inline h-4 w-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardSurface>
    </>
  )
}
