import { getApiClient } from '../core/client'
import { API_ENDPOINTS } from '../core/endpoints'

export type CreateWorkerPayoutCommand = {
  assignmentId: number
}

export type MarkWorkerPayoutAsProcessingCommand = {
  workerPayoutId: number
}

export type FailWorkerPayoutCommand = {
  workerPayoutId: number
}

export type RetryWorkerPayoutCommand = {
  workerPayoutId: number
}

export type ListWorkerPayoutsQuery = {
  limit?: number
  offset?: number
}

export type WorkerPayoutStatus = 'Pending' | 'Processing' | 'Paid' | 'Failed'

export type WorkerPayoutSnapshotModel = {
  workerPayoutId: number
  status: WorkerPayoutStatus
  isLocked: boolean
  updatedAt: string
}

export type WorkerPayoutListItemModel = {
  workerPayoutId: number
  assignmentId: number
  workerId: number
  workerName: string
  amount: number
  currency: string
  status: WorkerPayoutStatus
  isLocked: boolean
  lockReason: string | null
  lockedBy: string | null
  lockedUntil: string | null
  createdAt: string
  updatedAt: string
}

export type PagedListResponse<TItem> = {
  data: TItem[] | null
  hasMore: boolean
  limit: number | string
  offset: number | string
  totalCount: number | string
}

const client = getApiClient()

export const employerPayoutsApi = {
  list(body: ListWorkerPayoutsQuery = {}) {
    return client.post<PagedListResponse<WorkerPayoutListItemModel>, ListWorkerPayoutsQuery>(
      API_ENDPOINTS.employers.listWorkerPayouts,
      body,
      true,
    )
  },
  create(body: CreateWorkerPayoutCommand) {
    return client.post<WorkerPayoutSnapshotModel, CreateWorkerPayoutCommand>(
      API_ENDPOINTS.employers.createWorkerPayout,
      body,
      true,
    )
  },
  markProcessing(body: MarkWorkerPayoutAsProcessingCommand) {
    return client.post<WorkerPayoutSnapshotModel, MarkWorkerPayoutAsProcessingCommand>(
      API_ENDPOINTS.employers.markWorkerPayoutAsProcessing,
      body,
      true,
    )
  },
  fail(body: FailWorkerPayoutCommand) {
    return client.post<WorkerPayoutSnapshotModel, FailWorkerPayoutCommand>(
      API_ENDPOINTS.employers.failWorkerPayout,
      body,
      true,
    )
  },
  retry(body: RetryWorkerPayoutCommand) {
    return client.post<WorkerPayoutSnapshotModel, RetryWorkerPayoutCommand>(
      API_ENDPOINTS.employers.retryWorkerPayout,
      body,
      true,
    )
  },
}

