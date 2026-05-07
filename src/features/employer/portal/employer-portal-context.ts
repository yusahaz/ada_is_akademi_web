import { createContext } from 'react'

import type { EmployerPortalValue } from './employer-portal-types'

export const EmployerPortalContext = createContext<EmployerPortalValue | null>(null)
