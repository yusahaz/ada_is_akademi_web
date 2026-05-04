import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { isAuthenticated, logout, session } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

  const dashboardRole = session ? resolveDashboardRole(session) : null

  useEffect(() => {
    document.title = t('landing.meta.title')
  }, [t])

  return (
    <div
      className={`min-h-svh ${
        theme === 'dark'
          ? 'bg-[#0b0e14] text-white'
          : 'bg-[#f4f7fb] text-[#0f172a]'
      }`}
    >
      <Navbar
        onAuthAction={isAuthenticated ? logout : () => setLoginOpen(true)}
        authLabel={isAuthenticated ? t('landing.nav.logout') : t('landing.nav.login')}
      />
      <main>
        {isAuthenticated ? (
          <>
            {dashboardRole === 'admin' ? <AdminDashboard /> : null}
            {dashboardRole === 'employer' ? <EmployerDashboard /> : null}
            {dashboardRole === 'worker' ? <WorkerDashboard /> : null}
          </>
        ) : (
          <>
            <HeroSection />
            <LandingSections />
          </>
        )}
      </main>
      <footer
        className={`border-t py-8 text-center text-xs ${
          theme === 'dark'
            ? 'border-white/10 text-white/55'
            : 'border-slate-300/70 text-slate-600'
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
