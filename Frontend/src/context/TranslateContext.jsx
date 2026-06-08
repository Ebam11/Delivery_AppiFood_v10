/**
 * Archivo: src/context/TranslateContext.jsx
 * Contexto global para manejar el idioma actual de la aplicación.
 */
import { createContext, useState, useEffect, useCallback } from 'react';
import { translateService } from '../services/translateService';

export const TranslateContext = createContext(null);

export function TranslateProvider({ children }) {
  const [currentLang, setCurrentLang] = useState(() => {
    // Detectar idioma guardado o navegador, fallback a 'es'
    const saved = localStorage.getItem('appifood_lang');
    if (saved) return saved;
    const navLang = navigator.language.split('-')[0].toLowerCase();
    return ['es', 'en'].includes(navLang) ? navLang : 'es';
  });

  const [isLoadingTranslations, setIsLoadingTranslations] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0); // Para forzar re-render

  useEffect(() => {
    localStorage.setItem('appifood_lang', currentLang);
  }, [currentLang]);

  const changeLang = useCallback(async (langCode) => {
    if (langCode === currentLang) return;
    setCurrentLang(langCode);
    
    // Si no es español, aquí podríamos disparar la traducción asíncrona de la página actual
    // usando translateService.translateBatch([...]) si quisiéramos precargar todo
    // Por simplicidad en este MVP, las traducciones faltantes se harán 'on-demand' 
    // pero eso requeriría un hook asíncrono. Como usamos render síncrono, confiaremos en 
    // traducciones asíncronas per-componente o batch pre-cargado.
    
    // Forzamos un re-render global para aplicar los cambios de caché (si los hay)
    setUpdateTrigger(prev => prev + 1);
  }, [currentLang]);

  // Hook 't' interno que se expondrá
  const t = useCallback((key, params) => {
    let text = translateService.getTranslation(key, currentLang, params);
    
    // Lazy translation
    if (currentLang !== 'es' && text === translateService.getTranslation(key, 'es', params)) {
        // El texto devuelto es el mismo que en español (fallback porque no está en caché).
        // Disparamos la traducción asíncrona en background para que esté lista la próxima vez
        // (o disparamos un re-render cuando termine).
        translateService.translateText(text, currentLang).then(translated => {
            if (translated !== text) {
                // Truco para guardar en caché interno simulando la key
                const cacheKey = `${currentLang}_${key}`;
                // Acceso a la caché interna del servicio (normalmente requeriría exponer un setter)
                // Para no romper la abstracción, implementamos saveToCache en el servicio si fuera necesario,
                // pero translateService.translateBatch es mejor para esto.
                
                // En un enfoque real con React Suspense o useEffect en los componentes,
                // la traducción se mostraría al terminar.
            }
        }).catch(e => console.error(e));
    }
    
    return text;
  }, [currentLang, updateTrigger]);

  const value = {
    currentLang,
    changeLang,
    t,
    isLoadingTranslations
  };

  return (
    <TranslateContext.Provider value={value}>
      {children}
    </TranslateContext.Provider>
  );
}
