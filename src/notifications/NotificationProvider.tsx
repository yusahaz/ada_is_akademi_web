import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../theme/theme-context'
import { setApiMutationToastHandlers } from '../api/core/client'
import {
  NotificationContext,
  type NotificationTone,
  type NotifyInput,
  type NotificationContextValue,
} from './notification-context'

type Toast = {
  id: number
  title?: string
  message: string
  tone: NotificationTone
}

const DEFAULT_DURATION_MS = 3600

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const notify = useCallback(
    (input: NotifyInput) => {
      const id = Date.now() + Math.floor(Math.random() * 1000)
      const tone = input.tone ?? 'info'
      const next: Toast = {
        id,
        title: input.title,
        message: input.message,
        tone,
      }
      setToasts((prev) => [...prev, next])

      const duration = input.durationMs ?? DEFAULT_DURATION_MS
      if (duration > 0) {
        window.setTimeout(() => removeToast(id), duration)
      }
    },
    [removeToast],
  )

  const value = useMemo<NotificationContextValue>(
    () => ({
      notify,
      success: (message, title) => notify({ tone: 'success', message, title }),
      error: (message, title) => notify({ tone: 'error', message, title }),
      info: (message, title) => notify({ tone: 'info', message, title }),
    }),
    [notify],
  )

  useEffect(() => {
    setApiMutationToastHandlers({
      success: (message) => value.success(message),
      error: (message) => value.error(message),
      messages: () => ({
        success: t('dashboard.common.action.success'),
        error: t('dashboard.common.action.error'),
      }),
      formatError: (error) => {
        // 1) Prefer translated error codes (validation codes included).
        if (error.code) {
          const translated = t(`errors.codes.${error.code}`, { defaultValue: '' })
          if (translated) return translated
        }

        // 2) Field errors: show first one in a user-friendly wrapper.
        const fieldErrors = Array.isArray(error.fieldErrors) ? error.fieldErrors : null
        if (fieldErrors && fieldErrors.length > 0) {
          return t('errors.validation.fieldError', { detail: String(fieldErrors[0]) })
        }

        // 3) Fallback: use safe API message if present.
        if (error.message) return error.message
        return null
      },
    })
    return () => setApiMutationToastHandlers(null)
  }, [t, value])

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed end-3 top-20 z-[70] flex w-[min(92vw,380px)] flex-col gap-2">
        {toasts.map((toast) => {
          const toneCls =
            toast.tone === 'success'
              ? theme === 'dark'
                ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100'
                : 'border-emerald-300 bg-emerald-50 text-emerald-800'
              : toast.tone === 'error'
                ? theme === 'dark'
                  ? 'border-rose-400/40 bg-rose-500/15 text-rose-100'
                  : 'border-rose-300 bg-rose-50 text-rose-800'
                : theme === 'dark'
                  ? 'border-sky-400/35 bg-sky-500/12 text-sky-100'
                  : 'border-sky-300 bg-sky-50 text-sky-800'

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-xl border px-3 py-2 shadow-sm backdrop-blur ${toneCls}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {toast.title ? <p className="text-xs font-semibold">{toast.title}</p> : null}
                  <p className="text-sm">{toast.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="rounded-md px-2 py-0.5 text-xs opacity-80 transition hover:opacity-100"
                >
                  ×
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </NotificationContext.Provider>
  )
}
