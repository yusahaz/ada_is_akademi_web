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
    spotSummary,
  } = useEmployerPortal()
  const toneClass = theme === 'dark' ? 'text-white/70' : 'text-slate-600'

  const fillRatePercent =
    spotSummary != null
      ? Math.min(100, Math.max(0, Math.round(Number(spotSummary.dailyFillRatePercent))))
      : postings.length === 0
        ? 0
        : Math.min(100, Math.round((applications.length / (postings.length * 3)) * 100))

  const activeWorkersApprox =
    spotSummary != null
      ? spotSummary.activeWorkerCount
      : Math.min(
          applications.filter((item) => String(item.status).toLowerCase().includes('accepted')).length +
            Math.floor(applications.length / 4),
          999,
        )

  const anomalies: SpotAnomalyItem[] = (() => {
    const prefix = t('dashboard.employerSpot.anomalies.itemPrefix')
    if (badges.activeAnomalies === 0) return []
    return activeAssignments
      .filter((item) => item.isAnomalyFlagged)
      .slice(0, 3)
      .map((item) => ({
        key: String(item.assignmentId),
        title: item.anomalyType ?? t('dashboard.employerSpot.anomalies.gpsError'),
        detail: `${prefix} #${item.assignmentId} • ${t('dashboard.employerSpot.common.candidate')} ${item.workerId}`,
        severity: item.anomalyType?.toLowerCase().includes('replay') ? 'danger' : 'warning',
      }))
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
