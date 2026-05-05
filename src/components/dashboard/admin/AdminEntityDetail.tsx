import { type ReactNode, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../../../theme/theme-context'
import { DashboardSurface, InteractiveButton } from '../ui-primitives'

export type AdminEntityDetailBreadcrumbSegment = {
  key: string
  label: string
  onClick?: () => void
}

type AdminEntityDetailProps = {
  title: string
  segments: AdminEntityDetailBreadcrumbSegment[]
  onBack: () => void
  onClose: () => void
  onSave?: () => void | Promise<void>
  onDelete?: () => void | Promise<void>
  pending?: boolean
  saveDisabled?: boolean
  deleteDisabled?: boolean
  successMessage?: string | null
  errorMessage?: string | null
  children: ReactNode
}

function IconChevronStart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AdminEntityDetail({
  title,
  segments,
  onBack,
  onClose,
  onSave,
  onDelete,
  pending = false,
  saveDisabled = false,
  deleteDisabled = false,
  successMessage,
  errorMessage,
  children,
}: AdminEntityDetailProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSave = useCallback(async () => {
    if (!onSave || pending) return
    setLocalError(null)
    try {
      await onSave()
    } catch {
      setLocalError(t('dashboard.admin.detail.feedback.saveError'))
    }
  }, [onSave, pending, t])

  const handleDelete = useCallback(async () => {
    if (!onDelete || pending) return
    const confirmed = window.confirm(t('dashboard.admin.detail.feedback.deleteConfirm'))
    if (!confirmed) return
    setLocalError(null)
    try {
      await onDelete()
    } catch {
      setLocalError(t('dashboard.admin.detail.feedback.deleteError'))
    }
  }, [onDelete, pending, t])

  const combinedError = errorMessage ?? localError

  const btnBase =
    'inline-flex min-h-10 items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition disabled:opacity-50 sm:text-sm'

  return (
    <div className="space-y-4">
      <DashboardSurface theme={theme} className="border-b pb-4">
        <div className="flex flex-wrap items-start gap-2 sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
                theme === 'dark'
                  ? 'border-white/15 text-white hover:bg-white/10'
                  : 'border-slate-300 text-slate-800 hover:bg-slate-100'
              }`}
              aria-label={t('dashboard.admin.detail.backAria')}
            >
              <IconChevronStart className="h-5 w-5 rtl:rotate-180" />
            </button>

            <nav
              className="min-w-0 flex flex-wrap items-center gap-x-1 gap-y-1 text-sm"
              aria-label={t('dashboard.admin.detail.breadcrumbAria')}
            >
              {segments.map((segment, index) => (
                <span key={segment.key} className="inline-flex min-w-0 items-center gap-1">
                  {index > 0 ? (
                    <span
                      className={theme === 'dark' ? 'text-white/35' : 'text-slate-400'}
                      aria-hidden
                    >
                      /
                    </span>
                  ) : null}
                  {segment.onClick ? (
                    <button
                      type="button"
                      onClick={segment.onClick}
                      className={`truncate text-start underline-offset-2 hover:underline ${
                        theme === 'dark' ? 'text-sky-200' : 'text-sky-700'
                      }`}
                    >
                      {segment.label}
                    </button>
                  ) : (
                    <span
                      className={`truncate font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {segment.label}
                    </span>
                  )}
                </span>
              ))}
            </nav>
          </div>

          <div className="flex w-full flex-wrap items-stretch gap-2 sm:ms-auto sm:w-auto sm:justify-end">
            {onSave ? (
              <button
                type="button"
                disabled={pending || saveDisabled}
                onClick={() => void handleSave()}
                className={btnBase}
              >
                <InteractiveButton theme={theme} isActive>
                  {pending ? t('dashboard.admin.detail.actions.processing') : t('dashboard.admin.detail.actions.save')}
                </InteractiveButton>
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                disabled={pending || deleteDisabled}
                onClick={() => void handleDelete()}
                className={btnBase}
              >
                <InteractiveButton theme={theme}>
                  {pending ? t('dashboard.admin.detail.actions.processing') : t('dashboard.admin.detail.actions.delete')}
                </InteractiveButton>
              </button>
            ) : null}
            <button
              type="button"
              disabled={pending}
              onClick={onClose}
              className={btnBase}
            >
              <InteractiveButton theme={theme}>{t('dashboard.admin.detail.actions.close')}</InteractiveButton>
            </button>
          </div>
        </div>

        <h3
          className={`font-display text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}
        >
          {title}
        </h3>
      </DashboardSurface>

      {combinedError ? (
        <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
          {combinedError}
        </p>
      ) : null}
      {successMessage ? (
        <p className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
          {successMessage}
        </p>
      ) : null}

      <div className="min-w-0 space-y-4">{children}</div>
    </div>
  )
}
