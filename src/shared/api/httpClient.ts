import { appConfig } from '@/shared/config/env'
import { ApiError } from './ApiError'
export { ApiError } from './ApiError'

type SessionAdapter = {
  getToken: () => string | null
  getVersion: () => number
  prepare: () => Promise<string | null>
  refresh: (token: string) => Promise<string | null>
  onUnauthorized: (token: string) => void
}
let session: SessionAdapter | undefined
let transport: typeof fetch = (...args) => fetch(...args)
export function configureDevelopmentTransport(next: typeof fetch) {
  if (import.meta.env.DEV) transport = next
}
/** La aplicación conecta la sesión; shared no conoce módulos de negocio. */
export function configureHttpSession(adapter: SessionAdapter) {
  session = adapter
}

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH'
  body?: unknown
  token?: string
  authenticated?: boolean
  signal?: AbortSignal
}
const messages: Record<number, string> = {
  400: 'Revisa los datos ingresados.',
  401: 'Tu sesión ha vencido o las credenciales son incorrectas.',
  403: 'No tienes permiso para realizar esta operación.',
  404: 'No se encontró el recurso solicitado.',
  409: 'Los datos cambiaron o ya existe un registro equivalente. Revisa la información antes de volver a guardar.',
  429: 'Hay demasiadas solicitudes. Inténtalo más tarde.',
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
async function send<T>(
  path: `/${string}`,
  options: Options = {},
): Promise<{ data: T; headers: Headers }> {
  options.signal?.throwIfAborted()
  const token = options.token ?? (options.authenticated ? session?.getToken() : undefined)
  if (options.authenticated && !token)
    throw new ApiError(401, 'Debes iniciar sesión para continuar.')
  if (!appConfig.apiBaseUrl)
    throw new ApiError(0, 'No se ha configurado la conexión con el servidor.')
  const multipart = options.body instanceof FormData
  let response: Response
  let body: unknown
  try {
    response = await transport(`${appConfig.apiBaseUrl}${path}`, {
      method: options.method ?? 'GET',
      signal: options.signal,
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined && !multipart ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body:
        options.body === undefined
          ? undefined
          : multipart
            ? (options.body as FormData)
            : JSON.stringify(options.body),
    })
    // Invalidar incluso si el cuerpo del 401 está vacío o mal formado.
    if (response.status === 401 && token && !options.authenticated) session?.onUnauthorized(token)
    const text = await response.text()
    try {
      body = text ? JSON.parse(text) : undefined
    } catch {
      if (response.ok)
        throw new ApiError(response.status, 'El servidor devolvió una respuesta no válida.')
      body = text
    }
  } catch (error) {
    if (options.signal?.aborted || error instanceof ApiError) throw error
    throw new ApiError(0, 'No fue posible conectar con el servidor. Inténtalo nuevamente.')
  }
  if (!response.ok) {
    const details = record(body) ? body : {}
    const fieldErrors: Record<string, string[]> = {}
    if (record(details.errors)) {
      for (const [key, value] of Object.entries(details.errors)) {
        if (Array.isArray(value) && value.every((item) => typeof item === 'string'))
          fieldErrors[key] = value
      }
    }
    const message = [
      details.message,
      details.detail,
      Object.values(fieldErrors).flat().join(' '),
    ].find((value) => typeof value === 'string' && value.trim())
    throw new ApiError(
      response.status,
      typeof message === 'string'
        ? message
        : (messages[response.status] ?? 'No pudimos completar la operación. Inténtalo nuevamente.'),
      body,
      fieldErrors,
    )
  }
  return { data: body as T, headers: response.headers }
}
export async function getJson<T>(path: `/${string}`, signal?: AbortSignal): Promise<T> {
  return (await request<T>(path, { signal })).data
}

function waitFor<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise
  signal.throwIfAborted()
  return new Promise((resolve, reject) => {
    const abort = () => reject(signal.reason)
    signal.addEventListener('abort', abort, { once: true })
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort))
  })
}
export async function request<T>(
  path: `/${string}`,
  options: Options = {},
): Promise<{ data: T; headers: Headers }> {
  // Explicit-token auth operations never participate in automatic renewal.
  if (!options.authenticated || options.token || !session || path.startsWith('/api/auth/'))
    return send<T>(path, options)
  const adapter = session
  const version = adapter.getVersion()
  const valid = () => {
    options.signal?.throwIfAborted()
    if (adapter.getVersion() !== version)
      throw new ApiError(401, 'La sesión cambió. Inicia la operación nuevamente.')
  }
  valid()
  let token = await waitFor(adapter.prepare(), options.signal)
  valid()
  if (!token) throw new ApiError(401, 'Debes iniciar sesión para continuar.')
  try {
    return await send<T>(path, { ...options, token })
  } catch (error) {
    valid()
    if (!(error instanceof ApiError) || error.status !== 401) throw error
    token = await waitFor(adapter.refresh(token), options.signal)
    valid()
    if (!token) throw error
    try {
      return await send<T>(path, { ...options, token })
    } catch (retryError) {
      valid()
      if (retryError instanceof ApiError && retryError.status === 401) adapter.onUnauthorized(token)
      throw retryError
    }
  }
}
