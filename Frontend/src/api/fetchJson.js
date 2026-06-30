import client from './client'
import { API_URL } from './config'

/**
 * Wrapper de compatibilidad: permite migrar gradualmente de fetchJson() a axios.
 * Traduce el contrato de fetchJson (url, {method, body, headers}) al cliente axios.
 *
 * IMPORTANTE: Maneja automáticamente el doble prefijo /api/api.
 * Si la URL empieza con /api/ y el baseURL ya termina en /api, elimina el prefijo
 * redundante antes de enviar la petición.
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/**
 * Normaliza la URL eliminando el prefijo /api si el baseURL ya lo incluye,
 * evitando el error "api/api/..." duplicado.
 *
 * Ejemplos:
 *   baseURL = "http://localhost/.../public/api"
 *   url = "/api/payments"  →  "/payments"  ✅
 *   url = "/payments"      →  "/payments"  ✅
 *   url = "/api/me"        →  "/me"        ✅
 */
function normalizeUrl(url) {
  // Si el baseURL ya termina con /api, quitar el /api del inicio de la URL
  if (API_URL.endsWith('/api') && url.startsWith('/api/')) {
    return url.replace(/^\/api/, '')
  }
  // Si el baseURL ya termina con /api y la URL es exactamente /api
  if (API_URL.endsWith('/api') && url === '/api') {
    return '/'
  }
  return url
}

export async function fetchJson(url, options = {}) {
  const { method = 'GET', body, headers = {} } = options

  try {
    const config = {
      method,
      url: normalizeUrl(url),
      headers,
    }

    // Si body es FormData lo mandamos directo, si es objeto lo manda axios como JSON
    if (body instanceof FormData) {
      config.data = body
      // Dejar que axios/browser ponga el boundary de multipart
      delete config.headers['Content-Type']
    } else if (body) {
      config.data = typeof body === 'string' ? JSON.parse(body) : body
    }

    const response = await client(config)
    return response.data

  } catch (error) {
    if (error.response) {
      const data = error.response.data
      const message = data?.message || data?.error || `Error ${error.response.status}`
      throw new ApiError(message, error.response.status, data)
    }
    // Redirigir al login si no hay red o hay error 401 ya manejado
    throw new ApiError(error.message || 'Error de conexión', 0)
  }
}