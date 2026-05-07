import { InteractiveButton } from '../../../../../shared/ui/ui-primitives'

export function PostingsFilters({
  theme,
  postingsFilter,
  setPostingsFilter,
  onCreate,
  t,
}: {
  theme: 'dark' | 'light'
  postingsFilter: 'all' | 'open' | 'draft' | 'completed'
  setPostingsFilter: (value: 'all' | 'open' | 'draft' | 'completed') => void
  onCreate: () => void
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  const sectionButtonClass = (isActiveButton: boolean) => `inline-flex ${isActiveButton ? 'is-active' : ''}`
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {([
          ['all', t('dashboard.employer.postings.filters.all')],
          ['open', t('dashboard.employer.postings.filters.open')],
          ['draft', t('dashboard.employer.postings.filters.draft')],
          ['completed', t('dashboard.employer.postings.filters.completed')],
        ] as ['all' | 'open' | 'draft' | 'completed', string][]).map(([key, label]) => (
          <button key={key} type="button" className={sectionButtonClass(postingsFilter === key)} onClick={() => setPostingsFilter(key)}>
            <InteractiveButton theme={theme} isActive={postingsFilter === key}>{label}</InteractiveButton>
          </button>
        ))}
      </div>
      <button type="button" onClick={onCreate}>
        <InteractiveButton theme={theme} isActive>{t('dashboard.employerSpot.operations.tabs.createPosting')}</InteractiveButton>
      </button>
    </div>
  )
}
