import type { WorkerShiftHistoryItem } from '../../../../../api/worker/worker-portal'
import type { WorkerEmphasis } from '../../../worker-ui'

export function shiftStatusEmphasis(status: WorkerShiftHistoryItem['status']): WorkerEmphasis {
  if (status === 'checkedOut') return 'success'
  if (status === 'checkedIn') return 'info'
  if (status === 'awaitingMutualQr') return 'warning'
  return 'neutral'
}
