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
      <h2 className={`font-display text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
        {t('dashboard.employerSpot.operations.history.title')}
      </h2>
      <p className={`text-sm ${toneClass}`}>{t('dashboard.employerSpot.operations.history.subtitle')}</p>
      {assignmentHistory.length === 0 ? (
        <StatePanel theme={theme} text={t('dashboard.employerSpot.common.comingSoon')} />
      ) : (
        <div className="space-y-2">
          {assignmentHistory.map((row) => (
            <div key={row.assignmentId} className={`rounded-xl border px-3 py-2 text-xs ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
              <p className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>#{row.assignmentId}</p>
              <p className={toneClass}>{t('dashboard.employerSpot.operations.activeAssignments.worker')}: {row.workerId}</p>
              <p className={toneClass}>{t('dashboard.employerSpot.operations.activeAssignments.qrStatus')}: {tShiftAssignmentStatus(t, row.status)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
