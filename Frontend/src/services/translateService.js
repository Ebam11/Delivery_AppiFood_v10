/**
 * Archivo: src/services/translateService.js
 * Servicio para manejar traducciones dinámicas usando DeepL API (Free tier).
 * Implementa caché local para ahorrar caracteres y carga base desde JSON para español.
 */

import esTranslations from '../locales/es/translation.json';
import enTranslations from '../locales/en/translation.json';

const API_KEY = import.meta.env.VITE_DEEPL_API_KEY;
const API_URL = 'https://api-free.deepl.com/v2/translate';
const CACHE_KEY = 'appifood_translations_cache';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

// Caché en memoria inicializada desde localStorage
let translationCache = {};
try {
  const stored = localStorage.getItem(CACHE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    if (Date.now() - parsed.timestamp < CACHE_TTL) {
      translationCache = parsed.data;
    } else {
      localStorage.removeItem(CACHE_KEY);
    }
  }
} catch (e) {
  console.warn("Error reading translation cache", e);
}

// Función auxiliar para obtener un valor anidado de un objeto (ej. 'home.title')
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const translateService = {
  /**
   * Obtiene la traducción para una clave específica.
   * Si es español (idioma base), usa el JSON local.
   * Si es otro idioma, busca en caché. Si no está, devuelve un fallback (el texto original en es)
   * NOTA: Este método es síncrono para renderizado inmediato. La traducción vía API debe pre-cargarse.
   */
  getTranslation(key, targetLang = 'es', params = null) {
    let text = '';
    
    // 1. Obtener el texto original en español
    const esText = getNestedValue(esTranslations, key);
    
    if (targetLang === 'es') {
      text = typeof esText === 'string' ? esText : (params?.defaultValue ?? '');
    } else if (targetLang === 'en') {
      // Intentar obtener del JSON local de inglés
      const enText = getNestedValue(enTranslations, key);
      if (typeof enText === 'string') {
        text = enText;
      } else {
        text = typeof esText === 'string' ? esText : (params?.defaultValue ?? '');
      }
    } else {
      // 2. Si el target no es español ni inglés, buscar en caché
      text = typeof esText === 'string' ? esText : (params?.defaultValue ?? '');
      const cacheKey = `${targetLang}_${key}`;
      if (translationCache[cacheKey]) {
        text = translationCache[cacheKey];
      }
    }

    // 3. Interpolar parámetros si existen (ej. {{count}})
    if (params && typeof params === 'object') {
      Object.keys(params).forEach(p => {
        text = text.replace(new RegExp(`{{${p}}}`, 'g'), params[p]);
      });
    }

    return text;
  },

  /**
   * Traduce un texto usando DeepL API y lo guarda en caché.
   * Pensado para llamarse en background o cuando se cambia de idioma masivamente.
   */
  async translateText(text, targetLang) {
    if (targetLang === 'es' || !text || text.trim() === '') return text;
    if (!API_KEY) {
      console.warn("DeepL API Key missing. Showing original text.");
      return text;
    }

    // Adaptar código de idioma a lo que espera DeepL (ej. 'en' -> 'EN-US')
    let deeplTargetLang = targetLang.toUpperCase();
    if (deeplTargetLang === 'EN') deeplTargetLang = 'EN-US';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: [text],
          target_lang: deeplTargetLang,
          source_lang: 'ES'
        })
      });

      if (!response.ok) throw new Error(`DeepL API error: ${response.status}`);
      
      const data = await response.json();
      return data.translations[0].text;

    } catch (error) {
      console.error("Translation failed:", error);
      return text; // Fallback al texto original
    }
  },

  /**
   * Traduce múltiples keys en batch (para optimizar llamadas a la API)
   * Llama a esta función cuando se cambia el idioma globalmente.
   */
  async translateBatch(keys, targetLang) {
    if (targetLang === 'es') return;
    if (!API_KEY) return;

    // Filtrar keys que ya están cacheadas
    const keysToTranslate = keys.filter(k => !translationCache[`${targetLang}_${k}`]);
    if (keysToTranslate.length === 0) return;

    // Extraer textos en español
    const textsToTranslate = keysToTranslate.map(k => {
        const val = getNestedValue(esTranslations, k);
        return typeof val === 'string' ? val : k;
    });

    let deeplTargetLang = targetLang.toUpperCase();
    if (deeplTargetLang === 'EN') deeplTargetLang = 'EN-US';

    try {
      // Chunk requests if there are too many (DeepL might have size limits)
      // For simplicity, assuming one request here. In production, split into chunks of ~50.
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textsToTranslate,
          target_lang: deeplTargetLang,
          source_lang: 'ES'
        })
      });

      if (!response.ok) throw new Error(`DeepL API error: ${response.status}`);
      
      const data = await response.json();
      
      // Guardar en caché
      keysToTranslate.forEach((k, idx) => {
        translationCache[`${targetLang}_${k}`] = data.translations[idx].text;
      });

      this.saveCache();
      
    } catch (error) {
      console.error("Batch translation failed:", error);
    }
  },

  saveCache() {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data: translationCache
    }));
  },
  
  // Limpia el caché (útil para settings)
  clearCache() {
    translationCache = {};
    localStorage.removeItem(CACHE_KEY);
  }
};
