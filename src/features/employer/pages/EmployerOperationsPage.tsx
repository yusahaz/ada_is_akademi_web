import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { DashboardSurface, InteractiveButton, StatePanel } from '../../../components/dashboard/ui-primitives'
import { useTheme } from '../../../theme/theme-context'
import { WorkerSectionHeader } from '../../worker/worker-ui'
import { tShiftAssignmentStatus } from '../employer-enum-i18n'
import { useEmployerPortal } from '../use-employer-portal'

type OperationsView = 'activeAssignments' | 'applications' | 'history'
type AssignmentStatus = 'Pending' | 'AwaitingMutualQr' | 'CheckedIn' | 'CheckedOut'

export function EmployerOperationsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { postings, applications, selectedPostingId, setSelectedPostingId, activeAssignments, assignmentHistory } = useEmployerPortal()
  const [searchParams, setSearchParams] = useSearchParams()
  const toneClass = theme === 'dark' ? 'text-white/70' : 'text-slate-600'

  const viewParam = searchParams.get('view')
  const activeView: OperationsView =
    viewParam === 'applications' || viewParam === 'history' || viewParam === 'activeAssignments'
      ? viewParam
      : 'activeAssignments'
  const setView = (view: OperationsView) => {
    const next = new URLSearchParams(searchParams)
    next.set('view', view)
    setSearchParams(next, { replace: true })
  }
  const sectionButtonClass = (isActiveButton: boolean) => `inline-flex ${isActiveButton ? 'is-active' : ''}`

  const activeAssignmentsFallback = useMemo(() => {
    if (activeAssignments.length > 0) {
      return activeAssignments.map((item) => ({
        assignmentId: Number(item.assignmentId),
        workerId: Number(item.workerId),
        status: item.status as AssignmentStatus,
      }))
    }
    // ShiftAssignments endpoint bağlanana kadar sentetik: seçili ilana gelen başvuruları “assignment” gibi göster.
    const source = selectedPostingId ? applications : applications.slice(0, 8)
    return source.slice(0, 8).map((item, index) => ({
      assignmentId: item.applicationId,
      workerId: item.workerId,
      status: (index % 3 === 0 ? 'AwaitingMutualQr' : index % 3 === 1 ? 'CheckedIn' : 'Pending') as AssignmentStatus,
    }))
  }, [activeAssignments, applications, selectedPostingId])

  return (
    <>
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.employerPortal.pages.operations.title')}
        subtitle={t('dashboard.employerPortal.pages.operations.subtitle')}
      />

      <DashboardSurface theme={theme}>
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ['activeAssignments', t('dashboard.employerSpot.operations.tabs.activeAssignments')],
              ['applications', t('dashboard.employerSpot.operations.tabs.applications')],
              ['history', t('dashboard.employerSpot.operations.tabs.history')],
            ] as [OperationsView, string][]
          ).map(([key, label]) => (
            <button key={key} type="button" onClick={() => setView(key)} className={sectionButtonClass(activeView === key)}>
              <InteractiveButton theme={theme} isActive={activeView === key}>
                {label}
              </InteractiveButton>
            </button>
          ))}
        </div>

        {activeView === 'activeAssignments' ? (
          <div className="mt-4 space-y-3">
            <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t('dashboard.employerSpot.operations.activeAssignments.title')}
            </h2>
            <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.operations.activeAssignments.subtitle')}</p>

            {postings.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                {postings.slice(0, 6).map((posting) => {
                  const isActive = selectedPostingId === posting.id
                  return (
                    <button
                      key={posting.id}
                      type="button"
                      onClick={() => setSelectedPostingId(posting.id)}
                      className={sectionButtonClass(isActive)}
                    >
                      <InteractiveButton theme={theme} isActive={isActive}>
                        {posting.title}
                      </InteractiveButton>
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => setSelectedPostingId(null)}
                  className={sectionButtonClass(selectedPostingId === null)}
                >
                  <InteractiveButton theme={theme} isActive={selectedPostingId === null}>
                    {t('dashboard.employerSpot.operations.activeAssignments.all')}
                  </InteractiveButton>
                </button>
              </div>
            ) : null}

            {activeAssignmentsFallback.length === 0 ? (
              <StatePanel theme={theme} text={t('dashboard.employerSpot.operations.activeAssignments.empty')} />
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {activeAssignmentsFallback.map((row) => (
                  <div
                    key={row.assignmentId}
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-white/85' : 'border-slate-200 bg-slate-50 text-slate-800'
                    }`}
                  >
                    <p className="font-semibold">#{row.assignmentId}</p>
                    <p className={`mt-1 text-xs ${toneClass}`}>
                      {t('dashboard.employerSpot.operations.activeAssignments.worker')}: {row.workerId}
                    </p>
                    <p className={`mt-1 text-xs ${toneClass}`}>
                      {t('dashboard.employerSpot.operations.activeAssignments.qrStatus')}: {tShiftAssignmentStatus(t, row.status)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {activeView === 'applications' ? (
          <div className="mt-4 space-y-3">
            <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t('dashboard.employerSpot.operations.applications.title')}
            </h2>
            <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.operations.applications.subtitle')}</p>
            {applications.length === 0 ? (
              <StatePanel theme={theme} text={t('dashboard.employerSpot.operations.applications.empty')} />
            ) : (
              <div className="space-y-2">
                {applications.slice(0, 10).map((item, idx) => (
                  <div
                    key={item.applicationId}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-2 ${
                      theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        {t('dashboard.employerSpot.common.candidate')} {item.workerId}
                      </p>
                      <p className={`mt-1 text-xs ${toneClass}`}>#{item.applicationId}</p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                        theme === 'dark' ? 'bg-sky-500/15 text-sky-100' : 'bg-sky-100 text-sky-700'
                      }`}
                      aria-label={t('dashboard.employerSpot.operations.applications.matchScoreAria', { score: Math.max(90 - idx * 4, 65) })}
                    >
                      {t('dashboard.employerSpot.operations.applications.matchScore', { score: Math.max(90 - idx * 4, 65) })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {activeView === 'history' ? (
          <div className="mt-4 space-y-3">
            <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t('dashboard.employerSpot.operations.history.title')}
            </h2>
            <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.operations.history.subtitle')}</p>
            {assignmentHistory.length === 0 ? (
              <StatePanel theme={theme} text={t('dashboard.employerSpot.common.comingSoon')} />
            ) : (
              <div className="space-y-2">
                {assignmentHistory.map((row) => (
                  <div
                    key={row.assignmentId}
                    className={`rounded-xl border px-3 py-2 text-xs ${
                      theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <p className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>#{row.assignmentId}</p>
                    <p className={toneClass}>
                      {t('dashboard.employerSpot.operations.activeAssignments.worker')}: {row.workerId}
                    </p>
                    <p className={toneClass}>
                      {t('dashboard.employerSpot.operations.activeAssignments.qrStatus')}: {tShiftAssignmentStatus(t, row.status)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </DashboardSurface>
    </>
  )
}
