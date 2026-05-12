import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'

import { renderWithRoutes, LocationDisplay } from '../../../test/render-admin-page'
import { AdminEmployerDetailPage } from './AdminEmployerDetailPage'

const mockGetById = vi.fn(async () => ({
  id: 4,
  name: 'Akşit LLC A.Ş.',
  description: null,
  status: 20,
  taxNumber: 'TX-4',
  contact: { firstName: 'Ali', lastName: 'Veli', email: 'ali@example.com', phone: '+90' },
}))
const mockUpdate = vi.fn(async () => null)
const mockDelete = vi.fn(async () => null)

vi.mock('../../../api/admin/admin-management', async () => {
  const actual = await vi.importActual<typeof import('../../../api/admin/admin-management')>('../../../api/admin/admin-management')
  return {
    ...actual,
    adminManagementApi: {
      ...(actual as any).adminManagementApi,
      getEmployerById: (...args: unknown[]) => (mockGetById as any)(...args),
      updateEmployerProfile: (...args: unknown[]) => (mockUpdate as any)(...args),
      deleteEmployer: (...args: unknown[]) => (mockDelete as any)(...args),
      listEmployerLocations: vi.fn(async () => ({
        data: [
          {
            locationId: 1,
            name: 'Merkez',
            city: 'İstanbul',
            latitude: 41.0,
            longitude: 29.0,
            geofenceRadiusMetres: 150,
            isActive: true,
          },
        ],
        totalCount: 1,
        hasMore: false,
        limit: 20,
        offset: 0,
      })),
      listSystemUsers: vi.fn(async () => ({
        data: [
          { id: 99, email: 'employer.user@example.com', type: 20, accountStatus: 10 },
        ],
        totalCount: 1,
        hasMore: false,
        limit: 20,
        offset: 0,
      })),
      listEmployerSupervisors: vi.fn(async () => [
        { systemUserId: 99, fullName: 'Supervisor User', email: 'employer.user@example.com', assignedLocationIds: [1] },
      ]),
    },
  }
})

describe('AdminEmployerDetailPage', () => {
  it('loads and renders related sections', async () => {
    renderWithRoutes('/admin/employers/4', [
      { path: '/admin/employers/:entityId', element: <AdminEmployerDetailPage /> },
      { path: '*', element: <LocationDisplay /> },
    ])
    expect(await screen.findByRole('heading', { level: 1, name: /Akşit LLC A\.Ş\.\s*\(#4\)/i })).toBeInTheDocument()
    expect(await screen.findByText('Lokasyonlar')).toBeInTheDocument()
    expect(await screen.findByText('Merkez')).toBeInTheDocument()
    expect(await screen.findByText('Kullanıcılar')).toBeInTheDocument()
    expect((await screen.findAllByText(/Supervisor User/i)).length).toBeGreaterThan(0)
  })

  it('submits updateProfile on save', async () => {
    renderWithRoutes('/admin/employers/4', [
      { path: '/admin/employers/:entityId', element: <AdminEmployerDetailPage /> },
      { path: '*', element: <LocationDisplay /> },
    ])
    await screen.findByRole('heading', { level: 1, name: /Akşit LLC A\.Ş\.\s*\(#4\)/i })

    const nameInput = screen.getByRole('textbox', { name: /kurum|iş veren/i })
    fireEvent.change(nameInput, { target: { value: '  Yeni İsim  ' } })

    const saveButton = screen.getByRole('button', { name: /kaydet/i })
    fireEvent.click(saveButton)

    // It is async; just assert the call eventually happens.
    await vi.waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled()
    })
  })

  it('opens delete dialog and confirms delete (API + navigate)', async () => {
    renderWithRoutes('/admin/employers/4', [
      { path: '/admin/employers/:entityId', element: <AdminEmployerDetailPage /> },
      { path: '/admin/employers', element: <LocationDisplay /> },
    ])
    await screen.findByRole('heading', { level: 1, name: /Akşit LLC A\.Ş\.\s*\(#4\)/i })

    // Sanity: close button uses navigate synchronously.
    const closeBtn = screen.getByRole('button', { name: /kapat|close/i })
    fireEvent.click(closeBtn)
    expect(await screen.findByTestId('location-pathname')).toHaveTextContent('/admin/employers')

    // Go back to detail (re-render fresh) for delete flow.
    renderWithRoutes('/admin/employers/4', [
      { path: '/admin/employers/:entityId', element: <AdminEmployerDetailPage /> },
      { path: '/admin/employers', element: <LocationDisplay /> },
    ])
    await screen.findByRole('heading', { level: 1, name: /Akşit LLC A\.Ş\.\s*\(#4\)/i })

    const deleteBtn = screen.getByRole('button', { name: /sil/i })
    fireEvent.click(deleteBtn)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    const confirmBtn = screen.getByRole('button', { name: /evet,\s*sil/i })
    fireEvent.click(confirmBtn)

    await vi.waitFor(() => expect(mockDelete).toHaveBeenCalled())
    expect(await screen.findByTestId('location-pathname')).toHaveTextContent('/admin/employers')
  })
})

