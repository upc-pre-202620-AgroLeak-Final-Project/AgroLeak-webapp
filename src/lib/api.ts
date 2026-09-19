import type { ApiProblem } from '../types/api'

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  problem?: ApiProblem

  constructor(message: string, status: number, problem?: ApiProblem) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.problem = problem
  }
}

interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  token?: string | null
  body?: unknown
  headers?: Record<string, string>
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { token, body, headers, ...requestInit } = options
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestInit,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    let problem: ApiProblem | undefined
    try {
      problem = (await response.json()) as ApiProblem
    } catch {
      problem = undefined
    }
    const fieldError = problem?.errors ? Object.values(problem.errors)[0] : undefined
    throw new ApiError(
      fieldError || problem?.detail || problem?.title || `La solicitud falló (${response.status})`,
      response.status,
      problem,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof TypeError) {
    return 'No pudimos conectar con el backend. Verifica que Docker siga ejecutándose.'
  }
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado.'
}
