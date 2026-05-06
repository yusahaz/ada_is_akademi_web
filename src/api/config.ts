const DEV_API_BASE_URL = 'http://localhost:15080'
const PROD_API_BASE_URL = 'https://api.adaisakademi.com'

export function getApiBaseUrl(): string {
  if (import.meta.env.DEV) {
    return DEV_API_BASE_URL
  }

  const envBaseUrl = import.meta.env.VITE_API_BASE_URL
  if (typeof envBaseUrl === 'string' && envBaseUrl.trim().length > 0) {
    return envBaseUrl.trim().replace(/\/+$/, '')
  }
  return PROD_API_BASE_URL
}
