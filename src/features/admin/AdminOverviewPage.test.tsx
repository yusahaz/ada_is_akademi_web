import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'

import { renderAtRoute } from '../../test/render-admin-page'
import { AdminOverviewPage } from './AdminOverviewPage'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'tr', resolvedLanguage: 'tr' },
  }),
}))

vi.mock('../../api/admin/admin-dashboard', async () => {
  const actual = await vi.importActual<typeof import('../../api/admin/admin-dashboard')>('../../api/admin/admin-dashboard')
  return {
    ...actual,
    getAdminSummaryStats: vi.fn(async () => ({
      systemUsersCount: 0,
      approvalsCount: 0,
      securityStatus: '',
      usersHint: '',
      approvalsHint: '',
      securityHint: '',
      overview: {
        activatedTodayCount: 1,
        totalWorkerCount: 20,
        activeWorkerCount: 12,
        totalEmployerCount: 8,
        activeEmployerCount: 6,
        totalJobPostingCount: 10,
        openJobPostingCount: 4,
        totalJobApplicationCount: 18,
        pendingJobApplicationCount: 5,
        acceptedJobApplicationCount: 7,
        rejectedJobApplicationCount: 6,
      },
    })),
  }
})

vi.mock('./components/AdminCommissionRevenueChart', () => ({
  AdminCommissionRevenueChart: () => <div>chart-mounted</div>,
}))

describe('AdminOverviewPage', () => {
  it('renders KPI values from summary endpoint', async () => {
    renderAtRoute(<AdminOverviewPage />, '/admin', '/admin')
    expect(await screen.findByText('12')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('chart-mounted')).toBeInTheDocument()
  })
})

