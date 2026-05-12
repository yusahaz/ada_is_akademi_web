import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { DashboardSurface } from '../../../../shared/ui/ui-primitives'
import { useTheme } from '../../../../theme/theme-context'
import { WorkerSectionHeader } from '../../../worker/worker-ui'
import { useEmployerPortal } from '../../portal/use-employer-portal'
import { ActiveAssignmentsView, ApplicationsView, HistoryView, OperationsTabs } from './sections'

type OperationsView = 'activeAssignments' | 'applications' | 'history'
type AssignmentStatus = 'Pending' | 'AwaitingMutualQr' | 'CheckedIn' | 'CheckedOut'

export function EmployerOperationsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { postings, applications, selectedPostingId, setSelectedPostingId, activeAssignments, assignmentHistory } =
    useEmployerPortal()
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

  const activeAssignmentRows = useMemo(
    () =>
      activeAssignments.map((item) => ({
        assignmentId: Number(item.assignmentId),
        workerId: Number(item.workerId),
        status: item.status as AssignmentStatus,
      })),
    [activeAssignments],
  )

  return (
    <>
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.employerPortal.pages.operations.title')}
        subtitle={t('dashboard.employerPortal.pages.operations.subtitle')}
      />

      <DashboardSurface theme={theme}>
        <OperationsTabs theme={theme} activeView={activeView} setView={setView} t={t} />

        {activeView === 'activeAssignments' ? (
          <ActiveAssignmentsView
            theme={theme}
            toneClass={toneClass}
            postings={postings}
            selectedPostingId={selectedPostingId}
            setSelectedPostingId={setSelectedPostingId}
            activeAssignments={activeAssignmentRows}
          />
        ) : null}

        {activeView === 'applications' ? (
          <ApplicationsView theme={theme} toneClass={toneClass} applications={applications} t={t} />
        ) : null}

        {activeView === 'history' ? (
          <HistoryView theme={theme} toneClass={toneClass} assignmentHistory={assignmentHistory} />
        ) : null}
      </DashboardSurface>
    </>
  )
}
