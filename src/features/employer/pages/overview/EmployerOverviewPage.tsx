import { useTranslation } from 'react-i18next'

import { useTheme } from '../../../../theme/theme-context'
import { WorkerSectionHeader } from '../../../worker/worker-ui'
import { useEmployerPortal } from '../../portal/use-employer-portal'
import { AnomaliesPanel, KpiCards, PostingsPanel, type SpotAnomalyItem } from './sections'

export function EmployerOverviewPage() {
  const { t, i18n } = useTranslation()
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
    spotSummary,
  } = useEmployerPortal()
  const toneClass = theme === 'dark' ? 'text-white/70' : 'text-slate-600'
  const locale = i18n.resolvedLanguage ?? i18n.language

  const fillRatePercent =
    spotSummary != null
      ? Math.min(100, Math.max(0, Math.round(Number(spotSummary.dailyFillRatePercent))))
      : 0

  const activeWorkersApprox =
    spotSummary != null
      ? spotSummary.activeWorkerCount
      : 0

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

      <KpiCards
        theme={theme}
        fillRatePercent={fillRatePercent}
        activeWorkersApprox={activeWorkersApprox}
        openPostings={summary.openPostings}
        pendingApplications={summary.pendingApplications}
        activeAnomalies={badges.activeAnomalies}
        pendingPayouts={badges.pendingPayouts}
        t={t}
      />

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

      <div className="grid gap-4 xl:grid-cols-2">
        <AnomaliesPanel theme={theme} toneClass={toneClass} anomalies={anomalies} activeAnomalies={badges.activeAnomalies} t={t} />
        <PostingsPanel theme={theme} toneClass={toneClass} loading={loading} postings={postings} selectedPostingId={selectedPostingId} setSelectedPostingId={setSelectedPostingId} t={t} locale={locale} />
      </div>
    </>
  )
}
