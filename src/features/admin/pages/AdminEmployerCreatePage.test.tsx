import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'

import { LocationDisplay, renderWithRoutes } from '../../../test/render-admin-page'
import { AdminEmployerCreatePage } from './AdminEmployerCreatePage'

const { registerEmployerMock } = vi.hoisted(() => ({
  registerEmployerMock: vi.fn(async () => 42),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'tr', resolvedLanguage: 'tr' },
  }),
}))

vi.mock('../../../api/admin/admin-management', async () => {
  const actual = await vi.importActual<typeof import('../../../api/admin/admin-management')>(
    '../../../api/admin/admin-management',
  )
  return {
    ...actual,
    adminManagementApi: {
      ...(actual as any).adminManagementApi,
      registerEmployer: registerEmployerMock,
    },
  }
})

describe('AdminEmployerCreatePage', () => {
  it('submits required fields and navigates to employer detail', async () => {
    renderWithRoutes('/admin/employers/new', [
      { path: '/admin/employers/new', element: <AdminEmployerCreatePage /> },
      { path: '/admin/employers/:entityId', element: <LocationDisplay /> },
    ])

    const fields = await screen.findAllByRole('textbox')
    expect(fields.length).toBeGreaterThanOrEqual(10)

    fireEvent.change(fields[0], { target: { value: '  Acme A.S.  ' } })
    fireEvent.change(fields[1], { target: { value: ' Aciklama ' } })
    fireEvent.change(fields[2], { target: { value: ' 1234567890 ' } })
    fireEvent.change(fields[3], { target: { value: ' Merkez Mah. 1 ' } })
    fireEvent.change(fields[4], { target: { value: ' Istanbul ' } })
    fireEvent.change(fields[5], { target: { value: ' TR ' } })
    fireEvent.change(fields[6], { target: { value: ' Ada ' } })
    fireEvent.change(fields[7], { target: { value: ' Is ' } })
    fireEvent.change(fields[8], { target: { value: ' admin@acme.com ' } })
    fireEvent.change(fields[9], { target: { value: ' 5550000000 ' } })

    const passwordInput = screen.getByLabelText('dashboard.admin.register.password') as HTMLInputElement
    fireEvent.change(passwordInput, { target: { value: 'secret123' } })

    fireEvent.click(screen.getByRole('button', { name: 'dashboard.admin.employers.create.submit' }))

    await waitFor(() => {
      expect(registerEmployerMock).toHaveBeenCalledTimes(1)
    })

    expect(registerEmployerMock).toHaveBeenCalledWith({
      employerName: 'Acme A.S.',
      employerDescription: 'Aciklama',
      employerTaxNumber: '1234567890',
      employerAddressLine1: 'Merkez Mah. 1',
      employerAddressCity: 'Istanbul',
      employerAddressCountry: 'TR',
      firstName: 'Ada',
      lastName: 'Is',
      email: 'admin@acme.com',
      phone: '5550000000',
      password: 'secret123',
    })

    expect(await screen.findByTestId('location-pathname')).toHaveTextContent('/admin/employers/42')
  })
})

