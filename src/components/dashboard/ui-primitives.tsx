import type { ReactNode } from 'react'

type ThemeMode = 'light' | 'dark'

type SurfaceProps = {
  theme: ThemeMode
  children: ReactNode
  className?: string
}

type BadgeProps = {
  theme: ThemeMode
  children: ReactNode
  className?: string
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

export function GlowBadge({ theme, children, className }: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]',
        theme === 'dark'
          ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100'
          : 'border-sky-300 bg-sky-100 text-sky-700',
        className,
      )}
    >
      {children}
    </span>
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
