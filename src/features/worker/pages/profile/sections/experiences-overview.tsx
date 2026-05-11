import { Briefcase, CalendarRange, Pencil, Trash2 } from 'lucide-react'

import { DashboardSurface } from '../../../../../shared/ui/ui-primitives'
import type { WorkerProfileSectionItem } from '../types'
import { type TFn, type WorkerTone, resolveMuted, resolveTitle } from './helpers'
import { WorkerGhostButton } from '../../../worker-ui'

const LABEL_SEP = ' - '

function parseExperienceRow(item: WorkerProfileSectionItem, tEmpty: () => string) {
  const li = item.label.trim()
  const idx = li.indexOf(LABEL_SEP)
  const company = (idx === -1 ? li : li.slice(0, idx)).trim() || tEmpty()
  const role = (idx === -1 ? '' : li.slice(idx + LABEL_SEP.length)).trim()

  const vi = item.value.trim()
  const vidx = vi.indexOf(LABEL_SEP)
  const startRaw = (vidx === -1 ? vi : vi.slice(0, vidx)).trim()
  const endRaw = (vidx === -1 ? '' : vi.slice(vidx + LABEL_SEP.length)).trim()
  const isOngoing = !endRaw || endRaw === '...'

  return { company, role, startRaw, endRaw: isOngoing ? '' : endRaw, isOngoing }
}

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
  const tk = (k: string) => t(`dashboard.workerPortal.profile.experienceSection.${k}`)
  const muted = resolveMuted(theme)
  const titleCls = resolveTitle(theme)
  const emptyFn = () => t('dashboard.workerPortal.states.empty')
  const borderCard =
    theme === 'dark'
      ? 'border-white/12 bg-white/[0.045] shadow-[0_12px_32px_rgba(0,0,0,0.35)]'
      : 'border-slate-200/90 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.07)]'
  const iconWrap =
    theme === 'dark' ? 'border-white/15 bg-white/[0.06] text-cyan-200/90' : 'border-sky-200/70 bg-sky-50 text-sky-700'

  return (
    <DashboardSurface theme={theme}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className={`text-base font-semibold leading-tight sm:text-lg ${titleCls}`}>
            {t('dashboard.workerPortal.profile.experiences')}
          </h2>
          <p className={`text-xs leading-relaxed sm:text-sm ${muted}`}>{tk('listSubtitle')}</p>
        </div>
        <WorkerGhostButton
          tone={theme}
          onClick={onAdd}
          className="h-10 w-full shrink-0 justify-center sm:mt-0.5 sm:w-auto sm:self-start sm:px-5"
        >
          {t('dashboard.workerPortal.profile.actions.add')}
        </WorkerGhostButton>
      </div>

      <ul className="mt-4 space-y-2.5 sm:mt-5">
        {items.length === 0 ? (
          <li
            className={`rounded-2xl border border-dashed px-4 py-8 text-center sm:px-6 sm:py-10 ${theme === 'dark' ? 'border-white/20 bg-white/[0.03]' : 'border-slate-300/70 bg-slate-50/50'}`}
          >
            <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border ${iconWrap}`} aria-hidden>
              <Briefcase className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <p className={`text-sm font-medium ${titleCls}`}>{tk('emptyHint')}</p>
          </li>
        ) : (
          items.map((item) => {
            const row = parseExperienceRow(item, emptyFn)
            const periodBits = []
            if (row.startRaw) periodBits.push(row.startRaw)
            if (row.isOngoing) periodBits.push(tk('ongoing'))
            else if (row.endRaw) periodBits.push(row.endRaw)
            const periodText = periodBits.join(' — ')

            return (
              <li key={`experience-overview-${item.id}`} className="list-none">
                <article
                  className={`relative overflow-hidden rounded-2xl border p-3.5 transition sm:p-4 ${borderCard} ${theme === 'light' ? 'ring-1 ring-slate-200/70' : ''}`}
                >
                  <div className="relative flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-start min-[380px]:gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconWrap}`}>
                      <Briefcase className="h-[1.125rem] w-[1.125rem]" aria-hidden strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <h3 className={`text-sm font-semibold leading-snug [overflow-wrap:anywhere] sm:text-base ${titleCls}`}>
                          {row.company}
                        </h3>
                        {row.role ? (
                          <span className={`text-xs font-medium sm:text-[13px] ${muted} [overflow-wrap:anywhere]`}>
                            · {row.role}
                          </span>
                        ) : null}
                      </div>
                      {periodText ? (
                        <p className={`flex items-start gap-2 text-xs leading-relaxed sm:text-sm ${muted}`}>
                          <CalendarRange className="mt-0.5 h-4 w-4 shrink-0 opacity-85" aria-hidden strokeWidth={2} />
                          <span className="min-w-0 [overflow-wrap:anywhere]">{periodText}</span>
                        </p>
                      ) : (
                        <p className={`text-xs ${muted}`}>{tk('periodLabel')}: —</p>
                      )}
                    </div>
                    <div
                      className={`flex w-full gap-2 border-t pt-3 min-[380px]:w-auto min-[380px]:shrink-0 min-[380px]:flex-col min-[380px]:border-t-0 min-[380px]:pt-0 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}
                    >
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        aria-label={t('dashboard.workerPortal.profile.actions.edit')}
                        title={t('dashboard.workerPortal.profile.actions.edit')}
                        className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 min-[380px]:h-10 min-[380px]:w-10 min-[380px]:flex-none min-[380px]:px-0 ${theme === 'dark' ? 'border-white/12 bg-white/[0.06] text-white/90 hover:bg-white/10' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'}`}
                      >
                        <Pencil className="h-4 w-4 shrink-0" aria-hidden strokeWidth={2} />
                        <span className="min-[380px]:sr-only">{t('dashboard.workerPortal.profile.actions.edit')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDelete(item.id)}
                        aria-label={t('dashboard.workerPortal.availability.deleteAction')}
                        title={t('dashboard.workerPortal.availability.deleteAction')}
                        className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40 min-[380px]:h-10 min-[380px]:w-10 min-[380px]:flex-none min-[380px]:px-0 ${theme === 'dark' ? 'border-rose-400/25 bg-rose-500/10 text-rose-100 hover:bg-rose-500/15' : 'border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100/80'}`}
                      >
                        <Trash2 className="h-4 w-4 shrink-0" aria-hidden strokeWidth={2} />
                        <span className="min-[380px]:sr-only">{t('dashboard.workerPortal.availability.deleteAction')}</span>
                      </button>
                    </div>
                  </div>
                </article>
              </li>
            )
          })
        )}
      </ul>
    </DashboardSurface>
  )
}
