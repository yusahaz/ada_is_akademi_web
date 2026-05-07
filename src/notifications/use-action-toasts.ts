import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useNotification } from './notification-context'

export type ActionToastSuccessOptions = {
  messageKey: string
  interpolation?: Record<string, unknown>
}

export type ActionToastErrorOptions = {
  messageKey: string
  interpolation?: Record<string, unknown>
}

export type RunWithToastMessages = {
  success?: ActionToastSuccessOptions
  error: ActionToastErrorOptions
}

/**
 * Mutation aksiyonları için i18n tabanlı toast gösterimi.
 * Hata durumunda toast sonrası hatayı yeniden fırlatır (çağıran try/catch ile devam edebilir).
 */
export function useActionToasts() {
  const notifications = useNotification()
  const { t } = useTranslation()

  const runWithToast = useCallback(
    async <T,>(request: Promise<T>, messages: RunWithToastMessages): Promise<T> => {
      try {
        const result = await request
        if (messages.success) {
          const { messageKey, interpolation } = messages.success
          notifications.success(t(messageKey, interpolation as Record<string, string | number | boolean | Date>))
        }
        return result
      } catch (error) {
        const { messageKey, interpolation } = messages.error
        notifications.error(t(messageKey, interpolation as Record<string, string | number | boolean | Date>))
        throw error
      }
    },
    [notifications, t],
  )

  return { runWithToast }
}
