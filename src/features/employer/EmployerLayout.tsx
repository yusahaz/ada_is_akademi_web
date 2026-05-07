import { useEffect, useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  LogOut,
  Shield,
  Users,
  WalletCards,
} from 'lucide-react'

import { systemUsersApi } from '../../api'
import { useAuth } from '../../auth/auth-context'
import { AdaLogoMark } from '../../components/landing/AdaLogoMark'
import { AdaLogoWordmark } from '../../components/landing/AdaLogoWordmark'
import { HeaderUserMenu } from '../../components/dashboard/HeaderUserMenu'
import { useTheme } from '../../theme/theme-context'
import { cn } from '../../lib/cn'
import { useEmployerPortal } from './use-employer-portal'

type EmployerNavKey =
  | 'overview'
  | 'operations'
  | 'postings'
  | 'candidates'
  | 'billing'
  | 'reports'
  | 'disputes'

type EmployerNavItemConfig = {
  key: EmployerNavKey
  to: string
  showBadge?: boolean
}

type EmployerNavGroupConfig = {
  id: 'dashboard' | 'operations' | 'intelligence' | 'finance' | 'settings' | 'support'
  titleKey: string
  items: EmployerNavItemConfig[]
}

const navGroups: EmployerNavGroupConfig[] = [
  {
    id: 'dashboard',
    titleKey: 'dashboard.employerPortal.nav.groups.dashboard',
    items: [{ to: '/employer', key: 'overview' }],
  },
  {
    id: 'operations',
    titleKey: 'dashboard.employerPortal.nav.groups.operations',
    items: [
      { to: '/employer/operations', key: 'operations', showBadge: true },
      { to: '/employer/postings', key: 'postings' },
    ],
  },
  {
    id: 'intelligence',
    titleKey: 'dashboard.employerPortal.nav.groups.intelligence',
    items: [{ to: '/employer/candidates', key: 'candidates' }],
  },
  {
    id: 'finance',
    titleKey: 'dashboard.employerPortal.nav.groups.finance',
    items: [{ to: '/employer/billing', key: 'billing', showBadge: true }],
  },
  {
    id: 'settings',
    titleKey: 'dashboard.employerPortal.nav.groups.settings',
    items: [{ to: '/employer/reports', key: 'reports' }],
  },
  {
    id: 'support',
    titleKey: 'dashboard.employerPortal.nav.groups.support',
    items: [{ to: '/employer/disputes', key: 'disputes' }],
  },
]

const EMPLOYER_SIDEBAR_COLLAPSE_KEY = 'ada-employer:sidebar-collapsed'
const EMPLOYER_SHELL_LG_MIN_PX = 1024
const EMPLOYER_SIDEBAR_EXPANDED_WIDTH = 200
const EMPLOYER_SIDEBAR_COLLAPSED_DESKTOP_WIDTH = 76
const EMPLOYER_SIDEBAR_COLLAPSED_MOBILE_WIDTH = 50

const employerSidebarTransitionClass =
  'duration-[480ms] ease-[cubic-bezier(0.25,0.8,0.25,1)] motion-reduce:duration-0 motion-reduce:transition-none'

function useIsBelowEmployerShellLg() {
  const [isBelowLg, setIsBelowLg] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${EMPLOYER_SHELL_LG_MIN_PX - 1}px)`).matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${EMPLOYER_SHELL_LG_MIN_PX - 1}px)`)
    const onChange = () => setIsBelowLg(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return isBelowLg
}

const navItemIcons: Record<EmployerNavKey, ReactNode> = {
  overview: <LayoutGrid className="h-4 w-4" aria-hidden="true" />,
  postings: <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />,
  candidates: <Users className="h-4 w-4" aria-hidden="true" />,
  operations: <Shield className="h-4 w-4" aria-hidden="true" />,
  billing: <WalletCards className="h-4 w-4" aria-hidden="true" />,
  reports: <BarChart3 className="h-4 w-4" aria-hidden="true" />,
  disputes: <Shield className="h-4 w-4" aria-hidden="true" />,
}

export type EmployerLayoutProps = {
  children: ReactNode
  isSidebarOpen: boolean
  onSidebarClose: () => void
}

export function EmployerLayout({ children, isSidebarOpen, onSidebarClose }: EmployerLayoutProps) {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const { session, logout } = useAuth()
  const { badges } = useEmployerPortal()
  const isRtl = i18n.dir() === 'rtl'
  const [resolvedWelcomeName, setResolvedWelcomeName] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const stored = window.localStorage.getItem(EMPLOYER_SIDEBAR_COLLAPSE_KEY)
    if (stored === 'true') return true
    if (stored === 'false') return false
    return window.innerWidth < 1024
  })
  void isSidebarOpen
  const isBelowLg = useIsBelowEmployerShellLg()
  const tightMobileCollapsed = isBelowLg && isSidebarCollapsed
  const fallbackWelcomeName = session?.email.split('@')[0]?.trim() || t('dashboard.employer.defaultName')
  const welcomeName = session ? resolvedWelcomeName ?? fallbackWelcomeName : t('dashboard.employer.defaultName')

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
          emailAlias && emailAlias.length > 0 ? emailAlias : t('dashboard.employer.defaultName'),
        )
      })
      .catch(() => {
        if (!isActive) return
        const emailAlias = session.email.split('@')[0]?.trim()
        setResolvedWelcomeName(
          emailAlias && emailAlias.length > 0 ? emailAlias : t('dashboard.employer.defaultName'),
        )
      })

    return () => {
      isActive = false
    }
  }, [session, t])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(EMPLOYER_SIDEBAR_COLLAPSE_KEY, isSidebarCollapsed ? 'true' : 'false')
  }, [isSidebarCollapsed])

  const sidebarWidth = isSidebarCollapsed
    ? isBelowLg
      ? EMPLOYER_SIDEBAR_COLLAPSED_MOBILE_WIDTH
      : EMPLOYER_SIDEBAR_COLLAPSED_DESKTOP_WIDTH
    : EMPLOYER_SIDEBAR_EXPANDED_WIDTH
  const contentGutterPx = tightMobileCollapsed ? 0 : 8
  const contentInset = sidebarWidth + contentGutterPx

  return (
    <section className="w-full">
      <div className="relative">
        <aside
          className={cn(
            'fixed inset-y-0 z-40 h-[100svh] overflow-visible transition-[width,padding] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_45%)]',
            employerSidebarTransitionClass,
            tightMobileCollapsed ? 'px-0 py-2.5' : 'p-2.5',
            isRtl ? 'right-0 border-l' : 'left-0 border-r',
            theme === 'dark'
              ? 'border-cyan-300/20 bg-[radial-gradient(circle_at_left,rgba(56,189,248,0.12)_0%,rgba(11,14,20,0)_52%),linear-gradient(90deg,#0b0e14_0%,#0f172a_100%)]'
              : 'border-sky-300/55 bg-[radial-gradient(circle_at_left,rgba(56,189,248,0.18)_0%,rgba(248,250,252,0)_52%),linear-gradient(90deg,#f8fafc_0%,#e2e8f0_100%)]',
          )}
          style={{ width: `${sidebarWidth}px` }}
        >
          <div className={`relative mb-2 rounded-2xl bg-transparent p-2 ${isSidebarCollapsed ? 'h-12' : 'h-12'}`}>
            <span
              className={`absolute left-1/2 top-1/2 inline-flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-[opacity,transform] ${employerSidebarTransitionClass} ${
                isSidebarCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
              }`}
            >
              <AdaLogoMark className={`h-7 w-7 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`} />
            </span>
            <span
              className={`absolute inset-y-0 left-2 right-2 inline-flex items-center justify-start transition-[opacity,transform] ${employerSidebarTransitionClass} ${
                isSidebarCollapsed ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
              }`}
            >
              <AdaLogoWordmark className="h-8 w-[176px]" mode={theme === 'dark' ? 'dark' : 'light'} />
            </span>
          </div>
          <div className={cn('relative mb-2 h-6', !tightMobileCollapsed && '-mx-2.5')}>
            <button
              type="button"
              aria-label={t('dashboard.employerPortal.topbar.toggleSidebarAria')}
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className={cn(
                `absolute top-1/2 z-50 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border shadow-[0_4px_12px_rgba(2,6,23,0.2)] transition-[transform,box-shadow] ${employerSidebarTransitionClass} active:scale-95`,
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
                  <p
                    className={cn(
                      'px-2 text-[10px] font-semibold uppercase tracking-[0.16em]',
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
                    )}
                  >
                    {t(group.titleKey)}
                  </p>
                ) : null}
                <div className="flex flex-col gap-0">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.key}
                      to={item.to}
                      end={item.to === '/employer'}
                      className="block w-full"
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                          onSidebarClose()
                        }
                      }}
                    >
                      {({ isActive }) => (
                        <span
                          className={`block w-full py-2.5 text-sm font-semibold tracking-[0.01em] transition-[padding,border-radius,background-color,color,border-color] ${employerSidebarTransitionClass} ${
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
                            className={`inline-flex min-w-0 items-center transition-[gap] ${employerSidebarTransitionClass} ${
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
                            {!isSidebarCollapsed ? (
                              <span className="flex min-w-0 flex-1 items-center justify-between gap-1 truncate">
                                <span className="block truncate">
                                  {t(`dashboard.employerPortal.nav.${item.key}`)}
                                </span>
                                {item.showBadge ? (
                                  <span
                                    className="inline-flex items-center rounded-full bg-sky-500/10 px-2 text-[10px] font-semibold text-sky-700 dark:bg-cyan-400/15 dark:text-cyan-100"
                                    aria-label={
                                      item.key === 'billing'
                                        ? t('dashboard.employerPortal.nav.badges.pendingPayouts', { count: badges.pendingPayouts })
                                        : t('dashboard.employerPortal.nav.badges.activeAnomalies', { count: badges.activeAnomalies })
                                    }
                                  >
                                    {item.key === 'billing' ? badges.pendingPayouts : badges.activeAnomalies}
                                  </span>
                                ) : null}
                              </span>
                            ) : null}
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
              className={`flex w-full items-center px-2 py-2.5 text-sm font-semibold transition ${
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

        <div
          className={cn('min-w-0 space-y-4 transition-[margin-inline-start]', employerSidebarTransitionClass)}
          style={{ marginInlineStart: `${contentInset}px` }}
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
                {t('dashboard.employer.subtitle')}
              </p>
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              <button
                type="button"
                aria-label={t('dashboard.employerPortal.topbar.notificationsAria')}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${
                  theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
              </button>
              <HeaderUserMenu
                tone={theme}
                userName={resolvedWelcomeName ?? fallbackWelcomeName}
                userEmail={session?.email ?? null}
                onLogout={logout}
                align={isRtl ? 'start' : 'end'}
              />
            </div>
          </div>
          <div className="space-y-4 px-3 py-4 pb-[max(env(safe-area-inset-bottom),1rem)] sm:px-4 sm:py-5 lg:px-6 lg:py-6">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
