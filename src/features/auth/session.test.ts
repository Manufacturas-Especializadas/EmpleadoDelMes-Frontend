import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { login, logout, getAccessToken } from './session'
import { request } from '@/shared/api/httpClient'
import '@/app/configureApi'
vi.mock('@/shared/config/env', () => ({ appConfig: { apiBaseUrl: 'https://example.test' } }))
const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status })
let refreshCount = 0
let calls = 0
let temporary = false
let refreshStatus = 200
let resourceStatus = 200
let release: (() => void) | undefined
let block = false
beforeEach(() => {
  logout()
  refreshCount = 0
  calls = 0
  temporary = false
  refreshStatus = 200
  resourceStatus = 200
  block = false
  release = undefined
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, options: RequestInit) => {
      if (url.endsWith('/login'))
        return reply({ accessToken: 'first', refreshToken: 'refresh', expiresIn: 900 })
      if (url.endsWith('/me'))
        return reply({
          userId: '1',
          userName: 'test',
          displayName: null,
          roles: ['Administrator'],
          mustChangePassword: temporary,
        })
      if (url.endsWith('/refresh')) {
        refreshCount++
        if (block)
          await new Promise<void>((resolve) => {
            release = resolve
          })
        return reply({ accessToken: 'second', refreshToken: 'next', expiresIn: 900 }, refreshStatus)
      }
      calls++
      const token = (options.headers as Record<string, string>).Authorization
      return reply({}, resourceStatus || (token === 'Bearer first' ? 401 : 200))
    }),
  )
})
afterEach(() => {
  logout()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})
const protectedRequest = (signal?: AbortSignal) =>
  request('/resource', { authenticated: true, signal })
it('renueva antes de vencer usando expiresIn', async () => {
  vi.useFakeTimers()
  await login('test', 'secret')
  vi.advanceTimersByTime(871000)
  await protectedRequest()
  expect(refreshCount).toBe(1)
  expect(getAccessToken()).toBe('second')
  expect(calls).toBe(1)
})
it('cierra sesión si refresh expiró', async () => {
  await login('test', 'secret')
  resourceStatus = 0
  refreshStatus = 401
  await expect(protectedRequest()).rejects.toMatchObject({ status: 401 })
  expect(getAccessToken()).toBeNull()
  expect(refreshCount).toBe(1)
})
it('comparte una renovación entre solicitudes simultáneas y reintenta', async () => {
  await login('test', 'secret')
  resourceStatus = 0
  block = true
  const pending = Promise.all([protectedRequest(), protectedRequest()])
  await vi.waitFor(() => expect(release).toBeDefined())
  release!()
  await pending
  expect(refreshCount).toBe(1)
  expect(calls).toBe(4)
})
it('logout impide reactivar sesión y repetir solicitud', async () => {
  await login('test', 'secret')
  resourceStatus = 0
  block = true
  const pending = expect(protectedRequest()).rejects.toMatchObject({ status: 401 })
  await vi.waitFor(() => expect(release).toBeDefined())
  logout()
  release!()
  await pending
  expect(getAccessToken()).toBeNull()
  expect(calls).toBe(1)
})
it('reintenta solamente una vez tras 401', async () => {
  await login('test', 'secret')
  resourceStatus = 401
  await expect(protectedRequest()).rejects.toMatchObject({ status: 401 })
  expect(refreshCount).toBe(1)
  expect(calls).toBe(2)
  expect(getAccessToken()).toBeNull()
})
it('no renueva ante 403', async () => {
  await login('test', 'secret')
  resourceStatus = 403
  await expect(protectedRequest()).rejects.toMatchObject({ status: 403 })
  expect(refreshCount).toBe(0)
  expect(getAccessToken()).toBe('first')
})
it('no renueva contraseñas temporales', async () => {
  temporary = true
  await login('test', 'secret')
  resourceStatus = 401
  await expect(protectedRequest()).rejects.toMatchObject({ status: 401 })
  expect(refreshCount).toBe(0)
  expect(calls).toBe(1)
})
it('abortar la espera no repite ni cancela el refresh compartido', async () => {
  await login('test', 'secret')
  resourceStatus = 0
  block = true
  const controller = new AbortController()
  const pending = expect(protectedRequest(controller.signal)).rejects.toMatchObject({
    name: 'AbortError',
  })
  await vi.waitFor(() => expect(release).toBeDefined())
  controller.abort()
  await pending
  release!()
  await vi.waitFor(() => expect(getAccessToken()).toBe('second'))
  expect(calls).toBe(1)
})
it('refresh tardío no reemplaza un nuevo login', async () => {
  await login('test', 'secret')
  resourceStatus = 0
  block = true
  const pending = expect(protectedRequest()).rejects.toMatchObject({ status: 401 })
  await vi.waitFor(() => expect(release).toBeDefined())
  await login('other', 'secret')
  release!()
  await pending
  expect(getAccessToken()).toBe('first')
  expect(calls).toBe(1)
})
