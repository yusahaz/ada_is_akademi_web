import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'

import { LocationDisplay, renderWithRoutes } from '../../../test/render-admin-page'
import { AdminCandidateDetailPage } from './AdminCandidateDetailPage'

const mockGetDetail = vi.fn(async () => ({
  id: 10,
  systemUserId: 310,
  nationality: 'TR',
  university: 'Ankara Üniversitesi',
  embeddingUpdatedAt: null,
  systemUser: {
    id: 310,
    email: 'ayse@example.com',
    firstName: 'Ayşe',
    lastName: 'Yılmaz',
    phone: '5550001122',
    accountStatus: 'Active',
  },
  skills: [{ id: 1, tag: 'Kasa', createdAt: null }],
  availabilities: [],
  certificates: [],
  educations: [],
  experiences: [{ id: 1, companyName: 'Ada Cafe', position: 'Garson', startDate: null, endDate: null, isCurrent: true, description: null }],
  languages: [{ id: 1, language: 'Türkçe', level: 5 }],
  references: [],
}))
const mockUpdateProfile = vi.fn(async () => null)

vi.mock('../../../api/admin/admin-management', async () => {
  const actual = await vi.importActual<typeof import('../../../api/admin/admin-management')>('../../../api/admin/admin-management')
  return {
    ...actual,
    adminManagementApi: {
      ...(actual as any).adminManagementApi,
      getWorkerDetail: (...args: unknown[]) => (mockGetDetail as any)(...args),
      updateWorkerProfile: (...args: unknown[]) => (mockUpdateProfile as any)(...args),
    },
  }
})

describe('AdminCandidateDetailPage', () => {
  beforeEach(() => {
    mockGetDetail.mockClear()
    mockUpdateProfile.mockClear()
  })

  it('renders candidate detail content', async () => {
    renderWithRoutes('/admin/candidates/10', [{ path: '/admin/candidates/:entityId', element: <AdminCandidateDetailPage /> }])
    expect(await screen.findByRole('heading', { level: 1, name: /Ayşe Yılmaz\s*\(#10\)/i })).toBeInTheDocument()
    expect(screen.getByText(/ayse@example\.com/i)).toBeInTheDocument()
    expect(screen.getByText(/Kasa/i)).toBeInTheDocument()
  })

  it('submits save action and updateProfile is called', async () => {
    renderWithRoutes('/admin/candidates/10', [{ path: '/admin/candidates/:entityId', element: <AdminCandidateDetailPage /> }])
    await screen.findByRole('heading', { level: 1, name: /Ayşe Yılmaz\s*\(#10\)/i })
    fireEvent.change(screen.getByLabelText('Telefon'), { target: { value: '5321112233' } })
    fireEvent.click(screen.getByRole('button', { name: /kaydet/i }))
    await vi.waitFor(() => expect(mockUpdateProfile).toHaveBeenCalled())
  })

  it('navigates back to candidates list', async () => {
    renderWithRoutes('/admin/candidates/10', [
      { path: '/admin/candidates/:entityId', element: <AdminCandidateDetailPage /> },
      { path: '/admin/candidates', element: <LocationDisplay /> },
    ])
    await screen.findByRole('heading', { level: 1, name: /Ayşe Yılmaz\s*\(#10\)/i })
    fireEvent.click(screen.getByRole('button', { name: /listeye dön/i }))
    expect(await screen.findByTestId('location-pathname')).toHaveTextContent('/admin/candidates')
  })
})
