import { appConfig } from '@/shared/config/env'
export class ApiError extends Error {
  status: number
  details?: unknown
  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}
type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH'
  body?: unknown
  token?: string
  signal?: AbortSignal
}
export async function request<T>(
  path: `/${string}`,
  options: Options = {},
): Promise<{ data: T; headers: Headers }> {
  if (!appConfig.apiBaseUrl)
    throw new ApiError(0, 'No se ha configurado la conexión con el servidor.')
  let response: Response
  try {
    response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
      method: options.method ?? 'GET',
      signal: options.signal,
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch (error) {
    if (options.signal?.aborted) throw error
    throw new ApiError(0, 'No fue posible conectar con el servidor. Inténtalo nuevamente.')
  }
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const detail = body as { message?: string; errors?: Record<string, string[]> } | null
    throw new ApiError(
      response.status,
      detail?.message ??
        (detail?.errors
          ? Object.values(detail.errors).flat().join(' ')
          : response.status === 401
            ? 'Tu sesión ha vencido o las credenciales son incorrectas.'
            : response.status === 403
              ? 'No tienes permiso para realizar esta operación.'
              : 'No pudimos completar la operación.'),
      body,
    )
  }
  return { data: body as T, headers: response.headers }
}
export async function getJson<T>(path: `/${string}`, signal?: AbortSignal): Promise<T> {
  return (await request<T>(path, { signal })).data
}
