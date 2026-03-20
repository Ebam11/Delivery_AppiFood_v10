// Archivo: src/api/fetchJson.js | Comentario: logica principal del modulo.
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

const parseResponseBody = async (response) => {
  const raw = await response.text()

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

export async function fetchJson(url, options = {}) {
  const response = await fetch(url, options)
  const data = await parseResponseBody(response)

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && (data.message || data.error)) ||
      `Request failed with status ${response.status}`

    throw new ApiError(message, response.status, data)
  }

  return data
}