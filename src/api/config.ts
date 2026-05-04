const DEFAULT_API_BASE_URL = 'http://localhost:15080'

export function getApiBaseUrl(): string {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL
  if (typeof envBaseUrl === 'string' && envBaseUrl.trim().length > 0) {
    return envBaseUrl.trim().replace(/\/+$/, '')
  }
  return DEFAULT_API_BASE_URL
}
