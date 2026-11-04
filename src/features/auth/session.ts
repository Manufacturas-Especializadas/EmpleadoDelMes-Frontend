import { ApiError } from '@/shared/api/httpClient'
import { useSyncExternalStore } from 'react'
import { authApi } from './authApi'
import type { Tokens, User } from './types'
let user: User | null = null
let tokens: Tokens | null = null
let generation = 0
let expiresAt = 0
let refreshing: Promise<string | null> | null = null
const listeners = new Set<() => void>()
function emit() {
  listeners.forEach((listener) => listener())
}
export function logout() {
  generation++
  refreshing = null
  expiresAt = 0
  tokens = null
  user = null
  emit()
}
export async function login(userName: string, password: string) {
  logout()
  const version = generation
  const response = await authApi.login(userName, password)
  const profile = await authApi.me(response.data.accessToken)
  if (version !== generation) return
  tokens = response.data
  expiresAt = Date.now() + response.data.expiresIn * 1000
  user = {
    ...profile.data,
    mustChangePassword:
      profile.data.mustChangePassword || response.headers.get('X-Must-Change-Password') === 'true',
  }
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
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    () => user,
  )
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
  if (refreshing) return refreshing
  const version = generation
  const refreshToken = tokens.refreshToken
  const operation = (async () => {
    try {
      const response = await authApi.refresh(refreshToken)
      if (version !== generation) return null
      tokens = response.data
      expiresAt = Date.now() + tokens.expiresIn * 1000
      return tokens.accessToken
    } catch (error) {
      if (
        version === generation &&
        error instanceof ApiError &&
        [400, 401, 403].includes(error.status)
      )
        logout()
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
