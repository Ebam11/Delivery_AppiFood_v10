// Archivo: src/utils/blurhash.js | Comentario: logica principal del modulo.
/**
 * Hash de desenfoque (Blur Hash) para placeholders
 * Genera SVG placeholders basados en colores
 */

export const blurhash = {
  /**
   * Generar placeholder SVG con color
   */
  toSVG: (width = 220, height = 160, color = '#f5f5f5') => {
    return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"%3E%3Crect fill="%23${color.replace('#', '')}" width="${width}" height="${height}"/%3E%3C/svg%3E`
  },

  /**
   * Placeholder para productos (220x160)
   */
  product: () => blurhash.toSVG(220, 160, '#f5f5f5'),

  /**
   * Placeholder para restaurantes (320x200)
   */
  restaurant: () => blurhash.toSVG(320, 200, '#f5f5f5'),

  /**
   * Generar gradiente SVG más realista
   */
  gradient: (width = 220, height = 160, color1 = '#f5f5f5', color2 = '#e5e5e5') => {
    const id = Math.random().toString(36).substr(2, 9)
    return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"%3E%3Cdefs%3E%3ClinearGradient id="${id}" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23${color1.replace('#', '')};stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23${color2.replace('#', '')};stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="${width}" height="${height}" fill="url(%23${id})"/%3E%3C/svg%3E`
  },

  /**
   * Generar código CSS para blur background
   */
  cssBlur: (color = '#f5f5f5') => {
    return {
      background: color,
      backgroundImage: 'linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%)',
      backdropFilter: 'blur(10px)',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }
  }
}
