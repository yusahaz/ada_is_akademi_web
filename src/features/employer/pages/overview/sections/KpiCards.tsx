import { IconBolt, IconUsers } from '../../../../landing/components/icons'
import { DashboardSurface } from '../../../../../shared/ui/ui-primitives'

export function KpiCards({
  theme,
  fillRatePercent,
  activeWorkersApprox,
  openPostings,
  pendingApplications,
  t,
}: {
  theme: 'dark' | 'light'
  fillRatePercent: number
  activeWorkersApprox: number
  openPostings: number
  pendingApplications: number
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { title: t('dashboard.employerSpot.kpis.fillRateToday'), value: `${fillRatePercent}%`, icon: <IconBolt className="h-4 w-4" /> },
        { title: t('dashboard.employerSpot.kpis.activeWorkers'), value: activeWorkersApprox, icon: <IconUsers className="h-4 w-4" /> },
        { title: t('dashboard.employer.summary.openPostings'), value: openPostings, icon: <IconBolt className="h-4 w-4" /> },
        { title: t('dashboard.employer.summary.pendingApplications'), value: pendingApplications, icon: <IconUsers className="h-4 w-4" /> },
      ].map((item) => (
        <DashboardSurface key={item.title} theme={theme} className="relative">
          <div className="flex items-center justify-between gap-3">
            <p className={`text-xs ${theme === 'dark' ? 'text-white/75' : 'text-slate-600'}`}>{item.title}</p>
            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${theme === 'dark' ? 'bg-[#14f1d9]/15 text-[#14f1d9]' : 'bg-sky-100 text-sky-700'}`}>{item.icon}</span>
          </div>
          <p className={`mt-3 font-display text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.value}</p>
          <div aria-hidden className={`pointer-events-none absolute inset-x-4 bottom-2 h-px ${theme === 'dark' ? 'bg-cyan-300/20' : 'bg-sky-200'}`} />
        </DashboardSurface>
      ))}
    </div>
  )
}
