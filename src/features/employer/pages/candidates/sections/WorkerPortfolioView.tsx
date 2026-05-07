import { StatePanel } from '../../../../../shared/ui/ui-primitives'

export function WorkerPortfolioView({
  theme,
  toneClass,
  portfolioRows,
  t,
}: {
  theme: 'dark' | 'light'
  toneClass: string
  portfolioRows: Array<{ workerId: number; reliability: number; lastSeen: string }>
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  return (
    <div className="mt-4 space-y-3">
      <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
        {t('dashboard.employerSpot.intelligence.workerPortfolio.title')}
      </h2>
      <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.intelligence.workerPortfolio.subtitle')}</p>
      {portfolioRows.length === 0 ? (
        <StatePanel theme={theme} text={t('dashboard.employerSpot.intelligence.workerPortfolio.empty')} />
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {portfolioRows.map((row) => (
            <div key={row.workerId} className={`rounded-xl border px-3 py-2 ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {t('dashboard.employerSpot.common.candidate')} {row.workerId}
                </p>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${theme === 'dark' ? 'bg-emerald-400/15 text-emerald-100' : 'bg-emerald-100 text-emerald-800'}`}>
                  {t('dashboard.employerSpot.intelligence.workerPortfolio.reliability', { value: row.reliability })}
                </span>
              </div>
              <p className={`mt-1 text-xs ${toneClass}`}>{t('dashboard.employerSpot.intelligence.workerPortfolio.lastWorked')}: {row.lastSeen}</p>
            </div>
          ))}
        </div>
      )}
      <p className={`text-xs ${toneClass}`}>{t('dashboard.employerSpot.intelligence.workerPortfolio.hint')}</p>
    </div>
  )
}
