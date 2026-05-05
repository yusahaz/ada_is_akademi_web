import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { ApiError, createAuthAdapter, getAdminSummaryStats, systemUsersApi } from '../../api'
import { useAuth } from '../../auth/auth-context'
import { useTheme } from '../../theme/theme-context'
import {
  IconCheck,
  IconSpark,
  IconUsers,
} from '../landing/icons'
import { DashboardSurface, GlowBadge, InteractiveButton } from './ui-primitives'
import { CandidatesSection } from './admin/CandidatesSection'
import { EmployersSection } from './admin/EmployersSection'
import { UserGroupsSection } from './admin/UserGroupsSection'
import { UsersSection } from './admin/UsersSection'

type AdminSection =
  | 'overview'
  | 'employers'
  | 'candidates'
  | 'userGroups'
  | 'users'
  | 'createAdmin'

const ALLOWED_ADMIN_SECTIONS: AdminSection[] = [
  'overview',
  'employers',
  'candidates',
  'userGroups',
  'users',
  'createAdmin',
]

type AdminDashboardProps = {
  isSidebarOpen: boolean
  onSidebarClose: () => void
}

function IconBriefcase({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3.5" y="7" width="17" height="12.5" rx="2.5" />
      <path d="M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7" />
      <path d="M3.5 12.2h17" />
    </svg>
  )
}

function IconUserCircle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="9.2" r="2.2" />
      <path d="M8.2 16.2c.9-1.5 2.2-2.2 3.8-2.2s2.9.7 3.8 2.2" />
    </svg>
  )
}

function IconClipboardList({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="5" y="4.5" width="14" height="16" rx="2.4" />
      <path d="M9.2 4.5h5.6v2.3H9.2z" />
      <path d="M8.5 10h7M8.5 13.2h7M8.5 16.4h4.3" />
    </svg>
  )
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 3.5l7 3.2v6c0 4.2-3 8-7 8.8-4-.8-7-4.6-7-8.8v-6l7-3.2z" />
      <path d="M9.2 12.2l2.2 2.2 4.4-4.4" />
    </svg>
  )
}

function parseLocalizedCount(value: string) {
  const digits = value.replace(/[^\d]/g, '')
  const parsed = Number(digits)
  return Number.isFinite(parsed) ? parsed : 0
}

export function AdminDashboard({ isSidebarOpen, onSidebarClose }: AdminDashboardProps) {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const { session } = useAuth()
  const navigate = useNavigate()
  const { section, entityId } = useParams<{ section?: string; entityId?: string }>()
  const authApi = useMemo(() => createAuthAdapter(), [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [meDisplayName, setMeDisplayName] = useState<string | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [summaryStats, setSummaryStats] = useState<{
    overview: {
      activatedTodayCount: string
      totalWorkerCount: string
      activeWorkerCount: string
      totalEmployerCount: string
      activeEmployerCount: string
      totalJobPostingCount: string
      openJobPostingCount: string
      totalJobApplicationCount: string
      pendingJobApplicationCount: string
      acceptedJobApplicationCount: string
      rejectedJobApplicationCount: string
    } | null
  } | null>(null)

  useEffect(() => {
    if (!session) return
    let isActive = true

    void systemUsersApi
      .me()
      .then((me) => {
        if (!isActive) return
        const fullName = `${me.firstName ?? ''} ${me.lastName ?? ''}`.trim()
        setMeDisplayName(fullName.length > 0 ? fullName : me.email)
      })
      .catch(() => {
        if (!isActive) return
        setMeDisplayName(session.email)
      })

    return () => {
      isActive = false
    }
  }, [session])

  useEffect(() => {
    if (!session) return
    let isActive = true

    void getAdminSummaryStats()
      .then((stats) => {
        if (!isActive) return
        if (!stats) {
          setSummaryStats(null)
          return
        }
        const locale = i18n.resolvedLanguage ?? i18n.language ?? 'tr'
        const formatCount = (value: number) => value.toLocaleString(locale)
        setSummaryError(null)
        setSummaryStats({
          overview: stats.overview
            ? {
                activatedTodayCount: formatCount(stats.overview.activatedTodayCount),
                totalWorkerCount: formatCount(stats.overview.totalWorkerCount),
                activeWorkerCount: formatCount(stats.overview.activeWorkerCount),
                totalEmployerCount: formatCount(stats.overview.totalEmployerCount),
                activeEmployerCount: formatCount(stats.overview.activeEmployerCount),
                totalJobPostingCount: formatCount(stats.overview.totalJobPostingCount),
                openJobPostingCount: formatCount(stats.overview.openJobPostingCount),
                totalJobApplicationCount: formatCount(
                  stats.overview.totalJobApplicationCount,
                ),
                pendingJobApplicationCount: formatCount(
                  stats.overview.pendingJobApplicationCount,
                ),
                acceptedJobApplicationCount: formatCount(
                  stats.overview.acceptedJobApplicationCount,
                ),
                rejectedJobApplicationCount: formatCount(
                  stats.overview.rejectedJobApplicationCount,
                ),
              }
            : null,
        })
      })
      .catch(() => {
        if (!isActive) return
        setSummaryError(t('dashboard.admin.summary.fetchError'))
        setSummaryStats(null)
      })

    return () => {
      isActive = false
    }
  }, [i18n.language, i18n.resolvedLanguage, session, t])

  async function handleCreateAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const formData = new FormData(event.currentTarget)
    const firstName = String(formData.get('firstName') ?? '').trim()
    const lastName = String(formData.get('lastName') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim()
    const password = String(formData.get('password') ?? '')

    setSubmitError(null)
    setSubmitSuccess(null)
    setIsSubmitting(true)

    try {
      await authApi.registerByRole('admin', {
        email,
        password,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
      })
      setSubmitSuccess(t('dashboard.admin.register.success'))
      event.currentTarget.reset()
    } catch (error) {
      if (error instanceof ApiError && error.code === 'AUTH_NOT_CONFIGURED') {
        setSubmitError(t('dashboard.admin.register.authNotConfigured'))
      } else {
        setSubmitError(t('dashboard.admin.register.genericError'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const sidebarItems: Array<{
    key: AdminSection
    label: string
    icon: ReactNode
  }> = [
    {
      key: 'overview',
      label: t('dashboard.admin.sidebar.overview'),
      icon: <IconCheck className="h-4 w-4" />,
    },
    {
      key: 'employers',
      label: t('dashboard.admin.sidebar.employers'),
      icon: <IconBriefcase className="h-4 w-4" />,
    },
    {
      key: 'candidates',
      label: t('dashboard.admin.sidebar.candidates'),
      icon: <IconUserCircle className="h-4 w-4" />,
    },
    {
      key: 'userGroups',
      label: t('dashboard.admin.sidebar.userGroups'),
      icon: <IconShield className="h-4 w-4" />,
    },
    {
      key: 'users',
      label: t('dashboard.admin.sidebar.users'),
      icon: <IconUsers className="h-4 w-4" />,
    },
    {
      key: 'createAdmin',
      label: t('dashboard.admin.sidebar.createAdmin'),
      icon: <IconSpark className="h-4 w-4" />,
    },
  ]

  const activeSection: AdminSection = ALLOWED_ADMIN_SECTIONS.includes((section ?? 'overview') as AdminSection)
    ? ((section ?? 'overview') as AdminSection)
    : 'overview'

  useEffect(() => {
    if (!section) return
    if (ALLOWED_ADMIN_SECTIONS.includes(section as AdminSection)) return
    navigate('/admin/overview', { replace: true })
  }, [navigate, section])

  const detailTitleBySection: Record<AdminSection, string> = {
    overview: t('dashboard.admin.details.overview.title'),
    employers: t('dashboard.admin.sidebar.employers'),
    candidates: t('dashboard.admin.details.candidates.title'),
    userGroups: t('dashboard.admin.details.userGroups.title'),
    users: t('dashboard.admin.details.users.title'),
    createAdmin: t('dashboard.admin.register.title'),
  }

  const detailBodyBySection: Record<Exclude<AdminSection, 'createAdmin'>, string> = {
    overview: t('dashboard.admin.details.overview.body'),
    employers: t('dashboard.admin.details.employers.body'),
    candidates: t('dashboard.admin.details.candidates.body'),
    userGroups: t('dashboard.admin.details.userGroups.body'),
    users: t('dashboard.admin.details.users.body'),
  }

  function handleSidebarItemClick(section: AdminSection) {
    navigate(`/admin/${section}`)
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onSidebarClose()
    }
  }

  const detailId = entityId ? Number(entityId) : null
  const safeDetailId = Number.isFinite(detailId) && (detailId as number) > 0 ? (detailId as number) : null

  return (
    <section className="w-full overflow-x-hidden">
      <div className="relative">
        {isSidebarOpen ? (
          <button
            type="button"
            aria-label={t('dashboard.admin.sidebar.closeAria')}
            className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
            onClick={onSidebarClose}
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[260px] border p-3 transition-transform duration-300 lg:top-[4.5rem] lg:h-[calc(100svh-4.5rem)] lg:rounded-none lg:border-r lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${
            theme === 'dark'
              ? 'border-slate-700 bg-[#0f1f35]'
              : 'border-sky-200 bg-[#0c2340]'
          }`}
        >
          <div className="rounded-2xl bg-white/10 px-3 py-3 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-200">
              {t('landing.meta.title')}
            </p>
            <p className="mt-1 text-sm font-medium text-white">{t('dashboard.admin.title')}</p>
          </div>

          <div className="mt-4 px-1">
            <GlowBadge theme={theme === 'dark' ? 'dark' : 'light'}>
            {t('dashboard.common.welcome', {
              email: meDisplayName ?? session?.email ?? 'unknown',
            })}
            </GlowBadge>
          </div>

          <nav className="mt-3 flex flex-col gap-2">
            {sidebarItems.map((item) => {
              const isNavActive = activeSection === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleSidebarItemClick(item.key)}
                  className="flex min-h-11 w-full items-center gap-3 text-start text-sm font-medium"
                >
                  <span className={isNavActive ? 'text-sky-200' : 'text-slate-300'}>{item.icon}</span>
                  <InteractiveButton theme={theme} isActive={isNavActive} className="w-full justify-start">
                    <span className="truncate">{item.label}</span>
                  </InteractiveButton>
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="min-w-0 space-y-4 px-3 py-4 sm:px-4 sm:py-5 lg:ml-[260px] lg:px-6 lg:py-6">
          <DashboardSurface theme={theme} className="sm:p-6">
            <h2
              className={`font-display text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              {detailTitleBySection[activeSection]}
            </h2>

            {activeSection !== 'createAdmin' ? (
              <>
                <p
                  className={`mt-3 text-sm leading-relaxed ${
                    theme === 'dark' ? 'text-white/65' : 'text-slate-600'
                  }`}
                >
                  {detailBodyBySection[activeSection]}
                </p>

                {activeSection === 'employers' ? (
                  <EmployersSection
                    isActive={activeSection === 'employers'}
                    detailId={safeDetailId}
                    onOpenDetail={(id) => navigate(`/admin/employers/${id}`)}
                    onCloseDetail={() => navigate('/admin/employers')}
                  />
                ) : null}
                {activeSection === 'candidates' ? (
                  <CandidatesSection
                    isActive={activeSection === 'candidates'}
                    detailId={safeDetailId}
                    onOpenDetail={(id) => navigate(`/admin/candidates/${id}`)}
                    onCloseDetail={() => navigate('/admin/candidates')}
                  />
                ) : null}
                {activeSection === 'userGroups' ? (
                  <UserGroupsSection
                    isActive={activeSection === 'userGroups'}
                    detailId={safeDetailId}
                    onOpenDetail={(id) => navigate(`/admin/userGroups/${id}`)}
                    onCloseDetail={() => navigate('/admin/userGroups')}
                  />
                ) : null}
                {activeSection === 'users' ? (
                  <UsersSection
                    isActive={activeSection === 'users'}
                    detailId={safeDetailId}
                    onOpenDetail={(id) => navigate(`/admin/users/${id}`)}
                    onCloseDetail={() => navigate('/admin/users')}
                  />
                ) : null}
              </>
            ) : null}

            {activeSection === 'createAdmin' ? (
              <>
                <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-white/65' : 'text-slate-600'}`}>
                  {t('dashboard.admin.register.subtitle')}
                </p>

                <form className="mt-5 grid gap-3 sm:grid-cols-2" onSubmit={handleCreateAdmin}>
                  <label className="space-y-1.5">
                    <span
                      className={`text-xs font-medium ${
                        theme === 'dark' ? 'text-white/75' : 'text-slate-600'
                      }`}
                    >
                      {t('dashboard.admin.register.firstName')}
                    </span>
                    <input
                      name="firstName"
                      type="text"
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${
                        theme === 'dark'
                          ? 'border-white/15 bg-white/5 text-white placeholder:text-white/35 focus:border-[#14f1d9]/55 focus:ring-2 focus:ring-[#14f1d9]/20'
                          : 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
                      }`}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span
                      className={`text-xs font-medium ${
                        theme === 'dark' ? 'text-white/75' : 'text-slate-600'
                      }`}
                    >
                      {t('dashboard.admin.register.lastName')}
                    </span>
                    <input
                      name="lastName"
                      type="text"
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${
                        theme === 'dark'
                          ? 'border-white/15 bg-white/5 text-white placeholder:text-white/35 focus:border-[#14f1d9]/55 focus:ring-2 focus:ring-[#14f1d9]/20'
                          : 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
                      }`}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span
                      className={`text-xs font-medium ${
                        theme === 'dark' ? 'text-white/75' : 'text-slate-600'
                      }`}
                    >
                      {t('dashboard.admin.register.email')}
                    </span>
                    <input
                      name="email"
                      type="email"
                      required
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${
                        theme === 'dark'
                          ? 'border-white/15 bg-white/5 text-white placeholder:text-white/35 focus:border-[#14f1d9]/55 focus:ring-2 focus:ring-[#14f1d9]/20'
                          : 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
                      }`}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span
                      className={`text-xs font-medium ${
                        theme === 'dark' ? 'text-white/75' : 'text-slate-600'
                      }`}
                    >
                      {t('dashboard.admin.register.phone')}
                    </span>
                    <input
                      name="phone"
                      type="tel"
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${
                        theme === 'dark'
                          ? 'border-white/15 bg-white/5 text-white placeholder:text-white/35 focus:border-[#14f1d9]/55 focus:ring-2 focus:ring-[#14f1d9]/20'
                          : 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
                      }`}
                    />
                  </label>

                  <label className="space-y-1.5 sm:col-span-2">
                    <span
                      className={`text-xs font-medium ${
                        theme === 'dark' ? 'text-white/75' : 'text-slate-600'
                      }`}
                    >
                      {t('dashboard.admin.register.password')}
                    </span>
                    <input
                      name="password"
                      type="password"
                      required
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${
                        theme === 'dark'
                          ? 'border-white/15 bg-white/5 text-white placeholder:text-white/35 focus:border-[#14f1d9]/55 focus:ring-2 focus:ring-[#14f1d9]/20'
                          : 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
                      }`}
                    />
                  </label>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#14f1d9] px-5 text-sm font-semibold text-[#041014] transition hover:bg-[#62ffee] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting
                        ? t('dashboard.admin.register.submitting')
                        : t('dashboard.admin.register.submit')}
                    </button>
                  </div>
                </form>

                {submitError ? (
                  <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                    {submitError}
                  </p>
                ) : null}
                {submitSuccess ? (
                  <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
                    {submitSuccess}
                  </p>
                ) : null}
              </>
            ) : null}
          </DashboardSurface>

          {activeSection === 'overview' && summaryStats ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: t('dashboard.admin.cards.employers.title'),
                  value: summaryStats.overview?.activeEmployerCount ?? t('dashboard.admin.summary.loading'),
                  hint: t('dashboard.admin.cards.activeLabel'),
                  subValue:
                    summaryStats.overview?.totalEmployerCount ?? t('dashboard.admin.summary.loading'),
                  subHint: t('dashboard.admin.cards.totalLabel'),
                  icon: <IconBriefcase className="h-5 w-5" />,
                  tone: theme === 'dark' ? 'bg-sky-700 text-sky-50' : 'bg-sky-600 text-white',
                },
                {
                  title: t('dashboard.admin.cards.candidates.title'),
                  value: summaryStats.overview?.activeWorkerCount ?? t('dashboard.admin.summary.loading'),
                  hint: t('dashboard.admin.cards.activeLabel'),
                  subValue:
                    summaryStats.overview?.totalWorkerCount ?? t('dashboard.admin.summary.loading'),
                  subHint: t('dashboard.admin.cards.totalLabel'),
                  icon: <IconUserCircle className="h-5 w-5" />,
                  tone: theme === 'dark' ? 'bg-cyan-700 text-cyan-50' : 'bg-cyan-600 text-white',
                },
                {
                  title: t('dashboard.admin.cards.postings.title'),
                  value: summaryStats.overview?.openJobPostingCount ?? t('dashboard.admin.summary.loading'),
                  hint: t('dashboard.admin.cards.activeLabel'),
                  subValue:
                    summaryStats.overview?.totalJobPostingCount ?? t('dashboard.admin.summary.loading'),
                  subHint: t('dashboard.admin.cards.totalLabel'),
                  icon: <IconClipboardList className="h-5 w-5" />,
                  tone: theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-slate-600 text-white',
                },
                {
                  title: t('dashboard.admin.cards.applications.title'),
                  value:
                    summaryStats.overview?.pendingJobApplicationCount ??
                    t('dashboard.admin.summary.loading'),
                  hint: t('dashboard.admin.cards.activeLabel'),
                  subValue:
                    summaryStats.overview?.totalJobApplicationCount ??
                    t('dashboard.admin.summary.loading'),
                  subHint: t('dashboard.admin.cards.totalLabel'),
                  icon: <IconCheck className="h-5 w-5" />,
                  tone: theme === 'dark' ? 'bg-indigo-700 text-indigo-50' : 'bg-indigo-600 text-white',
                },
              ].map((item) => (
                <DashboardSurface key={item.title} theme={theme} className={item.tone}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-2xl font-semibold">{item.value}</p>
                      <p className="mt-1 text-sm font-medium">{item.title}</p>
                    </div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/10">
                      {item.icon}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs opacity-90">
                    <p>{item.hint}</p>
                    <p className="font-semibold">
                      {item.subHint}: {item.subValue}
                    </p>
                  </div>
                </DashboardSurface>
              ))}
            </div>
          ) : null}
          {activeSection === 'overview' && summaryStats?.overview ? (
            <article
              className={`rounded-2xl border p-4 sm:p-5 ${
                theme === 'dark' ? 'border-white/10 bg-[#121a2b]' : 'border-slate-300/80 bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {t('dashboard.admin.statistics.trendTitle')}
                </h3>
                <IconSpark className={`h-4 w-4 ${theme === 'dark' ? 'text-cyan-300' : 'text-sky-600'}`} />
              </div>
              <div className="mt-4 grid grid-cols-4 items-end gap-2">
                {[
                  parseLocalizedCount(summaryStats.overview.activeEmployerCount),
                  parseLocalizedCount(summaryStats.overview.activeWorkerCount),
                  parseLocalizedCount(summaryStats.overview.openJobPostingCount),
                  parseLocalizedCount(summaryStats.overview.pendingJobApplicationCount),
                ].map((value, index, arr) => {
                  const safeMax = Math.max(...arr, 1)
                  const percent = Math.max(18, Math.round((value / safeMax) * 100))
                  return (
                    <div key={index} className="space-y-2">
                      <div
                        className={`w-full rounded-t-lg ${theme === 'dark' ? 'bg-cyan-400/70' : 'bg-sky-500/80'}`}
                        style={{ height: `${percent}px` }}
                      />
                    </div>
                  )
                })}
              </div>
              <div
                className={`mt-2 grid grid-cols-4 gap-2 text-[11px] ${
                  theme === 'dark' ? 'text-white/70' : 'text-slate-600'
                }`}
              >
                <p className="truncate">{t('dashboard.admin.cards.employers.short')}</p>
                <p className="truncate">{t('dashboard.admin.cards.candidates.short')}</p>
                <p className="truncate">{t('dashboard.admin.cards.postings.short')}</p>
                <p className="truncate">{t('dashboard.admin.cards.applications.short')}</p>
              </div>
            </article>
          ) : null}
          {summaryError ? (
            <p
              className={`rounded-xl border px-3 py-2 text-sm ${
                theme === 'dark'
                  ? 'border-amber-400/30 bg-amber-400/10 text-amber-100'
                  : 'border-amber-300 bg-amber-50 text-amber-800'
              }`}
            >
              {summaryError}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
