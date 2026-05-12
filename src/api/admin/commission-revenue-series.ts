import { getApiClient } from '../core/client'
import { API_ENDPOINTS } from '../core/endpoints'

/** Matches backend `CommissionRevenueGranularity` (numeric enum). */
export const CommissionRevenueGranularity = {
  Monthly: 0,
  Quarterly: 1,
  HalfYearly: 2,
  Yearly: 3,
} as const

export type CommissionRevenueGranularity =
  (typeof CommissionRevenueGranularity)[keyof typeof CommissionRevenueGranularity]

export type CommissionRevenueCurrencyAmount = {
  currency: string
  amount: number
}

export type CommissionRevenueSeriesBucket = {
  label: string
  periodStart: string
  periodEnd: string
  amounts: CommissionRevenueCurrencyAmount[]
}

export type CommissionRevenueSeriesModel = {
  granularity: CommissionRevenueGranularity
  buckets: CommissionRevenueSeriesBucket[]
}

const client = getApiClient()

export function getCommissionRevenueSeries(granularity: CommissionRevenueGranularity) {
  return client.post<CommissionRevenueSeriesModel, { granularity: CommissionRevenueGranularity }>(
    API_ENDPOINTS.admin.commissionRevenueSeries,
    { granularity },
    true,
  )
}
