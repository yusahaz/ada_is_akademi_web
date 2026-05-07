import type { AuthSession } from './auth-context'
import { SystemUserType } from '../../api/core/index'

export type DashboardRole = 'worker' | 'employer' | 'admin'

export function resolveDashboardRole(session: AuthSession): DashboardRole {
  const currentType = Number(session.systemUserType)
  if (Number.isFinite(currentType)) {
    if (currentType === SystemUserType.Admin) {
      return 'admin'
    }
    if (currentType === SystemUserType.Employer) {
      return 'employer'
    }
    if (currentType === SystemUserType.Worker) {
      return 'worker'
    }
  }

  if (session.audience === 'corporate') {
    return 'employer'
  }

  return 'worker'
}
