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
  activeAssignmentsFallback,
}: {
  theme: 'dark' | 'light'
  toneClass: string
  postings: JobPostingSummary[]
  selectedPostingId: number | null
  setSelectedPostingId: (id: number | null) => void
  activeAssignmentsFallback: Array<{ assignmentId: number; workerId: number; status: AssignmentStatus }>
}) {
  const { t } = useTranslation()
  const sectionButtonClass = (isActiveButton: boolean) => `inline-flex ${isActiveButton ? 'is-active' : ''}`
  return (
    <div className="mt-4 space-y-3">
      <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
        {t('dashboard.employerSpot.operations.activeAssignments.title')}
      </h2>
      <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.operations.activeAssignments.subtitle')}</p>
      {postings.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
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
      {activeAssignmentsFallback.length === 0 ? (
        <StatePanel theme={theme} text={t('dashboard.employerSpot.operations.activeAssignments.empty')} />
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {activeAssignmentsFallback.map((row) => (
            <div key={row.assignmentId} className={`rounded-xl border px-3 py-2 text-sm ${theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-white/85' : 'border-slate-200 bg-slate-50 text-slate-800'}`}>
              <p className="font-semibold">#{row.assignmentId}</p>
              <p className={`mt-1 text-xs ${toneClass}`}>{t('dashboard.employerSpot.operations.activeAssignments.worker')}: {row.workerId}</p>
              <p className={`mt-1 text-xs ${toneClass}`}>{t('dashboard.employerSpot.operations.activeAssignments.qrStatus')}: {tShiftAssignmentStatus(t, row.status)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
