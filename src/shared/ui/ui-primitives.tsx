import type { ReactNode } from 'react'

type ThemeMode = 'light' | 'dark'

type SurfaceProps = {
  theme: ThemeMode
  children: ReactNode
  className?: string
}

type HeroProps = {
  theme: ThemeMode
  title: string
  description: string
  children?: ReactNode
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function DashboardSurface({ theme, children, className }: SurfaceProps) {
  return (
    <article
      className={cx(
        'relative overflow-hidden rounded-3xl border p-4 transition-all duration-300 sm:p-5',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_45%)]',
        theme === 'dark'
          ? 'border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] shadow-[0_10px_30px_rgba(8,15,35,0.35)]'
          : 'border-slate-300/80 bg-gradient-to-b from-white to-sky-50/40 shadow-[0_10px_24px_rgba(15,23,42,0.08)]',
        className,
      )}
    >
      {children}
    </article>
  )
}

export function DashboardHero({ theme, title, description, children }: HeroProps) {
  return (
    <article
      className={cx(
        'relative overflow-hidden rounded-3xl border p-5 sm:p-7',
        theme === 'dark'
          ? 'border-white/10 bg-[linear-gradient(135deg,rgba(20,241,217,0.16),rgba(15,23,42,0.92)_42%,rgba(2,6,23,0.95))]'
          : 'border-sky-200 bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(255,255,255,0.97)_45%,rgba(240,249,255,0.9))]',
      )}
    >
      <div
        className={cx(
          'relative z-[1]',
          children
            ? 'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6'
            : 'max-w-3xl',
        )}
      >
        <div className={cx(children ? 'min-w-0 flex-1' : undefined)}>
          <h1 className={cx('font-display text-2xl font-semibold sm:text-3xl', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
            {title}
          </h1>
          <p className={cx('mt-2 text-sm leading-6 sm:text-base', theme === 'dark' ? 'text-white/75' : 'text-slate-700')}>
            {description}
          </p>
        </div>
        {children ? (
          <div className="flex w-full min-w-0 shrink-0 items-center justify-end sm:w-auto">{children}</div>
        ) : null}
      </div>
      <div
        aria-hidden
        className={cx(
          'pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl',
          theme === 'dark' ? 'bg-cyan-300/20' : 'bg-sky-300/30',
        )}
      />
    </article>
  )
}

export function InteractiveButton({
  theme,
  isActive = false,
  className,
  children,
}: {
  theme: ThemeMode
  isActive?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cx(
        'inline-flex min-h-10 items-center rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 sm:text-sm',
        'hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(56,189,248,0.18)]',
        isActive
          ? theme === 'dark'
            ? 'border-cyan-300/45 bg-cyan-300/12 text-cyan-100'
            : 'border-sky-300 bg-sky-50 text-sky-700'
          : theme === 'dark'
            ? 'border-white/15 bg-white/[0.04] text-white/80 hover:bg-white/[0.08]'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function StatePanel({
  theme,
  text,
  isError = false,
}: {
  theme: ThemeMode
  text: string
  isError?: boolean
}) {
  return (
    <p
      className={cx(
        'rounded-2xl border px-3 py-2 text-sm',
        isError
          ? theme === 'dark'
            ? 'border-amber-400/30 bg-amber-500/10 text-amber-100'
            : 'border-amber-300 bg-amber-50 text-amber-800'
          : theme === 'dark'
            ? 'border-white/10 bg-white/[0.04] text-white/75'
            : 'border-slate-300/80 bg-white text-slate-700',
      )}
    >
      {text}
    </p>
  )
}
