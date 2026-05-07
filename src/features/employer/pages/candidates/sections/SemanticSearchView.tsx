import type { JobApplicationListItem } from '../../../../../api/jobs/job-applications'
import { InteractiveButton } from '../../../../../shared/ui/ui-primitives'

type SemanticResult = { workerId: number; fullName: string; semanticScore: number }

export function SemanticSearchView({
  theme,
  toneClass,
  searchText,
  setSearchText,
  runSemanticSearch,
  semanticResults,
  candidateGroups,
  t,
}: {
  theme: 'dark' | 'light'
  toneClass: string
  searchText: string
  setSearchText: (value: string) => void
  runSemanticSearch: (text: string) => Promise<void> | void
  semanticResults: SemanticResult[]
  candidateGroups: { pending: JobApplicationListItem[]; accepted: JobApplicationListItem[]; rejected: JobApplicationListItem[] }
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  const sectionButtonClass = () => 'inline-flex'
  return (
    <div className="mt-4 space-y-3">
      <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('dashboard.employerSpot.intelligence.semanticSearch.title')}</h2>
      <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.intelligence.semanticSearch.subtitle')}</p>
      <div className="flex flex-wrap gap-2">
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={t('dashboard.employerSpot.intelligence.semanticSearch.placeholder')}
          className={`h-11 min-w-52 flex-1 rounded-xl border px-3 text-sm ${theme === 'dark' ? 'border-white/15 bg-white/[0.04] text-white placeholder:text-white/40' : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400'}`}
        />
        <button type="button" className={sectionButtonClass()} onClick={() => void runSemanticSearch(searchText)}>
          <InteractiveButton theme={theme}>{t('dashboard.employerSpot.intelligence.semanticSearch.search')}</InteractiveButton>
        </button>
      </div>
      {semanticResults.length > 0 ? (
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          {semanticResults.map((item) => (
            <div key={item.workerId} className={`rounded-xl border p-3 ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.fullName}</p>
              <p className={`mt-1 text-xs ${toneClass}`}>#{item.workerId}</p>
              <p className={`mt-1 text-xs ${toneClass}`}>{t('dashboard.employer.candidates.score')}: {item.semanticScore}%</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          {([['pending', candidateGroups.pending], ['accepted', candidateGroups.accepted], ['rejected', candidateGroups.rejected]] as ['pending' | 'accepted' | 'rejected', JobApplicationListItem[]][]).map(([key, items]) => (
            <div key={key} className={`rounded-xl border p-3 ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${toneClass}`}>{t(`dashboard.employer.candidates.columns.${key}`)}</p>
              <div className="mt-2 space-y-2">
                {items.slice(0, 4).map((item, index) => (
                  <div key={item.applicationId} className={`rounded-lg border px-2 py-2 text-xs ${theme === 'dark' ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white'}`}>
                    <p className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{t('dashboard.employerSpot.common.candidate')} {item.workerId}</p>
                    <p className={`mt-1 ${toneClass}`}>{t('dashboard.employer.candidates.score')}: {Math.max(90 - index * 4, 65)}%</p>
                  </div>
                ))}
                {items.length === 0 ? <p className={`text-xs ${toneClass}`}>{t('dashboard.employer.candidates.empty')}</p> : null}
              </div>
            </div>
          ))}
        </div>
      )}
      <p className={`text-xs ${toneClass}`}>{t('dashboard.employerSpot.intelligence.semanticSearch.hint')}</p>
    </div>
  )
}
