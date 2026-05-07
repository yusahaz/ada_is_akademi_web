import { getApiClient } from './client'
import { API_ENDPOINTS } from './endpoints'

export type ListCommissionReceivablesByEmployerQuery = {
  limit?: number | string
  offset?: number | string
}

export type CommissionReceivableListItem = {
  id: number | string
  period: string
  totalAmount: number | string
  status: string
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

export type GetCommissionReceivableByPeriodQuery = {
  period: string
}

export type CommissionReceivableDetail = {
  id: number | string
  period: string
  totalAmount: number | string
  status: string
  pdfUrl?: string | null
}

export type GenerateCommissionReceivableCommand = {
  period: string
}

const client = getApiClient()

export const employerCommissionsApi = {
  listReceivables(body: ListCommissionReceivablesByEmployerQuery) {
    return client.post<PageableApiResponse<CommissionReceivableListItem>, ListCommissionReceivablesByEmployerQuery>(
      API_ENDPOINTS.employers.listCommissionReceivables,
      body,
      true,
    )
  },
  getReceivableByPeriod(body: GetCommissionReceivableByPeriodQuery) {
    return client.post<CommissionReceivableDetail, GetCommissionReceivableByPeriodQuery>(
      API_ENDPOINTS.employers.getCommissionReceivableByPeriod,
      body,
      true,
    )
  },
  generateReceivable(body: GenerateCommissionReceivableCommand) {
    return client.post<null, GenerateCommissionReceivableCommand>(
      API_ENDPOINTS.employers.generateCommissionReceivable,
      body,
      true,
    )
  },
}

