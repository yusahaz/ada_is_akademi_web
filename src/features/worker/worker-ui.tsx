import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '../../shared/lib/cn'

import type { AppTheme } from '../../theme/theme-context'

export type WorkerTone = AppTheme

export type WorkerEmphasis = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

export function WorkerSectionHeader({
  tone,
  title,
  subtitle,
  actions,
}: {
  tone: WorkerTone
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 pb-4">
      <div className="min-w-0">
        <h1
          className={cn(
            'font-display text-lg font-semibold tracking-tight sm:text-xl',
            tone === 'dark' ? 'text-white' : 'text-slate-900',
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className={cn('mt-1 max-w-prose text-sm', tone === 'dark' ? 'text-white/70' : 'text-slate-600')}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function WorkerMuted({ tone, children }: { tone: WorkerTone; children: ReactNode }) {
  return <span className={tone === 'dark' ? 'text-white/70' : 'text-slate-600'}>{children}</span>
}

export function WorkerPillBadge({
  tone,
  emphasis = 'neutral',
  children,
}: {
  tone: WorkerTone
  emphasis?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
  children: ReactNode
}) {
  const emphasisClass =
    emphasis === 'success'
      ? tone === 'dark'
        ? 'bg-emerald-500/15 text-emerald-100 ring-emerald-300/40'
        : 'bg-emerald-50 text-emerald-800 ring-emerald-200/80'
      : emphasis === 'warning'
        ? tone === 'dark'
          ? 'bg-amber-500/15 text-amber-100 ring-amber-300/40'
          : 'bg-amber-50 text-amber-900 ring-amber-200/80'
        : emphasis === 'danger'
          ? tone === 'dark'
            ? 'bg-rose-500/15 text-rose-100 ring-rose-300/40'
            : 'bg-rose-50 text-rose-800 ring-rose-200/80'
          : emphasis === 'info'
            ? tone === 'dark'
              ? 'bg-cyan-500/15 text-cyan-100 ring-cyan-300/40'
              : 'bg-cyan-50 text-cyan-900 ring-cyan-200/80'
            : tone === 'dark'
              ? 'bg-white/10 text-white/80 ring-white/15'
              : 'bg-slate-100 text-slate-700 ring-slate-200'

  return (
    <span className={cn('inline-flex max-w-max items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset', emphasisClass)}>
      {children}
    </span>
  )
}

export function WorkerPrimaryButton({
  tone,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone: WorkerTone }) {
  return (
    <button
      type="button"
      className={cn(
        'worker-flow-btn worker-flow-btn--primary inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 disabled:opacity-50',
        tone === 'dark'
          ? 'bg-gradient-to-r from-cyan-400 via-sky-500 to-teal-500 text-slate-950'
          : 'bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 text-white shadow-sm shadow-cyan-900/25',
        className,
      )}
      {...props}
    />
  )
}

export function WorkerGhostButton({
  tone,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone: WorkerTone }) {
  return (
    <button
      type="button"
      className={cn(
        'worker-flow-btn worker-flow-btn--ghost inline-flex items-center justify-center rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 disabled:opacity-50',
        tone === 'dark'
          ? 'border-white/15 bg-white/[0.04] text-white/85 hover:bg-white/[0.08]'
          : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
        className,
      )}
      {...props}
    />
  )
}

export type WorkerTabItem = {
  id: string
  label: ReactNode
  badge?: number
}

export function WorkerTabs({
  tone,
  items,
  value,
  onChange,
  ariaLabel,
}: {
  tone: WorkerTone
  items: WorkerTabItem[]
  value: string
  onChange: (id: string) => void
  ariaLabel?: string
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        '-mx-1 flex flex-wrap items-center gap-1 overflow-x-auto px-1 pb-1',
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      )}
    >
      {items.map((item) => {
        const isActive = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 sm:text-sm',
              isActive
                ? tone === 'dark'
                  ? 'bg-cyan-500/20 text-cyan-100 ring-1 ring-inset ring-cyan-300/40'
                  : 'bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-300/70'
                : tone === 'dark'
                  ? 'text-white/65 hover:bg-white/[0.06] hover:text-white/85'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-800',
            )}
          >
            <span className="truncate">{item.label}</span>
            {typeof item.badge === 'number' && item.badge > 0 ? (
              <span
                className={cn(
                  'inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-4',
                  isActive
                    ? tone === 'dark'
                      ? 'bg-cyan-300 text-slate-950'
                      : 'bg-sky-600 text-white'
                    : tone === 'dark'
                      ? 'bg-white/15 text-white/85'
                      : 'bg-slate-200 text-slate-700',
                )}
              >
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export type WorkerNoticeVariant = 'info' | 'warning' | 'success' | 'danger'

export function WorkerNotice({
  tone,
  variant = 'info',
  title,
  description,
  action,
  icon,
  className,
}: {
  tone: WorkerTone
  variant?: WorkerNoticeVariant
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  icon?: ReactNode
  className?: string
}) {
  const variantClass = resolveNoticeVariantClass(tone, variant)
  return (
    <div
      role={variant === 'danger' || variant === 'warning' ? 'alert' : 'status'}
      className={cn(
        'flex flex-wrap items-start gap-3 rounded-2xl border px-3 py-3 sm:flex-nowrap sm:px-4',
        variantClass,
        className,
      )}
    >
      {icon ? <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden="true">{icon}</span> : null}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug">{title}</p>
        {description ? <p className="mt-1 text-xs leading-relaxed opacity-90">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center">{action}</div> : null}
    </div>
  )
}

function resolveNoticeVariantClass(tone: WorkerTone, variant: WorkerNoticeVariant) {
  if (variant === 'success') {
    return tone === 'dark'
      ? 'border-emerald-300/30 bg-emerald-500/10 text-emerald-100'
      : 'border-emerald-300/80 bg-emerald-50 text-emerald-900'
  }
  if (variant === 'warning') {
    return tone === 'dark'
      ? 'border-amber-300/30 bg-amber-500/10 text-amber-100'
      : 'border-amber-300/80 bg-amber-50 text-amber-900'
  }
  if (variant === 'danger') {
    return tone === 'dark'
      ? 'border-rose-300/30 bg-rose-500/10 text-rose-100'
      : 'border-rose-300/80 bg-rose-50 text-rose-900'
  }
  return tone === 'dark'
    ? 'border-cyan-300/30 bg-cyan-500/10 text-cyan-100'
    : 'border-sky-300/70 bg-sky-50 text-sky-900'
}

export function WorkerNavBadge({
  tone,
  value,
  compact = false,
}: {
  tone: WorkerTone
  value: number
  compact?: boolean
}) {
  if (value <= 0) return null
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-bold leading-none',
        compact ? 'h-3.5 min-w-[0.875rem] px-1 text-[9px]' : 'h-5 min-w-[1.25rem] px-1.5 text-[10px]',
        tone === 'dark'
          ? 'bg-cyan-300 text-slate-950 shadow-[0_2px_6px_rgba(34,211,238,0.45)]'
          : 'bg-sky-600 text-white shadow-[0_2px_6px_rgba(2,132,199,0.35)]',
      )}
    >
      {value > 99 ? '99+' : value}
    </span>
  )
}
