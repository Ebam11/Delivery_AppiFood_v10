// Archivo: src/utils/imageCache.js | Comentario: logica principal del modulo.
/**
 * Cache de imágenes en localStorage
 * Almacena URLs de imágenes para evitar requests duplicados
 */

const CACHE_KEY_PREFIX = 'appifood_img_'
const CACHE_EXPIRY_DAYS = 30

// Limpiar caché viejo al iniciar
if (typeof window !== 'undefined') {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  } catch (e) {
    console.warn('Could not clear old cache')
  }
}

export const imageCache = {
  /**
   * Guardar imagen en cache
   */
  set: (key, imageUrl, metadata = {}) => {
    try {
      const data = {
        url: imageUrl,
        timestamp: Date.now(),
        ...metadata
      }
      localStorage.setItem(
        CACHE_KEY_PREFIX + key,
        JSON.stringify(data)
      )
    } catch (e) {
      console.warn('Cache write failed:', e)
    }
  },

  /**
   * Obtener imagen del cache
   */
  get: (key) => {
    try {
      const data = localStorage.getItem(CACHE_KEY_PREFIX + key)
      if (!data) return null

      const parsed = JSON.parse(data)
      const age = Date.now() - parsed.timestamp
      const expiryMs = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000

      // Si expiró, eliminar y retornar null
      if (age > expiryMs) {
        localStorage.removeItem(CACHE_KEY_PREFIX + key)
        return null
      }

      return parsed.url
    } catch (e) {
      console.warn('Cache read failed:', e)
      return null
    }
  },

  /**
   * Limpiar cache expirado
   */
  cleanup: () => {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (!key.startsWith(CACHE_KEY_PREFIX)) return

        const data = JSON.parse(localStorage.getItem(key))
        const age = Date.now() - data.timestamp
        const expiryMs = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000

        if (age > expiryMs) {
          localStorage.removeItem(key)
        }
      })
    } catch (e) {
      console.warn('Cache cleanup failed:', e)
    }
  },

  /**
   * Limpiar todo el cache
   */
  clear: () => {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (e) {
      console.warn('Cache clear failed:', e)
    }
  }
}
