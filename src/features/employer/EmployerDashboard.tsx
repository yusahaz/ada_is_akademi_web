import { Navigate, Route, Routes } from 'react-router-dom'

import { EmployerLayout } from './EmployerLayout'
import { EmployerPortalProvider } from './portal/employer-portal-provider'
import { EmployerBillingPage } from './pages/billing/EmployerBillingPage'
import { EmployerCandidatesPage } from './pages/candidates/EmployerCandidatesPage'
import { EmployerCreatePostingPage } from './pages/postings/EmployerCreatePostingPage'
import { EmployerDisputesPage } from './pages/disputes/EmployerDisputesPage'
import { EmployerOperationsPage } from './pages/operations/EmployerOperationsPage'
import { EmployerOverviewPage } from './pages/overview/EmployerOverviewPage'
import { EmployerPostingsPage } from './pages/postings/EmployerPostingsPage'
import { EmployerReportsPage } from './pages/reports/EmployerReportsPage'

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
          <Route path="postings/create" element={<EmployerCreatePostingPage />} />
          <Route path="candidates" element={<EmployerCandidatesPage />} />
          <Route path="operations" element={<EmployerOperationsPage />} />
          <Route path="billing" element={<EmployerBillingPage />} />
          <Route path="reports" element={<EmployerReportsPage />} />
          <Route path="disputes" element={<EmployerDisputesPage />} />
          <Route path="*" element={<Navigate to="/employer" replace />} />
        </Routes>
      </EmployerLayout>
    </EmployerPortalProvider>
  )
}
