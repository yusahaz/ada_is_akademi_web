import { getApiClient } from '../core/client'
import { API_ENDPOINTS } from '../core/endpoints'

export type ListGlobalSkillsQuery = {
  limit?: number
}

const client = getApiClient()

export const skillsApi = {
  list(body: ListGlobalSkillsQuery = {}) {
    return client.post<string[], ListGlobalSkillsQuery>(API_ENDPOINTS.skills.list, body, true)
  },
}
