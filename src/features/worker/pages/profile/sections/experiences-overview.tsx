import { Pencil, Trash2 } from 'lucide-react'

import { DashboardSurface, StatePanel } from '../../../../../shared/ui/ui-primitives'
import type { WorkerProfileSectionItem } from '../types'
import { type TFn, type WorkerTone, normalizeValue, resolveMuted, resolveTitle } from './helpers'
import { WorkerGhostButton } from '../../../worker-ui'

export function ExperiencesOverviewCard({
  items,
  theme,
  t,
  onAdd,
  onEdit,
  onDelete,
}: {
  items: WorkerProfileSectionItem[]
  theme: WorkerTone
  t: TFn
  onAdd: () => void
  onEdit: (item: WorkerProfileSectionItem) => void
  onDelete: (id: string) => Promise<void> | void
}) {
  return (
    <DashboardSurface theme={theme}>
      <div className="flex items-center justify-between gap-2">
        <h3 className={`text-sm font-semibold ${resolveTitle(theme)}`}>
          {t('dashboard.workerPortal.profile.experiences')}
        </h3>
        <WorkerGhostButton tone={theme} onClick={onAdd}>
          {t('dashboard.workerPortal.profile.actions.add')}
        </WorkerGhostButton>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2">
        {items.length === 0 ? (
          <StatePanel text={t('dashboard.workerPortal.states.empty')} theme={theme} />
        ) : (
          items.map((item) => (
            <div
              key={`experience-overview-${item.id}`}
              className={`w-full rounded-xl border px-3 py-2 text-sm ${theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-white/80' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={resolveTitle(theme)}>{normalizeValue(item.label, t)}</p>
                  <p className={`mt-1 text-xs ${resolveMuted(theme)}`}>{normalizeValue(item.value, t)}</p>
                </div>
                <div className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    aria-label={t('dashboard.workerPortal.profile.actions.edit')}
                    className={`rounded-lg p-1.5 transition ${theme === 'dark' ? 'text-cyan-200 hover:bg-cyan-400/20' : 'text-sky-700 hover:bg-sky-100'}`}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDelete(item.id)}
                    aria-label={t('dashboard.workerPortal.availability.deleteAction')}
                    className={`rounded-lg p-1.5 transition ${theme === 'dark' ? 'text-rose-200 hover:bg-rose-400/20' : 'text-rose-700 hover:bg-rose-100'}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardSurface>
  )
}
