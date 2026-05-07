import type { TFunction } from 'i18next'

import type { EmployerPayoutStatus, EmployerReceivableStatus } from './employer-portal-types'

type ShiftAssignmentStatus = 'Pending' | 'AwaitingMutualQr' | 'CheckedIn' | 'CheckedOut'

export function tShiftAssignmentStatus(t: TFunction, status: ShiftAssignmentStatus): string {
  return t(`dashboard.employerSpot.enums.shiftAssignmentStatus.${status}`)
}

export function tPayoutStatus(t: TFunction, status: EmployerPayoutStatus): string {
  return t(`dashboard.employer.billing.payoutStatus.${status}`)
}

export function tReceivableStatus(t: TFunction, status: EmployerReceivableStatus): string {
  return t(`dashboard.employer.billing.receivableStatus.${status}`)
}
