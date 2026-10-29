import { afterEach, describe, expect, it, vi } from 'vitest'
import { getJson } from '@/shared/api/httpClient'

// Simulamos la configuración de la API.
vi.mock('@/shared/config/env', () => ({
  appConfig: {
    apiBaseUrl: 'https://api.example.test',
  },
}))

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getJson', () => {
  it('devuelve los datos cuando la respuesta HTTP es exitosa', async () => {
    // Arrange
    const expectedData = { status: 'ok' }

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(expectedData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    vi.stubGlobal('fetch', fetchMock)

    // Act
    const result = await getJson<{ status: string }>('/api/ping')

    // Assert
    expect(result).toEqual(expectedData)

    expect(fetchMock).toHaveBeenCalledWith('https://api.example.test/api/ping', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: undefined,
    })
  })

  it('lanza un error cuando la API responde HTTP 500', async () => {
    // Arrange
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 500 }))

    vi.stubGlobal('fetch', fetchMock)

    // Act y Assert
    await expect(getJson('/api/ping')).rejects.toThrow('La API respondió con HTTP 500')
  })
})
