import { useState } from 'react'

import { workerPortalApi } from '../../../../../api/worker/worker-portal'
import { useActionToasts } from '../../../../../notifications/use-action-toasts'
import { WorkerPrimaryButton } from '../../../worker-ui'
import type { WorkerProfileData } from '../types'
import { EditableListSection, ProfileInput } from './common'
import { dateInputClass, type TFn, type WorkerTone } from './helpers'

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
  const [items, setItems] = useState(profile.certificates)
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [issuedAt, setIssuedAt] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  const addItem = async () => {
    if (!name.trim() || !organization.trim() || !issuedAt) return
    try {
      const id = await runWithToast(
        workerPortalApi.addCertificate({
          name: name.trim(),
          issuingOrganization: organization.trim(),
          issuedAt,
          expiresAt: expiresAt || null,
          documentUrl: null,
        }),
        {
          success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
          error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
        },
      )
      setItems((prev) => [
        ...prev,
        { id: String(id), label: name, value: `${organization} • ${issuedAt}${expiresAt ? ` - ${expiresAt}` : ''}` },
      ])
      setName('')
      setOrganization('')
      setIssuedAt('')
      setExpiresAt('')
    } catch {
      // toast
    }
  }

  const removeItem = async (id: string) => {
    const numeric = Number(id)
    if (!Number.isFinite(numeric) || numeric <= 0) return
    try {
      await runWithToast(workerPortalApi.removeCertificate(numeric), {
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
      title={t('dashboard.workerPortal.profile.certificates')}
      items={items}
      theme={theme}
      onRemove={removeItem}
      form={
        <div className="grid gap-2 sm:grid-cols-2">
          <ProfileInput
            theme={theme}
            label={t('dashboard.workerPortal.profile.certificates')}
            value={name}
            onChange={setName}
          />
          <ProfileInput
            theme={theme}
            label={t('dashboard.workerPortal.profile.fields.university')}
            value={organization}
            onChange={setOrganization}
          />
          <input
            type="date"
            value={issuedAt}
            onChange={(e) => setIssuedAt(e.target.value)}
            className={dateInputClass(theme)}
          />
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className={dateInputClass(theme)}
          />
          <WorkerPrimaryButton tone={theme} onClick={() => void addItem()} className="sm:col-span-2">
            {t('dashboard.workerPortal.profile.actions.save')}
          </WorkerPrimaryButton>
        </div>
      }
    />
  )
}
