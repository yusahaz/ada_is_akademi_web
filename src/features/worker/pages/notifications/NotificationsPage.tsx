import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { BellRing } from 'lucide-react'

import { workerPortalApi, type WorkerNotificationItem } from '../../../../api/worker/worker-portal'
import { useTheme } from '../../../../theme/theme-context'
import { DashboardSurface, StatePanel } from '../../../../shared/ui/ui-primitives'
import { useWorkerAsyncData } from '../../hooks/useWorkerAsyncData'
import { WorkerPillBadge, WorkerSectionHeader, type WorkerEmphasis } from '../../worker-ui'

export function NotificationsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const query = useCallback(() => workerPortalApi.listNotifications(), [])
  const { loading, error, data: items } = useWorkerAsyncData<WorkerNotificationItem[]>(
    [],
    ['worker', 'notifications'],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
  )

  return (
    <div className="space-y-4">
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.workerPortal.pages.notifications.title')}
        subtitle={t('dashboard.workerPortal.pages.notifications.subtitle')}
      />

      {loading ? <StatePanel text={t('dashboard.workerPortal.states.loading')} theme={theme} /> : null}
      {error ? <StatePanel text={error} theme={theme} isError /> : null}
      {!loading && !error && items.length === 0 ? (
        <StatePanel text={t('dashboard.workerPortal.notifications.empty')} theme={theme} />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <DashboardSurface theme={theme}>
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      theme === 'dark' ? 'bg-cyan-500/15 text-cyan-200' : 'bg-sky-100 text-sky-700'
                    }`}
                    aria-hidden="true"
                  >
                    <BellRing className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p
                        className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} ${
                          item.isRead ? 'opacity-75' : ''
                        }`}
                      >
                        {item.title}
                      </p>
                      <WorkerPillBadge tone={theme} emphasis={notificationEmphasis(item.type)}>
                        {t(`dashboard.workerPortal.notifications.type.${item.type}`)}
                      </WorkerPillBadge>
                    </div>
                    {item.description ? (
                      <p className={`mt-1 text-xs leading-relaxed ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
                        {item.description}
                      </p>
                    ) : null}
                    {item.createdAt ? (
                      <p className={`mt-1 text-[11px] ${theme === 'dark' ? 'text-white/55' : 'text-slate-500'}`}>
                        {formatNotificationDate(item.createdAt)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </DashboardSurface>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function notificationEmphasis(type: WorkerNotificationItem['type']): WorkerEmphasis {
  if (type === 'matching') return 'info'
  if (type === 'payout') return 'success'
  if (type === 'application') return 'warning'
  if (type === 'shift') return 'info'
  return 'neutral'
}

function formatNotificationDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString()
}
