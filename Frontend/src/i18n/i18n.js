// src/i18n.js
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Importar traducciones
import esTranslations from '../locales/es/translation.json'
import enTranslations from '../locales/en/translation.json'

const resources = {
  es: { translation: esTranslations },
  en: { translation: enTranslations }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false // React ya escapa
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    }
  })

export default i18n