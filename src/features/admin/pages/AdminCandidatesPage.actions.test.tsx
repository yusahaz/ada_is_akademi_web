import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'

import { LocationDisplay, renderAtRoute, renderWithRoutes } from '../../../test/render-admin-page'
import { AdminCandidatesPage } from './AdminCandidatesPage'

const mockList = vi.fn(async () => ({
  data: [{ workerId: 10, firstName: 'Ayşe', lastName: 'Yılmaz', email: 'ayse@example.com', accountStatus: 10 }],
  totalCount: 1,
  hasMore: false,
  limit: 20,
  offset: 0,
}))
const mockDelete = vi.fn(async () => null)

vi.mock('../../../api/admin/admin-management', async () => {
  const actual = await vi.importActual<typeof import('../../../api/admin/admin-management')>('../../../api/admin/admin-management')
  return {
    ...actual,
    adminManagementApi: {
      ...(actual as any).adminManagementApi,
      listWorkers: (...args: unknown[]) => (mockList as any)(...args),
      deleteWorker: (...args: unknown[]) => (mockDelete as any)(...args),
    },
  }
})

describe('AdminCandidatesPage button actions', () => {
  beforeEach(() => {
    mockDelete.mockClear()
    mockList.mockClear()
  })

  it('navigates to candidate detail when edit is clicked', async () => {
    renderWithRoutes('/admin/candidates', [
      { path: '/admin/candidates', element: <AdminCandidatesPage /> },
      { path: '/admin/candidates/:entityId', element: <LocationDisplay /> },
    ])
    await screen.findByText(/ayse@example\.com/i)

    const editBtn = screen.getByRole('button', { name: /düzenle|edit/i })
    fireEvent.click(editBtn)
    expect(await screen.findByTestId('location-pathname')).toHaveTextContent('/admin/candidates/10')
  })

  it('opens delete dialog and does not call delete when cancelled', async () => {
    renderAtRoute(<AdminCandidatesPage />, '/admin/candidates', '/admin/candidates')
    await screen.findByText(/ayse@example\.com/i)

    const deleteBtn = screen.getByRole('button', { name: /sil/i })
    fireEvent.click(deleteBtn)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    const cancelBtn = screen.getByRole('button', { name: /vazgeç|cancel/i })
    fireEvent.click(cancelBtn)

    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('calls workersApi.delete when dialog confirm accepted', async () => {
    renderAtRoute(<AdminCandidatesPage />, '/admin/candidates', '/admin/candidates')
    await screen.findByText(/ayse@example\.com/i)

    const deleteBtn = screen.getByRole('button', { name: /sil/i })
    fireEvent.click(deleteBtn)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    const confirmBtn = screen.getByRole('button', { name: /evet,\s*sil/i })
    fireEvent.click(confirmBtn)

    await vi.waitFor(() => {
      expect(mockDelete).toHaveBeenCalled()
    })
  })
})

