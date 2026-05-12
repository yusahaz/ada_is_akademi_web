import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'

import { AdminCommissionRevenueChart } from './AdminCommissionRevenueChart'
import { renderAtRoute } from '../../../test/render-admin-page'

vi.mock('../../../api/admin/commission-revenue-series', async () => {
  const actual = await vi.importActual<typeof import('../../../api/admin/commission-revenue-series')>(
    '../../../api/admin/commission-revenue-series',
  )
  return {
    ...actual,
    getCommissionRevenueSeries: vi.fn(async () => ({
      granularity: actual.CommissionRevenueGranularity.Monthly,
      buckets: [
        {
          label: '2026-05',
          periodStart: '2026-05-01',
          periodEnd: '2026-05-31',
          amounts: [{ currency: 'TRY', amount: 12500 }],
        },
      ],
    })),
  }
})

describe('AdminCommissionRevenueChart', () => {
  it('renders svg chart after load', async () => {
    renderAtRoute(<AdminCommissionRevenueChart />, '/', '/')
    expect(await screen.findByLabelText(/komisyon geliri/i)).toBeInTheDocument()
  })
})

