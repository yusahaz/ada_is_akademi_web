import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '../../lib/cn'

import type { AppTheme } from '../../theme/theme-context'

export type WorkerTone = AppTheme

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
        'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 disabled:opacity-50',
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
        'inline-flex items-center justify-center rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 disabled:opacity-50',
        tone === 'dark'
          ? 'border-white/15 bg-white/[0.04] text-white/85 hover:bg-white/[0.08]'
          : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
        className,
      )}
      {...props}
    />
  )
}
