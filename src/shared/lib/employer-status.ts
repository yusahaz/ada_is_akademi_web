import { EmployerStatus, type EmployerStatus as EmployerStatusType } from '../../api/core/enums'

const VALID_NUMERIC = new Set<number>([
  EmployerStatus.Pending,
  EmployerStatus.Active,
  EmployerStatus.Suspended,
  EmployerStatus.Banned,
])

const NAME_TO_VALUE: Record<string, EmployerStatusType> = {
  pending: EmployerStatus.Pending,
  active: EmployerStatus.Active,
  suspended: EmployerStatus.Suspended,
  banned: EmployerStatus.Banned,
}

/**
 * Normalizes API payloads where `EmployerStatus` may arrive as int or string name (e.g. "Active").
 */
export function parseEmployerStatus(raw: unknown): EmployerStatusType {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    const n = Math.trunc(raw)
    if (VALID_NUMERIC.has(n)) return n as EmployerStatusType
  }
  if (typeof raw === 'string') {
    const t = raw.trim()
    if (!t) return EmployerStatus.Pending
    const asNum = Number(t)
    if (Number.isFinite(asNum)) {
      const n = Math.trunc(asNum)
      if (VALID_NUMERIC.has(n)) return n as EmployerStatusType
    }
    const byName = NAME_TO_VALUE[t.toLowerCase()]
    if (byName !== undefined) return byName
  }
  return EmployerStatus.Pending
}

/** i18n key suffix under `dashboard.admin.employers.status.*` */
export function employerStatusLocaleKey(raw: unknown): '10' | '20' | '30' | '90' {
  return String(parseEmployerStatus(raw)) as '10' | '20' | '30' | '90'
}
