import { useTranslation } from 'react-i18next'

import { useTheme } from '../../../../theme/theme-context'
import { WorkerSectionHeader } from '../../../worker/worker-ui'
import { useEmployerPortal } from '../../portal/use-employer-portal'
import { AnomaliesPanel, CandidateFlowPanel, KpiCards, PostingsPanel, type SpotAnomalyItem } from './sections'

export function EmployerOverviewPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const {
    error,
    loading,
    summary,
    badges,
    postings,
    activeAssignments,
    selectedPostingId,
    setSelectedPostingId,
    applications,
  } = useEmployerPortal()
  const toneClass = theme === 'dark' ? 'text-white/70' : 'text-slate-600'

  const fillRatePercent = postings.length === 0 ? 0 : Math.min(100, Math.round((applications.length / (postings.length * 3)) * 100))
  const activeWorkersApprox = Math.min(
    applications.filter((item) => String(item.status).toLowerCase().includes('accepted')).length + Math.floor(applications.length / 4),
    999,
  )
  const anomalies: SpotAnomalyItem[] = (() => {
    const prefix = t('dashboard.employerSpot.anomalies.itemPrefix')
    if (badges.activeAnomalies === 0) return []
    const assignmentAnomalies = activeAssignments.filter((item) => item.isAnomalyFlagged).slice(0, 3)
    if (assignmentAnomalies.length > 0) {
      return assignmentAnomalies.map((item) => ({
        key: String(item.assignmentId),
        title: item.anomalyType ?? t('dashboard.employerSpot.anomalies.gpsError'),
        detail: `${prefix} #${item.assignmentId} • ${t('dashboard.employerSpot.common.candidate')} ${item.workerId}`,
        severity: item.anomalyType?.toLowerCase().includes('replay') ? 'danger' : 'warning',
      }))
    }
    const base: SpotAnomalyItem[] = [
      {
        key: 'gps',
        title: t('dashboard.employerSpot.anomalies.gpsError'),
        detail: `${prefix} #${applications[0]?.applicationId ?? '-'} • ${t('dashboard.employerSpot.common.candidate')} ${applications[0]?.workerId ?? '-'}`,
        severity: 'warning',
      },
      {
        key: 'expired',
        title: t('dashboard.employerSpot.anomalies.expiredToken'),
        detail: `${prefix} #${applications[1]?.applicationId ?? '-'} • ${t('dashboard.employerSpot.common.candidate')} ${applications[1]?.workerId ?? '-'}`,
        severity: 'warning',
      },
      {
        key: 'replay',
        title: t('dashboard.employerSpot.anomalies.replayAttack'),
        detail: `${prefix} #${applications[2]?.applicationId ?? '-'} • ${t('dashboard.employerSpot.common.candidate')} ${applications[2]?.workerId ?? '-'}`,
        severity: 'danger',
      },
    ]
    return base.slice(0, Math.min(badges.activeAnomalies, base.length))
  })()

  return (
    <>
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.employerPortal.pages.overview.title')}
        subtitle={t('dashboard.employerPortal.pages.overview.subtitle')}
      />

      <KpiCards theme={theme} fillRatePercent={fillRatePercent} activeWorkersApprox={activeWorkersApprox} openPostings={summary.openPostings} pendingApplications={summary.pendingApplications} t={t} />

      {error ? (
        <p
          className={`rounded-xl border px-3 py-2 text-sm ${
            theme === 'dark'
              ? 'border-amber-400/30 bg-amber-400/10 text-amber-100'
              : 'border-amber-300 bg-amber-50 text-amber-800'
          }`}
        >
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        <AnomaliesPanel theme={theme} toneClass={toneClass} anomalies={anomalies} activeAnomalies={badges.activeAnomalies} t={t} />
        <PostingsPanel theme={theme} toneClass={toneClass} loading={loading} postings={postings} selectedPostingId={selectedPostingId} setSelectedPostingId={setSelectedPostingId} t={t} />
        <CandidateFlowPanel theme={theme} toneClass={toneClass} selectedPostingId={selectedPostingId} applications={applications} t={t} />
      </div>
    </>
  )
}
