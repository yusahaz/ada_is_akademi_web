import { useEffect, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, AlertTriangle, Loader2, Trash2, X } from 'lucide-react'

import { cn } from '../../../shared/lib/cn'

type ThemeMode = 'light' | 'dark'

type EmployerDeleteConfirmDialogProps = {
  open: boolean
  theme: ThemeMode
  busy: boolean
  /** When set, shown as context under the title (e.g. employer/candidate display name). */
  entityName?: string | null
  /** Backward-compatible alias. */
  employerName?: string | null
  kickerText?: string
  titleText?: string
  contextPrefixText?: string
  descriptionText?: string
  warningText?: string
  cancelText?: string
  confirmText?: string
  workingText?: string
  onClose: () => void
  onConfirm: () => void
}

export function EmployerDeleteConfirmDialog({
  open,
  theme,
  busy,
  entityName,
  employerName,
  kickerText,
  titleText,
  contextPrefixText,
  descriptionText,
  warningText,
  cancelText,
  confirmText,
  workingText,
  onClose,
  onConfirm,
}: EmployerDeleteConfirmDialogProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open || busy) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, busy, onClose])

  if (!open) return null

  const name = (entityName ?? employerName)?.trim()

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-[3px] sm:items-center sm:p-4"
      role="presentation"
      onClick={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          'flex max-h-[min(92vh,640px)] w-full max-w-lg flex-col shadow-[0_25px_80px_-20px_rgba(15,23,42,0.45)] sm:rounded-3xl',
          theme === 'dark'
            ? 'border-t border-white/10 bg-[#0f172a] text-white sm:border sm:border-white/10'
            : 'border-t border-slate-200/80 bg-white text-slate-900 sm:border sm:border-slate-200/90',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={cn(
            'flex items-start gap-4 px-5 pb-4 pt-5 sm:gap-5 sm:px-6 sm:pb-5 sm:pt-6',
            theme === 'dark' ? 'bg-gradient-to-b from-rose-500/12 to-transparent' : 'bg-gradient-to-b from-rose-50/90 to-transparent',
          )}
        >
          <span
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border sm:h-14 sm:w-14',
              theme === 'dark' ? 'border-rose-400/35 bg-rose-500/20 text-rose-200' : 'border-rose-200 bg-rose-100 text-rose-700',
            )}
            aria-hidden
          >
            <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-600/90 dark:text-rose-300/90">
              {kickerText ?? t('dashboard.admin.employers.delete.dialogKicker')}
            </p>
            <h2 id={titleId} className="mt-1 font-display text-xl font-semibold leading-snug sm:text-2xl">
              {titleText ?? t('dashboard.admin.employers.delete.title')}
            </h2>
            {name ? (
              <p
                className={cn(
                  'mt-2 inline-flex max-w-full rounded-lg border px-2.5 py-1 text-sm font-medium',
                  theme === 'dark' ? 'border-white/12 bg-white/[0.06] text-white/90' : 'border-slate-200 bg-slate-50 text-slate-800',
                )}
              >
                {(contextPrefixText ?? 'Kayıt') + `: ${name}`}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 sm:px-6">
          <p id={descriptionId} className={cn('text-sm leading-relaxed', theme === 'dark' ? 'text-white/78' : 'text-slate-600')}>
            {descriptionText ?? t('dashboard.admin.detail.feedback.deleteConfirm')}
          </p>
          <div
            className={cn(
              'flex gap-3 rounded-2xl border px-3.5 py-3 text-sm leading-snug',
              theme === 'dark'
                ? 'border-amber-400/25 bg-amber-500/[0.12] text-amber-100/95'
                : 'border-amber-200/90 bg-amber-50 text-amber-950',
            )}
            role="note"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" aria-hidden />
            <span>{warningText ?? t('dashboard.admin.employers.delete.dialogWarning')}</span>
          </div>
        </div>

        <div
          className={cn(
            'mt-auto flex flex-col-reverse gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6 sm:py-5',
            theme === 'dark' ? 'border-white/10 bg-black/20' : 'border-slate-100 bg-slate-50/80',
          )}
        >
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className={cn(
              'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:min-w-[7.5rem]',
              theme === 'dark'
                ? 'border-white/18 bg-white/[0.04] text-white hover:bg-white/[0.09]'
                : 'border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50',
            )}
          >
            <X className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            {cancelText ?? t('dashboard.admin.employers.delete.cancel')}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={cn(
              'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50 disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:min-w-[7.5rem]',
              theme === 'dark'
                ? 'border-rose-400/45 bg-rose-600 text-white hover:bg-rose-500'
                : 'border-rose-600 bg-rose-600 text-white shadow-sm hover:bg-rose-700',
            )}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
            ) : (
              <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
            )}
            {busy ? (workingText ?? t('dashboard.admin.employers.delete.working')) : (confirmText ?? t('dashboard.admin.employers.delete.confirm'))}
          </button>
        </div>
      </div>
    </div>
  )
}

export const ConfirmDeleteDialog = EmployerDeleteConfirmDialog
