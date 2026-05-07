import { getApiClient } from './client'
import { API_ENDPOINTS } from './endpoints'

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

// ConfirmWorkerPayout endpointi worker tarafında `/Workers/ConfirmPayout` olarak görünüyor.
// Employer tarafında onay akışı backend’e göre farklılaşabileceği için burada sadece employer aksiyonları tutuldu.

const client = getApiClient()

export const employerPayoutsApi = {
  create(body: CreateWorkerPayoutCommand) {
    return client.post<number, CreateWorkerPayoutCommand>(API_ENDPOINTS.employers.createWorkerPayout, body, true)
  },
  markProcessing(body: MarkWorkerPayoutAsProcessingCommand) {
    return client.post<null, MarkWorkerPayoutAsProcessingCommand>(
      API_ENDPOINTS.employers.markWorkerPayoutAsProcessing,
      body,
      true,
    )
  },
  fail(body: FailWorkerPayoutCommand) {
    return client.post<null, FailWorkerPayoutCommand>(API_ENDPOINTS.employers.failWorkerPayout, body, true)
  },
  retry(body: RetryWorkerPayoutCommand) {
    return client.post<null, RetryWorkerPayoutCommand>(API_ENDPOINTS.employers.retryWorkerPayout, body, true)
  },
}

