import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'

import { renderWithRoutes } from '../../../test/render-admin-page'
import { AdminUserDetailPage } from './AdminUserDetailPage'

const mockGetSystemUserById = vi.fn(async () => ({
  systemUserId: 7,
  systemUserType: 'Admin',
  email: 'admin@adais.com',
  firstName: 'Ada',
  lastName: 'Admin',
  phone: '+90 555 000 00 00',
  accountStatus: 'Active',
  isLocked: false,
  employerId: null,
  workerId: null,
}))
const mockSuspend = vi.fn(async () => null)
const mockReactivate = vi.fn(async () => null)
const mockBan = vi.fn(async () => null)

vi.mock('../../../api/admin/admin-management', async () => {
  const actual = await vi.importActual<typeof import('../../../api/admin/admin-management')>('../../../api/admin/admin-management')
  return {
    ...actual,
    adminManagementApi: {
      ...(actual as any).adminManagementApi,
      getSystemUserById: (...args: unknown[]) => (mockGetSystemUserById as any)(...args),
      suspendSystemUser: (...args: unknown[]) => (mockSuspend as any)(...args),
      reactivateSystemUser: (...args: unknown[]) => (mockReactivate as any)(...args),
      banSystemUser: (...args: unknown[]) => (mockBan as any)(...args),
    },
  }
})

describe('AdminUserDetailPage account actions', () => {
  beforeEach(() => {
    mockGetSystemUserById.mockClear()
    mockSuspend.mockClear()
    mockReactivate.mockClear()
    mockBan.mockClear()
  })

  it('opens confirm and calls suspend', async () => {
    renderWithRoutes('/admin/users/7', [{ path: '/admin/users/:entityId', element: <AdminUserDetailPage /> }])
    fireEvent.click(await screen.findByRole('button', { name: /askıya al/i }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /evet,\s*askıya al/i }))
    await vi.waitFor(() => expect(mockSuspend).toHaveBeenCalled())
  })

  it('opens confirm and calls reactivate', async () => {
    renderWithRoutes('/admin/users/7', [{ path: '/admin/users/:entityId', element: <AdminUserDetailPage /> }])
    fireEvent.click(await screen.findByRole('button', { name: /yeniden aktifleştir/i }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /evet,\s*aktifleştir/i }))
    await vi.waitFor(() => expect(mockReactivate).toHaveBeenCalled())
  })

  it('opens confirm and calls ban', async () => {
    renderWithRoutes('/admin/users/7', [{ path: '/admin/users/:entityId', element: <AdminUserDetailPage /> }])
    fireEvent.click(await screen.findByRole('button', { name: /yasakla/i }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /evet,\s*yasakla/i }))
    await vi.waitFor(() => expect(mockBan).toHaveBeenCalled())
  })
})
