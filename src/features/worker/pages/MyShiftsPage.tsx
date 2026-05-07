import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { workerPortalApi, type WorkerShiftHistoryItem } from '../../../api/worker-portal'
import { useTheme } from '../../../theme/theme-context'
import { DashboardSurface, StatePanel } from '../../../components/dashboard/ui-primitives'
import { useWorkerAsyncData } from '../hooks/useWorkerAsyncData'
import { useWorkerLiveCounters } from '../hooks/useWorkerLiveCounters'
import {
  WorkerPillBadge,
  WorkerSectionHeader,
  WorkerTabs,
  type WorkerEmphasis,
  type WorkerTabItem,
} from '../worker-ui'
import { QrCheckPage } from './QrCheckPage'

type MyShiftsTabId = 'active' | 'history'

const tabIds: MyShiftsTabId[] = ['active', 'history']

export function MyShiftsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const counters = useWorkerLiveCounters()

  const requestedTab = searchParams.get('tab') as MyShiftsTabId | null
  const activeTab: MyShiftsTabId = requestedTab && tabIds.includes(requestedTab) ? requestedTab : 'active'

  const handleTabChange = (id: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', id)
    setSearchParams(next, { replace: true })
  }

  const tabs: WorkerTabItem[] = useMemo(
    () => [
      {
        id: 'active',
        label: t('dashboard.workerPortal.tabs.myShifts.active'),
        badge: counters.upcomingShifts > 0 ? counters.upcomingShifts : undefined,
      },
      {
        id: 'history',
        label: t('dashboard.workerPortal.tabs.myShifts.history'),
      },
    ],
    [counters.upcomingShifts, t],
  )

  return (
    <div className="space-y-4">
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.workerPortal.pages.myShifts.title')}
        subtitle={t('dashboard.workerPortal.pages.myShifts.subtitle')}
      />
      <WorkerTabs
        tone={theme}
        items={tabs}
        value={activeTab}
        onChange={handleTabChange}
        ariaLabel={t('dashboard.workerPortal.pages.myShifts.title')}
      />

      {activeTab === 'active' ? <ActiveShiftTab /> : null}
      {activeTab === 'history' ? <ShiftHistoryTab /> : null}
    </div>
  )
}

function ActiveShiftTab() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const query = useCallback(
    () =>
      Promise.all([
        workerPortalApi.getActiveShiftAssignment(),
        workerPortalApi.getUpcomingShiftAssignments(5),
      ]).then(([active, upcoming]) => ({ active, upcoming })),
    [],
  )
  const { loading, error, data } = useWorkerAsyncData<{ active: WorkerShiftHistoryItem | null; upcoming: WorkerShiftHistoryItem[] }>(
    { active: null, upcoming: [] },
    ['worker', 'shifts', 'active'],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
  )

  if (loading) {
    return <StatePanel text={t('dashboard.workerPortal.states.loading')} theme={theme} />
  }
  if (error) {
    return <StatePanel text={error} theme={theme} isError />
  }

  return (
    <div className="space-y-4">
      <DashboardSurface theme={theme}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-xs font-semibold uppercase tracking-[0.08em] ${theme === 'dark' ? 'text-white/65' : 'text-slate-500'}`}>
              {t('dashboard.workerPortal.tabs.myShifts.activeAssignment')}
            </p>
            {data.active ? (
              <>
                <p className={`mt-1 text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {data.active.shiftDate} • {data.active.shiftStartTime} - {data.active.shiftEndTime}
                </p>
                <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-white/65' : 'text-slate-600'}`}>
                  {t('dashboard.workerPortal.overview.employerPrefix', { id: data.active.jobPostingId })}
                </p>
              </>
            ) : (
              <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-white/65' : 'text-slate-600'}`}>
                {t('dashboard.workerPortal.tabs.myShifts.noActive')}
              </p>
            )}
          </div>
          {data.active ? (
            <WorkerPillBadge tone={theme} emphasis={shiftStatusEmphasis(data.active.status)}>
              {t(`dashboard.workerPortal.shiftHistory.status.${data.active.status}`)}
            </WorkerPillBadge>
          ) : null}
        </div>
      </DashboardSurface>

      <DashboardSurface theme={theme}>
        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          {t('dashboard.workerPortal.tabs.myShifts.qrTitle')}
        </p>
        <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-white/65' : 'text-slate-600'}`}>
          {t('dashboard.workerPortal.tabs.myShifts.qrHint')}
        </p>
        <div className="mt-3">
          <QrCheckPage embedded />
        </div>
      </DashboardSurface>

      {data.upcoming.length > 0 ? (
        <DashboardSurface theme={theme}>
          <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {t('dashboard.workerPortal.tabs.myShifts.upcoming')}
          </p>
          <ul className="mt-3 space-y-2">
            {data.upcoming.map((item) => (
              <li key={item.assignmentId}>
                <ShiftRow item={item} theme={theme} t={t} />
              </li>
            ))}
          </ul>
        </DashboardSurface>
      ) : null}
    </div>
  )
}

function ShiftHistoryTab() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const query = useCallback(() => workerPortalApi.listShiftHistory(20, 0), [])
  const { loading, error, data: items } = useWorkerAsyncData<WorkerShiftHistoryItem[]>(
    [],
    ['worker', 'shifts', 'history'],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
  )

  if (loading) return <StatePanel text={t('dashboard.workerPortal.states.loading')} theme={theme} />
  if (error) return <StatePanel text={error} theme={theme} isError />
  if (items.length === 0) return <StatePanel text={t('dashboard.workerPortal.shiftHistory.empty')} theme={theme} />

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {items.map((item) => (
        <DashboardSurface key={item.assignmentId} theme={theme}>
          <ShiftRow item={item} theme={theme} t={t} />
        </DashboardSurface>
      ))}
    </div>
  )
}

function ShiftRow({
  item,
  theme,
  t,
}: {
  item: WorkerShiftHistoryItem
  theme: 'dark' | 'light'
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          {item.shiftDate} • {item.shiftStartTime} - {item.shiftEndTime}
        </p>
        <p className={`mt-0.5 text-xs ${theme === 'dark' ? 'text-white/65' : 'text-slate-600'}`}>
          {t('dashboard.workerPortal.overview.employerPrefix', { id: item.jobPostingId })}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <WorkerPillBadge tone={theme} emphasis={shiftStatusEmphasis(item.status)}>
          {t(`dashboard.workerPortal.shiftHistory.status.${item.status}`)}
        </WorkerPillBadge>
        {item.isAnomalyFlagged ? (
          <WorkerPillBadge tone={theme} emphasis="warning">
            {t('dashboard.workerPortal.shiftHistory.anomaly')}
          </WorkerPillBadge>
        ) : null}
      </div>
    </div>
  )
}

function shiftStatusEmphasis(status: WorkerShiftHistoryItem['status']): WorkerEmphasis {
  if (status === 'checkedOut') return 'success'
  if (status === 'checkedIn') return 'info'
  if (status === 'awaitingMutualQr') return 'warning'
  return 'neutral'
}
