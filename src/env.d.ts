/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_ADMIN_SYSTEM_USER_TYPES?: string
  readonly VITE_EMPLOYER_SYSTEM_USER_TYPES?: string
  readonly VITE_WORKER_SYSTEM_USER_TYPES?: string
  readonly VITE_AUTH_STORAGE_SECRET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
