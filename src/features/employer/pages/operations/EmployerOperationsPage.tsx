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
        <OperationsTabs theme={theme} activeView={activeView} setView={setView} t={t} />

        {activeView === 'activeAssignments' ? (
          <ActiveAssignmentsView theme={theme} toneClass={toneClass} postings={postings} selectedPostingId={selectedPostingId} setSelectedPostingId={setSelectedPostingId} activeAssignmentsFallback={activeAssignmentsFallback} />
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
