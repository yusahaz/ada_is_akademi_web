import { getApiClient } from '../core/client'
import { API_ENDPOINTS } from '../core/endpoints'

/** Backend `EmployerCommissionListItemModel` (camelCase JSON). */
export type EmployerCommissionSummaryItem = {
  acceptedApplicationCount?: number
  commissionRate?: number
  employerId?: number
  employerName?: string
  employerStatus?: number
  estimatedCommissionAmount?: number
  estimatedGrossTransactionVolume?: number
}

export type EmployerCommissionEstimate = {
  acceptedApplicationCount?: number
  commissionRate?: number
  employerId?: number
  estimatedCommissionAmount?: number
  estimatedGrossTransactionVolume?: number
}

export type EmployerCommissionPolicy = {
  commissionRate: number
  employerId: number
}

export type SetEmployerCommissionRateBody = {
  employerId: number
  commissionRate: number
}

const client = getApiClient()

export const adminCommissionRulesApi = {
  listSummaries(limit: number) {
    return client.post<EmployerCommissionSummaryItem[], { limit: number }>(
      API_ENDPOINTS.employers.listCommissionSummaries,
      { limit },
      true,
    )
  },
  getPolicy(employerId: number) {
    return client.post<EmployerCommissionPolicy, { employerId: number }>(
      API_ENDPOINTS.employers.getCommissionPolicy,
      { employerId },
      true,
    )
  },
  getEstimate(employerId: number) {
    return client.post<EmployerCommissionEstimate, { employerId: number }>(
      API_ENDPOINTS.employers.getCommissionEstimate,
      { employerId },
      true,
    )
  },
  setPolicy(body: SetEmployerCommissionRateBody) {
    return client.post<null, SetEmployerCommissionRateBody>(API_ENDPOINTS.employers.setCommissionPolicy, body, true)
  },
}
