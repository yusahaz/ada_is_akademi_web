import { getApiClient } from '../core/client'
import { API_ENDPOINTS } from '../core/endpoints'

export type CreateShiftAssignmentCommand = {
  checkInTokenHash: string
  supervisorCheckInTokenHash: string
  jobApplicationId: number
}

export type CheckInShiftAssignmentCommand = {
  assignmentId: number
  checkInTokenHash: string
}

export type SupervisorCheckInShiftAssignmentCommand = {
  assignmentId: number
  supervisorCheckInTokenHash: string
}

export type CheckOutShiftAssignmentCommand = {
  assignmentId: number
  checkOutTokenHash: string
}

export type ListMyShiftAssignmentsQuery = {
  limit?: number | string
  offset?: number | string
}

export type ShiftAssignmentStatus = 'Pending' | 'AwaitingMutualQr' | 'CheckedIn' | 'CheckedOut'

export type WorkerShiftAssignmentListItem = {
  assignmentId: number | string
  jobPostingId: number | string
  jobApplicationId: number | string
  workerId: number | string
  status: ShiftAssignmentStatus
  isAnomalyFlagged: boolean
  anomalyCode: string | null
  anomalyType: string | null
  anomalyDetectedAt: string | null
  assignedAt: string
  checkedInAt: string | null
  checkedOutAt: string | null
  shiftDate: string
  shiftStartTime: string
  shiftEndTime: string
}

export type ListShiftAssignmentsHistoryQuery = {
  dateFrom?: string
  dateTo?: string
  locationId?: number
  status?: ShiftAssignmentStatus
  limit?: number | string
  offset?: number | string
}

export type ShiftAssignmentHistoryListItemModel = {
  assignmentId: number
  workerId: number
  status: ShiftAssignmentStatus
  wasNoShow: boolean
  completedAt: string | null
  anomalySummary: string | null
  disputeSummary: string | null
}

export type PageableApiResponse<T> = {
  isSuccess?: boolean
  success?: boolean
  message?: string | null
  data: {
    items: T[]
    totalCount: number
  }
}

const client = getApiClient()

export const shiftAssignmentsApi = {
  create(body: CreateShiftAssignmentCommand) {
    return client.post<null, CreateShiftAssignmentCommand>(API_ENDPOINTS.shiftAssignments.create, body, true)
  },
  checkIn(body: CheckInShiftAssignmentCommand) {
    return client.post<null, CheckInShiftAssignmentCommand>(API_ENDPOINTS.shiftAssignments.checkIn, body, true)
  },
  supervisorCheckIn(body: SupervisorCheckInShiftAssignmentCommand) {
    return client.post<null, SupervisorCheckInShiftAssignmentCommand>(
      API_ENDPOINTS.shiftAssignments.supervisorCheckIn,
      body,
      true,
    )
  },
  checkOut(body: CheckOutShiftAssignmentCommand) {
    return client.post<null, CheckOutShiftAssignmentCommand>(API_ENDPOINTS.shiftAssignments.checkOut, body, true)
  },
  myAssignments(body: ListMyShiftAssignmentsQuery | null = null) {
    return client.post<PageableApiResponse<WorkerShiftAssignmentListItem>, ListMyShiftAssignmentsQuery | null>(
      API_ENDPOINTS.shiftAssignments.myAssignments,
      body,
      true,
    )
  },
  listHistory(body: ListShiftAssignmentsHistoryQuery) {
    return client.post<PageableApiResponse<ShiftAssignmentHistoryListItemModel>, ListShiftAssignmentsHistoryQuery>(
      API_ENDPOINTS.shiftAssignments.listHistory,
      body,
      true,
    )
  },
}

