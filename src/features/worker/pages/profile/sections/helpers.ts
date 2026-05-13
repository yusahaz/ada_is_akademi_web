import type { Dispatch, SetStateAction } from 'react'

import type { WorkerGender } from '../../../../../api/core/enums'

import type { ExperienceEditorDraft, WorkerProfileData, WorkerProfileSectionItem } from '../types'

export type WorkerTone = 'dark' | 'light'
export type TFn = (key: string, options?: Record<string, unknown>) => string
export type WorkerProfileDraft = Pick<WorkerProfileData, 'fullName' | 'nationality' | 'university' | 'gender'> & {
  phoneCountryCode: string
  phoneNumber: string
}

export function resolveTitle(theme: WorkerTone) {
  return theme === 'dark' ? 'text-white' : 'text-slate-900'
}

export function resolveMuted(theme: WorkerTone) {
  return theme === 'dark' ? 'text-white/75' : 'text-slate-600'
}

export function dateInputClass(theme: WorkerTone) {
  return `w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 ${theme === 'dark' ? 'border-white/20 bg-white/[0.03] text-white' : 'border-slate-200 bg-white text-slate-900'}`
}

export function normalizeValue(value: string | null | undefined, t: TFn) {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (!normalized || normalized === 'N/A') return t('dashboard.workerPortal.states.empty')
  return normalized
}

export function normalizeExperienceDateInput(value: string): string {
  const text = value.trim()
  if (!text || text === '...') return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text
  const match = text.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (!match) return ''
  return `${match[3]}-${match[2]}-${match[1]}`
}

export function formatExperienceDate(value: string): string {
  const parsed = value ? new Date(value) : null
  if (!parsed || Number.isNaN(parsed.getTime())) return ''
  return parsed.toLocaleDateString('tr-TR')
}

export function toExperienceEditorDraft(item: WorkerProfileSectionItem): ExperienceEditorDraft {
  const [companyNameRaw = '', positionRaw = ''] = item.label.split(' - ')
  const [startRaw = '', endRaw = ''] = item.value.split(' - ')
  return {
    id: item.id,
    companyName: companyNameRaw.trim(),
    position: positionRaw.trim(),
    startDate: normalizeExperienceDateInput(startRaw),
    endDate: normalizeExperienceDateInput(endRaw),
  }
}

export function toDraft(profile: WorkerProfileData): WorkerProfileDraft {
  const rawPhone = (profile.phone ?? '').trim()
  const countryOptions = ['+90', '+1', '+44', '+49', '+39', '+34', '+33', '+7', '+971']
  const matchedCountry = countryOptions.find((code) => rawPhone.startsWith(code)) ?? '+90'
  const numberPart = rawPhone.startsWith(matchedCountry)
    ? rawPhone.slice(matchedCountry.length)
    : rawPhone
  const digits = numberPart.replace(/\D/g, '')
  return {
    fullName: profile.fullName ?? '',
    nationality: profile.nationality ?? '',
    university: profile.university ?? '',
    gender: (profile.gender ?? 0) as WorkerGender,
    phoneCountryCode: matchedCountry,
    phoneNumber: digits,
  }
}

export function handleStartEdit(
  profile: WorkerProfileData,
  setDraft: Dispatch<SetStateAction<WorkerProfileDraft | null>>,
  setIsEditing: Dispatch<SetStateAction<boolean>>,
  setSaveState: Dispatch<SetStateAction<'idle' | 'success' | 'validation-error'>>,
) {
  setDraft(toDraft(profile))
  setSaveState('idle')
  setIsEditing(true)
}

export function handleCancelEdit(
  setDraft: Dispatch<SetStateAction<WorkerProfileDraft | null>>,
  setIsEditing: Dispatch<SetStateAction<boolean>>,
  setSaveState: Dispatch<SetStateAction<'idle' | 'success' | 'validation-error'>>,
) {
  setDraft(null)
  setSaveState('idle')
  setIsEditing(false)
}
