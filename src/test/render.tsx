import { StrictMode, type ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'

import { appQueryClient } from '../query/query-client'
import { ThemeProvider } from '../theme/ThemeProvider'
import { NotificationProvider } from '../notifications/NotificationProvider'
import { AuthProvider } from '../features/auth/AuthProvider'

export function AppTestProviders({ children }: { children: ReactNode }) {
  return (
    <StrictMode>
      <BrowserRouter>
        <ThemeProvider>
          <QueryClientProvider client={appQueryClient}>
            <AuthProvider>
              <NotificationProvider>{children}</NotificationProvider>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </BrowserRouter>
    </StrictMode>
  )
}

