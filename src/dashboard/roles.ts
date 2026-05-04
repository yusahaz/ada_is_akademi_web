import type { AuthSession } from '../auth/auth-context'

export type DashboardRole = 'worker' | 'employer' | 'admin'

const DEFAULT_ADMIN_TYPES = [10]
const DEFAULT_EMPLOYER_TYPES = [20]
const DEFAULT_WORKER_TYPES = [30]

function parseTypeList(rawValue: string | undefined): number[] {
  if (!rawValue) return []
  return rawValue
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((value) => Number.isFinite(value))
}

export function resolveDashboardRole(session: AuthSession): DashboardRole {
  const adminTypes =
    parseTypeList(import.meta.env.VITE_ADMIN_SYSTEM_USER_TYPES).length > 0
      ? parseTypeList(import.meta.env.VITE_ADMIN_SYSTEM_USER_TYPES)
      : DEFAULT_ADMIN_TYPES
  const employerTypes =
    parseTypeList(import.meta.env.VITE_EMPLOYER_SYSTEM_USER_TYPES).length > 0
      ? parseTypeList(import.meta.env.VITE_EMPLOYER_SYSTEM_USER_TYPES)
      : DEFAULT_EMPLOYER_TYPES
  const workerTypes =
    parseTypeList(import.meta.env.VITE_WORKER_SYSTEM_USER_TYPES).length > 0
      ? parseTypeList(import.meta.env.VITE_WORKER_SYSTEM_USER_TYPES)
      : DEFAULT_WORKER_TYPES

  const currentType = Number(session.systemUserType)
  if (Number.isFinite(currentType)) {
    if (adminTypes.includes(currentType)) {
      return 'admin'
    }
    if (employerTypes.includes(currentType)) {
      return 'employer'
    }
    if (workerTypes.includes(currentType)) {
      return 'worker'
    }
  }

  if (session.audience === 'corporate') {
    return 'employer'
  }

  return 'worker'
}
