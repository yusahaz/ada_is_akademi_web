import type { EmployerSupervisorListItemModel } from '../../../../../api/employer/employer-supervisors'

export function TeamRbacView({
  theme,
  toneClass,
  employerSupervisors,
  t,
}: {
  theme: 'dark' | 'light'
  toneClass: string
  employerSupervisors: EmployerSupervisorListItemModel[]
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  return (
    <div className="mt-4 space-y-3">
      <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
        {t('dashboard.employerSpot.settings.teamRBAC.title')}
      </h2>
      <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.settings.teamRBAC.subtitle')}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {[
          t('dashboard.employerSpot.settings.teamRBAC.cards.supervisors'),
          t('dashboard.employerSpot.settings.teamRBAC.cards.groups'),
        ].map((label) => (
          <div key={label} className={`rounded-xl border p-3 ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
            <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{label}</p>
            <p className={`mt-1 text-xs ${toneClass}`}>
              {employerSupervisors.length > 0
                ? `${t('dashboard.employerSpot.operations.tabs.activeAssignments')}: ${employerSupervisors.length}`
                : t('dashboard.employerSpot.common.comingSoon')}
            </p>
          </div>
        ))}
      </div>
      <p className={`text-xs ${toneClass}`}>{t('dashboard.employerSpot.settings.teamRBAC.hint')}</p>
    </div>
  )
}
