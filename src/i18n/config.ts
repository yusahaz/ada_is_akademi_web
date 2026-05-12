import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import ar from './locales/ar.json'
import en from './locales/en.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import it from './locales/it.json'
import ru from './locales/ru.json'
import tr from './locales/tr.json'

const RTL_LANGUAGES = new Set(['ar'])
const LANGUAGE_STORAGE_KEY = 'ada-is-akademi:language'
const MOJIBAKE_PATTERN = /[ÃÂÐÑØÙÄÅâ]/

function decodeMojibakeText(text: string): string {
  if (!MOJIBAKE_PATTERN.test(text)) return text
  try {
    const bytes = Uint8Array.from(text, (char) => char.charCodeAt(0) & 0xff)
    const decoded = new TextDecoder('utf-8').decode(bytes)
    return decoded || text
  } catch {
    return text
  }
}

function normalizeLocaleResource<T>(value: T): T {
  if (typeof value === 'string') {
    return decodeMojibakeText(value) as T
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeLocaleResource(item)) as T
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      normalizeLocaleResource(item),
    ])
    return Object.fromEntries(entries) as T
  }
  return value
}

function getStoredLanguage(): string | null {
  if (typeof window === 'undefined') return null
  const fromSession = window.sessionStorage.getItem(LANGUAGE_STORAGE_KEY)
  return fromSession || null
}

function persistLanguage(language: string) {
  if (typeof window === 'undefined') return
  const normalized = language.split('-')[0] ?? language
  window.sessionStorage.setItem(LANGUAGE_STORAGE_KEY, normalized)
}

function applyDocumentLanguage(language: string) {
  const normalized = language.split('-')[0] ?? language
  const dir = RTL_LANGUAGES.has(normalized) ? 'rtl' : 'ltr'
  document.documentElement.lang = normalized
  document.documentElement.dir = dir
}

void i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
    es: { translation: normalizeLocaleResource(es) },
    fr: { translation: normalizeLocaleResource(fr) },
    it: { translation: normalizeLocaleResource(it) },
    ru: { translation: normalizeLocaleResource(ru) },
    ar: { translation: normalizeLocaleResource(ar) },
  },
  lng: getStoredLanguage() ?? 'tr',
  fallbackLng: 'en',
  supportedLngs: ['tr', 'en', 'es', 'it', 'ru', 'ar', 'fr'],
  interpolation: { escapeValue: false },
  react: {
    useSuspense: false,
  },
})

applyDocumentLanguage(i18n.language)
i18n.on('languageChanged', (language) => {
  applyDocumentLanguage(language)
  persistLanguage(language)
})

export { i18n }
