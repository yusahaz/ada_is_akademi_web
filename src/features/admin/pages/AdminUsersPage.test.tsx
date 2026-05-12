import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'

import { renderAtRoute } from '../../../test/render-admin-page'
import { AdminUsersPage } from './AdminUsersPage'

vi.mock('../../../api/admin/admin-management', async () => {
  const actual = await vi.importActual<typeof import('../../../api/admin/admin-management')>('../../../api/admin/admin-management')
  return {
    ...actual,
    adminManagementApi: {
      ...(actual as any).adminManagementApi,
      listSystemUsers: vi.fn(async () => ({
        data: [
          { id: 1, email: 'admin@example.com', type: 'Admin', accountStatus: 'Active' },
          { id: 2, email: 'employer@example.com', type: 20, accountStatus: 20 },
          { id: 3, email: 'supervisor@example.com', type: 'Supervisor', accountStatus: 'Pending' },
        ],
        totalCount: 3,
        hasMore: false,
        limit: 20,
        offset: 0,
      })),
    },
  }
})

describe('AdminUsersPage', () => {
  it('renders user rows', async () => {
    renderAtRoute(<AdminUsersPage />, '/admin/users', '/admin/users')
    expect(await screen.findByText('admin@example.com')).toBeInTheDocument()
    expect(screen.getByText('employer@example.com')).toBeInTheDocument()
    expect(screen.getByText('supervisor@example.com')).toBeInTheDocument()
    expect(screen.queryByText(/dashboard\.admin\.users\.type\.NaN/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/dashboard\.admin\.users\.status\.NaN/i)).not.toBeInTheDocument()
  })
})

