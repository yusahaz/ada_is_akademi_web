import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  workerPortalApi,
  type WorkerAvailabilitySlot,
} from '../../../../../api/worker/worker-portal'
import { useActionToasts } from '../../../../../notifications/use-action-toasts'
import { useTheme } from '../../../../../theme/theme-context'
import { StatePanel } from '../../../../../shared/ui/ui-primitives'
import { useWorkerAsyncData } from '../../../hooks/useWorkerAsyncData'
import { WorkerGhostButton, WorkerPrimaryButton } from '../../../worker-ui'
import { resolveMuted, resolveTitle } from './helpers'

export function AvailabilitySection() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { runWithToast } = useActionToasts()
  const query = useCallback(() => workerPortalApi.getAvailabilityCalendar(), [])
  const { loading, error, data: slots, setData: setSlots } = useWorkerAsyncData<WorkerAvailabilitySlot[]>(
    [],
    ['worker', 'availability'],
    query,
    () => t('dashboard.workerPortal.states.fetchError'),
  )
  const [isEditing, setIsEditing] = useState(false)
  const [draftByDay, setDraftByDay] = useState<Record<number, { enabled: boolean; timeFrom: string; timeTo: string }>>({})
  const [saveState, setSaveState] = useState<'idle' | 'success'>('idle')
  const [removingAvailabilityId, setRemovingAvailabilityId] = useState<string | null>(null)

  const orderedDays = useMemo(() => [1, 2, 3, 4, 5, 6, 0], [])
  const dayLabels = useMemo(
    () => orderedDays.map((day) => ({ day, label: t(`dashboard.workerPortal.availability.days.${day}`) })),
    [orderedDays, t],
  )

  const slotsByDay = useMemo(() => {
    const map = new Map<number, WorkerAvailabilitySlot[]>()
    for (const slot of slots) {
      const day = Number(slot.dayOfWeek)
      if (!Number.isFinite(day)) continue
      const list = map.get(day) ?? []
      list.push(slot)
      map.set(day, list)
    }
    return map
  }, [slots])

  const canSave = useMemo(
    () =>
      Object.values(draftByDay).every(
        (item) => !item.enabled || (item.timeFrom && item.timeTo && item.timeFrom < item.timeTo),
      ),
    [draftByDay],
  )

  const handleStartEdit = () => {
    const initialDraft: Record<number, { enabled: boolean; timeFrom: string; timeTo: string }> = {}
    for (let day = 0; day <= 6; day += 1) {
      const firstSlot = slotsByDay.get(day)?.[0]
      initialDraft[day] = {
        enabled: Boolean(firstSlot),
        timeFrom: firstSlot?.timeFrom || '09:00',
        timeTo: firstSlot?.timeTo || '18:00',
      }
    }
    setDraftByDay(initialDraft)
    setSaveState('idle')
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setDraftByDay({})
    setSaveState('idle')
    setIsEditing(false)
  }

  const handleSaveEdit = async () => {
    const nextSlots: WorkerAvailabilitySlot[] = []
    for (let day = 0; day <= 6; day += 1) {
      const draft = draftByDay[day]
      if (!draft?.enabled) continue
      nextSlots.push({ id: `draft-${day}`, dayOfWeek: day, timeFrom: draft.timeFrom, timeTo: draft.timeTo })
    }
    try {
      const savedSlots = await runWithToast(workerPortalApi.saveAvailabilityCalendar(nextSlots), {
        success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
        error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
      })
      setSlots(savedSlots)
      setSaveState('success')
      setIsEditing(false)
    } catch {
      // toast handled
    }
  }

  const handleRemoveAvailability = async (slotId: string) => {
    const numericId = Number(slotId)
    if (!Number.isFinite(numericId) || numericId <= 0 || removingAvailabilityId) return
    setRemovingAvailabilityId(slotId)
    try {
      await runWithToast(workerPortalApi.removeAvailability(numericId), {
        success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
        error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
      })
      setSlots((prev) => prev.filter((item) => item.id !== slotId))
    } catch {
      // toast handled
    } finally {
      setRemovingAvailabilityId(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className={`text-sm font-semibold ${resolveTitle(theme)}`}>
            {t('dashboard.workerPortal.profile.menu.availability')}
          </p>
          <p className={`mt-1 text-xs ${resolveMuted(theme)}`}>
            {t('dashboard.workerPortal.availability.description')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isEditing ? (
            <>
              <WorkerGhostButton tone={theme} onClick={handleCancelEdit}>
                {t('dashboard.workerPortal.profile.actions.cancel')}
              </WorkerGhostButton>
              <WorkerPrimaryButton tone={theme} onClick={() => void handleSaveEdit()} disabled={!canSave}>
                {t('dashboard.workerPortal.profile.actions.save')}
              </WorkerPrimaryButton>
            </>
          ) : (
            <WorkerGhostButton tone={theme} onClick={handleStartEdit}>
              {t('dashboard.workerPortal.availability.editAction')}
            </WorkerGhostButton>
          )}
        </div>
      </div>
      {loading ? <div className="mt-3"><StatePanel theme={theme} text={t('dashboard.workerPortal.states.loading')} /></div> : null}
      {error ? <div className="mt-3"><StatePanel theme={theme} text={error} isError /></div> : null}
      {saveState === 'success' ? (
        <p className="mt-3 rounded-xl border border-emerald-300/50 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-300/30 dark:bg-emerald-400/10 dark:text-emerald-100">
          {t('dashboard.workerPortal.profile.messages.savedLocal')}
        </p>
      ) : null}
      {!loading && !error ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {dayLabels.map(({ day, label }) => {
            const list = slotsByDay.get(day) ?? []
            const draft = draftByDay[day]
            return (
              <div
                key={label}
                className={`rounded-xl border px-3 py-2 text-sm ${theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-white/80' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
              >
                <p className={`text-xs font-semibold ${resolveTitle(theme)}`}>{label}</p>
                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={Boolean(draft?.enabled)}
                        onChange={(event) =>
                          setDraftByDay((prev) => ({
                            ...prev,
                            [day]: {
                              enabled: event.target.checked,
                              timeFrom: prev[day]?.timeFrom ?? '09:00',
                              timeTo: prev[day]?.timeTo ?? '18:00',
                            },
                          }))
                        }
                        className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-400/45"
                      />
                      <span className={resolveMuted(theme)}>{t('dashboard.workerPortal.availability.enableDay')}</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={draft?.timeFrom ?? '09:00'}
                        onChange={(event) =>
                          setDraftByDay((prev) => ({
                            ...prev,
                            [day]: {
                              enabled: prev[day]?.enabled ?? false,
                              timeFrom: event.target.value,
                              timeTo: prev[day]?.timeTo ?? '18:00',
                            },
                          }))
                        }
                        disabled={!draft?.enabled}
                        className={`w-full rounded-xl border px-2 py-1.5 text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 ${theme === 'dark' ? 'border-white/20 bg-white/[0.03] text-white disabled:opacity-50' : 'border-slate-200 bg-white text-slate-900 disabled:opacity-50'}`}
                      />
                      <input
                        type="time"
                        value={draft?.timeTo ?? '18:00'}
                        onChange={(event) =>
                          setDraftByDay((prev) => ({
                            ...prev,
                            [day]: {
                              enabled: prev[day]?.enabled ?? false,
                              timeFrom: prev[day]?.timeFrom ?? '09:00',
                              timeTo: event.target.value,
                            },
                          }))
                        }
                        disabled={!draft?.enabled}
                        className={`w-full rounded-xl border px-2 py-1.5 text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 ${theme === 'dark' ? 'border-white/20 bg-white/[0.03] text-white disabled:opacity-50' : 'border-slate-200 bg-white text-slate-900 disabled:opacity-50'}`}
                      />
                    </div>
                  </div>
                ) : list.length === 0 ? (
                  <p className={`mt-1 text-[11px] ${resolveMuted(theme)}`}>
                    {t('dashboard.workerPortal.availability.empty')}
                  </p>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {list.map((slot) => (
                      <li key={slot.id} className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] ${resolveMuted(theme)}`}>
                          {slot.timeFrom} - {slot.timeTo}
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleRemoveAvailability(slot.id)}
                          disabled={removingAvailabilityId === slot.id}
                          className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold transition ${theme === 'dark' ? 'text-rose-200 hover:bg-rose-400/20 disabled:opacity-50' : 'text-rose-700 hover:bg-rose-100 disabled:opacity-50'}`}
                        >
                          {t('dashboard.workerPortal.availability.deleteAction')}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
