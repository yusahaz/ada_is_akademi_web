import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { DashboardSurface, StatePanel } from '../../../components/dashboard/ui-primitives'
import { useTheme } from '../../../theme/theme-context'
import { WorkerSectionHeader } from '../../worker/worker-ui'
import { useEmployerPortal } from '../use-employer-portal'

type DisputeItem = {
  id: number | string
  title: string
  detail: string
  severity: 'warning' | 'danger'
}

export function EmployerDisputesPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { badges, applications } = useEmployerPortal()
  const toneClass = theme === 'dark' ? 'text-white/70' : 'text-slate-600'

  const disputes = useMemo<DisputeItem[]>(() => {
    if (badges.activeAnomalies === 0) return []
    const base = applications.slice(0, 6)
    return base.map((item, index) => ({
      id: item.applicationId,
      title:
        index % 3 === 0
          ? t('dashboard.employerSpot.disputes.flags.locationMismatch')
          : index % 3 === 1
            ? t('dashboard.employerSpot.disputes.flags.expiredToken')
            : t('dashboard.employerSpot.disputes.flags.replayAttack'),
      detail: t('dashboard.employerSpot.disputes.itemDetail', {
        id: item.applicationId,
        workerId: item.workerId,
      }),
      severity: index % 3 === 2 ? 'danger' : 'warning',
    }))
  }, [applications, badges.activeAnomalies, t])

  return (
    <div className="space-y-4">
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.employerPortal.pages.disputes.title')}
        subtitle={t('dashboard.employerPortal.pages.disputes.subtitle')}
      />

      <DashboardSurface theme={theme}>
        <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          {t('dashboard.employerSpot.disputes.title')}
        </h2>
        <p className={`mt-1 text-sm ${toneClass}`}>{t('dashboard.employerSpot.disputes.subtitle')}</p>

        {disputes.length === 0 ? (
          <div className="mt-4">
            <StatePanel theme={theme} text={t('dashboard.employerSpot.disputes.empty')} />
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {disputes.map((item) => {
              const tone =
                item.severity === 'danger'
                  ? theme === 'dark'
                    ? 'border-rose-400/30 bg-rose-500/10 text-rose-100'
                    : 'border-rose-300 bg-rose-50 text-rose-900'
                  : theme === 'dark'
                    ? 'border-amber-400/25 bg-amber-400/10 text-amber-100'
                    : 'border-amber-300 bg-amber-50 text-amber-900'

              return (
                <div key={String(item.id)} className={`rounded-xl border px-3 py-2 ${tone}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-semibold dark:bg-white/10">
                      #{item.id}
                    </span>
                  </div>
                  <p className="mt-1 text-xs opacity-90">{item.detail}</p>
                </div>
              )
            })}
          </div>
        )}

        <p className={`mt-4 text-xs ${toneClass}`}>{t('dashboard.employerSpot.disputes.hint')}</p>
      </DashboardSurface>
    </div>
  )
}

