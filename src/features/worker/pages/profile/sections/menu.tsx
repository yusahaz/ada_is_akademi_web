import type { TFn, WorkerTone } from './helpers'

export function ProfileSectionMenu({
  theme,
  t,
  active,
  onChange,
  sidebar = false,
}: {
  theme: WorkerTone
  t: TFn
  active: string
  onChange: (next: string) => void
  sidebar?: boolean
}) {
  const items = [
    { id: 'basic', label: t('dashboard.workerPortal.profile.menu.basic') },
    { id: 'experiences', label: t('dashboard.workerPortal.profile.menu.experiences') },
    { id: 'skills', label: t('dashboard.workerPortal.profile.menu.skills') },
    { id: 'certificates', label: t('dashboard.workerPortal.profile.menu.certificates') },
    { id: 'references', label: t('dashboard.workerPortal.profile.menu.references') },
    { id: 'cv', label: t('dashboard.workerPortal.profile.menu.cv') },
    { id: 'availability', label: t('dashboard.workerPortal.profile.menu.availability') },
    { id: 'settings', label: t('dashboard.workerPortal.profile.menu.settings') },
    { id: 'password', label: t('dashboard.workerPortal.profile.menu.password') },
    { id: 'accountControl', label: t('dashboard.workerPortal.profile.menu.accountControl') },
  ]
  return (
    <div
      role="tablist"
      aria-label={t('dashboard.workerPortal.profile.settingsMenu')}
      className={[
        '-mx-1 flex gap-1 px-1 pb-1',
        sidebar
          ? 'flex-wrap lg:mx-0 lg:flex-col lg:gap-1.5 lg:px-0 lg:pb-0'
          : 'flex-wrap items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      ].join(' ')}
    >
      {items.map((item) => {
        const isActive = item.id === active
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={[
              'inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 sm:text-sm',
              sidebar ? 'lg:w-full lg:justify-start lg:rounded-xl lg:px-3 lg:py-2 lg:text-left' : '',
              isActive
                ? theme === 'dark'
                  ? 'bg-cyan-500/20 text-cyan-100 ring-1 ring-inset ring-cyan-300/40'
                  : 'bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-300/70'
                : theme === 'dark'
                  ? 'text-white/65 hover:bg-white/[0.06] hover:text-white/85'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-800',
            ].join(' ')}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

