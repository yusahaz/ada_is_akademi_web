export const SUPPORTED_LOCALES = ['tr', 'en', 'es', 'it', 'ru', 'ar', 'fr'] as const

export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

/** Locales exposed in the admin shell user menu (subset of {@link SUPPORTED_LOCALES}). */
export const ADMIN_PANEL_LOCALES = ['tr', 'en'] as const satisfies readonly AppLocale[]
