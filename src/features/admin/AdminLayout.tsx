import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import {
  Bell,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  LogOut,
  Moon,
  Percent,
  Sun,
  UserCog,
  UserRound,
  Users,
} from 'lucide-react'

import { useAuth } from '../auth/auth-context'
import { useTheme } from '../../theme/theme-context'
import { ADMIN_PANEL_LOCALES } from '../../i18n/languages'
import { HeaderUserMenu } from '../../shared/ui/HeaderUserMenu'
import { AdaLogoMark } from '../landing/components/brand/AdaLogoMark'
import { AdaLogoWordmark } from '../landing/components/brand/AdaLogoWordmark'
import { cn } from '../../shared/lib/cn'

type AdminLayoutProps = {
  isSidebarOpen: boolean
  onSidebarClose: () => void
  children: ReactNode
}

type AdminNavKey = 'overview' | 'profile' | 'employers' | 'candidates' | 'users' | 'commissionRules'
type AdminNavItemConfig = { key: AdminNavKey; to: string }
type AdminNavGroupConfig = {
  id: 'dashboard' | 'management' | 'finance'
  titleKey: 'groupPanel' | 'groupManagement' | 'groupFinance'
  items: AdminNavItemConfig[]
}

const navGroups: AdminNavGroupConfig[] = [
  {
    id: 'dashboard',
    titleKey: 'groupPanel',
    items: [
      { key: 'overview', to: '/admin/overview' },
      { key: 'profile', to: '/admin/profile' },
    ],
  },
  {
    id: 'management',
    titleKey: 'groupManagement',
    items: [
      { key: 'employers', to: '/admin/employers' },
      { key: 'candidates', to: '/admin/candidates' },
      { key: 'users', to: '/admin/users' },
    ],
  },
  {
    id: 'finance',
    titleKey: 'groupFinance',
    items: [{ key: 'commissionRules', to: '/admin/commission-rules' }],
  },
]

const navItemIcons: Record<AdminNavKey, ReactNode> = {
  overview: <LayoutGrid className="h-4 w-4" aria-hidden="true" />,
  profile: <UserRound className="h-4 w-4" aria-hidden="true" />,
  employers: <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />,
  candidates: <Users className="h-4 w-4" aria-hidden="true" />,
  users: <UserCog className="h-4 w-4" aria-hidden="true" />,
  commissionRules: <Percent className="h-4 w-4" aria-hidden="true" />,
}

const ADMIN_SIDEBAR_COLLAPSE_KEY = 'ada-admin:sidebar-collapsed'
const ADMIN_SHELL_LG_MIN_PX = 1024
const ADMIN_SIDEBAR_EXPANDED_WIDTH = 200
const ADMIN_SIDEBAR_COLLAPSED_DESKTOP_WIDTH = 76
const ADMIN_SIDEBAR_COLLAPSED_MOBILE_WIDTH = 50
const adminSidebarTransitionClass =
  'duration-[480ms] ease-[cubic-bezier(0.25,0.8,0.25,1)] motion-reduce:duration-0 motion-reduce:transition-none'

function useIsBelowAdminShellLg() {
  const [isBelowLg, setIsBelowLg] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${ADMIN_SHELL_LG_MIN_PX - 1}px)`).matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${ADMIN_SHELL_LG_MIN_PX - 1}px)`)
    const onChange = () => setIsBelowLg(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return isBelowLg
}

export function AdminLayout({ isSidebarOpen, onSidebarClose, children }: AdminLayoutProps) {
  const { t, i18n } = useTranslation()
  const { session, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isRtl = i18n.dir() === 'rtl'
  const displayName = session?.email?.split('@')[0] ?? 'Admin'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const stored = window.localStorage.getItem(ADMIN_SIDEBAR_COLLAPSE_KEY)
    if (stored === 'true') return true
    if (stored === 'false') return false
    return window.innerWidth < 1024
  })
  void isSidebarOpen
  const isBelowLg = useIsBelowAdminShellLg()
  const tightMobileCollapsed = isBelowLg && isSidebarCollapsed

  useEffect(() => {
    const lang = (i18n.resolvedLanguage ?? i18n.language ?? '').toLowerCase()
    if (!lang.startsWith('tr') && !lang.startsWith('en')) {
      void i18n.changeLanguage('tr')
    }
  }, [i18n])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(ADMIN_SIDEBAR_COLLAPSE_KEY, isSidebarCollapsed ? 'true' : 'false')
  }, [isSidebarCollapsed])

  const sidebarWidth = isSidebarCollapsed
    ? isBelowLg
      ? ADMIN_SIDEBAR_COLLAPSED_MOBILE_WIDTH
      : ADMIN_SIDEBAR_COLLAPSED_DESKTOP_WIDTH
    : ADMIN_SIDEBAR_EXPANDED_WIDTH
  const contentInset = sidebarWidth + (tightMobileCollapsed ? 0 : 8)

  return (
    <section className="w-full">
      <div className="relative">
        <aside
          className={cn(
            'fixed inset-y-0 z-40 h-[100svh] overflow-visible transition-[width,padding] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_45%)]',
            adminSidebarTransitionClass,
            tightMobileCollapsed ? 'px-0 py-2.5' : 'p-2.5',
            isRtl ? 'right-0 border-l' : 'left-0 border-r',
            theme === 'dark'
              ? 'border-cyan-300/20 bg-[radial-gradient(circle_at_left,rgba(56,189,248,0.12)_0%,rgba(11,14,20,0)_52%),linear-gradient(90deg,#0b0e14_0%,#0f172a_100%)]'
              : 'border-sky-300/55 bg-[radial-gradient(circle_at_left,rgba(56,189,248,0.18)_0%,rgba(248,250,252,0)_52%),linear-gradient(90deg,#f8fafc_0%,#e2e8f0_100%)]'
          )}
          style={{ width: `${sidebarWidth}px` }}
        >
          <div className={`relative mb-2 rounded-2xl bg-transparent p-2 ${isSidebarCollapsed ? 'h-12' : 'h-12'}`}>
            <span
              className={`absolute left-1/2 top-1/2 inline-flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-[opacity,transform] ${adminSidebarTransitionClass} ${
                isSidebarCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
              }`}
            >
              <AdaLogoMark className={`h-7 w-7 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`} />
            </span>
            <span
              className={`absolute inset-y-0 left-2 right-2 inline-flex items-center justify-center transition-[opacity,transform] ${adminSidebarTransitionClass} ${
                isSidebarCollapsed ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
              }`}
            >
              <AdaLogoWordmark className="h-8 w-[176px]" mode={theme === 'dark' ? 'dark' : 'light'} />
            </span>
          </div>

          <div className={cn('relative mb-2 h-6', !tightMobileCollapsed && '-mx-2.5')}>
            <button
              type="button"
              aria-label={t('dashboard.admin.sidebar.closeAria')}
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className={cn(
                `absolute top-1/2 z-50 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border shadow-[0_4px_12px_rgba(2,6,23,0.2)] transition-[transform,box-shadow] ${adminSidebarTransitionClass} active:scale-95`,
                isRtl ? 'right-full translate-x-1/2' : 'left-full -translate-x-1/2',
                theme === 'dark'
                  ? 'border-cyan-300/40 bg-slate-900/95 text-slate-100'
                  : 'border-sky-300 bg-white/95 text-slate-700'
              )}
            >
              {isSidebarCollapsed ? (
                isRtl ? (
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                )
              ) : isRtl ? (
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>

          <nav className="mt-1 flex flex-col gap-2 pb-16">
            {navGroups.map((group) => (
              <div key={group.id} className="space-y-1">
                {!isSidebarCollapsed ? (
                  <p className={cn('px-2 text-[10px] font-semibold uppercase tracking-[0.16em]', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
                    {t(`dashboard.admin.sidebar.${group.titleKey}`)}
                  </p>
                ) : null}
                <div className="flex flex-col gap-0">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.key}
                      to={item.to}
                      end={item.to === '/admin/overview' || item.to === '/admin/profile' || item.to === '/admin/commission-rules'}
                      className="block w-full"
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                          onSidebarClose()
                        }
                      }}
                    >
                      {({ isActive }) => (
                        <span
                          className={`block w-full py-2.5 text-sm font-semibold tracking-[0.01em] transition-[padding,border-radius,background-color,color,border-color] ${adminSidebarTransitionClass} ${
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
                          <span className={`inline-flex min-w-0 items-center transition-[gap] ${adminSidebarTransitionClass} ${isSidebarCollapsed ? 'justify-center' : 'gap-2'}`}>
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
                            {!isSidebarCollapsed ? <span className="block truncate">{t(`dashboard.admin.sidebar.${item.key}`)}</span> : null}
                          </span>
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className={tightMobileCollapsed ? 'absolute inset-x-0 bottom-3 px-0' : 'absolute inset-x-3 bottom-3'}>
            <button
              type="button"
              onClick={logout}
              className={`flex w-full items-center gap-2 px-2 py-2.5 text-sm font-semibold transition ${
                isSidebarCollapsed ? 'justify-center' : 'gap-2'
              } ${
                theme === 'dark' ? 'text-slate-200 hover:bg-white/[0.08]' : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {!isSidebarCollapsed ? <span>{t('dashboard.employerPortal.logout')}</span> : null}
            </button>
          </div>
        </aside>

        <div className={cn('relative min-w-0 space-y-4 overflow-hidden transition-[margin-inline-start]', adminSidebarTransitionClass)} style={{ marginInlineStart: `${contentInset}px` }}>
          <svg
            className="pointer-events-none fixed bottom-0 inset-x-0 z-0 h-[140px] w-full sm:h-[170px]"
            viewBox="0 0 1440 200"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="adminWave1" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={theme === 'dark' ? '#14f1d9' : '#0284c7'}
                  stopOpacity={theme === 'dark' ? '0.12' : '0.32'}
                />
                <stop offset="100%" stopColor={theme === 'dark' ? '#14f1d9' : '#0284c7'} stopOpacity="0" />
              </linearGradient>
              <linearGradient id="adminWave2" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={theme === 'dark' ? '#2dd4bf' : '#0e7490'}
                  stopOpacity={theme === 'dark' ? '0.14' : '0.36'}
                />
                <stop offset="100%" stopColor={theme === 'dark' ? '#2dd4bf' : '#0e7490'} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="wave-anim-slow" d="M0 126 Q360 78 720 114 T1440 108 V200 H0Z" fill="url(#adminWave1)" />
            <path className="wave-anim-slower" d="M0 154 Q360 116 720 150 T1440 145 V200 H0Z" fill="url(#adminWave2)" />
          </svg>
          <div
            className={`sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b px-3 py-3 backdrop-blur-md sm:px-4 lg:px-6 ${
              theme === 'dark' ? 'border-white/10 bg-[#0b0e14]/70' : 'border-slate-300/80 bg-white/75'
            }`}
          >
            <div className="min-w-0">
              <p className={`truncate text-lg font-semibold sm:text-xl ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t('dashboard.common.welcome', { email: displayName })}
              </p>
              <p className={`mt-1 text-xs sm:text-[0.8125rem] ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
                {t('dashboard.admin.title')}
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                dir="ltr"
                aria-label={theme === 'dark' ? t('dashboard.userMenu.themeLight') : t('dashboard.userMenu.themeDark')}
                title={theme === 'dark' ? t('dashboard.userMenu.themeLight') : t('dashboard.userMenu.themeDark')}
                className={cn(
                  'relative inline-flex h-8 w-[4rem] items-center rounded-full border p-0.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45',
                  theme === 'dark' ? 'border-white/15 bg-white/[0.06]' : 'border-cyan-200/80 bg-cyan-50/70'
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-full border shadow-sm transition-transform duration-300',
                    theme === 'dark'
                      ? 'translate-x-[1.9rem] border-white/20 bg-slate-900 text-cyan-200'
                      : 'translate-x-0 border-cyan-200 bg-white text-sky-700'
                  )}
                >
                  {theme === 'dark' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                </span>
              </button>
              <button
                type="button"
                aria-label={t('dashboard.employerPortal.topbar.notificationsAria')}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border sm:h-10 sm:w-10 ${
                  theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
              </button>
              <HeaderUserMenu
                tone={theme}
                userName={displayName}
                userEmail={session?.email ?? null}
                profileTo="/admin/profile"
                onLogout={logout}
                localeChoices={ADMIN_PANEL_LOCALES}
              />
            </div>
          </div>

          <div className="relative z-10 space-y-4 px-3 py-4 pb-[max(env(safe-area-inset-bottom),1rem)] sm:px-4 sm:py-5 lg:px-6 lg:py-6">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
