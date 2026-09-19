const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

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

export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  const contentType = response.headers.get('content-type') ?? ''
  const payload =
    response.status === 204
      ? null
      : contentType.includes('application/json')
        ? await response.json()
        : { message: await response.text() }

  if (!response.ok) {
    throw new ApiError(payload?.message ?? 'request_failed', {
      status: response.status,
      code: payload?.message,
      data: payload?.data,
      errors: payload?.errors,
    })
  }

  return payload
}
