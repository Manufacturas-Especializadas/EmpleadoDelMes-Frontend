import { ApiError } from '@/shared/api/httpClient'
import { useSyncExternalStore } from 'react'
import { authApi } from './authApi'
import { readRefreshToken, storeRefreshToken } from './refreshTokenStorage'
import type { Tokens, User } from './types'
let user: User | null = null
let tokens: Tokens | null = null
let generation = 0
let expiresAt = 0
let refreshing: Promise<Tokens | null> | null = null
let restoring: Promise<void> | null = null
let refreshRequiresPasswordChange = false
type Initialization = { status: 'initializing' | 'ready' | 'error'; message?: string }
let initialization: Initialization = { status: 'initializing' }
const listeners = new Set<() => void>()
function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
function emit() {
  listeners.forEach((listener) => listener())
}
function rejectedSession(error: unknown) {
  return error instanceof ApiError && [400, 401, 403].includes(error.status)
}
export function logout() {
  generation++
  refreshing = null
  restoring = null
  expiresAt = 0
  tokens = null
  user = null
  refreshRequiresPasswordChange = false
  storeRefreshToken(null)
  initialization = { status: 'ready' }
  emit()
}
export async function login(userName: string, password: string) {
  logout()
  const version = generation
  const response = await authApi.login(userName, password)
  if (version !== generation) return
  const expiry = Date.now() + response.data.expiresIn * 1000
  const profile = await authApi.me(response.data.accessToken)
  if (version !== generation) return
  tokens = response.data
  expiresAt = expiry
  user = {
    ...profile.data,
    mustChangePassword:
      profile.data.mustChangePassword || response.headers.get('X-Must-Change-Password') === 'true',
  }
  // Persist only after /me has confirmed a non-temporary session.
  storeRefreshToken(user.mustChangePassword ? null : tokens.refreshToken)
  emit()
}
export async function changePassword(current: string, next: string) {
  if (!tokens) throw new Error('Inicia sesión nuevamente.')
  const version = generation
  await authApi.changePassword(tokens.accessToken, current, next)
  if (version !== generation) return
  logout()
}
export function useAuth() {
  return useSyncExternalStore(subscribe, () => user)
}
export function useSessionInitialization() {
  return useSyncExternalStore(subscribe, () => initialization)
}

/** One refresh operation shared by startup restoration and normal automatic renewal. */
async function renewTokens(refreshToken: string): Promise<Tokens | null> {
  if (refreshing) return refreshing
  const version = generation
  const operation = (async () => {
    try {
      const response = await authApi.refresh(refreshToken)
      if (version !== generation) return null
      tokens = response.data
      expiresAt = Date.now() + tokens.expiresIn * 1000
      refreshRequiresPasswordChange = response.headers.get('X-Must-Change-Password') === 'true'
      if (refreshRequiresPasswordChange && user) {
        user = { ...user, mustChangePassword: true }
      }
      // Keep a rotated refresh token if /me subsequently encounters a transient failure.
      storeRefreshToken(
        refreshRequiresPasswordChange || user?.mustChangePassword ? null : tokens.refreshToken,
      )
      if (refreshRequiresPasswordChange && user) emit()
      return tokens
    } catch (error) {
      if (version === generation && rejectedSession(error)) logout()
      throw error
    }
  })()
  refreshing = operation
  try {
    return await operation
  } finally {
    if (refreshing === operation) refreshing = null
  }
}

/** Called on React startup, and again only on explicit retry after a transient error. */
export async function initializeSession(): Promise<void> {
  if (restoring) return restoring
  if (initialization.status === 'ready') return
  const version = generation
  initialization = { status: 'initializing' }
  emit()
  const operation = (async () => {
    try {
      const refreshToken = tokens?.refreshToken ?? readRefreshToken()
      if (!refreshToken) {
        initialization = { status: 'ready' }
        emit()
        return
      }
      if (refreshRequiresPasswordChange && Date.now() >= expiresAt - 30_000) {
        // A temporary session cannot renew, including a retry after /me failed.
        logout()
        return
      }
      // A retry after /me failed can reuse the still-valid access token in memory.
      const restored =
        tokens && Date.now() < expiresAt - 30_000 ? tokens : await renewTokens(refreshToken)
      if (version !== generation || !restored) return
      const profile = await authApi.me(restored.accessToken)
      if (version !== generation) return
      user = {
        ...profile.data,
        mustChangePassword: profile.data.mustChangePassword || refreshRequiresPasswordChange,
      }
      storeRefreshToken(user.mustChangePassword ? null : restored.refreshToken)
      initialization = { status: 'ready' }
      emit()
    } catch (error) {
      if (version !== generation) return
      if (rejectedSession(error)) {
        logout()
      } else {
        initialization = {
          status: 'error',
          message: error instanceof Error ? error.message : 'No pudimos restaurar tu sesión.',
        }
        emit()
      }
    }
  })()
  restoring = operation
  try {
    await operation
  } finally {
    if (restoring === operation) restoring = null
  }
}

export const roles = [
  { name: 'Administrator', path: '/admin', label: 'Administración' },
  { name: 'Sponsor', path: '/sponsor', label: 'Patrocinador' },
  { name: 'HumanResources', path: '/human-resources', label: 'Recursos Humanos' },
  { name: 'Safety', path: '/safety', label: 'Seguridad' },
  { name: 'Quality', path: '/quality', label: 'Calidad' },
]
export function home(user: User) {
  return user.mustChangePassword
    ? '/change-password'
    : (roles.find((role) => user.roles.includes(role.name))?.path ?? '/access-denied')
}
export function getAccessToken(): string | null {
  return tokens?.accessToken ?? null
}
export function getSessionVersion() {
  return generation
}
export async function prepareAccessToken() {
  if (tokens && !user?.mustChangePassword && Date.now() >= expiresAt - 30_000)
    return refreshSession(tokens.accessToken)
  return getAccessToken()
}
export async function refreshSession(rejectedToken: string): Promise<string | null> {
  if (!tokens || !user || user.mustChangePassword) return null
  if (tokens.accessToken !== rejectedToken) return tokens.accessToken
  const refreshed = await renewTokens(tokens.refreshToken)
  return user?.mustChangePassword ? null : (refreshed?.accessToken ?? null)
}
