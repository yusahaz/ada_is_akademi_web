import type { ShiftAssignmentHistoryListItemModel } from '../../../../../api/jobs/shift-assignments'
import { StatePanel } from '../../../../../shared/ui/ui-primitives'
import { useTranslation } from 'react-i18next'
import { tShiftAssignmentStatus } from '../../../i18n/employer-enum-i18n'

export function HistoryView({
  theme,
  toneClass,
  assignmentHistory,
}: {
  theme: 'dark' | 'light'
  toneClass: string
  assignmentHistory: ShiftAssignmentHistoryListItemModel[]
}) {
  const { t } = useTranslation()
  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {t('dashboard.employerSpot.operations.history.title')}
          </h2>
          <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.operations.history.subtitle')}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
            theme === 'dark' ? 'bg-cyan-300/15 text-cyan-100' : 'bg-sky-100 text-sky-700'
          }`}
        >
          {assignmentHistory.length}
        </span>
      </div>
      {assignmentHistory.length === 0 ? (
        <StatePanel theme={theme} text={t('dashboard.employerSpot.common.comingSoon')} />
      ) : (
        <div className="space-y-2.5">
          {assignmentHistory.map((row) => (
            <div key={row.assignmentId} className={`rounded-2xl border px-3.5 py-3 text-xs ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center justify-between gap-2">
                <p className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>#{row.assignmentId}</p>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${theme === 'dark' ? 'bg-white/10 text-white/90' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}>
                  {tShiftAssignmentStatus(t, row.status)}
                </span>
              </div>
              <p className={`mt-2 ${toneClass}`}>{t('dashboard.employerSpot.operations.activeAssignments.worker')}: {row.workerId}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
