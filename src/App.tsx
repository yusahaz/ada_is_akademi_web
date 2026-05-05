import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes } from 'react-router-dom'

import { LoginModal } from './components/auth/LoginModal'
import { AdminDashboard } from './components/dashboard/AdminDashboard'
import { EmployerDashboard } from './components/dashboard/EmployerDashboard'
import { WorkerDashboard } from './components/dashboard/WorkerDashboard'
import { HeroSection } from './components/landing/HeroSection'
import { LandingSections } from './components/landing/LandingSections'
import { Navbar } from './components/landing/Navbar'
import { useAuth } from './auth/auth-context'
import { resolveDashboardRole } from './dashboard/roles'
import { useTheme } from './theme/theme-context'

export default function App() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { isAuthenticated, isHydrating, logout, session } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)
  const [adminSidebarOpen, setAdminSidebarOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    return window.innerWidth >= 1024
  })

  const dashboardRole = session ? resolveDashboardRole(session) : null
  const isAdminDashboard = isAuthenticated && dashboardRole === 'admin'

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
      <HeroSection />
      <LandingSections />
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
      {dashboardRole === 'employer' ? <EmployerDashboard /> : null}
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
      <Navbar
        onAuthAction={isAuthenticated ? logout : () => setLoginOpen(true)}
        authLabel={isAuthenticated ? t('landing.nav.logout') : t('landing.nav.login')}
        showSidebarToggle={isAdminDashboard}
        onSidebarToggle={() => setAdminSidebarOpen((prev) => !prev)}
      />
      <main className="flex-1 pb-16">
        <Routes>
          <Route
            path="/worker/*"
            element={
              isHydrating ? renderHydrating : isAuthenticated && dashboardRole === 'worker' ? (
                <WorkerDashboard />
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
              isHydrating ? renderHydrating : isAuthenticated && dashboardRole === 'admin' ? (
                <Navigate to="/admin/overview" replace />
              ) : (
                <Navigate to="/" replace />
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
      <footer
        className={`fixed inset-x-0 bottom-0 z-40 border-t py-3 text-center text-xs ${
          theme === 'dark'
            ? 'border-white/10 bg-[#0b0e14]/90 text-white/55'
            : 'border-slate-300/70 bg-white/92 text-slate-600'
        }`}
      >
        {t('landing.footer.copy')}
      </footer>

      <LoginModal
        open={loginOpen && !isAuthenticated}
        onClose={() => setLoginOpen(false)}
      />
    </div>
  )
}
