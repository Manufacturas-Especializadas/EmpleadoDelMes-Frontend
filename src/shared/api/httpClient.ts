import { appConfig } from '@/shared/config/env'

export async function getJson<T>(path: `/${string}`, signal?: AbortSignal): Promise<T> {
  if (!appConfig.apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL no está configurada')
  }

  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  })

  if (!response.ok) {
    throw new Error(`La API respondió con HTTP ${response.status}`)
  }

  return (await response.json()) as T
}
