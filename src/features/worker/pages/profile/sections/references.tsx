import { Building2, Briefcase, Mail, Pencil, Trash2, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { workerPortalApi } from '../../../../../api/worker/worker-portal'
import { useActionToasts } from '../../../../../notifications/use-action-toasts'
import { StatePanel } from '../../../../../shared/ui/ui-primitives'
import { WorkerGhostButton, WorkerPrimaryButton } from '../../../worker-ui'
import type { WorkerProfileData, WorkerProfileSectionItem } from '../types'
import { ProfileInput } from './common'
import { type TFn, type WorkerTone, resolveMuted, resolveTitle } from './helpers'

function parseReferenceItem(item: WorkerProfileSectionItem) {
  const [firstName = '', lastName = ''] = item.label.split(' ')
  const [company = '', position = '', email = ''] = item.value.split(' • ')
  return {
    id: item.id,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    company: company.trim(),
    position: position.trim(),
    email: email.trim(),
  }
}

export function ReferencesSection({
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
  const [items, setItems] = useState<WorkerProfileSectionItem[]>(profile.references ?? [])
  const [showEditor, setShowEditor] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    setItems(profile.references ?? [])
  }, [profile.references])

  const hasItems = items.length > 0
  const titleCls = resolveTitle(theme)
  const mutedCls = resolveMuted(theme)
  const cardCls =
    theme === 'dark'
      ? 'border-white/12 bg-white/[0.04] shadow-[0_10px_28px_rgba(0,0,0,0.35)]'
      : 'border-slate-200/90 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.07)]'

  const resetForm = () => {
    setEditingId(null)
    setFirstName('')
    setLastName('')
    setCompany('')
    setPosition('')
    setEmail('')
    setShowEditor(false)
  }

  const addOrEditItem = async () => {
    if (!firstName.trim() || !lastName.trim() || !company.trim() || !position.trim() || !email.trim()) return
    try {
      if (editingId) {
        const editingNumericId = Number(editingId)
        if (Number.isFinite(editingNumericId) && editingNumericId > 0) {
          await workerPortalApi.removeReference(editingNumericId)
        }
      }

      const id = await runWithToast(
        workerPortalApi.addReference({
          company: company.trim(),
          position: position.trim(),
          contactFirstName: firstName.trim(),
          contactLastName: lastName.trim(),
          contactEmail: email.trim(),
          contactPhone: null,
        }),
        {
          success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
          error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
        },
      )

      const nextItem: WorkerProfileSectionItem = {
        id: String(id),
        label: `${firstName.trim()} ${lastName.trim()}`,
        value: `${company.trim()} • ${position.trim()} • ${email.trim()}`,
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
      await runWithToast(workerPortalApi.removeReference(numeric), {
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
    <div className="space-y-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="space-y-1">
          <h3 className={`text-base font-semibold leading-tight sm:text-lg ${titleCls}`}>
            {t('dashboard.workerPortal.profile.references')}
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
            <ProfileInput theme={theme} label={`${t('dashboard.workerPortal.profile.fields.fullName')} (Ad)`} value={firstName} onChange={setFirstName} />
            <ProfileInput theme={theme} label={`${t('dashboard.workerPortal.profile.fields.fullName')} (Soyad)`} value={lastName} onChange={setLastName} />
            <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.fields.university')} value={company} onChange={setCompany} />
            <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.experiences')} value={position} onChange={setPosition} />
            <div className="sm:col-span-2">
              <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.fields.email')} value={email} onChange={setEmail} />
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
              disabled={!firstName.trim() || !lastName.trim() || !company.trim() || !position.trim() || !email.trim()}
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
              <UserRound className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <StatePanel text={t('dashboard.workerPortal.states.empty')} theme={theme} />
          </li>
        ) : (
          items.map((item) => (
            <li key={`reference-item-${item.id}`} className="list-none">
              <article className={`relative overflow-hidden rounded-2xl border p-3.5 transition sm:p-4 ${cardCls}`}>
                <div className="relative flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-start">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${theme === 'dark' ? 'border-white/15 bg-white/[0.06] text-cyan-200/90' : 'border-sky-200/70 bg-sky-50 text-sky-700'}`}>
                    <UserRound className="h-[1.125rem] w-[1.125rem]" aria-hidden strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <h4 className={`text-sm font-semibold leading-snug [overflow-wrap:anywhere] sm:text-base ${titleCls}`}>{item.label}</h4>
                    <p className={`flex items-start gap-2 text-xs leading-relaxed sm:text-sm ${mutedCls}`}>
                      <Building2 className="mt-0.5 h-4 w-4 shrink-0 opacity-85" aria-hidden strokeWidth={2} />
                      <span className="min-w-0 [overflow-wrap:anywhere]">{item.value.split(' • ')[0] || '-'}</span>
                    </p>
                    <p className={`flex items-start gap-2 text-xs leading-relaxed sm:text-sm ${mutedCls}`}>
                      <Briefcase className="mt-0.5 h-4 w-4 shrink-0 opacity-85" aria-hidden strokeWidth={2} />
                      <span className="min-w-0 [overflow-wrap:anywhere]">{item.value.split(' • ')[1] || '-'}</span>
                    </p>
                    <p className={`flex items-start gap-2 text-xs leading-relaxed sm:text-sm ${mutedCls}`}>
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 opacity-85" aria-hidden strokeWidth={2} />
                      <span className="min-w-0 [overflow-wrap:anywhere]">{item.value.split(' • ')[2] || '-'}</span>
                    </p>
                  </div>
                  <div className={`flex w-full gap-2 border-t pt-3 min-[380px]:w-auto min-[380px]:shrink-0 min-[380px]:flex-col min-[380px]:border-t-0 min-[380px]:pt-0 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
                    <button
                      type="button"
                      onClick={() => {
                        const parsed = parseReferenceItem(item)
                        setEditingId(parsed.id)
                        setFirstName(parsed.firstName)
                        setLastName(parsed.lastName)
                        setCompany(parsed.company)
                        setPosition(parsed.position)
                        setEmail(parsed.email)
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
    </div>
  )
}
