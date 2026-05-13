import { Navigate, useParams } from 'react-router-dom'

import { AdminLayout } from './AdminLayout'
import { AdminOverviewPage } from './AdminOverviewPage'
import { AdminSectionPlaceholder } from './AdminSectionPlaceholder'
import { AdminEmployerCreatePage } from './pages/AdminEmployerCreatePage'
import { AdminEmployerDetailPage } from './pages/AdminEmployerDetailPage'
import { AdminEmployersPage } from './pages/AdminEmployersPage'
import { AdminCandidateDetailPage } from './pages/AdminCandidateDetailPage'
import { AdminCandidatesPage } from './pages/AdminCandidatesPage'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { AdminUserDetailPage } from './pages/AdminUserDetailPage'
import { AdminUserCreatePage } from './pages/AdminUserCreatePage'
import { AdminProfilePage } from './pages/AdminProfilePage'
import { AdminCommissionRulesPage } from './pages/AdminCommissionRulesPage'
import { AdminCommissionRuleDetailPage } from './pages/AdminCommissionRuleDetailPage'

type AdminDashboardProps = {
  isSidebarOpen: boolean
  onSidebarClose: () => void
}

const ADMIN_SECTIONS = new Set([
  'overview',
  'profile',
  'employers',
  'candidates',
  'users',
  'userGroups',
  'createAdmin',
  'commission-rules',
])

export function AdminDashboard({ isSidebarOpen, onSidebarClose }: AdminDashboardProps) {
  const params = useParams<{ section?: string; entityId?: string }>()
  const section = params.section ?? ''

  if (!params.section || !ADMIN_SECTIONS.has(section)) {
    return <Navigate to="/admin/overview" replace />
  }

  const content =
    section === 'overview' ? (
      <AdminOverviewPage />
    ) : section === 'profile' ? (
      <AdminProfilePage />
    ) : section === 'commission-rules' &&
      params.entityId &&
      params.entityId !== 'new' &&
      Number.isFinite(Number(params.entityId)) &&
      Number(params.entityId) > 0 ? (
      <AdminCommissionRuleDetailPage />
    ) : section === 'commission-rules' ? (
      <AdminCommissionRulesPage />
    ) : section === 'employers' && params.entityId === 'new' ? (
      <AdminEmployerCreatePage />
    ) : section === 'employers' && params.entityId ? (
      <AdminEmployerDetailPage />
    ) : section === 'employers' ? (
      <AdminEmployersPage />
    ) : section === 'candidates' && params.entityId ? (
      <AdminCandidateDetailPage />
    ) : section === 'candidates' ? (
      <AdminCandidatesPage />
    ) : section === 'users' && params.entityId === 'new' ? (
      <AdminUserCreatePage />
    ) : section === 'users' && params.entityId ? (
      <AdminUserDetailPage />
    ) : section === 'users' ? (
      <AdminUsersPage />
    ) : section === 'userGroups' ? (
      <AdminSectionPlaceholder section="userGroups" />
    ) : section === 'createAdmin' ? (
      <AdminSectionPlaceholder section="createAdmin" />
    ) : (
      <Navigate to="/admin/overview" replace />
    )

  return (
    <AdminLayout isSidebarOpen={isSidebarOpen} onSidebarClose={onSidebarClose}>
      <div className="space-y-4">{content}</div>
    </AdminLayout>
  )
}
