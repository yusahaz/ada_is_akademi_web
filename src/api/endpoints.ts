export const API_ENDPOINTS = {
  statistics: {
    overview: 'Statistics/Overview',
  },
  systemUsers: {
    login: 'SystemUsers/Login',
    refreshToken: 'SystemUsers/RefreshToken',
    registerWorker: 'SystemUsers/RegisterWorker',
    registerEmployer: 'SystemUsers/RegisterEmployer',
    registerAdmin: 'SystemUsers/RegisterAdmin',
  },
} as const

export type ApiEndpoints = typeof API_ENDPOINTS
