import client from './client'

/**
 * Wrapper de compatibilidad: permite migrar gradualmente de fetchJson() a axios.
 * Traduce el contrato de fetchJson (url, {method, body, headers}) al cliente axios.
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export async function fetchJson(url, options = {}) {
  const { method = 'GET', body, headers = {} } = options

  try {
    const config = {
      method,
      url,
      headers,
    }

    // Si body es FormData lo mandamos directo, si es objeto lo manda axios como JSON
    if (body instanceof FormData) {
      config.data = body
      config.headers['Content-Type'] = 'multipart/form-data'
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