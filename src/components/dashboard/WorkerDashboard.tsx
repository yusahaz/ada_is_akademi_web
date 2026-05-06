import { Navigate, Route, Routes } from 'react-router-dom'

import { WorkerLayout } from '../../features/worker/WorkerLayout'
import { ApplicationsPage } from '../../features/worker/pages/ApplicationsPage'
import { CvImportPage } from '../../features/worker/pages/CvImportPage'
import { OverviewPage } from '../../features/worker/pages/OverviewPage'
import { PayoutsPage } from '../../features/worker/pages/PayoutsPage'
import { ProfilePage } from '../../features/worker/pages/ProfilePage'
import { QrCheckPage } from '../../features/worker/pages/QrCheckPage'
import { RecommendationsPage } from '../../features/worker/pages/RecommendationsPage'
import { ReportsPage } from '../../features/worker/pages/ReportsPage'
import { ShiftsPage } from '../../features/worker/pages/ShiftsPage'

type WorkerDashboardProps = {
  isSidebarOpen: boolean
  onSidebarClose: () => void
}

export function WorkerDashboard({ isSidebarOpen, onSidebarClose }: WorkerDashboardProps) {
  return (
    <WorkerLayout isSidebarOpen={isSidebarOpen} onSidebarClose={onSidebarClose}>
      <Routes>
        <Route index element={<OverviewPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="cv-import" element={<CvImportPage />} />
        <Route path="shifts" element={<ShiftsPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="qr-check" element={<QrCheckPage />} />
        <Route path="payouts" element={<PayoutsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/worker" replace />} />
      </Routes>
    </WorkerLayout>
  )
}
