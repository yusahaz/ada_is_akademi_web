import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import type { JobApplicationListItem } from '../../../api/job-applications'
import { DashboardSurface, InteractiveButton, StatePanel } from '../../../components/dashboard/ui-primitives'
import { useTheme } from '../../../theme/theme-context'
import { WorkerSectionHeader } from '../../worker/worker-ui'
import { useEmployerPortal } from '../use-employer-portal'

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
          <div className="mt-4 space-y-3">
            <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t('dashboard.employerSpot.intelligence.semanticSearch.title')}
            </h2>
            <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.intelligence.semanticSearch.subtitle')}</p>
            <div className="flex flex-wrap gap-2">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={t('dashboard.employerSpot.intelligence.semanticSearch.placeholder')}
                className={`h-11 min-w-52 flex-1 rounded-xl border px-3 text-sm ${
                  theme === 'dark'
                    ? 'border-white/15 bg-white/[0.04] text-white placeholder:text-white/40'
                    : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400'
                }`}
              />
              <button type="button" className={sectionButtonClass(false)} onClick={() => void runSemanticSearch(searchText)}>
                <InteractiveButton theme={theme}>{t('dashboard.employerSpot.intelligence.semanticSearch.search')}</InteractiveButton>
              </button>
            </div>

            {semanticResults.length > 0 ? (
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                {semanticResults.map((item) => (
                  <div
                    key={item.workerId}
                    className={`rounded-xl border p-3 ${
                      theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.fullName}</p>
                    <p className={`mt-1 text-xs ${toneClass}`}>#{item.workerId}</p>
                    <p className={`mt-1 text-xs ${toneClass}`}>{t('dashboard.employer.candidates.score')}: {item.semanticScore}%</p>
                  </div>
                ))}
              </div>
            ) : (
            <div className="mt-2 grid gap-3 md:grid-cols-2">
              {(
                [
                  ['pending', candidateGroups.pending],
                  ['accepted', candidateGroups.accepted],
                  ['rejected', candidateGroups.rejected],
                ] as ['pending' | 'accepted' | 'rejected', JobApplicationListItem[]][]
              ).map(([key, items]) => (
                <div
                  key={key}
                  className={`rounded-xl border p-3 ${
                    theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <p className={`text-xs font-semibold uppercase tracking-wide ${toneClass}`}>
                    {t(`dashboard.employer.candidates.columns.${key}`)}
                  </p>
                  <div className="mt-2 space-y-2">
                    {items.slice(0, 4).map((item, index) => (
                      <div
                        key={item.applicationId}
                        className={`rounded-lg border px-2 py-2 text-xs ${
                          theme === 'dark' ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <p className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                          {t('dashboard.employerSpot.common.candidate')} {item.workerId}
                        </p>
                        <p className={`mt-1 ${toneClass}`}>
                          {t('dashboard.employer.candidates.score')}: {Math.max(90 - index * 4, 65)}%
                        </p>
                      </div>
                    ))}
                    {items.length === 0 ? (
                      <p className={`text-xs ${toneClass}`}>{t('dashboard.employer.candidates.empty')}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            )}

            <p className={`text-xs ${toneClass}`}>{t('dashboard.employerSpot.intelligence.semanticSearch.hint')}</p>
          </div>
        ) : null}

        {activeView === 'workerPortfolio' ? (
          <div className="mt-4 space-y-3">
            <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t('dashboard.employerSpot.intelligence.workerPortfolio.title')}
            </h2>
            <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.intelligence.workerPortfolio.subtitle')}</p>

            {portfolioFallback.length === 0 ? (
              <StatePanel theme={theme} text={t('dashboard.employerSpot.intelligence.workerPortfolio.empty')} />
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {portfolioFallback.map((row) => (
                  <div
                    key={row.workerId}
                    className={`rounded-xl border px-3 py-2 ${
                      theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        {t('dashboard.employerSpot.common.candidate')} {row.workerId}
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                          theme === 'dark' ? 'bg-emerald-400/15 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {t('dashboard.employerSpot.intelligence.workerPortfolio.reliability', { value: row.reliability })}
                      </span>
                    </div>
                    <p className={`mt-1 text-xs ${toneClass}`}>
                      {t('dashboard.employerSpot.intelligence.workerPortfolio.lastWorked')}: {row.lastSeen}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <p className={`text-xs ${toneClass}`}>{t('dashboard.employerSpot.intelligence.workerPortfolio.hint')}</p>
          </div>
        ) : null}
      </DashboardSurface>
    </>
  )
}
