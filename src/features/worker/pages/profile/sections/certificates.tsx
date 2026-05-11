import { Award, Building2, CalendarRange, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { workerPortalApi } from '../../../../../api/worker/worker-portal'
import { useActionToasts } from '../../../../../notifications/use-action-toasts'
import { DashboardSurface, StatePanel } from '../../../../../shared/ui/ui-primitives'
import { WorkerGhostButton, WorkerPrimaryButton } from '../../../worker-ui'
import type { WorkerProfileData, WorkerProfileSectionItem } from '../types'
import { ProfileInput } from './common'
import { dateInputClass, type TFn, type WorkerTone, resolveMuted, resolveTitle } from './helpers'

function dateToMonthValue(value: string): string {
  const normalized = value.trim()
  if (!normalized) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized.slice(0, 7)
  return ''
}

function monthValueToDate(value: string): string {
  const normalized = value.trim()
  if (!normalized || !/^\d{4}-\d{2}$/.test(normalized)) return ''
  return `${normalized}-01`
}

function formatMonth(value: string) {
  const date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('tr-TR', { month: '2-digit', year: 'numeric' })
}

function parseCertificateItem(item: WorkerProfileSectionItem) {
  const name = item.label.trim()
  const [organizationRaw = '', periodRaw = ''] = item.value.split(' • ')
  const [issuedRaw = '', expiresRaw = ''] = periodRaw.split(' - ')
  return {
    id: item.id,
    name,
    organization: organizationRaw.trim(),
    issuedAt: dateToMonthValue(issuedRaw.trim()),
    expiresAt: expiresRaw.trim() && expiresRaw.trim() !== '...' ? dateToMonthValue(expiresRaw.trim()) : '',
  }
}

export function CertificatesSection({
  profile,
  theme,
  t,
  runWithToast,
}: {
  profile: WorkerProfileData
  theme: WorkerTone
  t: TFn
  runWithToast: ReturnType<typeof useActionToasts>['runWithToast']
}) {
  const { i18n } = useTranslation()
  const inputLocale = (i18n.resolvedLanguage || i18n.language || 'tr').toLowerCase()

  const [items, setItems] = useState<WorkerProfileSectionItem[]>(profile.certificates ?? [])
  const [showEditor, setShowEditor] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [issuedAt, setIssuedAt] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  useEffect(() => {
    setItems(profile.certificates ?? [])
  }, [profile.certificates])

  const hasItems = items.length > 0
  const titleCls = resolveTitle(theme)
  const mutedCls = resolveMuted(theme)
  const cardCls =
    theme === 'dark'
      ? 'border-white/12 bg-white/[0.04] shadow-[0_10px_28px_rgba(0,0,0,0.35)]'
      : 'border-slate-200/90 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.07)]'

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setOrganization('')
    setIssuedAt('')
    setExpiresAt('')
    setShowEditor(false)
  }

  const addOrEditItem = async () => {
    if (!name.trim() || !organization.trim() || !issuedAt) return
    try {
      if (editingId) {
        const editingNumericId = Number(editingId)
        if (Number.isFinite(editingNumericId) && editingNumericId > 0) {
          await workerPortalApi.removeCertificate(editingNumericId)
        }
      }

      const id = await runWithToast(
        workerPortalApi.addCertificate({
          name: name.trim(),
          issuingOrganization: organization.trim(),
          issuedAt: monthValueToDate(issuedAt),
          expiresAt: expiresAt ? monthValueToDate(expiresAt) : null,
          documentUrl: null,
        }),
        {
          success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
          error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
        },
      )

      const nextItem: WorkerProfileSectionItem = {
        id: String(id),
        label: name.trim(),
        value: `${organization.trim()} • ${formatMonth(monthValueToDate(issuedAt))} - ${expiresAt ? formatMonth(monthValueToDate(expiresAt)) : '...'}`,
      }
      setItems((prev) =>
        editingId ? [...prev.filter((item) => item.id !== editingId), nextItem] : [...prev, nextItem],
      )
      resetForm()
    } catch {
      // toast already handled
    }
  }

  const deleteItem = async (id: string) => {
    const numeric = Number(id)
    if (!Number.isFinite(numeric) || numeric <= 0) return
    try {
      await runWithToast(workerPortalApi.removeCertificate(numeric), {
        success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
        error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
      })
      setItems((prev) => prev.filter((x) => x.id !== id))
    } catch {
      // toast already handled
    }
  }

  const summary = useMemo(
    () => t('dashboard.workerPortal.profile.skillsSection.subtitle'),
    [t],
  )

  return (
    <DashboardSurface theme={theme}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="space-y-1">
          <h3 className={`text-base font-semibold leading-tight sm:text-lg ${titleCls}`}>
            {t('dashboard.workerPortal.profile.certificates')}
          </h3>
          <p className={`text-xs leading-relaxed sm:text-sm ${mutedCls}`}>{summary}</p>
        </div>
        {!showEditor ? (
          <WorkerGhostButton
            tone={theme}
            className="h-10 w-full justify-center sm:mt-0.5 sm:w-auto sm:self-start sm:px-5"
            onClick={() => setShowEditor(true)}
          >
            {t('dashboard.workerPortal.profile.actions.add')}
          </WorkerGhostButton>
        ) : null}
      </div>

      {showEditor ? (
        <div className={`mt-4 space-y-4 border-t pt-4 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200/80'}`}>
          <div className="grid gap-3 sm:grid-cols-2">
            <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.certificates')} value={name} onChange={setName} />
            <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.fields.university')} value={organization} onChange={setOrganization} />
            <div className="grid grid-cols-2 gap-3 sm:col-span-2">
              <label className="space-y-1 text-sm min-w-0">
                <span className={mutedCls}>{t('dashboard.workerPortal.shifts.card.when')}</span>
                <input
                  type="month"
                  lang={inputLocale}
                  value={issuedAt}
                  onChange={(e) => setIssuedAt(e.target.value)}
                  className={dateInputClass(theme)}
                />
              </label>
              <label className="space-y-1 text-sm min-w-0">
                <span className={mutedCls}>{t('dashboard.workerPortal.shifts.card.hours')}</span>
                <input
                  type="month"
                  lang={inputLocale}
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className={dateInputClass(theme)}
                />
              </label>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end sm:gap-3">
            <WorkerGhostButton tone={theme} className="h-10 w-full justify-center sm:w-auto sm:min-w-[7.5rem]" onClick={resetForm}>
              {t('dashboard.workerPortal.profile.actions.cancel')}
            </WorkerGhostButton>
            <WorkerPrimaryButton
              tone={theme}
              className="h-10 w-full justify-center sm:w-auto sm:min-w-[7.5rem]"
              onClick={() => void addOrEditItem()}
              disabled={!name.trim() || !organization.trim() || !issuedAt}
            >
              {t('dashboard.workerPortal.profile.actions.save')}
            </WorkerPrimaryButton>
          </div>
        </div>
      ) : null}

      <ul className="mt-4 space-y-2.5 sm:mt-5">
        {!hasItems ? (
          <li className={`rounded-2xl border border-dashed px-4 py-8 text-center sm:px-6 sm:py-10 ${theme === 'dark' ? 'border-white/20 bg-white/[0.03]' : 'border-slate-300/70 bg-slate-50/50'}`}>
            <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border ${theme === 'dark' ? 'border-white/15 bg-white/[0.06] text-cyan-200/90' : 'border-sky-200/70 bg-sky-50 text-sky-700'}`} aria-hidden>
              <Award className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <StatePanel text={t('dashboard.workerPortal.states.empty')} theme={theme} />
          </li>
        ) : (
          items.map((item) => (
            <li key={`certificate-item-${item.id}`} className="list-none">
              <article className={`relative overflow-hidden rounded-2xl border p-3.5 transition sm:p-4 ${cardCls}`}>
                <div className="relative flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-start">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${theme === 'dark' ? 'border-white/15 bg-white/[0.06] text-cyan-200/90' : 'border-sky-200/70 bg-sky-50 text-sky-700'}`}>
                    <Award className="h-[1.125rem] w-[1.125rem]" aria-hidden strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <h4 className={`text-sm font-semibold leading-snug [overflow-wrap:anywhere] sm:text-base ${titleCls}`}>{item.label}</h4>
                    <p className={`flex items-start gap-2 text-xs leading-relaxed sm:text-sm ${mutedCls}`}>
                      <Building2 className="mt-0.5 h-4 w-4 shrink-0 opacity-85" aria-hidden strokeWidth={2} />
                      <span className="min-w-0 [overflow-wrap:anywhere]">{item.value.split(' • ')[0] || '-'}</span>
                    </p>
                    <p className={`flex items-start gap-2 text-xs leading-relaxed sm:text-sm ${mutedCls}`}>
                      <CalendarRange className="mt-0.5 h-4 w-4 shrink-0 opacity-85" aria-hidden strokeWidth={2} />
                      <span className="min-w-0 [overflow-wrap:anywhere]">{item.value.split(' • ')[1] || '-'}</span>
                    </p>
                  </div>
                  <div className={`flex w-full gap-2 border-t pt-3 min-[380px]:w-auto min-[380px]:shrink-0 min-[380px]:flex-col min-[380px]:border-t-0 min-[380px]:pt-0 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
                    <button
                      type="button"
                      onClick={() => {
                        const parsed = parseCertificateItem(item)
                        setEditingId(parsed.id)
                        setName(parsed.name)
                        setOrganization(parsed.organization)
                        setIssuedAt(parsed.issuedAt)
                        setExpiresAt(parsed.expiresAt)
                        setShowEditor(true)
                      }}
                      className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 min-[380px]:h-10 min-[380px]:w-10 min-[380px]:flex-none min-[380px]:px-0 ${theme === 'dark' ? 'border-white/12 bg-white/[0.06] text-white/90 hover:bg-white/10' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'}`}
                    >
                      <Pencil className="h-4 w-4 shrink-0" aria-hidden strokeWidth={2} />
                      <span className="min-[380px]:sr-only">{t('dashboard.workerPortal.profile.actions.edit')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteItem(item.id)}
                      className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40 min-[380px]:h-10 min-[380px]:w-10 min-[380px]:flex-none min-[380px]:px-0 ${theme === 'dark' ? 'border-rose-400/25 bg-rose-500/10 text-rose-100 hover:bg-rose-500/15' : 'border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100/80'}`}
                    >
                      <Trash2 className="h-4 w-4 shrink-0" aria-hidden strokeWidth={2} />
                      <span className="min-[380px]:sr-only">{t('dashboard.workerPortal.availability.deleteAction')}</span>
                    </button>
                  </div>
                </div>
              </article>
            </li>
          ))
        )}
      </ul>
    </DashboardSurface>
  )
}
