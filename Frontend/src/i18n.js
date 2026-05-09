/**
 * Archivo: src/i18n.js
 * Configuración de internacionalización (i18next).
 * Gestiona los idiomas Español (es) e Inglés (en) con detección automática.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importación de las traducciones (JSON)
import es from './locales/es/translation.json';
import en from './locales/en/translation.json';

i18n
  // Detectar idioma automáticamente del navegador o localStorage
  .use(LanguageDetector)
  // Pasar la instancia de i18n a react-i18next.
  .use(initReactI18next)
  // Inicializar i18next
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    // Idioma por defecto si no se detecta ninguno
    fallbackLng: 'es',
    // Evita XSS ya que React lo maneja por defecto
    interpolation: {
      escapeValue: false,
    },
    // Configuración del detector de idioma
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;