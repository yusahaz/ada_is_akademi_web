import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'

import { LocationDisplay, renderWithRoutes } from '../../../test/render-admin-page'
import { AdminUsersPage } from './AdminUsersPage'

const mockList = vi.fn(async () => ({
  data: [
    { id: 1, email: 'admin@example.com', type: 'Admin', accountStatus: 'Active' },
    { id: 2, email: 'employer@example.com', type: 20, accountStatus: 20 },
  ],
  totalCount: 2,
  hasMore: false,
  limit: 20,
  offset: 0,
}))
const mockBan = vi.fn(async () => null)

vi.mock('../../../api/admin/admin-management', async () => {
  const actual = await vi.importActual<typeof import('../../../api/admin/admin-management')>('../../../api/admin/admin-management')
  return {
    ...actual,
    adminManagementApi: {
      ...(actual as any).adminManagementApi,
      listSystemUsers: (...args: unknown[]) => (mockList as any)(...args),
      banSystemUser: (...args: unknown[]) => (mockBan as any)(...args),
    },
  }
})

describe('AdminUsersPage actions', () => {
  beforeEach(() => {
    mockList.mockClear()
    mockBan.mockClear()
  })

  it('navigates to user detail when edit is clicked', async () => {
    renderWithRoutes('/admin/users', [
      { path: '/admin/users', element: <AdminUsersPage /> },
      { path: '/admin/users/:entityId', element: <LocationDisplay /> },
    ])
    await screen.findByText('admin@example.com')
    fireEvent.click(screen.getAllByRole('button', { name: /düzenle/i })[0]!)
    expect(await screen.findByTestId('location-pathname')).toHaveTextContent('/admin/users/1')
  })

  it('navigates to create user page when create button is clicked', async () => {
    renderWithRoutes('/admin/users', [
      { path: '/admin/users', element: <AdminUsersPage /> },
      { path: '/admin/users/new', element: <LocationDisplay /> },
    ])
    await screen.findByText('admin@example.com')
    fireEvent.click(screen.getByRole('button', { name: /yeni kullanıcı oluştur/i }))
    expect(await screen.findByTestId('location-pathname')).toHaveTextContent('/admin/users/new')
  })

  it('opens delete dialog then confirms delete', async () => {
    renderWithRoutes('/admin/users', [{ path: '/admin/users', element: <AdminUsersPage /> }])
    await screen.findByText('admin@example.com')
    fireEvent.click(screen.getAllByRole('button', { name: /sil/i })[0]!)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /evet,\s*sil/i }))
    await vi.waitFor(() => expect(mockBan).toHaveBeenCalled())
  })
})
