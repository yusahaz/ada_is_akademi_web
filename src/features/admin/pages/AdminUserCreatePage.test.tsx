import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'

import { LocationDisplay, renderWithRoutes } from '../../../test/render-admin-page'
import { AdminUserCreatePage } from './AdminUserCreatePage'

const mockSuccess = vi.fn()
const mockError = vi.fn()
const mockRegisterAdmin = vi.fn(async () => 42)

vi.mock('../../../notifications/notification-context', async () => {
  const actual = await vi.importActual<typeof import('../../../notifications/notification-context')>(
    '../../../notifications/notification-context',
  )
  return {
    ...actual,
    useNotification: () => ({ success: mockSuccess, error: mockError, info: vi.fn(), notify: vi.fn() }),
  }
})

vi.mock('../../../api/admin/admin-management', async () => {
  const actual = await vi.importActual<typeof import('../../../api/admin/admin-management')>(
    '../../../api/admin/admin-management',
  )
  return {
    ...actual,
    adminManagementApi: {
      ...(actual as any).adminManagementApi,
      registerAdmin: (...args: unknown[]) => (mockRegisterAdmin as any)(...args),
    },
  }
})

describe('AdminUserCreatePage', () => {
  beforeEach(() => {
    mockSuccess.mockClear()
    mockError.mockClear()
    mockRegisterAdmin.mockClear()
  })

  it('validates required email and password', async () => {
    renderWithRoutes('/admin/users/new', [{ path: '/admin/users/new', element: <AdminUserCreatePage /> }])

    fireEvent.submit((await screen.findByRole('button', { name: /admin kullanıcısı oluştur/i })).closest('form')!)

    expect(await screen.findByText(/e-posta ve şifre zorunludur/i)).toBeInTheDocument()
    expect(mockRegisterAdmin).not.toHaveBeenCalled()
  })

  it('creates admin user successfully and navigates to detail', async () => {
    renderWithRoutes('/admin/users/new', [
      { path: '/admin/users/new', element: <AdminUserCreatePage /> },
      { path: '/admin/users/:entityId', element: <LocationDisplay /> },
    ])

    fireEvent.change(await screen.findByLabelText(/e-posta/i), { target: { value: 'new-admin@adais.com' } })
    fireEvent.change(screen.getByLabelText(/şifre/i), { target: { value: '123456' } })
    fireEvent.change(screen.getByLabelText(/^ad$/i), { target: { value: 'Ada' } })
    fireEvent.change(screen.getByLabelText(/soyad/i), { target: { value: 'Yonetici' } })
    fireEvent.change(screen.getByLabelText(/telefon/i), { target: { value: '+90 555 000 00 00' } })

    fireEvent.click(screen.getByRole('button', { name: /admin kullanıcısı oluştur/i }))

    await vi.waitFor(() =>
      expect(mockRegisterAdmin).toHaveBeenCalledWith({
        email: 'new-admin@adais.com',
        password: '123456',
        firstName: 'Ada',
        lastName: 'Yonetici',
        phone: '+90 555 000 00 00',
      }),
    )
    expect(mockSuccess).toHaveBeenCalled()
    expect(await screen.findByTestId('location-pathname')).toHaveTextContent('/admin/users/42')
  })

  it('shows error toast when create fails', async () => {
    mockRegisterAdmin.mockRejectedValueOnce(new Error('fail'))

    renderWithRoutes('/admin/users/new', [{ path: '/admin/users/new', element: <AdminUserCreatePage /> }])

    fireEvent.change(await screen.findByLabelText(/e-posta/i), { target: { value: 'new-admin@adais.com' } })
    fireEvent.change(screen.getByLabelText(/şifre/i), { target: { value: '123456' } })
    fireEvent.click(screen.getByRole('button', { name: /admin kullanıcısı oluştur/i }))

    await vi.waitFor(() => expect(mockRegisterAdmin).toHaveBeenCalled())
    expect(mockError).toHaveBeenCalledWith('İşlem sırasında bir hata oluştu')
  })
})
