import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'

import { renderAtRoute } from '../../../../test/render-admin-page'
import { JobPostingDetailPage } from './JobPostingDetailPage'

const mockGetById = vi.fn(async () => ({
  id: 1,
  title: 'Garson',
  description: 'Açıklama',
  shiftDate: '2026-05-11',
  shiftStartTime: '09:00',
  shiftEndTime: '18:00',
  wageAmount: 1000,
  wageCurrency: 'TRY',
  headCount: 2,
  skills: [{ jobPostingId: 1, isRequired: true, tag: 'Hız' }],
}))

vi.mock('../../../../api/jobs/job-postings', async () => {
  const actual = await vi.importActual<typeof import('../../../../api/jobs/job-postings')>(
    '../../../../api/jobs/job-postings',
  )
  return {
    ...actual,
    jobPostingsApi: {
      ...actual.jobPostingsApi,
      getById: (...args: unknown[]) => (mockGetById as any)(...args),
    },
  }
})

const mockSubmitApplication = vi.fn(async () => null)
vi.mock('../../../../api/worker/worker-portal', async () => {
  const actual = await vi.importActual<typeof import('../../../../api/worker/worker-portal')>(
    '../../../../api/worker/worker-portal',
  )
  return {
    ...actual,
    workerPortalApi: {
      ...actual.workerPortalApi,
      submitApplication: (...args: unknown[]) => (mockSubmitApplication as any)(...args),
    },
  }
})

const mockRunWithToast = vi.fn(async (request: Promise<unknown>) => await request)
vi.mock('../../../../notifications/use-action-toasts', () => ({
  useActionToasts: () => ({ runWithToast: mockRunWithToast }),
}))

describe('JobPostingDetailPage button actions', () => {
  beforeEach(() => {
    mockRunWithToast.mockClear()
    mockSubmitApplication.mockClear()
    mockGetById.mockClear()
  })

  it('clicking apply calls submitApplication and runWithToast', async () => {
    renderAtRoute(<JobPostingDetailPage />, '/worker/jobs/1', '/worker/jobs/:postingId')

    await screen.findByText('Garson')
    const applyBtn = screen.getByRole('button', { name: /başvur|apply|gönder/i })
    fireEvent.click(applyBtn)

    await vi.waitFor(() => {
      expect(mockSubmitApplication).toHaveBeenCalled()
      expect(mockRunWithToast).toHaveBeenCalled()
    })
  })
})

