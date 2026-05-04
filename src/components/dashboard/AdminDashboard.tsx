import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ApiError,
  createAuthAdapter,
  getAdminSummaryStats,
  jobApplicationsApi,
  systemUsersApi,
} from '../../api'
import type { JobApplicationListItem } from '../../api/job-applications'
import { useAuth } from '../../auth/auth-context'
import { useTheme } from '../../theme/theme-context'
import {
  IconCheck,
  IconShield,
  IconSpark,
  IconUsers,
} from '../landing/icons'

type AdminSection = 'overview' | 'users' | 'approvals' | 'security' | 'createAdmin'

export function AdminDashboard() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const { session } = useAuth()
  const authApi = useMemo(() => createAuthAdapter(), [])
  const [activeSection, setActiveSection] = useState<AdminSection>('overview')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [operationPending, setOperationPending] = useState(false)
  const [operationMessage, setOperationMessage] = useState<string | null>(null)
  const [operationError, setOperationError] = useState<string | null>(null)
  const [approvalItems, setApprovalItems] = useState<JobApplicationListItem[]>([])
  const [meDisplayName, setMeDisplayName] = useState<string | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [summaryStats, setSummaryStats] = useState<{
    systemUsersCount: string
    approvalsCount: string
    securityStatus: string
    usersHint: string
    approvalsHint: string
    securityHint: string
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
          systemUsersCount: formatCount(stats.systemUsersCount),
          approvalsCount: formatCount(stats.approvalsCount),
          securityStatus: stats.securityStatus || t('dashboard.admin.cards.security.value'),
          usersHint: stats.usersHint || t('dashboard.admin.cards.systemUsers.hint'),
          approvalsHint:
            stats.approvalsHint || t('dashboard.admin.cards.approvals.hint'),
          securityHint: stats.securityHint || t('dashboard.admin.cards.security.hint'),
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

  async function runSystemUserAction(
    action: 'suspend' | 'reactivate' | 'ban',
    systemUserId: number,
  ) {
    setOperationError(null)
    setOperationMessage(null)
    setOperationPending(true)
    try {
      if (action === 'suspend') {
        await systemUsersApi.suspend({ systemUserId })
        setOperationMessage(t('dashboard.admin.actions.userSuspendSuccess'))
      } else if (action === 'reactivate') {
        await systemUsersApi.reactivate({ systemUserId })
        setOperationMessage(t('dashboard.admin.actions.userReactivateSuccess'))
      } else {
        await systemUsersApi.ban({ systemUserId })
        setOperationMessage(t('dashboard.admin.actions.userBanSuccess'))
      }
    } catch {
      setOperationError(t('dashboard.admin.actions.genericError'))
    } finally {
      setOperationPending(false)
    }
  }

  async function handleUserActionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (operationPending) return

    const formData = new FormData(event.currentTarget)
    const action = String(formData.get('action') ?? '') as
      | 'suspend'
      | 'reactivate'
      | 'ban'
    const rawUserId = String(formData.get('systemUserId') ?? '').trim()
    const systemUserId = Number(rawUserId)

    if (!Number.isFinite(systemUserId) || systemUserId <= 0) {
      setOperationError(t('dashboard.admin.actions.invalidUserId'))
      setOperationMessage(null)
      return
    }

    await runSystemUserAction(action, systemUserId)
  }

  async function handlePasswordResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (operationPending) return

    const formData = new FormData(event.currentTarget)
    const rawUserId = String(formData.get('systemUserId') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const systemUserId = Number(rawUserId)

    if (!Number.isFinite(systemUserId) || systemUserId <= 0) {
      setOperationError(t('dashboard.admin.actions.invalidUserId'))
      setOperationMessage(null)
      return
    }
    if (password.trim().length < 6) {
      setOperationError(t('dashboard.admin.actions.invalidPassword'))
      setOperationMessage(null)
      return
    }

    setOperationError(null)
    setOperationMessage(null)
    setOperationPending(true)
    try {
      await systemUsersApi.changePassword({ systemUserId, password })
      setOperationMessage(t('dashboard.admin.actions.passwordResetSuccess'))
      event.currentTarget.reset()
    } catch {
      setOperationError(t('dashboard.admin.actions.genericError'))
    } finally {
      setOperationPending(false)
    }
  }

  async function handleApprovalQuerySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (operationPending) return

    const formData = new FormData(event.currentTarget)
    const rawPostingId = String(formData.get('jobPostingId') ?? '').trim()
    const jobPostingId = Number(rawPostingId)

    if (!Number.isFinite(jobPostingId) || jobPostingId <= 0) {
      setOperationError(t('dashboard.admin.actions.invalidPostingId'))
      setOperationMessage(null)
      return
    }

    setOperationError(null)
    setOperationMessage(null)
    setOperationPending(true)
    try {
      const items = await jobApplicationsApi.list({ jobPostingId })
      setApprovalItems(items)
      setOperationMessage(
        t('dashboard.admin.actions.approvalQuerySuccess', {
          count: items.length,
        }),
      )
    } catch {
      setOperationError(t('dashboard.admin.actions.genericError'))
      setApprovalItems([])
    } finally {
      setOperationPending(false)
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
      key: 'users',
      label: t('dashboard.admin.sidebar.users'),
      icon: <IconUsers className="h-4 w-4" />,
    },
    {
      key: 'approvals',
      label: t('dashboard.admin.sidebar.approvals'),
      icon: <IconCheck className="h-4 w-4" />,
    },
    {
      key: 'security',
      label: t('dashboard.admin.sidebar.security'),
      icon: <IconShield className="h-4 w-4" />,
    },
    {
      key: 'createAdmin',
      label: t('dashboard.admin.sidebar.createAdmin'),
      icon: <IconUsers className="h-4 w-4" />,
    },
  ]

  const detailTitleBySection: Record<AdminSection, string> = {
    overview: t('dashboard.admin.details.overview.title'),
    users: t('dashboard.admin.details.users.title'),
    approvals: t('dashboard.admin.details.approvals.title'),
    security: t('dashboard.admin.details.security.title'),
    createAdmin: t('dashboard.admin.register.title'),
  }

  const detailBodyBySection: Record<Exclude<AdminSection, 'createAdmin'>, string> = {
    overview: t('dashboard.admin.details.overview.body'),
    users: t('dashboard.admin.details.users.body'),
    approvals: t('dashboard.admin.details.approvals.body'),
    security: t('dashboard.admin.details.security.body'),
  }

  return (
    <section className="mx-auto max-w-6xl overflow-x-hidden px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="grid gap-3 lg:grid-cols-[240px_1fr] lg:gap-6">
        <aside
          className={`rounded-3xl border p-2 sm:p-3 ${
            theme === 'dark'
              ? 'border-white/10 bg-white/[0.04]'
              : 'border-slate-300/80 bg-white'
          }`}
        >
          <p
            className={`px-2 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              theme === 'dark' ? 'text-[#14f1d9]' : 'text-sky-700'
            }`}
          >
            {t('dashboard.common.welcome', {
              email: meDisplayName ?? session?.email ?? 'unknown',
            })}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:mt-3 lg:flex lg:grid-cols-1 lg:flex-col">
            {sidebarItems.map((item) => {
              const isActive = activeSection === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveSection(item.key)}
                  className={`flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2 text-start text-sm font-medium transition ${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-[#14f1d9]/15 text-[#14f1d9]'
                        : 'bg-sky-100 text-sky-700'
                      : theme === 'dark'
                        ? 'text-white/75 hover:bg-white/8'
                        : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              )
            })}
          </div>
        </aside>

        <div className="min-w-0 space-y-4 lg:space-y-6">
          <div
            className={`rounded-3xl border p-4 sm:p-7 ${
              theme === 'dark'
                ? 'border-white/10 bg-white/[0.04]'
                : 'border-slate-300/80 bg-white'
            }`}
          >
            <h1
              className={`font-display text-2xl font-semibold sm:text-3xl ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              {t('dashboard.admin.title')}
            </h1>
            <p
              className={`mt-2 break-words text-sm sm:text-base ${
                theme === 'dark' ? 'text-white/65' : 'text-slate-600'
              }`}
            >
              {t('dashboard.admin.subtitle')}
            </p>
          </div>

          {summaryStats?.overview ? (
            <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: t('dashboard.admin.statistics.groups.candidateStatus'),
                    icon: <IconSpark className="h-4 w-4" />,
                    items: [
                      {
                        label: t('dashboard.admin.statistics.totalWorkerCount'),
                        value: summaryStats.overview.totalWorkerCount,
                      },
                      {
                        label: t('dashboard.admin.statistics.activeWorkerCount'),
                        value: summaryStats.overview.activeWorkerCount,
                      },
                    ],
                  },
                  {
                    title: t('dashboard.admin.statistics.groups.employerStatus'),
                    icon: <IconUsers className="h-4 w-4" />,
                    items: [
                      {
                        label: t('dashboard.admin.statistics.totalEmployerCount'),
                        value: summaryStats.overview.totalEmployerCount,
                      },
                      {
                        label: t('dashboard.admin.statistics.activeEmployerCount'),
                        value: summaryStats.overview.activeEmployerCount,
                      },
                    ],
                  },
                  {
                    title: t('dashboard.admin.statistics.groups.postingStatus'),
                    icon: <IconShield className="h-4 w-4" />,
                    items: [
                      {
                        label: t('dashboard.admin.statistics.totalJobPostingCount'),
                        value: summaryStats.overview.totalJobPostingCount,
                      },
                      {
                        label: t('dashboard.admin.statistics.openJobPostingCount'),
                        value: summaryStats.overview.openJobPostingCount,
                      },
                    ],
                  },
                  {
                    title: t('dashboard.admin.statistics.groups.applicationStatus'),
                    icon: <IconCheck className="h-4 w-4" />,
                    items: [
                      {
                        label: t('dashboard.admin.statistics.totalJobApplicationCount'),
                        value: summaryStats.overview.totalJobApplicationCount,
                      },
                      {
                        label: t('dashboard.admin.statistics.pendingJobApplicationCount'),
                        value: summaryStats.overview.pendingJobApplicationCount,
                      },
                      {
                        label: t('dashboard.admin.statistics.acceptedJobApplicationCount'),
                        value: summaryStats.overview.acceptedJobApplicationCount,
                      },
                      {
                        label: t('dashboard.admin.statistics.rejectedJobApplicationCount'),
                        value: summaryStats.overview.rejectedJobApplicationCount,
                      },
                    ],
                  },
                  {
                    title: t('dashboard.admin.statistics.groups.activationStatus'),
                    icon: <IconShield className="h-4 w-4" />,
                    items: [
                      {
                        label: t('dashboard.admin.statistics.activatedTodayCount'),
                        value: summaryStats.overview.activatedTodayCount,
                      },
                    ],
                  },
                ].map((group) => (
                  <article
                    key={group.title}
                    className={`rounded-3xl border p-4 sm:p-6 ${
                      theme === 'dark'
                        ? 'border-white/10 bg-white/[0.04]'
                        : 'border-slate-300/80 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3
                        className={`font-display text-base font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {group.title}
                      </h3>
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${
                          theme === 'dark'
                            ? 'bg-[#14f1d9]/12 text-[#14f1d9]'
                            : 'bg-sky-100 text-sky-700'
                        }`}
                      >
                        {group.icon}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {group.items.map((item) => (
                        <div
                          key={`${group.title}-${item.label}`}
                          className="flex items-center justify-between gap-3"
                        >
                          <p
                            className={`text-xs ${
                              theme === 'dark' ? 'text-white/65' : 'text-slate-600'
                            }`}
                          >
                            {item.label}
                          </p>
                          <p
                            className={`font-display text-base font-semibold ${
                              theme === 'dark' ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
          ) : null}
          {summaryError ? (
            <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
              {summaryError}
            </p>
          ) : null}

          <article
            className={`rounded-3xl border p-4 backdrop-blur-xl sm:p-6 ${
              theme === 'dark'
                ? 'border-white/10 bg-white/[0.04]'
                : 'border-slate-300/80 bg-white'
            }`}
          >
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

                {activeSection === 'users' ? (
                  <form
                    className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]"
                    onSubmit={handleUserActionSubmit}
                  >
                    <input
                      name="systemUserId"
                      type="number"
                      min="1"
                      placeholder={t('dashboard.admin.actions.userIdPlaceholder')}
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${
                        theme === 'dark'
                          ? 'border-white/15 bg-white/5 text-white placeholder:text-white/35 focus:border-[#14f1d9]/55 focus:ring-2 focus:ring-[#14f1d9]/20'
                          : 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
                      }`}
                    />
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <button
                        type="submit"
                        name="action"
                        value="suspend"
                        disabled={operationPending}
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-amber-400/40 px-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/10 disabled:opacity-60"
                      >
                        {t('dashboard.admin.actions.suspend')}
                      </button>
                      <button
                        type="submit"
                        name="action"
                        value="reactivate"
                        disabled={operationPending}
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-emerald-400/40 px-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/10 disabled:opacity-60"
                      >
                        {t('dashboard.admin.actions.reactivate')}
                      </button>
                      <button
                        type="submit"
                        name="action"
                        value="ban"
                        disabled={operationPending}
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-rose-400/40 px-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-400/10 disabled:opacity-60"
                      >
                        {t('dashboard.admin.actions.ban')}
                      </button>
                    </div>
                  </form>
                ) : null}

                {activeSection === 'security' ? (
                  <form
                    className="mt-5 grid gap-3 sm:grid-cols-2"
                    onSubmit={handlePasswordResetSubmit}
                  >
                    <input
                      name="systemUserId"
                      type="number"
                      min="1"
                      placeholder={t('dashboard.admin.actions.userIdPlaceholder')}
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${
                        theme === 'dark'
                          ? 'border-white/15 bg-white/5 text-white placeholder:text-white/35 focus:border-[#14f1d9]/55 focus:ring-2 focus:ring-[#14f1d9]/20'
                          : 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
                      }`}
                    />
                    <input
                      name="password"
                      type="password"
                      placeholder={t('dashboard.admin.actions.newPasswordPlaceholder')}
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${
                        theme === 'dark'
                          ? 'border-white/15 bg-white/5 text-white placeholder:text-white/35 focus:border-[#14f1d9]/55 focus:ring-2 focus:ring-[#14f1d9]/20'
                          : 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
                      }`}
                    />
                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        disabled={operationPending}
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-[#14f1d9] px-4 text-sm font-semibold text-[#041014] transition hover:bg-[#62ffee] disabled:opacity-60"
                      >
                        {t('dashboard.admin.actions.resetPassword')}
                      </button>
                    </div>
                  </form>
                ) : null}

                {activeSection === 'approvals' ? (
                  <>
                    <form
                      className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]"
                      onSubmit={handleApprovalQuerySubmit}
                    >
                      <input
                        name="jobPostingId"
                        type="number"
                        min="1"
                        placeholder={t('dashboard.admin.actions.postingIdPlaceholder')}
                        className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${
                          theme === 'dark'
                            ? 'border-white/15 bg-white/5 text-white placeholder:text-white/35 focus:border-[#14f1d9]/55 focus:ring-2 focus:ring-[#14f1d9]/20'
                            : 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={operationPending}
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-[#14f1d9] px-4 text-sm font-semibold text-[#041014] transition hover:bg-[#62ffee] disabled:opacity-60"
                      >
                        {t('dashboard.admin.actions.queryApprovals')}
                      </button>
                    </form>

                    <div className="mt-4 min-w-0 space-y-2">
                      {approvalItems.map((item) => (
                        <div
                          key={`${item.applicationId}-${item.workerId}`}
                          className={`rounded-xl border px-3 py-2 text-sm break-words ${
                            theme === 'dark'
                              ? 'border-white/10 bg-white/[0.03] text-white/80'
                              : 'border-slate-300 bg-slate-50 text-slate-700'
                          }`}
                        >
                          #{item.applicationId} · worker:{' '}
                          {item.workerId} · status: {item.status}
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </>
            ) : null}

            {activeSection === 'createAdmin' ? (
              <>
                <p
                  className={`mt-2 text-sm ${
                    theme === 'dark' ? 'text-white/65' : 'text-slate-600'
                  }`}
                >
                  {t('dashboard.admin.register.subtitle')}
                </p>

                <form
                  className="mt-5 grid gap-3 sm:grid-cols-2"
                  onSubmit={handleCreateAdmin}
                >
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

            {operationError ? (
              <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                {operationError}
              </p>
            ) : null}
            {operationMessage ? (
              <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
                {operationMessage}
              </p>
            ) : null}
          </article>
        </div>
      </div>
    </section>
  )
}
