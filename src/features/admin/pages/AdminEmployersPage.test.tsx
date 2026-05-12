import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'

import { renderAtRoute } from '../../../test/render-admin-page'
import { AdminEmployersPage } from './AdminEmployersPage'

vi.mock('../../../api/admin/admin-management', async () => {
  const actual = await vi.importActual<typeof import('../../../api/admin/admin-management')>('../../../api/admin/admin-management')
  return {
    ...actual,
    adminManagementApi: {
      ...(actual as any).adminManagementApi,
      listEmployers: vi.fn(async () => ({
        data: [
          {
            employerId: 8,
            name: 'Acme A.Ş.',
            taxNumber: '123',
            status: 20,
            commissionRate: 0.15,
            logoViewUrl: null,
          },
        ],
        totalCount: 1,
        hasMore: false,
        limit: 20,
        offset: 0,
      })),
    },
  }
})

describe('AdminEmployersPage', () => {
  it('renders employer row', async () => {
    renderAtRoute(<AdminEmployersPage />, '/admin/employers', '/admin/employers')
    expect(await screen.findByText('Acme A.Ş.')).toBeInTheDocument()
    expect(screen.getByText('123')).toBeInTheDocument()
  })
})

