export const SUPPORTED_LOCALES = ['tr', 'en', 'es', 'it', 'ru', 'ar'] as const

export type AppLocale = (typeof SUPPORTED_LOCALES)[number]
