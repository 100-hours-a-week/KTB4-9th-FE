const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const TOKEN_REFRESH_PATH = '/auth/token/refresh'

let refreshRequest = null

export class ApiError extends Error {
  constructor(message, { status, code, data, errors } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.data = data
    this.errors = errors
  }
}

function fetchApi(path, options = {}) {
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
}

async function readPayload(response) {
  const contentType = response.headers.get('content-type') ?? ''
  return (
    response.status === 204
      ? null
      : contentType.includes('application/json')
        ? await response.json()
        : { message: await response.text() }
  )
}

function createApiError(response, payload) {
  return new ApiError(payload?.message ?? 'request_failed', {
    status: response.status,
    code: payload?.message,
    data: payload?.data,
    errors: payload?.errors,
  })
}

async function refreshTokens() {
  if (!refreshRequest) {
    refreshRequest = fetchApi(TOKEN_REFRESH_PATH, { method: 'POST' })
      .then(async (response) => {
        if (response.ok) return

        const payload = await readPayload(response)
        throw createApiError(response, payload)
      })
      .finally(() => {
        refreshRequest = null
      })
  }

  return refreshRequest
}

function moveToLogin() {
  if (typeof window === 'undefined' || window.location.pathname === '/login') return
  window.location.replace('/login')
}

export async function request(path, options = {}) {
  let response = await fetchApi(path, options)

  if (response.status === 401 && path !== TOKEN_REFRESH_PATH) {
    try {
      await refreshTokens()
    } catch (error) {
      if (error?.status === 401 || error?.status === 403) moveToLogin()
      throw error
    }

    response = await fetchApi(path, options)
    if (response.status === 401 || response.status === 403) moveToLogin()
  }

  const payload = await readPayload(response)

  if (!response.ok) {
    throw createApiError(response, payload)
  }

  return payload
}
