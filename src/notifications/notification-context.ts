import { createContext, useContext } from 'react'

export type NotificationTone = 'success' | 'error' | 'info'

export type NotifyInput = {
  title?: string
  message: string
  tone?: NotificationTone
  durationMs?: number
}

export type NotificationContextValue = {
  notify: (input: NotifyInput) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
}

export const NotificationContext = createContext<NotificationContextValue | null>(null)

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}
