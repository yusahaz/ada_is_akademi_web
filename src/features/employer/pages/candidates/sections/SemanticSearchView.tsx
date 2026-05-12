import { useState } from 'react'
import { InteractiveButton, StatePanel } from '../../../../../shared/ui/ui-primitives'

type SemanticResult = { workerId: number; fullName: string; semanticScore: number }

export function SemanticSearchView({
  theme,
  toneClass,
  searchText,
  setSearchText,
  runSemanticSearch,
  semanticResults,
  skillSuggestions,
  t,
}: {
  theme: 'dark' | 'light'
  toneClass: string
  searchText: string
  setSearchText: (value: string) => void
  runSemanticSearch: (text: string) => Promise<void> | void
  semanticResults: SemanticResult[]
  skillSuggestions: string[]
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  const sectionButtonClass = () => 'inline-flex'
  const hasResults = semanticResults.length > 0
  const filteredSuggestions =
    searchText.trim().length === 0
      ? skillSuggestions.slice(0, 8)
      : skillSuggestions
          .filter((skill) => skill.toLocaleLowerCase().includes(searchText.trim().toLocaleLowerCase()))
          .slice(0, 8)
  const showSuggestions = filteredSuggestions.length > 0
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (query?: string) => {
    if (isSearching) return
    setIsSearching(true)
    try {
      await Promise.resolve(runSemanticSearch(query ?? searchText))
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('dashboard.employerSpot.intelligence.semanticSearch.title')}</h2>
          <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.intelligence.semanticSearch.subtitle')}</p>
        </div>
        {hasResults ? (
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${theme === 'dark' ? 'bg-cyan-300/15 text-cyan-100' : 'bg-sky-100 text-sky-700'}`}>
            {semanticResults.length}
          </span>
        ) : null}
      </div>

      <div className={`rounded-2xl border p-2.5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white/70'}`}>
        <div className="flex flex-wrap gap-2">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void handleSearch()
              }
            }}
            placeholder={t('dashboard.employerSpot.intelligence.semanticSearch.placeholder')}
            className={`h-11 min-w-52 flex-1 rounded-xl border px-3 text-sm ${theme === 'dark' ? 'border-white/15 bg-white/[0.04] text-white placeholder:text-white/40' : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400'}`}
          />
          <button type="button" className={sectionButtonClass()} onClick={() => void handleSearch()} disabled={isSearching}>
            <InteractiveButton theme={theme}>
              {isSearching ? `${t('dashboard.employerSpot.intelligence.semanticSearch.search')}...` : t('dashboard.employerSpot.intelligence.semanticSearch.search')}
            </InteractiveButton>
          </button>
        </div>
        {showSuggestions ? (
          <div
            className={`mt-2 max-h-44 overflow-auto rounded-xl border p-1 ${
              theme === 'dark' ? 'border-white/10 bg-[#0f172a]/80' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex flex-wrap gap-1.5">
              {filteredSuggestions.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => {
                    setSearchText(skill)
                    void handleSearch(skill)
                  }}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                    theme === 'dark'
                      ? 'bg-white/[0.06] text-white/90 hover:bg-cyan-400/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-sky-100 hover:text-sky-800'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {hasResults ? (
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          {semanticResults.map((item) => (
            <div key={item.workerId} className={`rounded-2xl border p-3.5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`truncate text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.fullName}</p>
                  <p className={`mt-1 text-xs ${toneClass}`}>#{item.workerId}</p>
                </div>
                <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-1 text-xs font-semibold ${theme === 'dark' ? 'bg-sky-500/15 text-sky-100' : 'bg-sky-100 text-sky-700'}`}>
                  {t('dashboard.employer.candidates.score')}: {item.semanticScore}%
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <StatePanel
          theme={theme}
          text={searchText.trim().length > 0 ? t('dashboard.employer.candidates.empty') : t('dashboard.employerSpot.intelligence.semanticSearch.placeholder')}
        />
      )}
      <p className={`text-xs ${toneClass}`}>{t('dashboard.employerSpot.intelligence.semanticSearch.hint')}</p>
    </div>
  )
}
