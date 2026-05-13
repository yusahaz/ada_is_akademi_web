import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Building2, BriefcaseBusiness, Info, MapPin, Save, Trash2, UserRound, Users, X } from 'lucide-react'

import { type EmployerDetail } from '../../../api/employer/employers'
import { ApiError } from '../../../api/core/client'
import { adminManagementApi } from '../../../api/admin/admin-management'
import type { EmployerLocationListItemModel } from '../../../api/employer/employer-locations'
import type { EmployerSupervisorListItemModel } from '../../../api/employer/employer-supervisors'
import type { SystemUserListItem } from '../../../api/system/system-users'
import { DashboardHero, DashboardSurface, StatePanel } from '../../../shared/ui/ui-primitives'
import { cn } from '../../../shared/lib/cn'
import { useTheme } from '../../../theme/theme-context'
import { AccountStatus, EmployerStatus, SystemUserType } from '../../../api/core/enums'
import { employerStatusLocaleKey, parseEmployerStatus } from '../../../shared/lib/employer-status'
import { useNotification } from '../../../notifications/notification-context'
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog'

function statusBadgeClasses(theme: 'light' | 'dark', status: EmployerDetail['status']): string {
  const s = parseEmployerStatus(status)
  if (theme === 'dark') {
    switch (s) {
      case EmployerStatus.Active:
        return 'border-emerald-400/35 bg-emerald-400/15 text-emerald-100'
      case EmployerStatus.Pending:
        return 'border-amber-400/35 bg-amber-400/15 text-amber-100'
      case EmployerStatus.Suspended:
        return 'border-orange-400/35 bg-orange-400/15 text-orange-100'
      case EmployerStatus.Banned:
      default:
        return 'border-rose-400/35 bg-rose-400/15 text-rose-100'
    }
  }
  switch (s) {
    case EmployerStatus.Active:
      return 'border-emerald-200 bg-emerald-50 text-emerald-900'
    case EmployerStatus.Pending:
      return 'border-amber-200 bg-amber-50 text-amber-900'
    case EmployerStatus.Suspended:
      return 'border-orange-200 bg-orange-50 text-orange-950'
    case EmployerStatus.Banned:
    default:
      return 'border-rose-200 bg-rose-50 text-rose-950'
  }
}

function RequiredMark({ theme, title }: { theme: 'light' | 'dark'; title: string }) {
  return (
    <abbr
      title={title}
      className={cn('ml-0.5 cursor-help font-semibold no-underline', theme === 'dark' ? 'text-rose-300' : 'text-rose-600')}
    >
      *
    </abbr>
  )
}

function formatApiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) return fallback
  const parts: string[] = []
  if (error.message) parts.push(error.message)
  if (error.code) parts.push(`(${error.code})`)
  return parts.length > 0 ? parts.join(' ') : fallback
}

function buildMiniMapEmbedUrl(latitude: number, longitude: number): string {
  const delta = 0.008
  const left = longitude - delta
  const right = longitude + delta
  const top = latitude + delta
  const bottom = latitude - delta
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${latitude}%2C${longitude}`
}

function humanizeEmailAlias(email: string): string {
  const alias = String(email ?? '').split('@')[0]?.trim() ?? ''
  if (!alias) return ''
  return alias
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function parseAccountStatusValue(value: unknown): AccountStatus | null {
  const n = Number(value)
  if (Number.isFinite(n)) {
    if (n === AccountStatus.Pending || n === AccountStatus.Active || n === AccountStatus.Suspended || n === AccountStatus.Banned) {
      return n as AccountStatus
    }
  }
  const s = String(value ?? '').trim().toLowerCase()
  if (!s) return null
  if (s === 'pending') return AccountStatus.Pending
  if (s === 'active') return AccountStatus.Active
  if (s === 'suspended') return AccountStatus.Suspended
  if (s === 'banned') return AccountStatus.Banned
  return null
}

function parseSystemUserTypeValue(value: unknown): SystemUserType | null {
  const n = Number(value)
  if (Number.isFinite(n)) {
    if (n === SystemUserType.Admin || n === SystemUserType.Employer || n === SystemUserType.Supervisor || n === SystemUserType.Worker) {
      return n as SystemUserType
    }
  }
  const s = String(value ?? '').trim().toLowerCase()
  if (!s) return null
  if (s === 'admin') return SystemUserType.Admin
  if (s === 'employer') return SystemUserType.Employer
  if (s === 'supervisor') return SystemUserType.Supervisor
  if (s === 'worker' || s === 'candidate') return SystemUserType.Worker
  return null
}

function userAccountStatusBadgeClasses(theme: 'light' | 'dark', status: unknown): string {
  const s = parseAccountStatusValue(status)
  if (theme === 'dark') {
    switch (s) {
      case AccountStatus.Active:
        return 'border-emerald-400/35 bg-emerald-400/15 text-emerald-100'
      case AccountStatus.Pending:
        return 'border-amber-400/35 bg-amber-400/15 text-amber-100'
      case AccountStatus.Suspended:
        return 'border-orange-400/35 bg-orange-400/15 text-orange-100'
      case AccountStatus.Banned:
      default:
        return 'border-white/15 bg-white/[0.05] text-white/75'
    }
  }
  switch (s) {
    case AccountStatus.Active:
      return 'border-emerald-200 bg-emerald-50 text-emerald-900'
    case AccountStatus.Pending:
      return 'border-amber-200 bg-amber-50 text-amber-900'
    case AccountStatus.Suspended:
      return 'border-orange-200 bg-orange-50 text-orange-950'
    case AccountStatus.Banned:
    default:
      return 'border-slate-200 bg-slate-100 text-slate-700'
  }
}

export function AdminEmployerDetailPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const { success, error: notifyError } = useNotification()
  const params = useParams<{ entityId?: string }>()
  const employerId = Number(params.entityId ?? '')

  const [detail, setDetail] = useState<EmployerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [taxNumber, setTaxNumber] = useState('')
  const [description, setDescription] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [saveBusy, setSaveBusy] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [locations, setLocations] = useState<EmployerLocationListItemModel[]>([])
  const [locationsLoading, setLocationsLoading] = useState(false)
  const [locationsError, setLocationsError] = useState<string | null>(null)

  const [users, setUsers] = useState<SystemUserListItem[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [supervisors, setSupervisors] = useState<EmployerSupervisorListItemModel[]>([])

  const loadDetail = useCallback(async () => {
    if (!Number.isFinite(employerId) || employerId <= 0) {
      setError(t('dashboard.admin.employers.invalidId'))
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const d = await adminManagementApi.getEmployerById({ employerId })
      setDetail(d)
    } catch {
      setDetail(null)
      setError(t('dashboard.admin.employers.fetchError'))
    } finally {
      setLoading(false)
    }
  }, [employerId, t])

  useEffect(() => {
    void loadDetail()
  }, [loadDetail])

  const loadRelatedLists = useCallback(async () => {
    if (!Number.isFinite(employerId) || employerId <= 0) return
    setLocationsLoading(true)
    setUsersLoading(true)
    setLocationsError(null)
    setUsersError(null)
    const [locResult, userResult, supervisorResult] = await Promise.allSettled([
      adminManagementApi.listEmployerLocations({ employerId, limit: 20, offset: 0 }),
      adminManagementApi.listSystemUsers({ employerId, limit: 20, offset: 0, type: null, accountStatus: null, searchEmail: null }),
      adminManagementApi.listEmployerSupervisors({ employerId }),
    ])

    if (locResult.status === 'fulfilled') {
      setLocations(locResult.value.data ?? [])
      setLocationsError(null)
    } else {
      setLocations([])
      setLocationsError(formatApiErrorMessage(locResult.reason, 'İşlem sırasında bir hata oluştu'))
    }

    if (userResult.status === 'fulfilled') {
      setUsers((Array.isArray(userResult.value) ? userResult.value : userResult.value.data ?? []).filter(Boolean))
      setUsersError(null)
    } else {
      setUsers([])
      setUsersError(formatApiErrorMessage(userResult.reason, 'İşlem sırasında bir hata oluştu'))
    }

    // Supervisor list is optional on this admin screen; do not fail other sections if this call is unauthorized.
    if (supervisorResult.status === 'fulfilled') {
      setSupervisors(Array.isArray(supervisorResult.value) ? supervisorResult.value : [])
    } else {
      setSupervisors([])
    }

    setLocationsLoading(false)
    setUsersLoading(false)
  }, [employerId])

  useEffect(() => {
    // Load once per employer, and refresh after successful profile update via loadDetail().
    void loadRelatedLists()
  }, [loadRelatedLists])

  useEffect(() => {
    if (!detail) return
    setName(detail.name)
    setTaxNumber(detail.taxNumber)
    setDescription(detail.description ?? '')
    setFirstName(detail.contact?.firstName ?? '')
    setLastName(detail.contact?.lastName ?? '')
    setEmail(detail.contact?.email ?? '')
    setPhone(detail.contact?.phone ?? '')
    setFormError(null)
  }, [detail])

  const inputClass = cn(
    'w-full rounded-xl border px-3 py-2.5 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-offset-1 min-w-0 sm:text-sm',
    theme === 'dark'
      ? 'border-white/18 bg-white/[0.04] text-white placeholder:text-white/38 focus-visible:border-cyan-400/45 focus-visible:ring-cyan-400/35 focus-visible:ring-offset-[#0b0e14]'
      : 'border-slate-200 bg-white text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-sky-400 focus-visible:ring-sky-400/30 focus-visible:ring-offset-white',
  )

  const toneMuted = theme === 'dark' ? 'text-white/65' : 'text-slate-600'
  const toneLabel = theme === 'dark' ? 'text-white/80' : 'text-slate-700'
  const sectionCard = cn(
    'rounded-2xl border p-5 sm:p-6',
    theme === 'dark' ? 'border-white/[0.09] bg-white/[0.025]' : 'border-slate-200/90 bg-white shadow-sm',
  )
  const sectionIconWrap = cn(
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
    theme === 'dark' ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200' : 'border-sky-200 bg-sky-50 text-sky-700',
  )

  const onSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!detail || !Number.isFinite(employerId) || employerId <= 0) return
    setFormError(null)
    const n = name.trim()
    const tax = taxNumber.trim()
    const fn = firstName.trim()
    const ln = lastName.trim()
    const em = email.trim()
    const ph = phone.trim()
    if (!n || !tax || !fn || !ln || !em || !ph) {
      setFormError(t('dashboard.admin.employers.detail.validationRequired'))
      return
    }
    setSaveBusy(true)
    try {
      await adminManagementApi.updateEmployerProfile({
        employerId,
        name: n,
        taxNumber: tax,
        description: description.trim() || null,
        firstName: fn,
        lastName: ln,
        email: em,
        phone: ph,
      })
      await loadDetail()
    } catch (err) {
      // Global mutation toasts show generic status; keep the exact API message visible on the form.
      setFormError(formatApiErrorMessage(err, t('dashboard.admin.employers.detail.actions.saveError')))
    } finally {
      setSaveBusy(false)
    }
  }

  const confirmDelete = async () => {
    if (!Number.isFinite(employerId) || employerId <= 0) return
    setDeleteBusy(true)
    try {
      await adminManagementApi.deleteEmployer({ employerId })
      success(t('dashboard.admin.employers.delete.success'))
      setDeleteOpen(false)
      navigate('/admin/employers')
    } catch {
      notifyError(t('dashboard.admin.employers.delete.error'))
    } finally {
      setDeleteBusy(false)
    }
  }

  const actionsDisabled = saveBusy || deleteBusy || loading || !detail

  const statusLabel = (s: unknown) => {
    const parsed = parseAccountStatusValue(s)
    if (parsed == null) return '—'
    const key = String(parsed)
    const translated = t(`dashboard.admin.users.status.${key}`)
    return translated.startsWith('dashboard.') ? '—' : translated
  }
  const userTypeLabel = (type: unknown) => {
    const parsed = parseSystemUserTypeValue(type)
    if (parsed == null) return '—'
    const translated = t(`dashboard.admin.users.type.${parsed}`)
    return translated.startsWith('dashboard.') ? '—' : translated
  }

  const supervisorUserIdSet = new Set<number>(supervisors.map((s) => Number(s.systemUserId)).filter((n) => Number.isFinite(n) && n > 0))
  const supervisorsByLocation = new Map<number, EmployerSupervisorListItemModel[]>()
  for (const s of supervisors) {
    for (const locationId of s.assignedLocationIds ?? []) {
      if (!supervisorsByLocation.has(locationId)) supervisorsByLocation.set(locationId, [])
      supervisorsByLocation.get(locationId)!.push(s)
    }
  }

  const heroToolbar =
    detail && !error ? (
      <div
        className="grid w-full grid-cols-1 gap-2 sm:w-full sm:max-w-[26rem] sm:grid-cols-3"
        role="toolbar"
        aria-label={t('dashboard.admin.employers.columns.actions')}
      >
        <button
          type="submit"
          form="admin-employer-detail-form"
          disabled={actionsDisabled}
          className={cn(
            'inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f7fb] disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-[#0f172a]',
            theme === 'dark'
              ? 'border-sky-500 bg-sky-500 text-white hover:bg-sky-400'
              : 'border-sky-600 bg-sky-600 text-white hover:bg-sky-700',
          )}
        >
          <Save className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">{saveBusy ? t('dashboard.admin.employers.detail.actions.saving') : t('dashboard.admin.employers.detail.actions.save')}</span>
        </button>
        <button
          type="button"
          disabled={saveBusy || deleteBusy || loading}
          onClick={() => setDeleteOpen(true)}
          aria-haspopup="dialog"
          className={cn(
            'inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/65 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            theme === 'dark'
              ? 'border-rose-400/55 bg-rose-600/90 text-white shadow-rose-950/35 hover:border-rose-300/70 hover:bg-rose-600 focus-visible:ring-offset-[#0b0e14]'
              : 'border-rose-500 bg-rose-600 text-white shadow-[0_2px_10px_rgba(225,29,72,0.35)] hover:border-rose-600 hover:bg-rose-700 focus-visible:ring-offset-white',
          )}
        >
          <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">{t('dashboard.admin.employers.actions.delete')}</span>
        </button>
        <button
          type="button"
          disabled={saveBusy || deleteBusy || loading}
          onClick={() => navigate('/admin/employers')}
          className={cn(
            'inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f7fb] disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-[#0f172a]',
            theme === 'dark'
              ? 'border-sky-400/45 bg-sky-500/20 text-sky-100 hover:bg-sky-500/30'
              : 'border-sky-300 bg-sky-50 text-sky-900 hover:bg-sky-100',
          )}
        >
          <X className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">{t('dashboard.admin.employers.detail.actions.close')}</span>
        </button>
      </div>
    ) : null

  return (
    <>
      <DashboardHero
        theme={theme}
        title={
          detail
            ? t('dashboard.admin.employers.detail.title', { name: detail.name, id: detail.id })
            : t('dashboard.admin.details.employers.title')
        }
        description={t('dashboard.admin.employers.detail.subtitle')}
      >
        {heroToolbar}
      </DashboardHero>

      {error ? <StatePanel theme={theme} text={error} isError /> : null}

      {loading ? (
        <p className={`text-sm ${toneMuted}`}>{t('dashboard.admin.summary.loading')}</p>
      ) : detail && !error ? (
        <div className="space-y-4 pb-[calc(8.5rem+env(safe-area-inset-bottom))] sm:pb-0">
          <DashboardSurface theme={theme} className="!p-0 sm:!p-0">
            {/* Identity summary */}
            <div
              className={cn(
                'border-b px-5 py-6 sm:px-6 sm:py-7',
                theme === 'dark' ? 'border-white/[0.08] bg-gradient-to-br from-white/[0.06] via-transparent to-transparent' : 'border-slate-100 bg-gradient-to-br from-slate-50 via-white to-white',
              )}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <span
                  className={cn(
                    'inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-sm',
                    theme === 'dark' ? 'border-white/14 bg-[#141a22]' : 'border-slate-200 bg-white',
                  )}
                >
                  <BriefcaseBusiness className={cn('h-7 w-7', theme === 'dark' ? 'text-cyan-300' : 'text-sky-600')} aria-hidden />
                </span>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                        statusBadgeClasses(theme, detail.status),
                      )}
                    >
                      {t(`dashboard.admin.employers.status.${employerStatusLocaleKey(detail.status)}`)}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium tabular-nums',
                        theme === 'dark' ? 'border-white/12 bg-black/25 text-white/55' : 'border-slate-200 bg-slate-100 text-slate-600',
                      )}
                    >
                      {t('dashboard.admin.employers.detail.idLabel')} · {detail.id}
                    </span>
                  </div>
                  <div>
                    <h2
                      className={cn(
                        'truncate text-lg font-semibold tracking-tight sm:text-xl',
                        theme === 'dark' ? 'text-white' : 'text-slate-900',
                      )}
                    >
                      {name.trim() || detail.name || t('dashboard.admin.employers.create.employerName')}
                    </h2>
                    <div
                      className={cn(
                        'mt-3 flex gap-3 rounded-xl border px-3 py-2.5 text-sm leading-relaxed',
                        theme === 'dark' ? 'border-cyan-400/15 bg-cyan-400/[0.06] text-white/70' : 'border-sky-100 bg-sky-50/90 text-slate-600',
                      )}
                    >
                      <Info className={cn('mt-0.5 h-4 w-4 shrink-0', theme === 'dark' ? 'text-cyan-300/90' : 'text-sky-600')} aria-hidden />
                      <p id="admin-employer-form-hint">{t('dashboard.admin.employers.detail.formHint')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form
              id="admin-employer-detail-form"
              onSubmit={(e) => void onSave(e)}
              className="space-y-6 px-5 py-6 sm:space-y-7 sm:px-6 sm:py-8"
              aria-describedby="admin-employer-form-hint"
            >
              {formError ? <StatePanel theme={theme} text={formError} isError /> : null}

              <section className={sectionCard} aria-labelledby="employer-section-org-heading">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <span className={sectionIconWrap} aria-hidden>
                      <Building2 className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h3
                        id="employer-section-org-heading"
                        className={cn('text-base font-semibold tracking-tight', theme === 'dark' ? 'text-white' : 'text-slate-900')}
                      >
                        {t('dashboard.admin.employers.detail.sectionOrgTitle')}
                      </h3>
                      <p className={`mt-1 max-w-xl text-xs leading-relaxed sm:text-sm ${toneMuted}`}>
                        {t('dashboard.admin.employers.detail.sectionOrgHint')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'hidden shrink-0 rounded-lg border px-2 py-1 text-[11px] font-medium sm:inline-flex',
                      theme === 'dark' ? 'border-white/12 text-white/45' : 'border-slate-200 text-slate-500',
                    )}
                  >
                    {t('dashboard.admin.employers.detail.requiredField')}
                  </span>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="sm:col-span-2">
                    <span className={cn('mb-1.5 flex items-center text-sm font-medium', toneLabel)}>
                      {t('dashboard.admin.employers.create.employerName')}
                      <RequiredMark theme={theme} title={t('dashboard.admin.employers.detail.requiredField')} />
                    </span>
                    <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="organization" required />
                  </label>
                  <label className="sm:col-span-2 sm:max-w-md">
                    <span className={cn('mb-1.5 flex items-center text-sm font-medium', toneLabel)}>
                      {t('dashboard.admin.employers.taxNo')}
                      <RequiredMark theme={theme} title={t('dashboard.admin.employers.detail.requiredField')} />
                    </span>
                    <input className={inputClass} value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} autoComplete="off" required />
                  </label>
                  <label className="sm:col-span-2">
                    <span className={cn('mb-1.5 block text-sm font-medium', toneLabel)}>{t('dashboard.admin.employers.create.description')}</span>
                    <textarea
                      className={cn(inputClass, 'min-h-[6.25rem] resize-y leading-relaxed')}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </label>
                </div>
              </section>

              <section className={sectionCard} aria-labelledby="employer-section-contact-heading">
                <div className="mb-6 flex gap-4">
                  <span className={sectionIconWrap} aria-hidden>
                    <UserRound className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3
                      id="employer-section-contact-heading"
                      className={cn('text-base font-semibold tracking-tight', theme === 'dark' ? 'text-white' : 'text-slate-900')}
                    >
                      {t('dashboard.admin.employers.create.contactSection')}
                    </h3>
                    <p className={`mt-1 text-xs leading-relaxed sm:text-sm ${toneMuted}`}>
                      {t('dashboard.admin.employers.detail.sectionContactHint')}
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className={cn('mb-1.5 flex items-center text-sm font-medium', toneLabel)}>
                      {t('dashboard.admin.register.firstName')}
                      <RequiredMark theme={theme} title={t('dashboard.admin.employers.detail.requiredField')} />
                    </span>
                    <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" required />
                  </label>
                  <label>
                    <span className={cn('mb-1.5 flex items-center text-sm font-medium', toneLabel)}>
                      {t('dashboard.admin.register.lastName')}
                      <RequiredMark theme={theme} title={t('dashboard.admin.employers.detail.requiredField')} />
                    </span>
                    <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" required />
                  </label>
                  <label className="sm:col-span-2">
                    <span className={cn('mb-1.5 flex items-center text-sm font-medium', toneLabel)}>
                      {t('dashboard.admin.register.email')}
                      <RequiredMark theme={theme} title={t('dashboard.admin.employers.detail.requiredField')} />
                    </span>
                    <input
                      className={inputClass}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </label>
                  <label className="sm:col-span-2">
                    <span className={cn('mb-1.5 flex items-center text-sm font-medium', toneLabel)}>
                      {t('dashboard.admin.register.phone')}
                      <RequiredMark theme={theme} title={t('dashboard.admin.employers.detail.requiredField')} />
                    </span>
                    <input className={inputClass} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" required />
                  </label>
                </div>
              </section>
            </form>
          </DashboardSurface>

          <DashboardSurface theme={theme} className="space-y-3">
            <details open className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition hover:bg-white/[0.03] border-white/10 dark:border-white/10">
                <span className="flex min-w-0 items-center gap-3">
                  <span className={cn('inline-flex h-10 w-10 items-center justify-center rounded-xl border', theme === 'dark' ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200' : 'border-sky-200 bg-sky-50 text-sky-700')}>
                    <MapPin className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className={cn('block truncate text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>Lokasyonlar</span>
                    <span className={cn('block truncate text-xs', theme === 'dark' ? 'text-white/55' : 'text-slate-600')}>
                      {locationsLoading ? 'Yükleniyor…' : `${locations.length} kayıt`}
                    </span>
                  </span>
                </span>
                <span className={cn('text-xs font-semibold', theme === 'dark' ? 'text-white/55' : 'text-slate-600')}>▾</span>
              </summary>

              <div className="mt-3 space-y-2">
                {locationsError ? <StatePanel theme={theme} text={locationsError} isError /> : null}
                {!locationsLoading && locations.length === 0 && !locationsError ? (
                  <p className={cn('px-1 text-sm', theme === 'dark' ? 'text-white/60' : 'text-slate-600')}>Lokasyon bulunamadı.</p>
                ) : null}

                <div className="grid gap-2 sm:grid-cols-2">
                  {locations.map((loc) => (
                    <div
                      key={loc.locationId}
                      className={cn(
                        'rounded-2xl border p-4',
                        theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white shadow-sm',
                      )}
                    >
                      <div className="mb-3 overflow-hidden rounded-xl border border-white/10">
                        <iframe
                          title={`${loc.name} mini map`}
                          src={buildMiniMapEmbedUrl(loc.latitude, loc.longitude)}
                          className="h-24 w-full"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className={cn('truncate text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>{loc.name}</p>
                          <p className={cn('mt-1 truncate text-xs', theme === 'dark' ? 'text-white/60' : 'text-slate-600')}>{loc.city}</p>
                        </div>
                        <span
                          className={cn(
                            'inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                            loc.isActive
                              ? theme === 'dark'
                                ? 'border-emerald-400/35 bg-emerald-400/15 text-emerald-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                              : theme === 'dark'
                                ? 'border-rose-400/35 bg-rose-400/15 text-rose-100'
                                : 'border-rose-200 bg-rose-50 text-rose-950',
                          )}
                        >
                          {loc.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                      <div className={cn('mt-3 text-xs tabular-nums', theme === 'dark' ? 'text-white/55' : 'text-slate-600')}>
                        {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)} · {Math.round(loc.geofenceRadiusMetres)}m
                      </div>
                      <div className={cn('mt-3 flex flex-wrap items-center gap-1.5 text-xs', theme === 'dark' ? 'text-white/70' : 'text-slate-600')}>
                        <span className={cn('inline-flex rounded-full border px-2 py-0.5 font-medium', theme === 'dark' ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100' : 'border-sky-200 bg-sky-50 text-sky-700')}>
                          Supervisor: {(supervisorsByLocation.get(loc.locationId) ?? []).length}
                        </span>
                        {(supervisorsByLocation.get(loc.locationId) ?? []).slice(0, 2).map((s) => (
                          <span
                            key={`${loc.locationId}-${s.systemUserId}`}
                            className={cn('inline-flex rounded-full border px-2 py-0.5 font-medium', theme === 'dark' ? 'border-white/15 bg-white/[0.05] text-white/80' : 'border-slate-200 bg-white text-slate-700')}
                          >
                            {s.fullName || s.email}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          </DashboardSurface>

          <DashboardSurface theme={theme} className="space-y-3">
            <details open className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition hover:bg-white/[0.03] border-white/10 dark:border-white/10">
                <span className="flex min-w-0 items-center gap-3">
                  <span className={cn('inline-flex h-10 w-10 items-center justify-center rounded-xl border', theme === 'dark' ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200' : 'border-sky-200 bg-sky-50 text-sky-700')}>
                    <Users className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className={cn('block truncate text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>Kullanıcılar</span>
                    <span className={cn('block truncate text-xs', theme === 'dark' ? 'text-white/55' : 'text-slate-600')}>
                      {usersLoading ? 'Yükleniyor…' : `${users.length} kayıt`}
                    </span>
                  </span>
                </span>
                <span className={cn('text-xs font-semibold', theme === 'dark' ? 'text-white/55' : 'text-slate-600')}>▾</span>
              </summary>

              <div className="mt-3 space-y-2">
                {usersError ? <StatePanel theme={theme} text={usersError} isError /> : null}
                {!usersLoading && users.length === 0 && !usersError ? (
                  <p className={cn('px-1 text-sm', theme === 'dark' ? 'text-white/60' : 'text-slate-600')}>Kullanıcı bulunamadı.</p>
                ) : null}

                <div className="grid gap-2 sm:grid-cols-2">
                  {users
                    .filter((u) => parseSystemUserTypeValue(u.type) !== SystemUserType.Admin)
                    .map((u) => (
                      <div
                        key={String(u.id)}
                        className={cn(
                          'rounded-2xl border p-4',
                          theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white shadow-sm',
                        )}
                      >
                        {(() => {
                          const supervisor = supervisors.find((s) => Number(s.systemUserId) === Number(u.id))
                          const apiFullName = `${String(u.firstName ?? '').trim()} ${String(u.lastName ?? '').trim()}`.trim()
                          const fullName =
                            apiFullName || supervisor?.fullName || humanizeEmailAlias(String(u.email ?? '')) || 'Ad Soyad bilgisi yok'
                          const contactPhone = String(u.phone ?? '').trim()
                          return (
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className={cn('truncate text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                              {fullName}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                              <span className={cn(theme === 'dark' ? 'text-white/60' : 'text-slate-600')}>
                                {userTypeLabel(u.type)}
                              </span>
                              {supervisorUserIdSet.has(Number(u.id)) ? (
                                <span
                                  className={cn(
                                    'inline-flex rounded-full border px-2 py-0.5 font-semibold',
                                    theme === 'dark'
                                      ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100'
                                      : 'border-sky-200 bg-sky-50 text-sky-700',
                                  )}
                                >
                                  Supervisor
                                </span>
                              ) : null}
                            </div>
                            <div className={cn('mt-2 space-y-0.5 text-xs', theme === 'dark' ? 'text-white/65' : 'text-slate-600')}>
                              <p className="truncate">Telefon: {contactPhone || '—'}</p>
                            </div>
                          </div>
                          <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold', userAccountStatusBadgeClasses(theme, u.accountStatus))}>
                            {statusLabel(u.accountStatus)}
                          </span>
                        </div>
                          )
                        })()}
                      </div>
                    ))}
                </div>
              </div>
            </details>
          </DashboardSurface>
        </div>
      ) : null}

      <ConfirmDeleteDialog
        open={deleteOpen}
        theme={theme}
        busy={deleteBusy}
        entityName={detail?.name}
        titleText="İşvereni sil"
        contextPrefixText="İşveren"
        onClose={() => !deleteBusy && setDeleteOpen(false)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  )
}
