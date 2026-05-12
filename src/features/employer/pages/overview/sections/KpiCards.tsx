import { IconBolt, IconUsers } from '../../../../landing/components/icons'
import { DashboardSurface } from '../../../../../shared/ui/ui-primitives'

export function KpiCards({
  theme,
  fillRatePercent,
  activeWorkersApprox,
  openPostings,
  pendingApplications,
  activeAnomalies,
  pendingPayouts,
  t,
}: {
  theme: 'dark' | 'light'
  fillRatePercent: number
  activeWorkersApprox: number
  openPostings: number
  pendingApplications: number
  activeAnomalies: number
  pendingPayouts: number
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  void fillRatePercent
  void activeWorkersApprox

  const cards = [
    {
      key: 'openPostings',
      title: t('dashboard.employer.summary.openPostings'),
      value: openPostings,
      icon: <IconBolt className="h-4 w-4" />,
      tone: theme === 'dark' ? 'text-cyan-100' : 'text-slate-900',
    },
    {
      key: 'pendingApplications',
      title: t('dashboard.employer.summary.pendingApplications'),
      value: pendingApplications,
      icon: <IconUsers className="h-4 w-4" />,
      tone: theme === 'dark' ? 'text-amber-100' : 'text-slate-900',
    },
    {
      key: 'activeAnomalies',
      title: t('dashboard.employerSpot.anomalies.title'),
      value: activeAnomalies,
      icon: <IconBolt className="h-4 w-4" />,
      tone: activeAnomalies > 0
        ? theme === 'dark'
          ? 'text-rose-200'
          : 'text-rose-700'
        : theme === 'dark'
          ? 'text-emerald-200'
          : 'text-emerald-700',
    },
    {
      key: 'pendingPayouts',
      title: t('dashboard.employerPortal.nav.billing'),
      value: pendingPayouts,
      icon: <IconUsers className="h-4 w-4" />,
      tone: theme === 'dark' ? 'text-cyan-100' : 'text-slate-900',
    },
  ] as const

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((item) => (
        <DashboardSurface key={item.key} theme={theme} className="relative">
          <div className="flex items-center justify-between gap-3">
            <p className={`text-xs ${theme === 'dark' ? 'text-white/75' : 'text-slate-600'}`}>{item.title}</p>
            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${theme === 'dark' ? 'bg-[#14f1d9]/15 text-[#14f1d9]' : 'bg-sky-100 text-sky-700'}`}>{item.icon}</span>
          </div>
          <p className={`mt-3 font-display text-3xl font-semibold ${item.tone}`}>{item.value}</p>
          <div aria-hidden className={`pointer-events-none absolute inset-x-4 bottom-2 h-px ${theme === 'dark' ? 'bg-cyan-300/20' : 'bg-sky-200'}`} />
        </DashboardSurface>
      ))}
    </div>
  )
}
