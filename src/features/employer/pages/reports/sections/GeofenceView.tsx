import type { EmployerLocationListItemModel } from '../../../../../api/employer/employer-locations'
import { StatePanel } from '../../../../../shared/ui/ui-primitives'

export function GeofenceView({
  theme,
  toneClass,
  employerLocations,
  t,
}: {
  theme: 'dark' | 'light'
  toneClass: string
  employerLocations: EmployerLocationListItemModel[]
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  return (
    <div className="mt-4 space-y-3">
      <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
        {t('dashboard.employerSpot.settings.geofence.title')}
      </h2>
      <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.settings.geofence.subtitle')}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {(employerLocations.length > 0
          ? employerLocations.map((item) => `${item.name} • ${item.city} • r:${item.geofenceRadiusMetres}`)
          : [
              t('dashboard.employerSpot.settings.geofence.fields.locationName'),
              t('dashboard.employerSpot.settings.geofence.fields.city'),
              t('dashboard.employerSpot.settings.geofence.fields.latitude'),
              t('dashboard.employerSpot.settings.geofence.fields.longitude'),
              t('dashboard.employerSpot.settings.geofence.fields.radius'),
            ]
        ).map((label) => (
          <div key={label} className={`rounded-xl border px-3 py-3 text-xs ${theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-white/80' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
            {label}
          </div>
        ))}
      </div>
      <StatePanel theme={theme} text={t('dashboard.employerSpot.common.comingSoon')} />
      <p className={`text-xs ${toneClass}`}>{t('dashboard.employerSpot.settings.geofence.hint')}</p>
    </div>
  )
}
