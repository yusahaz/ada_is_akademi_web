import { DashboardSurface } from '../../../../../shared/ui/ui-primitives'
import type { SpotAnomalyItem } from './types'

export function AnomaliesPanel({
  theme,
  toneClass,
  anomalies,
  activeAnomalies,
  t,
}: {
  theme: 'dark' | 'light'
  toneClass: string
  anomalies: SpotAnomalyItem[]
  activeAnomalies: number
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  return (
    <DashboardSurface theme={theme} className="xl:col-span-1">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('dashboard.employerSpot.anomalies.title')}</h2>
          <p className={`mt-1 text-sm ${toneClass}`}>{t('dashboard.employerSpot.anomalies.subtitle')}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${activeAnomalies > 0 ? theme === 'dark' ? 'bg-amber-400/15 text-amber-100' : 'bg-amber-100 text-amber-800' : theme === 'dark' ? 'bg-emerald-400/15 text-emerald-100' : 'bg-emerald-100 text-emerald-800'}`}>{activeAnomalies}</span>
      </div>
      {anomalies.length === 0 ? (
        <p className={`mt-4 text-sm ${toneClass}`}>{t('dashboard.employerSpot.anomalies.empty')}</p>
      ) : (
        <div className="mt-4 space-y-2">
          {anomalies.map((item) => {
            const tone = item.severity === 'danger' ? theme === 'dark' ? 'border-rose-400/30 bg-rose-500/10 text-rose-100' : 'border-rose-300 bg-rose-50 text-rose-900' : theme === 'dark' ? 'border-amber-400/25 bg-amber-400/10 text-amber-100' : 'border-amber-300 bg-amber-50 text-amber-900'
            return (
              <div key={item.key} className={`rounded-xl border px-3 py-2 ${tone}`}>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-xs opacity-90">{item.detail}</p>
              </div>
            )
          })}
        </div>
      )}
    </DashboardSurface>
  )
}
