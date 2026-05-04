import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import ar from './locales/ar.json'
import en from './locales/en.json'
import es from './locales/es.json'
import it from './locales/it.json'
import ru from './locales/ru.json'
import tr from './locales/tr.json'

const RTL_LANGUAGES = new Set(['ar'])

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
    es: { translation: es },
    it: { translation: it },
    ru: { translation: ru },
    ar: { translation: ar },
  },
  lng: 'tr',
  fallbackLng: 'en',
  supportedLngs: ['tr', 'en', 'es', 'it', 'ru', 'ar'],
  interpolation: { escapeValue: false },
  react: {
    useSuspense: false,
  },
})

applyDocumentLanguage(i18n.language)
i18n.on('languageChanged', applyDocumentLanguage)

export { i18n }
