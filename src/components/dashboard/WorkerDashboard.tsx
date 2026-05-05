import { Navigate, Route, Routes } from 'react-router-dom'

import { WorkerShell } from '../../features/worker/WorkerShell'
import { ApplicationsPage } from '../../features/worker/pages/ApplicationsPage'
import { CvImportPage } from '../../features/worker/pages/CvImportPage'
import { OverviewPage } from '../../features/worker/pages/OverviewPage'
import { PayoutsPage } from '../../features/worker/pages/PayoutsPage'
import { ProfilePage } from '../../features/worker/pages/ProfilePage'
import { QrCheckPage } from '../../features/worker/pages/QrCheckPage'
import { ReportsPage } from '../../features/worker/pages/ReportsPage'
import { ShiftsPage } from '../../features/worker/pages/ShiftsPage'

export function WorkerDashboard() {
  return (
    <WorkerShell>
      <Routes>
        <Route index element={<OverviewPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="cv-import" element={<CvImportPage />} />
        <Route path="shifts" element={<ShiftsPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="qr-check" element={<QrCheckPage />} />
        <Route path="payouts" element={<PayoutsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/worker" replace />} />
      </Routes>
    </WorkerShell>
  )
}
