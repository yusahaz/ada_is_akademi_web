import { describe, it, expect } from 'vitest'

import { resolveDashboardRole } from './roles'
import { SystemUserType } from '../../api/core/index'

describe('resolveDashboardRole', () => {
  it('returns only admin/employer/worker roles (no supervisor dashboard role)', () => {
    const admin = resolveDashboardRole({ systemUserType: SystemUserType.Admin, audience: 'corporate' } as any)
    const employer = resolveDashboardRole({ systemUserType: SystemUserType.Employer, audience: 'corporate' } as any)
    const worker = resolveDashboardRole({ systemUserType: SystemUserType.Worker, audience: 'consumer' } as any)

    expect([admin, employer, worker].sort()).toEqual(['admin', 'employer', 'worker'].sort())
  })
})

