import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'

import { renderWithRoutes, LocationDisplay } from '../../../test/render-admin-page'
import { AdminEmployersPage } from './AdminEmployersPage'

const mockSuccess = vi.fn()
const mockError = vi.fn()
vi.mock('../../../notifications/notification-context', async () => {
  const actual = await vi.importActual<typeof import('../../../notifications/notification-context')>(
    '../../../notifications/notification-context'
  )
  return {
    ...actual,
    useNotification: () => ({ success: mockSuccess, error: mockError, info: vi.fn(), notify: vi.fn() }),
  }
})

const mockList = vi.fn(async ({ offset }: { offset?: number }) => ({
  data: [
    {
      employerId: offset ? 2 : 1,
      name: offset ? 'Beta' : 'Acme A.Ş.',
      taxNumber: offset ? 'T-2' : 'T-1',
      status: 20,
      commissionRate: 0.15,
      logoViewUrl: null,
    },
  ],
  totalCount: 30,
  hasMore: true,
  limit: 20,
  offset: offset ?? 0,
}))

const mockDelete = vi.fn(async () => null)

vi.mock('../../../api/admin/admin-management', async () => {
  const actual = await vi.importActual<typeof import('../../../api/admin/admin-management')>('../../../api/admin/admin-management')
  return {
    ...actual,
    adminManagementApi: {
      ...(actual as any).adminManagementApi,
      listEmployers: (...args: unknown[]) => (mockList as any)(...args),
      deleteEmployer: (...args: unknown[]) => (mockDelete as any)(...args),
    },
  }
})

describe('AdminEmployersPage button actions', () => {
  beforeEach(() => {
    mockDelete.mockClear()
    mockList.mockClear()
    mockSuccess.mockClear()
    mockError.mockClear()
  })

  it('navigates to create page when clicking add employer', async () => {
    renderWithRoutes('/admin/employers', [
      { path: '/admin/employers', element: <AdminEmployersPage /> },
      { path: '/admin/employers/new', element: <LocationDisplay /> },
    ])
    const addBtn = await screen.findByRole('button', { name: /yeni|ekle|add/i })
    fireEvent.click(addBtn)
    expect(await screen.findByTestId('location-pathname')).toHaveTextContent('/admin/employers/new')
  })

  it('opens delete dialog then confirms delete', async () => {
    renderWithRoutes('/admin/employers', [
      { path: '/admin/employers', element: <AdminEmployersPage /> },
      { path: '*', element: <LocationDisplay /> },
    ])
    await screen.findByText('Acme A.Ş.')

    const deleteRowBtn = screen.getByRole('button', { name: /sil/i })
    fireEvent.click(deleteRowBtn)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    const confirm = screen.getByRole('button', { name: /evet,\s*sil/i })
    fireEvent.click(confirm)

    await vi.waitFor(() => expect(mockDelete).toHaveBeenCalled())
  })
})

