import type { ApiEnvelope, ApiErrorResponse } from '../types/api'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api'
const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, '')
const TOKEN_STORAGE_KEY = 'eneba.auth.token'

export class ApiError extends Error {
  status: number
  errors?: ApiErrorResponse['errors']

  constructor(status: number, body: ApiErrorResponse) {
    super(body.message || 'The request could not be completed.')
    this.name = 'ApiError'
    this.status = status
    this.errors = body.errors
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  const body: unknown = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorBody = body as Partial<ApiErrorResponse>
    throw new ApiError(response.status, {
      message: errorBody.message ?? `Request failed (${response.status}).`,
      errors: errorBody.errors,
    })
  }

  return body as T
}

export async function apiData<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiRequest<ApiEnvelope<T>>(path, init)
  return response.data
}
