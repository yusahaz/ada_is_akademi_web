import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, BookOpen, BriefcaseBusiness, Globe, Phone, Save, Sparkles, UserRound } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { type WorkerDetail } from '../../../api/worker/workers'
import { adminManagementApi } from '../../../api/admin/admin-management'
import { getNationalitySelectOptions } from '../../../shared/lib/nationality-options'
import { AccountStatus } from '../../../api/core/enums'
import { DashboardHero, DashboardSurface, StatePanel } from '../../../shared/ui/ui-primitives'
import { cn } from '../../../shared/lib/cn'
import { useTheme } from '../../../theme/theme-context'
import { useNotification } from '../../../notifications/notification-context'

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

function candidateStatusLabel(status: unknown, t: (key: string) => string): string {
  const parsed = parseAccountStatusValue(status)
  switch (parsed) {
    case AccountStatus.Pending:
      return t('dashboard.admin.candidates.status.0')
    case AccountStatus.Active:
      return t('dashboard.admin.candidates.status.10')
    case AccountStatus.Suspended:
      return t('dashboard.admin.candidates.status.20')
    case AccountStatus.Banned:
      return t('dashboard.admin.candidates.status.30')
    default:
      return '—'
  }
}

function statusBadgeClasses(theme: 'light' | 'dark', status: unknown): string {
  const parsed = parseAccountStatusValue(status)
  if (theme === 'dark') {
    switch (parsed) {
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
  switch (parsed) {
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

function fullName(detail: WorkerDetail | null): string {
  if (!detail?.systemUser) return '—'
  const fn = String(detail.systemUser.firstName ?? '').trim()
  const ln = String(detail.systemUser.lastName ?? '').trim()
  return `${fn} ${ln}`.trim() || '—'
}

export function AdminCandidateDetailPage() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const { success, error: notifyError } = useNotification()
  const navigate = useNavigate()
  const params = useParams<{ entityId?: string }>()
  const candidateId = Number(params.entityId ?? '')

  const [detail, setDetail] = useState<WorkerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveBusy, setSaveBusy] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [nationality, setNationality] = useState('')
  const [university, setUniversity] = useState('')

  const load = useCallback(async () => {
    if (!Number.isFinite(candidateId) || candidateId <= 0) {
      setError(t('dashboard.admin.employers.invalidId'))
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const d = await adminManagementApi.getWorkerDetail({ workerId: candidateId })
      setDetail(d)
    } catch {
      setDetail(null)
      setError(t('dashboard.admin.candidates.detail.loadError'))
    } finally {
      setLoading(false)
    }
  }, [candidateId, t])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!detail) return
    setFirstName(String(detail.systemUser?.firstName ?? '').trim())
    setLastName(String(detail.systemUser?.lastName ?? '').trim())
    setPhone(String(detail.systemUser?.phone ?? '').trim())
    setNationality(String(detail.nationality ?? '').trim())
    setUniversity(String(detail.university ?? '').trim())
  }, [detail])

  const inputClass = cn(
    'h-11 w-full rounded-xl border px-3 text-sm outline-none transition',
    'focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2',
    theme === 'dark'
      ? 'border-white/15 bg-[#0f172a] text-white placeholder:text-white/40 ring-offset-[#0b0e14]'
      : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm ring-offset-white',
  )

  const statusLabel = candidateStatusLabel(detail?.systemUser?.accountStatus, t)

  const skillTags = detail?.skills ?? []
  const languageTags = detail?.languages ?? []
  const experienceRows = detail?.experiences ?? []

  const pageTitle = useMemo(
    () =>
      t('dashboard.admin.candidates.detail.title', {
        name: fullName(detail),
        id: detail?.id ?? candidateId ?? '—',
      }),
    [candidateId, detail, t],
  )

  const nationalityOptions = useMemo(
    () => getNationalitySelectOptions(i18n.language, nationality),
    [i18n.language, nationality],
  )

  const onSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!detail) return
    setSaveBusy(true)
    try {
      await adminManagementApi.updateWorkerProfile({
        workerId: detail.id,
        firstName: firstName || null,
        lastName: lastName || null,
        nationality: nationality || null,
        university: university || null,
        phone: phone || null,
      })
      success('İşlem başarılı')
      await load()
    } catch {
      notifyError('İşlem sırasında bir hata oluştu')
    } finally {
      setSaveBusy(false)
    }
  }

  return (
    <>
      <DashboardHero theme={theme} title={pageTitle} description="Adayın profil ve iletişim bilgilerini düzenleyin." />
      {error ? <StatePanel theme={theme} text={error} isError /> : null}

      {loading ? (
        <StatePanel theme={theme} text={t('dashboard.admin.summary.loading')} />
      ) : detail ? (
        <div className="space-y-4 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:pb-0">
          <DashboardSurface theme={theme} className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className={cn('text-sm font-semibold sm:text-base', theme === 'dark' ? 'text-white' : 'text-slate-900')}>{fullName(detail)}</p>
                <p className={cn('mt-1 text-xs sm:text-sm', theme === 'dark' ? 'text-white/70' : 'text-slate-600')}>
                  {detail.systemUser?.email || '—'}
                </p>
              </div>
              <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold', statusBadgeClasses(theme, detail.systemUser?.accountStatus))}>
                {statusLabel}
              </span>
            </div>
            <div className="grid gap-2 text-xs sm:grid-cols-3">
              <p className={cn(theme === 'dark' ? 'text-white/65' : 'text-slate-600')}>Aday ID: #{detail.id}</p>
              <p className={cn(theme === 'dark' ? 'text-white/65' : 'text-slate-600')}>Sistem Kullanıcı: #{detail.systemUserId}</p>
              <p className={cn(theme === 'dark' ? 'text-white/65' : 'text-slate-600')}>
                Embedding: {detail.embeddingUpdatedAt ? 'Hazır' : 'Bekliyor'}
              </p>
            </div>
          </DashboardSurface>

          <form onSubmit={onSave} className="grid gap-4 lg:grid-cols-3">
            <DashboardSurface theme={theme} className="space-y-3 lg:col-span-2">
              <div className="flex items-center gap-2">
                <UserRound className={cn('h-4 w-4', theme === 'dark' ? 'text-cyan-200' : 'text-sky-700')} />
                <p className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>Profil Bilgileri</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className={cn('mb-1.5 block text-xs font-semibold uppercase tracking-wide', theme === 'dark' ? 'text-white/55' : 'text-slate-600')}>Ad</span>
                  <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </label>
                <label>
                  <span className={cn('mb-1.5 block text-xs font-semibold uppercase tracking-wide', theme === 'dark' ? 'text-white/55' : 'text-slate-600')}>Soyad</span>
                  <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </label>
                <label>
                  <span className={cn('mb-1.5 block text-xs font-semibold uppercase tracking-wide', theme === 'dark' ? 'text-white/55' : 'text-slate-600')}>Telefon</span>
                  <div className="relative">
                    <Phone className={cn('pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2', theme === 'dark' ? 'text-white/45' : 'text-slate-400')} />
                    <input className={cn(inputClass, 'pl-9')} value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </label>
                <label>
                  <span className={cn('mb-1.5 block text-xs font-semibold uppercase tracking-wide', theme === 'dark' ? 'text-white/55' : 'text-slate-600')}>Milliyet</span>
                  <select className={inputClass} value={nationality} onChange={(e) => setNationality(e.target.value)}>
                    <option value="">{t('dashboard.workerPortal.profile.fields.nationalityPlaceholder')}</option>
                    {nationalityOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="sm:col-span-2">
                  <span className={cn('mb-1.5 block text-xs font-semibold uppercase tracking-wide', theme === 'dark' ? 'text-white/55' : 'text-slate-600')}>Üniversite</span>
                  <input className={inputClass} value={university} onChange={(e) => setUniversity(e.target.value)} />
                </label>
              </div>
            </DashboardSurface>

            <div className="space-y-4">
              <DashboardSurface theme={theme} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className={cn('h-4 w-4', theme === 'dark' ? 'text-emerald-200' : 'text-emerald-700')} />
                  <p className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                    {t('dashboard.admin.candidates.detail.skillsTitle')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skillTags.length > 0 ? (
                    skillTags.map((skill) => (
                      <span key={String(skill.id)} className={cn('inline-flex rounded-full border px-2 py-1 text-[11px] font-medium', theme === 'dark' ? 'border-white/15 bg-white/[0.04] text-white/85' : 'border-slate-200 bg-slate-100 text-slate-700')}>
                        {skill.tag}
                      </span>
                    ))
                  ) : (
                    <p className={cn('text-xs', theme === 'dark' ? 'text-white/60' : 'text-slate-600')}>
                      {t('dashboard.admin.candidates.detail.emptySkills')}
                    </p>
                  )}
                </div>
              </DashboardSurface>

              <DashboardSurface theme={theme} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className={cn('h-4 w-4', theme === 'dark' ? 'text-sky-200' : 'text-sky-700')} />
                  <p className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                    {t('dashboard.admin.candidates.detail.languagesTitle')}
                  </p>
                </div>
                <div className="space-y-1">
                  {languageTags.length > 0 ? (
                    languageTags.map((lang) => (
                      <p key={String(lang.id)} className={cn('text-xs', theme === 'dark' ? 'text-white/80' : 'text-slate-700')}>
                        {(lang.language ?? '—') + ` (Seviye ${lang.level ?? '—'})`}
                      </p>
                    ))
                  ) : (
                    <p className={cn('text-xs', theme === 'dark' ? 'text-white/60' : 'text-slate-600')}>
                      {t('dashboard.admin.candidates.detail.emptyLanguages')}
                    </p>
                  )}
                </div>
              </DashboardSurface>
            </div>

            <DashboardSurface theme={theme} className="space-y-3 lg:col-span-3">
              <div className="flex items-center gap-2">
                <BriefcaseBusiness className={cn('h-4 w-4', theme === 'dark' ? 'text-violet-200' : 'text-violet-700')} />
                <p className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                  {t('dashboard.admin.candidates.detail.experienceTitle')}
                </p>
              </div>
              {experienceRows.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {experienceRows.map((exp) => (
                    <div key={String(exp.id)} className={cn('rounded-xl border p-3', theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50')}>
                      <p className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>{exp.position || '—'}</p>
                      <p className={cn('mt-0.5 text-xs', theme === 'dark' ? 'text-white/70' : 'text-slate-600')}>{exp.companyName || '—'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={cn('text-xs', theme === 'dark' ? 'text-white/60' : 'text-slate-600')}>
                  {t('dashboard.admin.candidates.detail.emptyExperiences')}
                </p>
              )}
            </DashboardSurface>

            <DashboardSurface theme={theme} className="space-y-2 lg:col-span-3">
              <div className="flex items-center gap-2">
                <BookOpen className={cn('h-4 w-4', theme === 'dark' ? 'text-amber-200' : 'text-amber-700')} />
                <p className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                  {t('dashboard.admin.candidates.detail.educationTitle')}
                </p>
              </div>
              {detail.educations.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {detail.educations.map((edu) => (
                    <p key={String(edu.id)} className={cn('rounded-xl border px-3 py-2 text-xs', theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-white/80' : 'border-slate-200 bg-slate-50 text-slate-700')}>
                      {edu.school || '—'} - {edu.department || '—'}
                    </p>
                  ))}
                </div>
              ) : (
                <p className={cn('text-xs', theme === 'dark' ? 'text-white/60' : 'text-slate-600')}>
                  {t('dashboard.admin.candidates.detail.emptyEducations')}
                </p>
              )}
            </DashboardSurface>

            <div
              className={cn(
                'fixed inset-x-0 bottom-0 z-20 border-t p-3 backdrop-blur-md sm:static sm:inset-auto sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-0',
                theme === 'dark' ? 'border-white/10 bg-[#0b0e14]/92' : 'border-slate-200 bg-white/95',
              )}
            >
              <div className="mx-auto flex max-w-screen-2xl items-center justify-end gap-2 sm:justify-start">
                <button
                  type="button"
                  onClick={() => navigate('/admin/candidates')}
                  className={cn(
                    'inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition sm:text-sm',
                    theme === 'dark' ? 'border-white/15 bg-white/[0.03] text-white/85 hover:bg-white/[0.08]' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
                  )}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Listeye Dön
                </button>
                <button
                  type="submit"
                  disabled={saveBusy}
                  className={cn(
                    'inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition disabled:opacity-60 sm:text-sm',
                    theme === 'dark' ? 'border-cyan-400/60 bg-cyan-500/85 text-slate-950 hover:bg-cyan-400' : 'border-cyan-500 bg-cyan-600 text-white hover:bg-cyan-700',
                  )}
                >
                  <Save className="h-4 w-4" aria-hidden />
                  {saveBusy ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </>
  )
}
