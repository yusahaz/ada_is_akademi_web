import type { JobPostingSummary } from '../../../../../api/jobs/job-postings'
import { InteractiveButton, StatePanel } from '../../../../../shared/ui/ui-primitives'
import { useTranslation } from 'react-i18next'
import { tShiftAssignmentStatus } from '../../../i18n/employer-enum-i18n'

type AssignmentStatus = 'Pending' | 'AwaitingMutualQr' | 'CheckedIn' | 'CheckedOut'

export function ActiveAssignmentsView({
  theme,
  toneClass,
  postings,
  selectedPostingId,
  setSelectedPostingId,
  activeAssignments,
}: {
  theme: 'dark' | 'light'
  toneClass: string
  postings: JobPostingSummary[]
  selectedPostingId: number | null
  setSelectedPostingId: (id: number | null) => void
  activeAssignments: Array<{ assignmentId: number; workerId: number; status: AssignmentStatus }>
}) {
  const { t } = useTranslation()
  const sectionButtonClass = (isActiveButton: boolean) => `inline-flex ${isActiveButton ? 'is-active' : ''}`
  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {t('dashboard.employerSpot.operations.activeAssignments.title')}
          </h2>
          <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.operations.activeAssignments.subtitle')}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
            theme === 'dark' ? 'bg-cyan-300/15 text-cyan-100' : 'bg-sky-100 text-sky-700'
          }`}
        >
          {activeAssignments.length}
        </span>
      </div>
      {postings.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/60 p-2 dark:border-white/10 dark:bg-white/[0.02]">
          {postings.slice(0, 6).map((posting) => {
            const isActive = selectedPostingId === posting.id
            return (
              <button key={posting.id} type="button" onClick={() => setSelectedPostingId(posting.id)} className={sectionButtonClass(isActive)}>
                <InteractiveButton theme={theme} isActive={isActive}>{posting.title}</InteractiveButton>
              </button>
            )
          })}
          <button type="button" onClick={() => setSelectedPostingId(null)} className={sectionButtonClass(selectedPostingId === null)}>
            <InteractiveButton theme={theme} isActive={selectedPostingId === null}>
              {t('dashboard.employerSpot.operations.activeAssignments.all')}
            </InteractiveButton>
          </button>
        </div>
      ) : null}
      {activeAssignments.length === 0 ? (
        <StatePanel theme={theme} text={t('dashboard.employerSpot.operations.activeAssignments.empty')} />
      ) : (
        <div className="grid gap-2.5 md:grid-cols-2">
          {activeAssignments.map((row) => (
            <div key={row.assignmentId} className={`rounded-2xl border px-3.5 py-3 text-sm ${theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-white/85' : 'border-slate-200 bg-slate-50 text-slate-800'}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">#{row.assignmentId}</p>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${theme === 'dark' ? 'bg-white/10 text-white/90' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}>
                  {tShiftAssignmentStatus(t, row.status)}
                </span>
              </div>
              <p className={`mt-2 text-xs ${toneClass}`}>
                {t('dashboard.employerSpot.operations.activeAssignments.worker')}: {row.workerId}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
