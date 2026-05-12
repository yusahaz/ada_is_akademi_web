import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'

import { renderAtRoute } from '../../../test/render-admin-page'
import { AdminCandidatesPage } from './AdminCandidatesPage'

vi.mock('../../../api/admin/admin-management', async () => {
  const actual = await vi.importActual<typeof import('../../../api/admin/admin-management')>('../../../api/admin/admin-management')
  return {
    ...actual,
    adminManagementApi: {
      ...(actual as any).adminManagementApi,
      listWorkers: vi.fn(async () => ({
        data: [
          { workerId: 10, firstName: 'Ayşe', lastName: 'Yılmaz', email: 'ayse@example.com', accountStatus: 10 },
        ],
        totalCount: 1,
        hasMore: false,
        limit: 20,
        offset: 0,
      })),
      deleteWorker: vi.fn(async () => null),
    },
  }
})

describe('AdminCandidatesPage', () => {
  it('renders candidate rows', async () => {
    renderAtRoute(<AdminCandidatesPage />, '/admin/candidates', '/admin/candidates')
    expect(await screen.findByText(/Ayşe\s+Yılmaz/i)).toBeInTheDocument()
    expect(screen.getByText('ayse@example.com')).toBeInTheDocument()
  })
})

