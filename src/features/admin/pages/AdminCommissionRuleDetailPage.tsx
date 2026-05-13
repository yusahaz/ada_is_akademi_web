import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, Percent, Save } from 'lucide-react'

import { adminCommissionRulesApi, type EmployerCommissionEstimate } from '../../../api/admin/admin-commission-rules'
import { adminManagementApi } from '../../../api/admin/admin-management'
import type { EmployerDetail } from '../../../api/employer/employers'
import { ApiError } from '../../../api/core/client'
import { EmployerStatus } from '../../../api/core/enums'
import { employerStatusLocaleKey, parseEmployerStatus } from '../../../shared/lib/employer-status'
import { DashboardHero, DashboardSurface, StatePanel } from '../../../shared/ui/ui-primitives'
import { cn } from '../../../shared/lib/cn'
import { useTheme } from '../../../theme/theme-context'
import { useNotification } from '../../../notifications/notification-context'

function pickNum(...vals: unknown[]): number {
  for (const v of vals) {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return 0
}

function normalizeEstimate(raw: EmployerCommissionEstimate) {
  const r = raw as Record<string, unknown>
  return {
    acceptedApplicationCount: pickNum(raw.acceptedApplicationCount, r.AcceptedApplicationCount),
    commissionRate: pickNum(raw.commissionRate, r.CommissionRate),
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

export function AdminCommissionRuleDetailPage() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const params = useParams<{ entityId?: string }>()
  const { success, error: notifyError } = useNotification()
  const locale = i18n.resolvedLanguage ?? i18n.language ?? 'tr'

  const employerId = Number(params.entityId)
  const validId = Number.isFinite(employerId) && employerId > 0

  const [employer, setEmployer] = useState<EmployerDetail | null>(null)
  const [estimate, setEstimate] = useState<ReturnType<typeof normalizeEstimate> | null>(null)
  const [rateFraction, setRateFraction] = useState<number | null>(null)
  const [percentInput, setPercentInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const inputClass = cn(
    'w-full max-w-xs rounded-xl border px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45',
    theme === 'dark'
      ? 'border-white/20 bg-white/[0.03] text-white placeholder:text-white/40'
      : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400',
  )

  const toneMuted = theme === 'dark' ? 'text-white/65' : 'text-slate-600'
  const toneStrong = theme === 'dark' ? 'text-white' : 'text-slate-900'

  const fmtMoney = useMemo(
    () => (n: number) =>
      n.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale],
  )

  const loadAll = useCallback(async () => {
    if (!validId) return
    setLoading(true)
    setLoadError(null)
    try {
      const [pol, est, emp] = await Promise.all([
        adminCommissionRulesApi.getPolicy(employerId),
        adminCommissionRulesApi.getEstimate(employerId),
        adminManagementApi.getEmployerById({ employerId }),
      ])
      const rate = pickNum(pol.commissionRate, (pol as Record<string, unknown>).CommissionRate)
      setRateFraction(rate)
      setPercentInput((rate * 100).toLocaleString(locale, { maximumFractionDigits: 4 }))
      setEstimate(normalizeEstimate(est))
      setEmployer(emp)
    } catch (e) {
      setEmployer(null)
      setEstimate(null)
      setRateFraction(null)
      const msg = e instanceof ApiError ? e.message : t('dashboard.admin.commissionRules.detail.fetchError')
      setLoadError(msg)
    } finally {
      setLoading(false)
    }
  }, [employerId, locale, t, validId])

  useEffect(() => {
    if (!validId) {
      setLoading(false)
      return
    }
    void loadAll()
  }, [loadAll, validId])

  const parsedPercent = useMemo(() => {
    const normalized = percentInput.replace(',', '.').trim()
    const n = Number(normalized)
    return Number.isFinite(n) ? n : NaN
  }, [percentInput])

  const parsedFraction = parsedPercent / 100
  const canSave =
    validId &&
    Number.isFinite(parsedPercent) &&
    parsedPercent >= 0 &&
    parsedPercent <= 100 &&
    rateFraction !== null &&
    Math.abs(parsedFraction - rateFraction) > 1e-9

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!validId) return
    if (!Number.isFinite(parsedPercent) || parsedPercent < 0 || parsedPercent > 100) {
      setFormError(t('dashboard.admin.commissionRules.detail.invalidRate'))
      return
    }
    setSaving(true)
    try {
      await adminCommissionRulesApi.setPolicy({ employerId, commissionRate: parsedFraction })
      success(t('dashboard.admin.commissionRules.detail.saveSuccess'))
      await loadAll()
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : t('dashboard.admin.commissionRules.detail.saveError')
      setFormError(msg)
      notifyError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (!validId) {
    return <Navigate to="/admin/commission-rules" replace />
  }

  const empStatus = employer ? parseEmployerStatus(employer.status) : EmployerStatus.Pending

  return (
    <>
      <button
        type="button"
        onClick={() => navigate('/admin/commission-rules')}
        className={cn(
          'mb-2 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition',
          theme === 'dark' ? 'border-white/15 text-white hover:bg-white/10' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
        )}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('dashboard.admin.commissionRules.detail.back')}
      </button>

      <DashboardHero
        theme={theme}
        title={t('dashboard.admin.commissionRules.detail.title')}
        description={t('dashboard.admin.commissionRules.detail.subtitle')}
      />

      {loading ? (
        <DashboardSurface theme={theme}>
          <p className={cn('py-8 text-center text-sm', toneMuted)}>{t('dashboard.admin.summary.loading')}</p>
        </DashboardSurface>
      ) : loadError ? (
        <DashboardSurface theme={theme}>
          <StatePanel theme={theme} text={loadError} isError />
        </DashboardSurface>
      ) : (
        <>
          <DashboardSurface theme={theme}>
            <div className="flex flex-wrap items-start gap-4">
              <span
                className={cn(
                  'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border',
                  theme === 'dark' ? 'border-white/15 bg-white/[0.06] text-cyan-200' : 'border-sky-200 bg-sky-50 text-sky-700',
                )}
              >
                <Building2 className="h-6 w-6" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className={cn('text-lg font-semibold sm:text-xl', toneStrong)}>{employer?.name ?? '—'}</h2>
                  <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold', statusBadge(theme, empStatus))}>
                    {t(employerStatusLocaleKey(empStatus))}
                  </span>
                </div>
                <p className={cn('text-sm', toneMuted)}>
                  {t('dashboard.admin.commissionRules.detail.tax')}: {employer?.taxNumber ?? '—'}
                </p>
              </div>
            </div>

            {estimate ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className={cn('rounded-2xl border p-4', theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white')}>
                  <p className={cn('text-xs font-semibold uppercase tracking-wide', toneMuted)}>{t('dashboard.admin.commissionRules.detail.kpis.rate')}</p>
                  <p className={cn('mt-1 text-xl font-bold tabular-nums', toneStrong)}>{(estimate.commissionRate * 100).toFixed(2)}%</p>
                </div>
                <div className={cn('rounded-2xl border p-4', theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white')}>
                  <p className={cn('text-xs font-semibold uppercase tracking-wide', toneMuted)}>{t('dashboard.admin.commissionRules.detail.kpis.accepted')}</p>
                  <p className={cn('mt-1 text-xl font-bold tabular-nums', toneStrong)}>{estimate.acceptedApplicationCount.toLocaleString(locale)}</p>
                </div>
                <div className={cn('rounded-2xl border p-4', theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white')}>
                  <p className={cn('text-xs font-semibold uppercase tracking-wide', toneMuted)}>{t('dashboard.admin.commissionRules.detail.kpis.gross')}</p>
                  <p className={cn('mt-1 text-xl font-bold tabular-nums', toneStrong)}>{fmtMoney(estimate.estimatedGrossTransactionVolume)}</p>
                </div>
                <div className={cn('rounded-2xl border p-4', theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white')}>
                  <p className={cn('text-xs font-semibold uppercase tracking-wide', toneMuted)}>{t('dashboard.admin.commissionRules.detail.kpis.commission')}</p>
                  <p className={cn('mt-1 text-xl font-bold tabular-nums', toneStrong)}>{fmtMoney(estimate.estimatedCommissionAmount)}</p>
                </div>
              </div>
            ) : null}
          </DashboardSurface>

          <DashboardSurface theme={theme}>
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
                  theme === 'dark' ? 'border-white/15 bg-white/[0.06] text-cyan-200' : 'border-sky-200 bg-sky-50 text-sky-700',
                )}
              >
                <Percent className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className={cn('text-base font-semibold', toneStrong)}>{t('dashboard.admin.commissionRules.detail.formTitle')}</h3>
                <p className={cn('mt-1 text-xs sm:text-sm', toneMuted)}>{t('dashboard.admin.commissionRules.detail.formHint')}</p>
              </div>
            </div>

            <form onSubmit={(e) => void onSubmit(e)} className="mt-4 space-y-4">
              {formError ? <StatePanel theme={theme} text={formError} isError /> : null}
              <label className="block max-w-md">
                <span className={cn('mb-1.5 block text-xs font-semibold uppercase tracking-wide', toneMuted)}>
                  {t('dashboard.admin.commissionRules.detail.ratePercent')}
                </span>
                <input
                  className={inputClass}
                  type="text"
                  inputMode="decimal"
                  value={percentInput}
                  onChange={(ev) => setPercentInput(ev.target.value)}
                  disabled={saving}
                />
              </label>
              <button
                type="submit"
                disabled={saving || !canSave}
                className={cn(
                  'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
                  theme === 'dark'
                    ? 'border-cyan-300/45 bg-cyan-300/12 text-cyan-50 hover:bg-cyan-300/18'
                    : 'border-sky-300 bg-sky-600 text-white hover:bg-sky-700',
                )}
              >
                <Save className="h-4 w-4" aria-hidden />
                {saving ? t('dashboard.admin.summary.loading') : t('dashboard.admin.commissionRules.detail.save')}
              </button>
            </form>
          </DashboardSurface>
        </>
      )}
    </>
  )
}
