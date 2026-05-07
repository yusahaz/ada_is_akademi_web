import { Navigate, Route, Routes } from 'react-router-dom'

import { WorkerLayout } from '../../features/worker/WorkerLayout'
import { JobsPage } from '../../features/worker/pages/JobsPage'
import { MyShiftsPage } from '../../features/worker/pages/MyShiftsPage'
import { NotificationsPage } from '../../features/worker/pages/NotificationsPage'
import { OverviewPage } from '../../features/worker/pages/OverviewPage'
import { ProfilePage } from '../../features/worker/pages/ProfilePage'
import { WalletPage } from '../../features/worker/pages/WalletPage'

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
        <Route path="jobs" element={<JobsPage />} />
        <Route path="shifts" element={<MyShiftsPage />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="notifications" element={<NotificationsPage />} />

        {/* Backward-compatible redirects to new IA */}
        <Route
          path="applications"
          element={<Navigate to="/worker/jobs?tab=applications" replace />}
        />
        <Route
          path="recommendations"
          element={<Navigate to="/worker/jobs?tab=recommendations" replace />}
        />
        <Route
          path="qr-check"
          element={<Navigate to="/worker/shifts?tab=active" replace />}
        />
        <Route
          path="payouts"
          element={<Navigate to="/worker/wallet?tab=payouts" replace />}
        />
        <Route
          path="reports"
          element={<Navigate to="/worker/wallet?tab=earnings" replace />}
        />
        <Route
          path="cv-import"
          element={<Navigate to="/worker/profile?section=cvImport" replace />}
        />

        <Route path="*" element={<Navigate to="/worker" replace />} />
      </Routes>
    </WorkerLayout>
  )
}
