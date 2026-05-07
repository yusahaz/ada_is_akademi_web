import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { DashboardSurface, InteractiveButton } from '../../../../shared/ui/ui-primitives'
import { useTheme } from '../../../../theme/theme-context'
import { WorkerSectionHeader } from '../../../worker/worker-ui'
import { useEmployerPortal } from '../../portal/use-employer-portal'
import { SemanticSearchView, WorkerPortfolioView } from './sections'

type IntelligenceView = 'semanticSearch' | 'workerPortfolio'

export function EmployerCandidatesPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { candidateGroups, semanticResults, runSemanticSearch, workerPortfolio } = useEmployerPortal()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchText, setSearchText] = useState('')
  const toneClass = theme === 'dark' ? 'text-white/70' : 'text-slate-600'
  const activeView = (searchParams.get('view') as IntelligenceView | null) ?? 'semanticSearch'
  const setView = (view: IntelligenceView) => {
    const next = new URLSearchParams(searchParams)
    next.set('view', view)
    setSearchParams(next, { replace: true })
  }
  const sectionButtonClass = (isActiveButton: boolean) => `inline-flex ${isActiveButton ? 'is-active' : ''}`

  const portfolioFallback = useMemo(() => {
    if (workerPortfolio.length > 0) {
      return workerPortfolio.map((item) => ({
        workerId: item.workerId,
        reliability: item.reliabilityScore,
        lastSeen: item.lastWorkedAt ?? '-',
      }))
    }
    const base = [...candidateGroups.accepted, ...candidateGroups.pending].slice(0, 12)
    return base.map((item, index) => ({
      workerId: item.workerId,
      reliability: Math.max(92 - index * 3, 60),
      lastSeen: item.appliedAt,
    }))
  }, [candidateGroups.accepted, candidateGroups.pending, workerPortfolio])

  return (
    <>
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.employerPortal.pages.candidates.title')}
        subtitle={t('dashboard.employerPortal.pages.candidates.subtitle')}
      />
      <DashboardSurface theme={theme}>
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ['semanticSearch', t('dashboard.employerSpot.intelligence.tabs.semanticSearch')],
              ['workerPortfolio', t('dashboard.employerSpot.intelligence.tabs.workerPortfolio')],
            ] as [IntelligenceView, string][]
          ).map(([key, label]) => (
            <button key={key} type="button" onClick={() => setView(key)} className={sectionButtonClass(activeView === key)}>
              <InteractiveButton theme={theme} isActive={activeView === key}>
                {label}
              </InteractiveButton>
            </button>
          ))}
        </div>

        {activeView === 'semanticSearch' ? (
          <SemanticSearchView
            theme={theme}
            toneClass={toneClass}
            searchText={searchText}
            setSearchText={setSearchText}
            runSemanticSearch={runSemanticSearch}
            semanticResults={semanticResults}
            candidateGroups={candidateGroups}
            t={t}
          />
        ) : null}

        {activeView === 'workerPortfolio' ? (
          <WorkerPortfolioView theme={theme} toneClass={toneClass} portfolioRows={portfolioFallback} t={t} />
        ) : null}
      </DashboardSurface>
    </>
  )
}
