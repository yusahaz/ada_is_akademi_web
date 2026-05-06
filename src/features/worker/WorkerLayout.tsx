import { useEffect, useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bell, BriefcaseBusiness, ChevronLeft, ChevronRight, FileText, LayoutGrid, LogOut, UserRound, WalletCards } from 'lucide-react'

import { systemUsersApi } from '../../api'
import { useAuth } from '../../auth/auth-context'
import { AdaLogoMark } from '../../components/landing/AdaLogoMark'
import { AdaLogoWordmark } from '../../components/landing/AdaLogoWordmark'
import { useTheme } from '../../theme/theme-context'
import { cn } from '../../lib/cn'

const navItems = [
  { to: '/worker', key: 'overview' },
  { to: '/worker/shifts', key: 'jobs' },
  { to: '/worker/profile', key: 'cvProfile' },
  { to: '/worker/applications', key: 'myApplications' },
  { to: '/worker/profile?section=accountControl', key: 'account' },
]

const WORKER_SIDEBAR_COLLAPSE_KEY = 'ada-worker:sidebar-collapsed'
const WORKER_SHELL_LG_MIN_PX = 1024
const WORKER_SIDEBAR_EXPANDED_WIDTH = 200
const WORKER_SIDEBAR_COLLAPSED_DESKTOP_WIDTH = 76
const WORKER_SIDEBAR_COLLAPSED_MOBILE_WIDTH = 50

/** Shared sidebar / main-column motion (respect reduced-motion). */
const workerSidebarTransitionClass =
  'duration-[480ms] ease-[cubic-bezier(0.25,0.8,0.25,1)] motion-reduce:duration-0 motion-reduce:transition-none'

function useIsBelowWorkerShellLg() {
  const [isBelowLg, setIsBelowLg] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${WORKER_SHELL_LG_MIN_PX - 1}px)`).matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${WORKER_SHELL_LG_MIN_PX - 1}px)`)
    const onChange = () => setIsBelowLg(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return isBelowLg
}

const navItemIcons: Record<string, ReactNode> = {
  overview: <LayoutGrid className="h-4 w-4" aria-hidden="true" />,
  jobs: <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />,
  cvProfile: <FileText className="h-4 w-4" aria-hidden="true" />,
  myApplications: <WalletCards className="h-4 w-4" aria-hidden="true" />,
  account: <UserRound className="h-4 w-4" aria-hidden="true" />,
}

export type WorkerLayoutProps = {
  children: ReactNode
  isSidebarOpen: boolean
  onSidebarClose: () => void
}

export function WorkerLayout({ children, isSidebarOpen, onSidebarClose }: WorkerLayoutProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { session, logout } = useAuth()
  const [resolvedWelcomeName, setResolvedWelcomeName] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const stored = window.localStorage.getItem(WORKER_SIDEBAR_COLLAPSE_KEY)
    if (stored === 'true') return true
    if (stored === 'false') return false
    return window.innerWidth < 1024
  })
  void isSidebarOpen
  const isBelowLg = useIsBelowWorkerShellLg()
  const tightMobileCollapsed = isBelowLg && isSidebarCollapsed
  const fallbackWelcomeName = session?.email.split('@')[0]?.trim() || t('dashboard.worker.defaultName')
  const welcomeName = session ? resolvedWelcomeName ?? fallbackWelcomeName : t('dashboard.worker.defaultName')

  useEffect(() => {
    let isActive = true

    if (!session) {
      return () => {
        isActive = false
      }
    }

    void systemUsersApi
      .me()
      .then((me) => {
        if (!isActive) return
        const fullName = `${me.firstName ?? ''} ${me.lastName ?? ''}`.trim()
        if (fullName.length > 0) {
          setResolvedWelcomeName(fullName)
          return
        }
        const emailAlias = session.email.split('@')[0]?.trim()
        setResolvedWelcomeName(
          emailAlias && emailAlias.length > 0 ? emailAlias : t('dashboard.worker.defaultName'),
        )
      })
      .catch(() => {
        if (!isActive) return
        const emailAlias = session.email.split('@')[0]?.trim()
        setResolvedWelcomeName(
          emailAlias && emailAlias.length > 0 ? emailAlias : t('dashboard.worker.defaultName'),
        )
      })

    return () => {
      isActive = false
    }
  }, [session, t])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(
      WORKER_SIDEBAR_COLLAPSE_KEY,
      isSidebarCollapsed ? 'true' : 'false',
    )
  }, [isSidebarCollapsed])

  const sidebarWidth = isSidebarCollapsed
    ? isBelowLg
      ? WORKER_SIDEBAR_COLLAPSED_MOBILE_WIDTH
      : WORKER_SIDEBAR_COLLAPSED_DESKTOP_WIDTH
    : WORKER_SIDEBAR_EXPANDED_WIDTH
  const contentGutterPx = tightMobileCollapsed ? 0 : 8
  const contentInset = sidebarWidth + contentGutterPx

  return (
    <section className="w-full">
      <div className="relative">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 h-[100svh] overflow-visible border-r transition-[width,padding] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_45%)]',
            workerSidebarTransitionClass,
            tightMobileCollapsed ? 'px-0 py-2.5' : 'p-2.5',
            theme === 'dark'
              ? 'border-cyan-300/20 bg-[radial-gradient(circle_at_left,rgba(56,189,248,0.12)_0%,rgba(11,14,20,0)_52%),linear-gradient(90deg,#0b0e14_0%,#0f172a_100%)]'
              : 'border-sky-300/55 bg-[radial-gradient(circle_at_left,rgba(56,189,248,0.18)_0%,rgba(248,250,252,0)_52%),linear-gradient(90deg,#f8fafc_0%,#e2e8f0_100%)]',
          )}
          style={{ width: `${sidebarWidth}px` }}
        >
          <div className={`relative mb-2 rounded-2xl bg-transparent p-2 ${isSidebarCollapsed ? 'h-12' : 'h-12'}`}>
            <span
              className={`absolute left-1/2 top-1/2 inline-flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-[opacity,transform] ${workerSidebarTransitionClass} ${
                isSidebarCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
              }`}
            >
              <AdaLogoMark className={`h-7 w-7 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`} />
            </span>
            <span
              className={`absolute inset-y-0 left-2 right-2 inline-flex items-center justify-start transition-[opacity,transform] ${workerSidebarTransitionClass} ${
                isSidebarCollapsed ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
              }`}
            >
              <AdaLogoWordmark
                className="h-8 w-[176px]"
                mode={theme === 'dark' ? 'dark' : 'light'}
              />
            </span>
          </div>
          <div className={cn('relative mb-2 h-6', !tightMobileCollapsed && '-mx-2.5')}>
            <button
              type="button"
              aria-label={t('dashboard.workerPortal.topbar.toggleSidebarAria')}
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className={`absolute left-full top-1/2 z-50 inline-flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-[0_4px_12px_rgba(2,6,23,0.2)] transition-[transform,box-shadow] ${workerSidebarTransitionClass} active:scale-95 ${
                theme === 'dark'
                  ? 'border-cyan-300/40 bg-slate-900/95 text-slate-100'
                  : 'border-sky-300 bg-white/95 text-slate-700'
              }`}
            >
              {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : <ChevronLeft className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>

          <nav className="mt-1 flex flex-col gap-0 pb-16">
            {navItems.map((item) => {
              return (
                <NavLink
                  key={item.key}
                  to={item.to}
                  end={item.to === '/worker'}
                  className="block w-full"
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      onSidebarClose()
                    }
                  }}
                >
                  {({ isActive }) => (
                    <span
                      className={`block w-full py-2.5 text-sm font-semibold tracking-[0.01em] transition-[padding,border-radius,background-color,color,border-color] ${workerSidebarTransitionClass} ${
                        isSidebarCollapsed ? 'px-0 text-center' : 'px-2 text-start'
                      } ${
                        isActive
                          ? theme === 'dark'
                            ? 'rounded-xl border-l-2 border-l-cyan-300 bg-cyan-300/8 text-cyan-100'
                            : 'rounded-xl border-l-2 border-l-sky-500 bg-sky-100 text-sky-900'
                          : theme === 'dark'
                            ? 'text-slate-200 hover:bg-white/[0.08]'
                            : 'text-slate-700 hover:bg-slate-200/70'
                      }`}
                    >
                      <span
                        className={`inline-flex min-w-0 items-center transition-[gap] ${workerSidebarTransitionClass} ${
                          isSidebarCollapsed ? 'justify-center' : 'gap-2'
                        }`}
                      >
                        <span
                          className={
                            isActive
                              ? theme === 'dark'
                                ? 'text-cyan-200'
                                : 'text-sky-700'
                              : theme === 'dark'
                                ? 'text-slate-300'
                                : 'text-slate-500'
                          }
                        >
                          {navItemIcons[item.key]}
                        </span>
                        {!isSidebarCollapsed ? <span className="block truncate">{t(`dashboard.workerPortal.nav.${item.key}`)}</span> : null}
                      </span>
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>

          <div className={tightMobileCollapsed ? 'absolute inset-x-0 bottom-3 px-0' : 'absolute inset-x-3 bottom-3'}>
            <button
              type="button"
              onClick={logout}
              className={`flex w-full items-center px-2 py-2.5 text-sm font-semibold transition ${
                isSidebarCollapsed ? 'justify-center' : 'gap-2'
              } ${
                theme === 'dark' ? 'text-slate-200 hover:bg-white/[0.08]' : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {!isSidebarCollapsed ? <span>{t('dashboard.workerPortal.logout')}</span> : null}
            </button>
          </div>
        </aside>

        <div
          className={cn('min-w-0 space-y-4 transition-[margin-left]', workerSidebarTransitionClass)}
          style={{ marginLeft: `${contentInset}px` }}
        >
          <div
            className={cn(
              'sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b px-3 py-3 backdrop-blur-md sm:px-4 lg:px-6',
              theme === 'dark'
                ? 'border-white/10 bg-[#0b0e14]/70'
                : 'border-slate-300/80 bg-white/75',
            )}
          >
            <div className="min-w-0">
              <p
                className={`truncate text-lg font-semibold leading-snug tracking-tight sm:text-xl ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
              >
                {t('dashboard.common.welcome', { email: welcomeName })}
              </p>
              <p
                className={`mt-1 text-xs leading-snug sm:text-[0.8125rem] ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}
              >
                {t('dashboard.worker.subtitle')}
              </p>
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              <button
                type="button"
                aria-label={t('dashboard.workerPortal.topbar.notificationsAria')}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${
                  theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={t('dashboard.workerPortal.topbar.toggleThemeAria')}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${
                  theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <UserRound className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div
            className="space-y-4 px-3 py-4 pb-[max(env(safe-area-inset-bottom),1rem)] sm:px-4 sm:py-5 lg:px-6 lg:py-6"
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
