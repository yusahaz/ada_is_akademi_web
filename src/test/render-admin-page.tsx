import { type ReactElement } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ThemeProvider } from '../theme/ThemeProvider'
import { NotificationProvider } from '../notifications/NotificationProvider'

export function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location-pathname">{location.pathname}</div>
}

export function renderAtRoute(ui: ReactElement, route: string, path: string) {
  return renderWithRoutes(route, [{ path, element: ui }])
}

export function renderWithRoutes(
  initialEntry: string,
  routes: Array<{ path: string; element: ReactElement }>,
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnMount: false, refetchOnWindowFocus: false, staleTime: Infinity, gcTime: Infinity },
      mutations: { retry: false },
    },
  })

  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <Routes>
              {routes.map((r) => (
                <Route key={r.path} path={r.path} element={r.element} />
              ))}
            </Routes>
          </NotificationProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

