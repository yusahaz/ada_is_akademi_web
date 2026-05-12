import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { LoginModal } from './features/auth/components/LoginModal'
import { AdminLoginPage } from './features/auth/pages/AdminLoginPage'
import { AdminDashboard } from './features/admin/AdminDashboard'
import { EmployerDashboard } from './features/employer/EmployerDashboard'
import { WorkerDashboard } from './features/worker/WorkerDashboard'
import { HeroSection } from './features/landing/components/HeroSection'
import { LandingSections } from './features/landing/components/LandingSections'
import { Navbar } from './features/landing/Navbar'
import { useAuth } from './features/auth/auth-context'
import { resolveDashboardRole } from './features/auth/roles'
import { useTheme } from './theme/theme-context'

export default function App() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const location = useLocation()
  const { isAuthenticated, isHydrating, logout, session } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)
  const [adminSidebarOpen, setAdminSidebarOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    return window.innerWidth >= 1024
  })
  const [workerSidebarOpen, setWorkerSidebarOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    return window.innerWidth >= 1024
  })
  const [employerSidebarOpen, setEmployerSidebarOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    return window.innerWidth >= 1024
  })

  const dashboardRole = session ? resolveDashboardRole(session) : null
  const isAdminDashboard = isAuthenticated && dashboardRole === 'admin'
  const isWorkerDashboard = isAuthenticated && dashboardRole === 'worker'
  const isEmployerDashboard = isAuthenticated && dashboardRole === 'employer'
  const isAdminLoginRoute = location.pathname === '/admin' && !isAuthenticated
  const shouldShowGlobalNavbar =
    !isWorkerDashboard && !isEmployerDashboard && !isAdminDashboard && !isAdminLoginRoute
  const shouldShowGlobalFooter =
    !isWorkerDashboard && !isEmployerDashboard && !isAdminDashboard && !isAdminLoginRoute

  useEffect(() => {
    document.title = t('landing.meta.title')
  }, [t])

  const renderHydrating = (
    <section className="mx-auto flex min-h-[40svh] w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="inline-flex items-center gap-3 rounded-2xl border border-sky-200 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-300 border-t-sky-700" />
        <span>{t('dashboard.admin.summary.loading')}</span>
      </div>
    </section>
  )

  const renderGuestLanding = (
    <>
      <HeroSection onOpenLogin={() => setLoginOpen(true)} />
      <LandingSections onOpenLogin={() => setLoginOpen(true)} />
    </>
  )

  const renderAuthenticatedDashboard = (
    <>
      {dashboardRole === 'admin' ? (
        <AdminDashboard
          isSidebarOpen={adminSidebarOpen}
          onSidebarClose={() => setAdminSidebarOpen(false)}
        />
      ) : null}
      {dashboardRole === 'employer' ? <Navigate to="/employer" replace /> : null}
      {dashboardRole === 'worker' ? <Navigate to="/worker" replace /> : null}
    </>
  )

  return (
    <div
      className={`flex min-h-svh flex-col ${
        theme === 'dark'
          ? 'bg-[#0b0e14] text-white'
          : 'bg-[#f4f7fb] text-[#0f172a]'
      }`}
    >
      {shouldShowGlobalNavbar ? (
        <Navbar
          onAuthAction={isAuthenticated ? logout : () => setLoginOpen(true)}
          authLabel={isAuthenticated ? t('landing.nav.logout') : t('landing.nav.login')}
          showSidebarToggle={isAdminDashboard || isWorkerDashboard || isEmployerDashboard}
          onSidebarToggle={() => {
            if (isAdminDashboard) {
              setAdminSidebarOpen((prev) => !prev)
              return
            }
            if (isWorkerDashboard) {
              setWorkerSidebarOpen((prev) => !prev)
              return
            }
            if (isEmployerDashboard) {
              setEmployerSidebarOpen((prev) => !prev)
            }
          }}
        />
      ) : null}
      <main className={`flex-1 ${shouldShowGlobalFooter ? 'pb-16' : ''}`}>
        <Routes>
          <Route
            path="/worker/*"
            element={
              isHydrating ? renderHydrating : isAuthenticated && dashboardRole === 'worker' ? (
                <WorkerDashboard
                  isSidebarOpen={workerSidebarOpen}
                  onSidebarClose={() => setWorkerSidebarOpen(false)}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/employer/*"
            element={
              isHydrating ? renderHydrating : isAuthenticated && dashboardRole === 'employer' ? (
                <EmployerDashboard
                  isSidebarOpen={employerSidebarOpen}
                  onSidebarClose={() => setEmployerSidebarOpen(false)}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/admin/:section/:entityId"
            element={
              isHydrating ? renderHydrating : isAuthenticated && dashboardRole === 'admin' ? (
                renderAuthenticatedDashboard
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/admin/:section"
            element={
              isHydrating ? renderHydrating : isAuthenticated && dashboardRole === 'admin' ? (
                renderAuthenticatedDashboard
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/admin"
            element={
              isHydrating ? renderHydrating : isAuthenticated ? (
                dashboardRole === 'admin' ? <Navigate to="/admin/overview" replace /> : <Navigate to="/" replace />
              ) : (
                <AdminLoginPage />
              )
            }
          />
          <Route
            path="/"
            element={
              isHydrating ? renderHydrating : isAuthenticated ? (
                dashboardRole === 'admin' ? (
                  <Navigate to="/admin/overview" replace />
                ) : (
                  renderAuthenticatedDashboard
                )
              ) : (
                renderGuestLanding
              )
            }
          />
          <Route
            path="*"
            element={
              isHydrating ? renderHydrating : <Navigate to="/" replace />
            }
          />
        </Routes>
      </main>
      {shouldShowGlobalFooter ? (
        <footer
          className={`fixed inset-x-0 bottom-0 z-40 border-t py-3 text-center text-xs ${
            theme === 'dark'
              ? 'border-white/10 bg-[#0b0e14]/90 text-white/55'
              : 'border-slate-300/70 bg-white/92 text-slate-600'
          }`}
        >
          {t('landing.footer.copy')}
        </footer>
      ) : null}

      <LoginModal
        open={loginOpen && !isAuthenticated}
        onClose={() => setLoginOpen(false)}
      />
    </div>
  )
}
