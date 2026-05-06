import { Navigate, Route, Routes } from 'react-router-dom'

import { EmployerLayout } from '../../features/employer/EmployerLayout'
import { EmployerPortalProvider } from '../../features/employer/employer-portal-provider'
import { EmployerBillingPage } from '../../features/employer/pages/EmployerBillingPage'
import { EmployerCandidatesPage } from '../../features/employer/pages/EmployerCandidatesPage'
import { EmployerOperationsPage } from '../../features/employer/pages/EmployerOperationsPage'
import { EmployerOverviewPage } from '../../features/employer/pages/EmployerOverviewPage'
import { EmployerPostingsPage } from '../../features/employer/pages/EmployerPostingsPage'
import { EmployerReportsPage } from '../../features/employer/pages/EmployerReportsPage'

type EmployerDashboardProps = {
  isSidebarOpen: boolean
  onSidebarClose: () => void
}

export function EmployerDashboard({ isSidebarOpen, onSidebarClose }: EmployerDashboardProps) {
  return (
    <EmployerPortalProvider>
      <EmployerLayout isSidebarOpen={isSidebarOpen} onSidebarClose={onSidebarClose}>
        <Routes>
          <Route index element={<EmployerOverviewPage />} />
          <Route path="postings" element={<EmployerPostingsPage />} />
          <Route path="candidates" element={<EmployerCandidatesPage />} />
          <Route path="operations" element={<EmployerOperationsPage />} />
          <Route path="billing" element={<EmployerBillingPage />} />
          <Route path="reports" element={<EmployerReportsPage />} />
          <Route path="*" element={<Navigate to="/employer" replace />} />
        </Routes>
      </EmployerLayout>
    </EmployerPortalProvider>
  )
}
