import { useState } from 'react'

import { workerPortalApi } from '../../../../../api/worker/worker-portal'
import { useActionToasts } from '../../../../../notifications/use-action-toasts'
import { WorkerPrimaryButton } from '../../../worker-ui'
import type { WorkerProfileData } from '../types'
import { EditableListSection, ProfileInput } from './common'
import { type TFn, type WorkerTone } from './helpers'

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
  const [items, setItems] = useState(profile.references)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const [email, setEmail] = useState('')

  const addItem = async () => {
    if (!firstName.trim() || !lastName.trim() || !company.trim() || !position.trim() || !email.trim()) return
    try {
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
      setItems((prev) => [...prev, { id: String(id), label: `${firstName} ${lastName}`, value: `${company} • ${position} • ${email}` }])
      setFirstName('')
      setLastName('')
      setCompany('')
      setPosition('')
      setEmail('')
    } catch {
      // toast
    }
  }

  const removeItem = async (id: string) => {
    const numeric = Number(id)
    if (!Number.isFinite(numeric) || numeric <= 0) return
    try {
      await runWithToast(workerPortalApi.removeReference(numeric), {
        success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
        error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
      })
      setItems((prev) => prev.filter((x) => x.id !== id))
    } catch {
      // toast
    }
  }

  return (
    <EditableListSection
      title={t('dashboard.workerPortal.profile.references')}
      items={items}
      theme={theme}
      onRemove={removeItem}
      form={
        <div className="grid gap-2 sm:grid-cols-2">
          <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.fields.fullName')} value={firstName} onChange={setFirstName} />
          <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.fields.fullName')} value={lastName} onChange={setLastName} />
          <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.fields.university')} value={company} onChange={setCompany} />
          <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.experiences')} value={position} onChange={setPosition} />
          <ProfileInput theme={theme} label={t('dashboard.workerPortal.profile.fields.email')} value={email} onChange={setEmail} />
          <WorkerPrimaryButton tone={theme} onClick={() => void addItem()} className="sm:col-span-2">
            {t('dashboard.workerPortal.profile.actions.save')}
          </WorkerPrimaryButton>
        </div>
      }
    />
  )
}
