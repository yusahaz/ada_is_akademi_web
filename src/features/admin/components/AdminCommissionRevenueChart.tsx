import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  CommissionRevenueGranularity,
  getCommissionRevenueSeries,
  type CommissionRevenueSeriesBucket,
  type CommissionRevenueSeriesModel,
} from '../../../api/admin/commission-revenue-series'
import { cn } from '../../../shared/lib/cn'
import { DashboardSurface, StatePanel } from '../../../shared/ui/ui-primitives'
import { useTheme } from '../../../theme/theme-context'

const BAR_PALETTE_LIGHT = ['#0284c7', '#0ea5e9', '#38bdf8', '#22d3ee', '#0369a1']
const BAR_PALETTE_DARK = ['#22d3ee', '#38bdf8', '#67e8f9', '#a5f3fc', '#0891b2']

function formatMoney(locale: string, currency: string, amount: number): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount)
  } catch {
    return `${amount.toLocaleString(locale, { maximumFractionDigits: 2 })} ${currency}`
  }
}

function formatAxisAmount(locale: string, value: number, singleCurrency: string | null): string {
  if (singleCurrency) {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: singleCurrency,
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 2,
      }).format(value)
    } catch {
      /* fall through */
    }
  }
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatBarTopAmount(locale: string, value: number, singleCurrency: string | null): string {
  if (singleCurrency) {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: singleCurrency,
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
      }).format(value)
    } catch {
      /* fall through */
    }
  }
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value)
}

function niceStep(rough: number): number {
  if (!Number.isFinite(rough) || rough <= 0) return 1
  const exponent = Math.floor(Math.log10(rough))
  const fraction = rough / 10 ** exponent
  let niceFraction: number
  if (fraction < 1.5) niceFraction = 1
  else if (fraction < 3) niceFraction = 2
  else if (fraction < 7) niceFraction = 5
  else niceFraction = 10
  return niceFraction * 10 ** exponent
}

function buildYScale(maxData: number, tickTarget: number): { scaleMax: number; ticks: number[] } {
  if (maxData <= 0) {
    return { scaleMax: 1, ticks: [0, 0.25, 0.5, 0.75, 1] }
  }
  const step = niceStep(maxData / Math.max(1, tickTarget - 1))
  const scaleMax = Math.max(step, Math.ceil(maxData / step) * step)
  const ticks: number[] = []
  for (let v = 0; v <= scaleMax + 1e-9; v += step) {
    ticks.push(Number(v.toPrecision(12)))
  }
  if (ticks.length === 0 || ticks[ticks.length - 1] < scaleMax - 1e-9) {
    ticks.push(scaleMax)
  }
  return { scaleMax, ticks }
}

function formatBucketLabel(label: string, locale: string): string {
  const monthly = /^(\d{4})-(\d{2})$/.exec(label)
  if (monthly) {
    const y = Number(monthly[1])
    const mo = Number(monthly[2]) - 1
    const d = new Date(y, mo, 1)
    return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(d)
  }
  return label
}

function bucketTotal(bucket: CommissionRevenueSeriesBucket): number {
  return bucket.amounts.reduce((sum, row) => sum + (Number(row.amount) || 0), 0)
}

function bucketAmountsByCurrency(bucket: CommissionRevenueSeriesBucket): { currency: string; amount: number }[] {
  const map = new Map<string, number>()
  for (const a of bucket.amounts) {
    const c = String(a.currency || '???').toUpperCase()
    map.set(c, (map.get(c) ?? 0) + (Number(a.amount) || 0))
  }
  return [...map.entries()]
    .filter(([, amt]) => amt > 0)
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([currency, amount]) => ({ currency, amount }))
}

type TooltipState = {
  clientX: number
  clientY: number
  periodLabel: string
  currency: string
  segmentAmount: number
  singleCurrencyTotal: number | null
  periodTotalsParts: string
}

export function AdminCommissionRevenueChart() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const locale = i18n.resolvedLanguage ?? i18n.language ?? 'tr'

  const [granularity, setGranularity] = useState<CommissionRevenueGranularity>(CommissionRevenueGranularity.Monthly)
  const [model, setModel] = useState<CommissionRevenueSeriesModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hover, setHover] = useState<{ bucketIndex: number; currencyIndex: number } | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const next = await getCommissionRevenueSeries(granularity)
      setModel(next)
    } catch {
      setModel(null)
      setError(t('dashboard.admin.commissionChart.fetchError'))
    } finally {
      setLoading(false)
    }
  }, [granularity, t])

  useEffect(() => {
    void load()
  }, [load])

  const buckets = model?.buckets ?? []

  const allCurrencies = useMemo(() => {
    const set = new Set<string>()
    for (const b of buckets) {
      for (const a of b.amounts) {
        if (a.currency) set.add(a.currency.toUpperCase())
      }
    }
    return [...set].sort((a, x) => a.localeCompare(x))
  }, [buckets])

  const singleAxisCurrency = useMemo(() => {
    if (allCurrencies.length !== 1) return null
    const c = allCurrencies[0]
    return c && c !== '???' ? c : null
  }, [allCurrencies])

  const currencyColorIndex = useMemo(() => {
    const map = new Map<string, number>()
    allCurrencies.forEach((c, i) => map.set(c, i))
    return map
  }, [allCurrencies])

  const palette = theme === 'dark' ? BAR_PALETTE_DARK : BAR_PALETTE_LIGHT

  const maxTotal = useMemo(() => {
    let m = 0
    for (const b of buckets) {
      m = Math.max(m, bucketTotal(b))
    }
    return m
  }, [buckets])

  const { scaleMax, yTicks } = useMemo(() => {
    const { scaleMax: sm, ticks } = buildYScale(maxTotal, 5)
    return { scaleMax: sm, yTicks: ticks }
  }, [maxTotal])

  const totalsByCurrency = useMemo(() => {
    const map = new Map<string, number>()
    for (const b of buckets) {
      for (const a of b.amounts) {
        const c = String(a.currency || '').toUpperCase() || '???'
        map.set(c, (map.get(c) ?? 0) + (Number(a.amount) || 0))
      }
    }
    return [...map.entries()].sort((left, right) => left[0].localeCompare(right[0]))
  }, [buckets])

  const vbW = 720
  const vbH = 260
  const padL = 62
  const padR = 16
  const padT = 14
  const padB = 56
  const plotW = vbW - padL - padR
  const plotH = vbH - padT - padB

  const n = Math.max(1, buckets.length)
  const gap = 6
  const barSlot = plotW / n
  const barW = Math.max(8, barSlot - gap)

  const yToSvg = (value: number) => padT + plotH - (value / scaleMax) * plotH

  const tabs: { key: CommissionRevenueGranularity; label: string }[] = [
    { key: CommissionRevenueGranularity.Monthly, label: t('dashboard.admin.commissionChart.monthly') },
    { key: CommissionRevenueGranularity.Quarterly, label: t('dashboard.admin.commissionChart.quarterly') },
    { key: CommissionRevenueGranularity.HalfYearly, label: t('dashboard.admin.commissionChart.halfYearly') },
    { key: CommissionRevenueGranularity.Yearly, label: t('dashboard.admin.commissionChart.yearly') },
  ]

  const toneMuted = theme === 'dark' ? 'text-white/55' : 'text-slate-600'
  const toneStrong = theme === 'dark' ? 'text-white' : 'text-slate-900'

  const gridStroke = theme === 'dark' ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.35)'
  const axisStroke = theme === 'dark' ? 'rgba(148,163,184,0.35)' : 'rgba(148,163,184,0.7)'
  const labelFill = theme === 'dark' ? 'rgba(226,232,240,0.65)' : '#64748b'

  const showEmptyInChart = !loading && !error && buckets.length > 0 && maxTotal <= 0

  return (
    <DashboardSurface theme={theme} className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className={`text-base font-semibold sm:text-lg ${toneStrong}`}>{t('dashboard.admin.commissionChart.title')}</h2>
          <p className={`mt-1 text-xs sm:text-sm ${toneMuted}`}>{t('dashboard.admin.commissionChart.subtitle')}</p>
          {!loading && !error ? (
            <>
              <p className={`mt-2 text-xs font-medium ${toneMuted}`}>
                {t('dashboard.admin.commissionChart.total')}:{' '}
                <span className={toneStrong}>
                  {totalsByCurrency.length === 0
                    ? '—'
                    : totalsByCurrency
                        .map(([currency, amt]) => formatMoney(locale, currency, amt))
                        .join(' · ')}
                </span>
              </p>
              <p className={`mt-1 text-[11px] leading-snug ${toneMuted}`}>
                {singleAxisCurrency
                  ? t('dashboard.admin.commissionChart.axisHintSingle', { currency: singleAxisCurrency })
                  : t('dashboard.admin.commissionChart.axisHintMulti')}
              </p>
            </>
          ) : null}
        </div>

        <div
          className="flex flex-wrap gap-2 lg:max-w-[48%] lg:justify-end"
          role="tablist"
          aria-label={t('dashboard.admin.commissionChart.title')}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={granularity === tab.key}
              onClick={() => setGranularity(tab.key)}
              disabled={loading}
              className={cn(
                'rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:opacity-50',
                granularity === tab.key
                  ? theme === 'dark'
                    ? 'border-cyan-300/45 bg-cyan-400/15 text-cyan-50'
                    : 'border-sky-400 bg-sky-50 text-sky-800'
                  : theme === 'dark'
                    ? 'border-white/15 bg-white/[0.04] text-white/75 hover:bg-white/[0.08]'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error ? <StatePanel theme={theme} text={error} isError /> : null}

      {loading ? (
        <p className={`py-16 text-center text-sm ${toneMuted}`}>{t('dashboard.admin.commissionChart.loading')}</p>
      ) : error ? null : (
        <>
          <div className="relative w-full overflow-x-auto">
            {tooltip ? (
              <div
                className={cn(
                  'pointer-events-none fixed z-[100] max-w-[min(280px,calc(100vw-24px))] rounded-xl border px-3 py-2 text-left text-xs shadow-xl',
                  theme === 'dark'
                    ? 'border-white/15 bg-[#141a24]/95 text-white backdrop-blur-sm'
                    : 'border-slate-200/90 bg-white/95 text-slate-900 shadow-slate-200/80 backdrop-blur-sm',
                )}
                style={{ left: tooltip.clientX + 14, top: tooltip.clientY + 14 }}
                role="tooltip"
              >
                <div className={`font-semibold ${theme === 'dark' ? 'text-cyan-100' : 'text-sky-900'}`}>
                  {t('dashboard.admin.commissionChart.tooltipPeriod')}: {tooltip.periodLabel}
                </div>
                <div className="mt-1 opacity-90">
                  {t('dashboard.admin.commissionChart.tooltipSegment', {
                    currency: tooltip.currency,
                    amount: formatMoney(locale, tooltip.currency, tooltip.segmentAmount),
                  })}
                </div>
                <div className={`mt-1 border-t pt-1 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
                  {tooltip.singleCurrencyTotal != null
                    ? t('dashboard.admin.commissionChart.tooltipStackTotal', {
                        amount: formatMoney(locale, tooltip.currency, tooltip.singleCurrencyTotal),
                      })
                    : t('dashboard.admin.commissionChart.tooltipPeriodTotals', { parts: tooltip.periodTotalsParts })}
                </div>
              </div>
            ) : null}

            <svg
              viewBox={`0 0 ${vbW} ${vbH}`}
              className="h-[240px] min-w-[520px] w-full text-[11px]"
              role="img"
              aria-label={t('dashboard.admin.commissionChart.ariaChart')}
            >
              {yTicks.map((tick) => {
                const y = yToSvg(tick)
                return (
                  <g key={`grid-${tick}`}>
                    <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke={gridStroke} strokeWidth={1} vectorEffect="non-scaling-stroke" />
                    <text x={padL - 8} y={y + 4} textAnchor="end" fill={labelFill}>
                      {formatAxisAmount(locale, tick, singleAxisCurrency)}
                    </text>
                  </g>
                )
              })}

              <line
                x1={padL}
                y1={padT + plotH}
                x2={padL + plotW}
                y2={padT + plotH}
                stroke={axisStroke}
                strokeWidth={1}
              />

              {showEmptyInChart ? (
                <text
                  x={padL + plotW / 2}
                  y={padT + plotH / 2}
                  textAnchor="middle"
                  fill={labelFill}
                  className="text-[12px]"
                >
                  {t('dashboard.admin.commissionChart.empty')}
                </text>
              ) : null}

              {buckets.map((bucket, bi) => {
                const xCenter = padL + bi * barSlot + barSlot / 2
                const x = xCenter - barW / 2
                let yCursor = padT + plotH
                const stackTotal = bucketTotal(bucket)

                const sortedAmounts = [...bucket.amounts].sort((a, b) =>
                  String(a.currency).localeCompare(String(b.currency)),
                )

                const displayLabel = formatBucketLabel(bucket.label, locale)
                const byCur = bucketAmountsByCurrency(bucket)
                const periodTotalsParts =
                  byCur.length > 0 ? byCur.map((b) => formatMoney(locale, b.currency, b.amount)).join(' · ') : '—'
                const nativeTitleTail =
                  byCur.length === 1
                    ? t('dashboard.admin.commissionChart.tooltipStackTotal', {
                        amount: formatMoney(locale, byCur[0].currency, byCur[0].amount),
                      })
                    : t('dashboard.admin.commissionChart.tooltipPeriodTotals', { parts: periodTotalsParts })

                return (
                  <g key={`${bucket.label}-${bucket.periodStart}`}>
                    {sortedAmounts.map((row, ci) => {
                      const amt = Number(row.amount) || 0
                      const segH = (amt / scaleMax) * plotH
                      yCursor -= segH
                      const cy = currencyColorIndex.get(String(row.currency).toUpperCase()) ?? 0
                      const fill = palette[cy % palette.length]
                      const isHover = hover?.bucketIndex === bi && hover?.currencyIndex === ci
                      const curCode = String(row.currency || '???').toUpperCase()
                      const singleTotal =
                        byCur.length === 1 && byCur[0] ? byCur[0].amount : null

                      return (
                        <rect
                          key={`${row.currency}-${ci}`}
                          x={x}
                          y={yCursor}
                          width={barW}
                          height={Math.max(segH, 0)}
                          rx={3}
                          fill={fill}
                          opacity={isHover ? 1 : 0.92}
                          stroke={theme === 'dark' ? 'rgba(15,23,42,0.45)' : 'rgba(255,255,255,0.85)'}
                          strokeWidth={0.5}
                          onMouseEnter={() => setHover({ bucketIndex: bi, currencyIndex: ci })}
                          onMouseMove={(e) => {
                            setTooltip({
                              clientX: e.clientX,
                              clientY: e.clientY,
                              periodLabel: displayLabel,
                              currency: curCode,
                              segmentAmount: amt,
                              singleCurrencyTotal: singleTotal,
                              periodTotalsParts,
                            })
                          }}
                          onMouseLeave={() => {
                            setHover(null)
                            setTooltip(null)
                          }}
                        >
                          <title>
                            {`${displayLabel} · ${row.currency}: ${formatMoney(locale, row.currency, amt)} — ${nativeTitleTail}`}
                          </title>
                        </rect>
                      )
                    })}
                    {singleAxisCurrency && stackTotal > 0 && barW >= 20 ? (
                      <text
                        x={xCenter}
                        y={yToSvg(stackTotal) - 4}
                        textAnchor="middle"
                        fill={theme === 'dark' ? 'rgba(248,250,252,0.92)' : '#0f172a'}
                        fontSize={10}
                        fontWeight={600}
                        style={{ textShadow: theme === 'dark' ? '0 0 6px rgba(0,0,0,0.85)' : '0 0 4px rgba(255,255,255,0.9)' }}
                      >
                        {formatBarTopAmount(locale, stackTotal, singleAxisCurrency)}
                      </text>
                    ) : null}
                    <text
                      x={xCenter}
                      y={vbH - 18}
                      textAnchor="middle"
                      fill={theme === 'dark' ? 'rgba(226,232,240,0.72)' : '#475569'}
                      transform={`rotate(-28 ${xCenter} ${vbH - 18})`}
                    >
                      {displayLabel}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {allCurrencies.length > 1 ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-dashed pt-3 border-slate-300/60 dark:border-white/10">
              {allCurrencies.map((c) => {
                const idx = currencyColorIndex.get(c) ?? 0
                return (
                  <span key={c} className={`inline-flex items-center gap-2 text-xs ${toneMuted}`}>
                    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: palette[idx % palette.length] }} />
                    <span className={toneStrong}>{c}</span>
                  </span>
                )
              })}
            </div>
          ) : totalsByCurrency.length === 0 || totalsByCurrency.every(([, amt]) => amt === 0) ? (
            <p className={`text-center text-xs ${toneMuted}`}>{t('dashboard.admin.commissionChart.empty')}</p>
          ) : null}
        </>
      )}
    </DashboardSurface>
  )
}
