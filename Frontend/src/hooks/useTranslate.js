/**
 * Archivo: src/hooks/useTranslate.js
 * Hook personalizado que reemplaza `useTranslation` de react-i18next.
 * Mantiene la misma firma para minimizar los cambios en los componentes.
 */
import { useContext } from 'react';
import { TranslateContext } from '../context/TranslateContext';

export function useTranslate() {
  const context = useContext(TranslateContext);
  
  if (!context) {
    // Fallback seguro si se usa fuera del Provider durante tests o errores
    return {
      t: (key, params) => key,
      currentLang: 'es',
      changeLang: () => {},
      i18n: { 
        changeLanguage: () => {},
        language: 'es'
      }
    };
  }

  // Se expone un objeto `i18n` simulado para mantener compatibilidad con 
  // componentes como LanguageSwitcher.jsx que esperan esta estructura.
  return {
    t: context.t,
    currentLang: context.currentLang,
    changeLang: context.changeLang,
    // Shim para react-i18next
    i18n: {
      changeLanguage: context.changeLang,
      language: context.currentLang
    }
  };
}
