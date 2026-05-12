import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'

import { renderAtRoute } from '../../../../test/render-admin-page'
import { EmployerReportsPage } from './EmployerReportsPage'
import { EmployerPortalContext } from '../../portal/employer-portal-context'

describe('EmployerReportsPage actions', () => {
  it('renders Team RBAC view when view=teamRBAC', async () => {
    renderAtRoute(
      <EmployerPortalContext.Provider
        value={
          {
            loading: false,
            error: null,
            badges: { activeAnomalies: 0, pendingPayouts: 0 },
            postings: [],
            selectedPostingId: null,
            setSelectedPostingId: () => undefined,
            selectedPosting: null,
            applications: [],
            postingsFilter: 'all',
            setPostingsFilter: () => undefined,
            payoutFilter: 'all',
            setPayoutFilter: () => undefined,
            receivableFilter: 'all',
            setReceivableFilter: () => undefined,
            reportFormat: 'csv',
            setReportFormat: () => undefined,
            summary: { openPostings: 0, pendingApplications: 0, actionRequired: 0 },
            postingsWithStatus: [],
            filteredPostings: [],
            candidateGroups: { pending: [], accepted: [], rejected: [] },
            filteredPayouts: [],
            filteredReceivables: [],
            reportMetrics: { totalPostings: 0, acceptedApplications: 0, pendingApplications: 0, rejectedApplications: 0, monthlyReceivable: 0 },
            activeAssignments: [],
            assignmentHistory: [],
            semanticResults: [],
            runSemanticSearch: async () => undefined,
            workerPortfolio: [],
            skillSuggestions: [],
            employerLocations: [],
            employerSupervisors: [{ id: 1, email: 'sup@example.com', firstName: 'S', lastName: 'P', accountStatus: 10 }],
            disputes: [],
            spotSummary: null,
            reloadPostings: async () => undefined,
          } as any
        }
      >
        <EmployerReportsPage />
      </EmployerPortalContext.Provider>,
      '/employer/reports?view=teamRBAC',
      '/employer/reports',
    )

    expect(
      await screen.findByRole('heading', { level: 2, name: /Ekip Yönetimi \(RBAC\)/i }),
    ).toBeInTheDocument()
  })
})

