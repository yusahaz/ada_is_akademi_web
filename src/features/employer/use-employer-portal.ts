import { useContext } from 'react'

import { EmployerPortalContext } from './employer-portal-context'
import type { EmployerPortalValue } from './employer-portal-types'

export function useEmployerPortal(): EmployerPortalValue {
  const ctx = useContext(EmployerPortalContext)
  if (!ctx) throw new Error('useEmployerPortal must be used within EmployerPortalProvider')
  return ctx
}
